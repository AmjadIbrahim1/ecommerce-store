const Stripe = require('stripe');
const Category = require('../models/categoryModel');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const { sendMail } = require('../utils/sendMail');
const { errorValidation } = require('../utils/error-validation');
const { throwError } = require('../utils/throwError');

module.exports.getProfile = async (req, res, next) => {
    try {
        const { firstName, lastName } = req.user;
        const categories = await Category.find();
        return res.render('layouts/layout', {
            title: `${firstName} ${lastName} - Profile`,
            page: 'pages/profile',
            path: '/profile',

            data: { categories },
        });
    } catch (err) {
        return next(err);
    }
};

module.exports.postProfile = async (req, res, next) => {
    try {
        const {
            firstName, lastName, email,
        } = req.body;
        const { user } = req;
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email;
        await user.save();
        res.status(202).redirect('/profile');

        try {
            await sendMail({
                to: user.email,
                subject: 'Profile update',
                text: 'Your profile is updated',
            });
        } catch (err) {
            // never fail the request because the mail server is unreachable
            console.log('Profile update email failed:', err.message);
        }
    } catch (err) {
        next(err);
    }
};

module.exports.postRateProduct = async (req, res, next) => {
    try {
        errorValidation(req, false);

        const { productId, rating, description } = req.body;
        const product = await Product.findById(productId);
        if (!product) {
            req.flash('error', 'Product Not found');
            return res.redirect('/');
        }
        try {
            await product.addReview({ userId: req.user._id, rating, description });
            await product.save();
        } catch (err) {
            req.flash('error', 'Unable to save review');
        }

        return res.redirect(req.headers.referer);
    } catch (err) {
        return next(err);
    }
};

module.exports.postAddToCart = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;

        req.user.addToCart(productId, +quantity || 1);
        return res.status(200).redirect(req.headers.referer);
    } catch (err) {
        return next(err);
    }
};

module.exports.postRemoveFromCart = async (req, res, next) => {
    try {
        const { productId } = req.body;

        if (!req.user) {
            return res.redirect('/signin');
        }
        req.user.removeFromCart(productId);
        return res.redirect(req.headers.referer);
    } catch (err) {
        return next(err);
    }
};

module.exports.clearCart = async (req, res, next) => {
    try {
        await req.user.clearCart();
        res.redirect(req.headers.referer);
    } catch (err) {
        next(err);
    }
};

module.exports.postAddToWishList = async (req, res, next) => {
    try {
        const { productId } = req.body;
        const product = await Product.findById(productId);
        if (!product) {
            throwError('Product not found', 404, false);
        }
        await req.user.addToWishList(productId);
        return res.redirect(req.headers.referer);
    } catch (err) {
        return next(err);
    }
};

module.exports.postRemoveFromWishList = async (req, res, next) => {
    try {
        const { productId } = req.body;
        const product = await Product.findById(productId);
        if (!product) {
            throwError('Product not found', 404, false);
        }
        await req.user.removeFromWishlist(productId);
        res.redirect(req.headers.referer);
    } catch (err) {
        next(err);
    }
};

module.exports.getCheckout = async (req, res, next) => {
    try {
        const categories = await Category.find();

        res.render('layouts/layout', {
            title: 'Checkout',
            page: 'pages/checkout',
            path: '/',

            data: { categories },
        });
    } catch (err) {
        next(err);
    }
};

module.exports.postCheckout = async (req, res, next) => {
    try {
        errorValidation(req, false);
        const { user } = req;
        req.session.paymentAddress = req.body;
        const cartProduct = await user.getCartProducts();
        const stripe = Stripe(process.env.STRIPE_PRIVATE_KEY);

        const products = cartProduct.map((product) => (
            {
                name: product.title,
                amount: Math.round((product.price) * 100),
                quantity: product.quantity,
                currency: 'bdt',
                // payment_method_types: ['card'],
            }
        ));
        const session = await stripe.checkout.sessions.create({
            line_items: products,
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: `${process.env.SERVER_URL}/checkout-complete`,
            cancel_url: `${process.env.SERVER_URL}/checkout`,
        });

        res.redirect(session.url);
    } catch (err) {
        next(err);
    }
};

module.exports.getCheckoutComplete = async (req, res, next) => {
    try {
        errorValidation(req, false);
        const {
            name, email, phone,
            division, district,
            upazilla, address,
        } = req.session.paymentAddress;
        const { user } = req;

        const cartProduct = await user.getCartProducts();
        const order = new Order({
            userId: user._id,
            name,
            email,
            phone,
            division,
            district,
            upazilla,
            address,
            products: cartProduct,
            total: user.cart.total,
        });
        try {
            await order.save();
        } catch (err) {
            console.log(err);
            req.flash('error', 'Unable to save order');
            return res.redirect('/checkout');
        }

        // update the product collection that products have been selled
        // const products = await Product.updateMany(
        //     { _id: {
        //         $includes: cartProduct.map(item => item._id)
        //     } },
        //     {},
        //     {}
        // );
        // console.log(products);

        user.clearCart();
        req.flash('success', 'Order placed successfully');
        // return res.redirect('/');
        return res.send('ok');
    } catch (err) {
        return next();
    }
};
