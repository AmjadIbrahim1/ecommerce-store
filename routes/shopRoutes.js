const express = require('express');
const {
    getIndex, getProduct, getProductModal, search, getSearchSuggestion,
} = require('../controller/shopController');

const router = express.Router();

router.get('/', getIndex);
router.get('/search', search);
router.get('/search-suggestion', getSearchSuggestion);
router.get('/product/:slug', getProduct);
router.get('/product-modal/:productId', getProductModal);

module.exports = router;
