const express = require('express');
const { body } = require('express-validator');
const {
    postAddToCart, postRemoveFromCart, postRateProduct,
    postAddToWishList, clearCart, postRemoveFromWishList,
    getCheckout, getProfile, postProfile, postCheckout, getCheckoutComplete,
} = require('../controller/userController');
const { userIsAuth } = require('../middleware/isAuth');

const router = express.Router();

router.get('/profile', userIsAuth, getProfile);
router.post('/profile', userIsAuth, postProfile);

router.post('/rate-product', userIsAuth, [
    body('productId').trim().notEmpty().withMessage('Product id not found'),
    body('rating').trim()
        .notEmpty().withMessage('Rating is empty'),
    body('description').trim(),
], postRateProduct);

router.post('/add-to-cart', userIsAuth, [
    body('productId').trim()
        .isEmpty().withMessage('Product id is not provided'),
    body('quantity').trim()
        .isLength({ min: 1 }).withMessage('Minimum quantity is 1'),
], postAddToCart);

router.post('/remove-from-cart', userIsAuth, [
    body('productId').trim()
        .isEmpty().withMessage('Product id is not provided'),
], postRemoveFromCart);

router.post('/clear-cart', userIsAuth, clearCart);

router.post('/add-to-wishlist', userIsAuth, postAddToWishList);
router.post('/remove-from-wishlist', userIsAuth, postRemoveFromWishList);

router.get('/checkout', userIsAuth, getCheckout);
router.post('/checkout', userIsAuth, [
    body('name').trim().notEmpty().withMessage('Enter a name'),
    body('email').trim().notEmpty().withMessage('Enter an email'),
    body('phone').trim().notEmpty().withMessage('Enter your phone number'),
    body('division').trim().notEmpty().withMessage('Select a division'),
    body('district').trim().notEmpty().withMessage('Select a district'),
    body('upazilla').trim().notEmpty().withMessage('Select a upazilla'),
    body('address').trim().notEmpty().withMessage('Address is empty'),
], postCheckout);
router.get('/checkout-complete', userIsAuth, getCheckoutComplete);

module.exports = router;
