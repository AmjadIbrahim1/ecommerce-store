const express = require('express');
const { body } = require('express-validator');
const User = require('../models/UserModel');
const {
    getSignin, postSignin, getSignup, postSignup, postLogout,
} = require('../controller/adminAuthController');
const { alreadyLoggedIn } = require('../middleware/alreadyLoggedIn');

const router = express.Router();

router.get('/signin', alreadyLoggedIn, getSignin);
router.post('/signin', [
    body('email').trim().normalizeEmail().isEmail()
        .withMessage('Email address is not valid.'),
    body('password').trim().notEmpty().withMessage('Password is empty'),
], postSignin);

router.get('/signup', alreadyLoggedIn, getSignup);
router.post('/signup', [
    body('firstName').trim()
        .notEmpty().withMessage('First name is required'),
    body('userName').trim()
        .notEmpty().withMessage('User name is required')
        .custom(async (value) => {
            const isUserNameUnique = await User.findOne({ userName: value });
            if (isUserNameUnique) {
                return Promise.reject(new Error('Username is not unique'));
            }
            return true;
        }),
    body('email').trim()
        .notEmpty().withMessage('Email is required')
        .normalizeEmail()
        .isEmail()
        .withMessage('Email address is not valid')
        .custom(async (value) => {
            const isEmailUnique = await User.findOne({ email: value });
            if (isEmailUnique) {
                return Promise.reject(new Error('Email is already in use'));
            }

            return true;
        }),
    body('password').trim()
        .notEmpty().withMessage('Password is required')
        .isStrongPassword()
        .withMessage('Strong password is not strong enough'),
    body('confirmPassword').trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                return Promise.reject(new Error('Password and Conform password is not same'));
            }
            return true;
        }),
], postSignup);

router.post('/logout', postLogout);

module.exports = router;
