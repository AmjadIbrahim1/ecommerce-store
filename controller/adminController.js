const { errorValidation } = require('../utils/error-validation');
const { makeSlug } = require('../utils/makeSlug');
const { throwError } = require('../utils/throwError');
const { checkFileExt } = require('../utils/checkFileExt');
// models
const Banner = require('../models/bannerModel');
const Product = require('../models/productModel');
const User = require('../models/UserModel');
const Category = require('../models/categoryModel');
const Ad = require('../models/adModel');
const Tag = require('../models/tagModel');

const { productImageResize } = require('../utils/imageResize');
const { deleteFile } = require('../utils/file');

module.exports.getIndex = async (req, res, next) => {
    try {
        const adminRequest = await User
            .find({ isAdmin: true, isActive: false })
            .sort({ createdAt: -1 });

        res.render('admin/layouts/layout', {
            title: 'Admin Panel - Amjad',
            page: 'pages/index',
            path: `/${process.env.ADMIN_PANEL_PATH}`,
            user: req.user,

            data: { adminRequest },
        });
    } catch (err) {
        next(err);
    }
};

module.exports.getActivities = (req, res) => {
    res.render('admin/layouts/layout', {
        title: 'Activities - Amjad',
        page: 'pages/activities',
        path: `/${process.env.ADMIN_PANEL_PATH}/activities`,
        user: req.user,

        data: {},
    });
};

module.exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find();

        res.render('admin/layouts/layout', {
            title: 'All Category - Amjad',
            page: 'pages/categories',
            path: `/${process.env.ADMIN_PANEL_PATH}/category`,
            user: req.user,

            data: { categories },
        });
    } catch (err) {
        return next(err);
    }
    return null;
};

module.exports.getCategoryLabel = async (req, res, next) => {
    try {
        const { label } = req.body;
        let parentCategory = '';

        if (label === 'sub') {
            parentCategory = 'main';
        } else if (label === 'pro-sub') {
            parentCategory = 'sub';
        }

        const categories = await Category.find({ label: parentCategory });
        res.status(200).json({ message: 'Category found', categories });
    } catch (err) {
        next(err);
    }
};

module.exports.getAddCategory = async (req, res, next) => {
    try {
        const categories = await Category.find();

        return res.render('admin/layouts/layout', {
            title: 'Add Category - Amjad',
            page: 'pages/edit-category',
            path: `/${process.env.ADMIN_PANEL_PATH}/category/add`,
            user: req.user,

            data: { categories },
        });
    } catch (err) {
        next(err);
    }
    return null;
};

module.exports.postAddCategory = async (req, res, next) => {
    try {
        errorValidation(req);

        const { name, label, parent } = req.body;
        const slug = makeSlug(name);

        const categoryExists = await Category.findOne({ name });
        if (categoryExists) {
            throwError('Category already exists', 422, true);
        }

        const category = new Category({
            name,
            slug,
            label: label || 'main',
            parent,
        });

        try {
            await category.save();
        } catch (err) {
            throwError('Unable to save', 500, true);
        }

        res.json({ message: 'Category Saved' });
    } catch (err) {
        next(err);
    }
    return null;
};

module.exports.getEditCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.query;
        let category; let parent;

        try {
            category = await Category.findOne({ _id: categoryId }).populate('parent');
            parent = category.parent;
        } catch (err) {
            category = await Category.findOne({ _id: categoryId });
            parent = null;
        }

        const parents = await Category.find({ label: parent?.label });

        return res.render('admin/layouts/layout', {
            title: 'Add Category - Amjad',
            page: 'pages/edit-category',
            path: `/${process.env.ADMIN_PANEL_PATH}/category/edit`,
            user: req.user,

            data: {
                category,
                parents,
                editMode: true,
            },
        });
    } catch (err) {
        next(err);
    }
    return null;
};

module.exports.postEditCategory = async (req, res, next) => {
    try {
        errorValidation(req);

        const {
            categoryId, name, label, parent,
        } = req.body;
        const slug = makeSlug(name);

        const categoryExists = await Category.findOneAndUpdate(
            { _id: categoryId },
            {
                name, slug, label, parent,
            },
            { useFindAndModify: false },
        );

        try {
            await categoryExists.save();
        } catch (err) {
            throwError('Unable to save', 500, true);
        }

        res.json({ message: 'Category Saved' });
    } catch (err) {
        next(err);
    }
    return null;
};

module.exports.deleteCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.body;

        try {
            await Category.findOneAndDelete({ _id: categoryId });
        } catch (err) {
            throwError('Unable to delete category', 500, true);
        }
        res.status(200).json({ message: 'Category deleted' });
    } catch (err) {
        next(err);
    }
};

module.exports.getBanners = async (req, res) => {
    const banners = await Banner.find();

    res.render('admin/layouts/layout', {
        title: 'Banners - Amjad',
        page: 'pages/banners',
        path: `/${process.env.ADMIN_PANEL_PATH}/banner`,
        user: req.user,

        data: { banners },
    });
};

module.exports.getAddBanner = async (req, res, next) => {
    try {
        const categories = await Category.find();

        res.render('admin/layouts/layout', {
            title: 'Add Banner - Amjad',
            page: 'pages/edit-banner',
            path: `/${process.env.ADMIN_PANEL_PATH}/banner/add`,
            user: req.user,

            data: { editMode: false, categories },
        });
    } catch (err) {
        next(err);
    }
};

module.exports.postAddBanner = async (req, res, next) => {
    try {
        errorValidation(req);
        const { heading, text, productCategory } = req.body;

        // check if banner is already exists
        const bannerExists = await Banner.findOne({ heading });
        if (bannerExists) {
            throwError('Banner is already exists', 422, true);
        }

        // add new banner
        const banner = new Banner({
            slug: makeSlug(heading),
            image: req.file.path.replace(/\\/g, '/'),
            heading,
            text,
            productCategory,
        });

        try {
            await banner.save();
        } catch (err) {
            throwError('Unable to save banner', 500, true);
        }
        return res.status(200).json({ message: 'Banner information has been saved' });
    } catch (err) {
        next(err);
    }
    return null;
};

module.exports.getEditBanner = async (req, res, next) => {
    try {
        const { bannerId } = req.query;
        const banner = await Banner.findById(bannerId);
        const categories = await Category.find();

        if (!banner) {
            return next();
        }

        res.render('admin/layouts/layout', {
            title: 'Add Banner - Amjad',
            page: 'pages/edit-banner',
            path: `/${process.env.ADMIN_PANEL_PATH}/banner/add`,
            user: req.user,

            data: { editMode: true, banner, categories },
        });
    } catch (err) {
        next(err);
    }
    return null;
};

module.exports.postEditBanner = async (req, res, next) => {
    try {
        errorValidation(req);
        const {
            bannerId, heading, text, productCategory,
        } = req.body;

        let oldImage;
        const banner = await Banner.findById(bannerId);

        if (heading) {
            banner.slug = makeSlug(heading);
            banner.heading = heading;
        }
        if (text) banner.heading = text;
        if (productCategory) banner.productCategory = productCategory;
        if (req.file) {
            oldImage = banner.image;
            banner.image = req.file.path.replace(/\\/g, '/');
        }

        try {
            await banner.save();
        } catch (err) {
            throwError('Unable to save banner', 500, true);
        }
        if (oldImage) deleteFile(oldImage);
        return res.status(200).json({ message: 'Banner is updated' });
    } catch (err) {
        next(err);
    }
    return null;
};

module.exports.deleteBanner = async (req, res, next) => {
    try {
        const { _id } = req.body;

        const banner = await Banner.findOne({ _id });
        if (!banner) {
            throwError('Unable to find banner', 404, true);
        }

        try {
            await Banner.deleteOne({ _id });
        } catch (err) {
            const error = new Error('Unable to delete banner');
            error.status = 500;
            error.apiError = true;
            throw error;
        }

        return res.status(200).json({ message: 'Banner Deleted.' });
    } catch (err) {
        next(next);
    }
    return null;
};

// manage products
module.exports.getProducts = async (req, res, next) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });

        res.render('admin/layouts/layout', {
            title: 'All Products - Amjad',
            page: 'pages/products',
            path: `/${process.env.ADMIN_PANEL_PATH}/product`,
            user: req.user,

            data: { products },
        });
    } catch (err) {
        next(err);
    }
};

module.exports.getAddProduct = async (req, res) => {
    const categories = await Category.find();
    const tags = await Tag.find();

    res.render('admin/layouts/layout', {
        title: 'Add New Product - Amjad',
        page: 'pages/edit-product',
        path: `/${process.env.ADMIN_PANEL_PATH}/product/add`,
        user: req.user,

        data: { editMode: false, categories, tags },
    });
};

module.exports.postAddProduct = async (req, res, next) => {
    try {
        errorValidation(req);
        if (req.file) {
            checkFileExt(req.file.originalname, 'image');
        }

        const {
            title, price, discount, category, shortDescription, description, flag,
        } = req.body;
        const tags = JSON.parse(req.body.tags);

        // save tags of product
        try {
            tags.forEach(async (item) => {
                const tag = await Tag.findOne({ name: item.toLowerCase() });
                if (!tag) {
                    const newTag = new Tag({
                        name: item.toLowerCase(),
                        slug: makeSlug(item),
                    });
                    await newTag.save();
                }
            });
        } catch (err) {
            throwError('Unable to save Tag', 500, true);
        }

        // resize image 800x800 => 100x100, 360x360, 630x630
        // oneSet = {thumb, normal, large, extraLarge}
        let oneSet;
        try {
            oneSet = await productImageResize(req.file.path);
        } catch (err) {
            next(err);
        }

        // check if product already exists
        const existingProduct = await Product.findOne({ slug: makeSlug(title) });
        if (existingProduct) {
            throwError('Product already exists', 422, true);
        }

        // create new product
        const product = new Product({
            userId: req.user._id,
            slug: makeSlug(title),
            title,
            price,
            discount,
            category,
            tags,
            flag,
            shortDescription,
            description,
            images: [oneSet],
        });
        try {
            product.save();
        } catch (err) {
            throwError('Unable to save product', 500, true);
        }
        res.status(200).json({ message: 'Product successfully added' });
    } catch (err) {
        next(err);
    }
};

module.exports.getEditProduct = async (req, res, next) => {
    try {
        const { productId } = req.query;
        const product = await Product.findById(productId).populate('categories');
        if (!product) {
            return next();
        }

        const categories = await Category.find();

        res.render('admin/layouts/layout', {
            title: 'Edit Product - Amjad',
            page: 'pages/edit-product',
            path: `/${process.env.ADMIN_PANEL_PATH}/product/edit`,
            user: req.user,

            data: { editMode: true, categories, product },
        });
    } catch (err) {
        next(err);
    }
    return null;
};

module.exports.postEditProduct = async (req, res, next) => {
    try {
        errorValidation(req);
        let oldImages;
        if (req.file) {
            checkFileExt(req.file.originalname, 'image');
        }

        const {
            productId, title, price, discount, categories, shortDescription, description, flag,
        } = req.body;
        console.log(categories);
        let tags;
        try {
            tags = JSON.parse(req.body.tags);
        } catch (err) {
            throwError('Edit tags and try again', 422, true);
        }

        // resize image 800x800 => 100x100, 360x360, 630x630
        // oneSet = {thumb, normal, large, extraLarge}
        let oneSet;
        if (req.file) {
            try {
                oneSet = await productImageResize(req.file.path);
            } catch (err) {
                next(err);
            }
        }

        // check if product already exists
        const product = await Product.findById(productId);

        if (!product) {
            throwError('Product Not Found', 404, true);
        }

        if (title) {
            product.title = title;
            product.slug = makeSlug(title);
        }
        if (price) product.price = price;
        if (discount) product.discount = discount;
        if (categories) product.categories = categories;
        if (tags) product.tags = tags;
        if (flag) product.flag = flag;
        if (shortDescription) product.shortDescription = shortDescription;
        if (description) product.description = description;
        if (req.file) {
            oldImages = product.images;
            product.images = [oneSet];
        }

        try {
            product.save();
        } catch (err) {
            throwError('Unable to save product', 500, true);
        }
        res.status(200).json({ message: 'Product successfully added' });
        // delete all previous images
        if (oldImages) {
            oldImages.forEach((imageBlock) => {
                deleteFile(imageBlock.thumb);
                deleteFile(imageBlock.normal);
                deleteFile(imageBlock.large);
                deleteFile(imageBlock.extraLarge);
            });
        }
    } catch (err) {
        next(err);
    }
    return null;
};

module.exports.postProductFeatured = async (req, res, next) => {
    try {
        const { productId } = req.body;
        const product = await Product.findById(productId);
        if (!product) {
            throwError('Product Not Found', 404, true);
        }

        product.featured = !product.featured;
        try {
            product.save();
        } catch (err) {
            throwError('Unable to save product', 500, true);
        }
        return res.status(200).json({ message: 'Product saved' });
    } catch (err) {
        next(err);
    }
    return null;
};

module.exports.postDeleteProduct = async (req, res, next) => {
    try {
        const { productId } = req.body;
        const product = await Product.deleteOne({ _id: productId });

        // delete all previous images
        product.images.forEach((imageBlock) => {
            deleteFile(imageBlock.thumb);
            deleteFile(imageBlock.normal);
            deleteFile(imageBlock.large);
            deleteFile(imageBlock.extraLarge);
        });

        res.status(200).json({ message: 'Product Deleted' });
    } catch (err) {
        next(err);
    }
    return null;
};

module.exports.getAds = async (req, res, next) => {
    try {
        const ads = await Ad.find().sort({ createdAt: -1 });

        res.render('admin/layouts/layout', {
            title: 'All Products - Amjad',
            page: 'pages/ads',
            path: `/${process.env.ADMIN_PANEL_PATH}/ad`,
            user: req.user,

            data: { ads },
        });
    } catch (err) {
        next(err);
    }
};

module.exports.getAddAd = async (req, res, next) => {
    try {
        errorValidation(req);
        const categories = await Category.find();

        res.render('admin/layouts/layout', {
            title: 'Add New Advertisement - Amjad',
            page: 'pages/edit-ad',
            path: `/${process.env.ADMIN_PANEL_PATH}/ad/add`,
            user: req.user,

            data: {
                editMode: false,
                categories,
            },
        });
    } catch (err) {
        next(err);
    }
    return null;
};

module.exports.postAddAd = async (req, res, next) => {
    try {
        errorValidation(req);

        const { slug, imageSize } = req.body;
        const image = req.file.path.replace(/\\/g, '/');

        const ad = new Ad({ slug, imageSize, image });
        try {
            await ad.save();
        } catch (err) {
            throwError('Unable to save', 500, true);
        }

        return res.json({ message: 'Advertisement Saved' });
    } catch (err) {
        next(err);
    }
    return null;
};

module.exports.getEditAd = async (req, res, next) => {
    try {
        errorValidation(req);
        const { adId } = req.query;
        const categories = await Category.find();
        const ad = await Ad.findById(adId);

        res.render('admin/layouts/layout', {
            title: 'Add New Advertisement - Amjad',
            page: 'pages/edit-ad',
            path: `/${process.env.ADMIN_PANEL_PATH}/ad/edit`,
            user: req.user,

            data: {
                editMode: true,
                categories,
                ad,
            },
        });
    } catch (err) {
        next(err);
    }
    return null;
};

module.exports.postEditAd = async (req, res, next) => {
    try {
        errorValidation(req);

        const { adId, slug, imageSize } = req.body;
        const image = req.file?.path?.replace(/\\/g, '/');

        const ad = await Ad.findById(adId);
        const oldImage = ad.image;

        if (adId) ad.slug = slug;
        if (imageSize) ad.imageSize = imageSize;
        if (image) ad.image = image;

        try {
            await ad.save();
        } catch (err) {
            throwError('Unable to save', 500, true);
        }
        if (image) deleteFile(oldImage);

        return res.json({ message: 'Advertisement Saved' });
    } catch (err) {
        next(err);
    }
    return null;
};

module.exports.deleteAd = async (req, res, next) => {
    try {
        const { adId } = req.body;
        const ad = await Ad.findById(adId);
        try {
            await Ad.deleteOne({ _id: adId });
        } catch (err) {
            throwError('Unable to delete ad', 500, true);
        }
        deleteFile(ad.image);

        res.status(204).json({ message: 'Advertisement Deleted' });
    } catch (err) {
        next(err);
    }
};
