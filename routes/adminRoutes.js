const express = require('express');
const { body } = require('express-validator');
const {
    getIndex,
    getActivities,
    getCategories,
    getBanners,
    getAddBanner,
    postAddBanner,
    deleteBanner,
    getProducts,
    getAddProduct,
    postAddProduct,
    getAddCategory,
    postAddCategory,
    getCategoryLabel,
    getEditCategory,
    postEditCategory,
    deleteCategory,
    getAddAd,
    postAddAd,
    getEditAd,
    getAds,
    postEditAd,
    deleteAd,
    getEditBanner,
    postEditBanner,
    getEditProduct,
    postEditProduct,
    postProductFeatured,
    postDeleteProduct,
} = require('../controller/adminController');
const Ad = require('../models/adModel');

const router = express.Router();

router.get('/', getIndex);
router.get('/activities', getActivities);

// manage banner information
router.get('/banner', getBanners);
router.get('/banner/add', getAddBanner);
router.post('/banner/add', [
    body('heading').trim()
        .not().isEmpty()
        .withMessage('Banner heading can\'t be empty')
        .isLength({ max: 100 })
        .withMessage('Max length of heading is 100'),
    body('text').trim()
        .not().isEmpty()
        .withMessage('Banner text is required')
        .isLength({ max: 50 })
        .withMessage('Max length of text is 50'),
    body('productCategory').trim()
        .not().isEmpty()
        .withMessage('Select a category'),
    body('image').not().custom((value, { req }) => {
        if (!req.file) {
            return true;
        }
        return false;
    }).withMessage('Select an background image(.png, .jpg, .jpeg and .webp)'),
], postAddBanner);
router.get('/banner/edit', getEditBanner);
router.post('/banner/edit', [
    body('heading').trim()
        .not().isEmpty()
        .withMessage('Banner heading can\'t be empty')
        .isLength({ max: 100 })
        .withMessage('Max length of heading is 100'),
    body('text').trim()
        .not().isEmpty()
        .withMessage('Banner text is required')
        .isLength({ max: 50 })
        .withMessage('Max length of text is 50'),
    body('productCategory').trim()
        .not().isEmpty()
        .withMessage('Select a category'),
], postEditBanner);
router.delete('/banner/delete', deleteBanner);

// manage product
router.get('/product', getProducts);
router.get('/product/add', getAddProduct);
router.post('/product/add', [
    body('title').trim()
        .not().isEmpty()
        .withMessage('Product title can\'t be empty')
        .isLength({ max: 100 })
        .withMessage('Max length of title is 100'),
    body('price').trim()
        .not().isEmpty()
        .withMessage('Price can\'t be empty')
        .isNumeric()
        .withMessage('Price should be a number')
        .custom((value) => {
            if (value < 100) {
                return Promise.reject(new Error('Price should be greater than 50'));
            }
            return true;
        }),
    body('discount').trim()
        .custom((value) => {
            if (Number.isNaN(+value)) {
                return Promise.reject(new Error('Discount should be a number'));
            }
            return true;
        }),
    body('category')
        .not().isEmpty().withMessage('Category can\'t be empty'),
    body('tags')
        .not().isEmpty().withMessage('Please select at least one tag'),
    body('shortDescription')
        .notEmpty().withMessage('Short description should not be empty'),
    body('description')
        .notEmpty().withMessage('Description should not be empty'),
    body('image').custom((value, { req }) => {
        if (!req.file) {
            return Promise.reject(new Error('Image should not be empty'));
        }
        if (req.file.size > 2000000) {
            return Promise.reject(new Error('Image is too large'));
        }
        return true;
    }),
], postAddProduct);
router.get('/product/edit', getEditProduct);
router.post('/product/edit', [
    body('title').trim()
        .not().isEmpty()
        .withMessage('Product title can\'t be empty')
        .isLength({ max: 100 })
        .withMessage('Max length of title is 100'),
    body('price').trim()
        .not().isEmpty()
        .withMessage('Price can\'t be empty')
        .isNumeric()
        .withMessage('Price should be a number')
        .custom((value) => {
            if (value < 100) {
                return Promise.reject(new Error('Price should be greater than 50'));
            }
            return true;
        }),
    body('discount').trim()
        .custom((value) => {
            if (Number.isNaN(+value)) {
                return Promise.reject(new Error('Discount should be a number'));
            }
            return true;
        }),
    body('categories')
        .notEmpty().withMessage('No categories are selected'),
    body('tags').trim()
        .notEmpty().withMessage('Please select at least one tag'),
    body('shortDescription')
        .notEmpty()
        .withMessage('Short description should not be empty'),
    body('description')
        .notEmpty().withMessage('Description should not be empty'),
    body('image').custom((value, { req }) => {
        if (req.file?.size > 2000000) {
            return Promise.reject(new Error('Image is too large'));
        }
        return true;
    }),
], postEditProduct);
router.post('/product/featured', postProductFeatured);
router.post('/product/delete', postDeleteProduct);

// manage categories
router.get('/category', getCategories);

router.post('/category-label', [
    body('label').trim().custom((value) => {
        const expectedLabel = ['main', 'sub', 'pro-sub'];
        if (!expectedLabel.includes(value)) {
            return Promise.reject(new Error('Label is not supported'));
        }
        return true;
    }),
], getCategoryLabel);

router.get('/category/add', getAddCategory);
router.post('/category/add', [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('label').trim()
        .custom((value) => {
            if (!value) {
                return null;
            }
            const expectedLabel = ['main', 'sub', 'pro-sub'];
            if (!expectedLabel.includes(value)) {
                return Promise.reject(new Error('Label is not supported'));
            }
            return true;
        }),
    body('parent').trim().custom((value, { req }) => {
        if (!value && req.body.label !== 'main') {
            return Promise.reject(new Error('Please select a parent category'));
        }
        return true;
    }),
], postAddCategory);
router.delete('/category/delete', deleteCategory);
router.get('/category/edit', getEditCategory);
router.post('/category/edit', [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('label').trim()
        .custom((value) => {
            if (!value) {
                return null;
            }
            const expectedLabel = ['main', 'sub', 'pro-sub'];
            if (!expectedLabel.includes(value)) {
                return Promise.reject(new Error('Label is not supported'));
            }
            return true;
        }),
    body('parent').trim().custom((value, { req }) => {
        if (!value && req.body.label !== 'main') {
            return Promise.reject(new Error('Please select a parent category'));
        }
        return true;
    }),
], postEditCategory);

router.get('/ad', getAds);
router.get('/ad/add', getAddAd);
router.post('/ad/add', [
    body('slug').trim()
        .notEmpty().withMessage('slug is required')
        .custom(async (value) => {
            const adCount = await Ad.find().count();
            if (adCount >= 3) {
                return Promise.reject(new Error('Can\'n add more than 3'));
            }

            const adExists = await Ad.findOne({ slug: value });
            console.log(adExists);
            if (adExists) {
                return Promise.reject(new Error('Slug already exists', 422, true));
            }
            return true;
        }),
    body('imageSize').trim()
        .notEmpty().withMessage('Size of ad image is required')
        .custom(async (value) => {
            if (value !== 'large') {
                return true;
            }

            const adExists = await Ad.findOne({ imageSize: 'large' });
            if (adExists) {
                return Promise.reject(new Error('Can\'t add more large Advertisement', 422, true));
            }
            return true;
        }),
    body('image').custom((value, { req }) => {
        if (!req.file) {
            return Promise.reject(new Error('Image is required'));
        }

        return true;
    }),
], postAddAd);
router.get('/ad/edit', getEditAd);
router.post('/ad/edit', [
    body('slug').trim()
        .notEmpty().withMessage('slug is required')
        .custom(async (value, { req }) => {
            const { adId } = req.body;
            const adExists = await Ad.findOne({ slug: value });
            if (adExists?._id.toString() !== adId) {
                return Promise.reject(new Error('Slug already exists', 422, true));
            }
            return true;
        }),
    body('imageSize').trim()
        .notEmpty().withMessage('Size of ad image is required')
        .custom(async (value, { req }) => {
            if (value !== 'large') {
                return true;
            }

            const { adId } = req.body;
            const adExists = await Ad.findOne({ imageSize: 'large' });
            if (adExists?._id.toString() !== adId) {
                return Promise.reject(new Error('Can\'t add more large Advertisement', 422, true));
            }
            return true;
        }),
], postEditAd);
router.post('/ad/delete', deleteAd);

module.exports = router;
