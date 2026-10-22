const bcrypt = require('bcrypt');
const { errorValidation } = require('../utils/error-validation');
const { throwError } = require('../utils/throwError');
const User = require('../models/UserModel');

module.exports.getSignin = async (req, res, next) => {
    try {
        res.render('admin/layouts/layout-small', {
            title: 'Log in to Amjad as an admin',
            page: 'auth/signin',
            path: '/auth/signin',

            data: {},
        });
    } catch (err) {
        next(err);
    }
};

module.exports.postSignin = async (req, res, next) => {
    try {
        errorValidation(req, '/signin');
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            throwError('User not found', 404, true);
        }
        const passwordMatched = await bcrypt.compare(password, user.password);
        if (!passwordMatched) {
            throwError('Credentials do not match', 422, true);
        }

        if (!user.isAdmin) {
            throwError('You are not an admin', 401, true);
        }
        if (!user.isActive) {
            throwError('You account is not active', 401, true);
        }
        req.session.isLoggedIn = true;
        req.session.user = user;
        req.session.save((err) => {
            if (err) {
                console.log(err);
                return;
            }
            res.status(200).json({ message: 'sign in successful' });
        });
    } catch (err) {
        next(err);
    }
    return null;
};

module.exports.getSignup = (req, res, next) => {
    try {
        res.render('admin/layouts/layout-small', {
            title: 'Join to Amjad as an admin',
            page: 'auth/signup',
            path: '/signup',

            data: {},
        });
    } catch (err) {
        next(err);
    }
};

module.exports.postSignup = async (req, res, next) => {
    try {
        errorValidation(req);

        const {
            firstName, lastName, userName, phone, email, password,
        } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            userName,
            isActive: false,
            isSuperAdmin: false,
            isAdmin: true,
        });
        try {
            await newUser.save();
        } catch (err) {
            console.log(err);
            throwError('Unable to save user', 500, true);
        }

        res.status(200).json({ message: 'Account created successfully.' });
    } catch (err) {
        next(err);
    }
};

module.exports.postLogout = async (req, res, next) => {
    try {
        await req.session.destroy();
        res.redirect(`${process.env.ADMIN_PANEL_PATH}/auth/signin`);
    } catch (err) {
        next(err);
    }
};
