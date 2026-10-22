const crypto = require('crypto');
const bcrypt = require('bcrypt');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const User = require('../models/UserModel');
const { errorValidation } = require('../utils/error-validation');
const { sendMail } = require('../utils/sendMail');
const { throwError } = require('../utils/throwError');

module.exports.getSignIn = async (req, res, next) => {
    try {
        const categories = await Category.find();

        res.render('layouts/layout', {
            title: 'Sign In',
            page: 'auth/signin',
            path: '/signin',

            data: { categories },
        });
    } catch (err) {
        next(err);
    }
};

module.exports.postSignIn = async (req, res, next) => {
    try {
        errorValidation(req, false);
        const { email, password } = req.body;

        const user = await User.findOne({
            $or: [
                { username: email },
                { email },
            ],
        });
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/signin');
        }
        const passwordMatched = await bcrypt.compare(password, user.password);
        if (!passwordMatched) {
            throwError('Incorrect password', 422, false);
        }
        req.session.isLoggedIn = true;
        req.session.user = user;
        req.session.save((err) => {
            if (err) {
                return console.log(err);
            }
            return res.redirect('/');
        });
    } catch (err) {
        return next(err);
    }
    return null;
};

module.exports.getSignUp = async (req, res, next) => {
    try {
        const categories = await Category.find();

        res.render('layouts/layout', {
            title: 'Sign Up',
            page: 'auth/signup',
            path: '/signup',

            data: { categories },
        });
    } catch (err) {
        next(err);
    }
};

module.exports.postSignUp = async (req, res, next) => {
    try {
        errorValidation(req, false);

        const {
            firstName, lastName, userName, email, password,
        } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const bufferText = await crypto.randomBytes(32).toString('hex');

        const user = new User({
            firstName,
            lastName,
            userName,
            email,
            password: hashedPassword,

            resetToken: bufferText,
            resetTokenExpire: Date.now() + (1000 * 60 * 20), // 20 minutes
        });
        try {
            await user.save();
        } catch (err) {
            throwError('Unable to create user', 500, false);
        }

        // saving user in session
        req.session.isLoggedIn = true;
        req.session.user = user;
        await req.session.save((err) => {
            if (err) {
                req.flash('warning', 'User is not saved in session');
            }
            res.redirect('/');
        });

        try {
            await sendMail({
                to: email,
                subject: 'Amjad: Activate your account',
                html: `
                    <p>Congratulations, You have successfully signed up in Amjad</p>
                    <p>Please activate your account <a href="${process.env.SERVER_URL}/activate-email/${bufferText}">here</a></p>
                `,
            });
            console.log('email sent');
        } catch (err) {
            console.log(err);
        }
    } catch (err) {
        next(err);
    }
};

module.exports.postSignOut = async (req, res, next) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log(err);
            } else {
                res.redirect('/');
            }
        });
    } catch (err) {
        next(err);
    }
};

module.exports.activateEmail = async (req, res, next) => {
    try {
        const { user, params: { token } } = req;

        if (user.resetToken === token && user.resetTokenExpire > Date.now()) {
            user.emailVerified = true;
            user.resetToken = null;
            user.resetTokenExpire = null;
        }
        await user.save();

        res.redirect('/');
    } catch (err) {
        next(err);
    }
};

module.exports.activateEmailRequest = async (req, res, next) => {
    try {
        const bufferText = await crypto.randomBytes(32).toString('hex');
        req.user.resetToken = bufferText;
        req.user.resetTokenExpire = Date.now() + (1000 * 60 * 20); // 20 minutes

        await req.user.save();
        try {
            await sendMail({
                to: req.user.email,
                subject: 'Amjad: Activate your account',
                html: `
                    <p>Congratulations, You have successfully signed up in Amjad</p>
                    <p>Please activate your account <a href="${process.env.SERVER_URL}/activate-email/${bufferText}">here</a></p>
                `,
            });
        } catch (err) {
            // ! error notification
            console.log(err);
        }
        res.redirect('/');
    } catch (err) {
        next(err);
    }
};
