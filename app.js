const path = require('path');
const os = require('os');
const fs = require('fs');
// express loads the view engine dynamically, so require it here to make sure
// Vercel's file tracer bundles it into the serverless function
require('ejs');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const csrf = require('csurf');
const multer = require('multer');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const MongoDBStore = require('connect-mongodb-session')(session);
const userRouter = require('./routes/userRoutes');
const adminRouter = require('./routes/adminRoutes');
const shopRouter = require('./routes/shopRoutes');
const userAuthRouter = require('./routes/userAuthRoutes');
const adminAuthRouter = require('./routes/adminAuthRouter');
const User = require('./models/UserModel');
const { get404, getError } = require('./controller/errorController');
const { adminIsAuth } = require('./middleware/isAuth');

// load .env before anything else reads process.env
dotenv.config();

// true when running as a Vercel serverless function instead of a long-lived server
const isVercel = Boolean(process.env.VERCEL);

if (isVercel) {
    const requiredEnv = ['MONGO_STRING', 'SESSION_SECRET', 'ADMIN_PANEL_PATH', 'SERVER_URL'];
    const missingEnv = requiredEnv.filter((key) => !process.env[key]);
    if (missingEnv.length) {
        throw new Error(`Missing environment variables: ${missingEnv.join(', ')}. Set them in Vercel (Project -> Settings -> Environment Variables) and redeploy.`);
    }
}

const csrfProtection = csrf({ cookie: true });

// define storage path
// Vercel's filesystem is read-only, so uploads go to /tmp there (ephemeral - see README)
const uploadDir = isVercel
    ? path.join(os.tmpdir(), 'uploads')
    : path.join(__dirname, 'public', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const fileFilter = (req, file, cb) => {
    const fileTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
    const fileExts = ['.png', '.jpg', '.jpeg', '.webp'];

    if (fileTypes.includes(file.mimetype) && fileExts.includes(path.extname(file.originalname))) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
const store = new MongoDBStore({
    uri: process.env.MONGO_STRING,
    collection: 'sessions',
});
store.on('error', (err) => console.error('[sessions] MongoDB session store error:', err));

const app = express();

app.set('view engine', 'ejs');
// behind Vercel's HTTPS proxy
if (isVercel) app.set('trust proxy', 1);
// enable request body
app.use(cookieParser());
// to parse url encoded payload (form)
app.use(express.urlencoded({ extended: true }));
// to parse json payload
app.use(express.json());
app.use(csrfProtection);
// activating flash message
app.use(flash());
// activating session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }, // session is valid for 1 week
}));
app.use('/public', express.static(path.join(__dirname, 'public')));

// * accepting file from request
app.use(multer({ storage: fileStorage, fileFilter }).single('image'));

// * get user from session
app.use(async (req, res, next) => {
    try {
        res.locals.unverifiedEmail = false;
        const sessionUser = req.session.user;
        const user = await User.findOne({ _id: sessionUser?._id }).populate('cart.items.productId');

        if (!user) {
            return next();
        }
        user.cart.total = user.cartTotal();
        if (!user.emailVerified) {
            res.locals.unverifiedEmail = true;
        }

        req.user = user;
        req.isLoggedIn = true;
        return next();
    } catch (err) {
        return next(err);
    }
});

app.use((req, res, next) => {
    res.locals.q = req.query.q;
    res.locals.user = req.user;
    res.locals.message = req.flash();
    res.locals._csrf = req.csrfToken();
    next();
});

app.use(shopRouter);
app.use(userRouter);
app.use(userAuthRouter);
app.use(`/${process.env.ADMIN_PANEL_PATH}/auth`, adminAuthRouter);
app.use(`/${process.env.ADMIN_PANEL_PATH}`, adminIsAuth, adminRouter);

// route for 404 page
app.use(get404);

// server error
app.use(getError);

// connect to database
mongoose.connect(process.env.MONGO_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        // on Vercel the exported app is invoked per request - never call app.listen()
        if (isVercel) {
            console.log('Connected to MongoDB (Vercel serverless)');
            return;
        }
        console.log(`Listening at http://localhost:${process.env.PORT || 8080}`);
        // listening for incoming request
        app.listen(process.env.PORT || 8080);
    })
    .catch((err) => {
        console.error('There is some error running this app. :(');
        console.error('MongoDB connection failed:', err.message);
        if (!process.env.MONGO_STRING) console.error('MONGO_STRING is not set.');
    });

// Vercel serverless entrypoint (api/index.js) uses this
module.exports = app;
