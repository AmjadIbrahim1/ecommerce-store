const { performance } = require('perf_hooks');
const Banner = require('../models/bannerModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Ad = require('../models/adModel');

module.exports.getIndex = async (req, res, next) => {
    try {
        const ads = await Ad.find();
        const banners = await Banner.find().limit(4);
        const categories = await Category.find();
        const products = await Product.find().populate('categories');

        const bestSellingProducts = products.sort((a, b) => b.totalSale - a.totalSale);
        const featuredProducts = products.filter((product) => product.featured).slice(0, 5);
        const newArrivals = products.filter((product) => product.flag.toLowerCase() === 'new').slice(0, 10);

        res.render('layouts/layout', {
            title: 'Home - Amjad',
            page: 'pages/index',
            path: '/',

            data: {
                banners, categories, bestSellingProducts, ads, featuredProducts, newArrivals,
            },
        });
    } catch (err) {
        next(err);
    }
};

module.exports.getSearchSuggestion = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.send('');
        }

        const agg = [
            {
                $search: {
                    index: 'search-suggestion',
                    autocomplete: {
                        query: q,
                        path: 'title',
                        fuzzy: {
                            maxEdits: 1,
                        },
                        score: {
                            function: {
                                multiply: [
                                    {
                                        score: 'relevance',
                                    }, {
                                        path: {
                                            value: 'rating',
                                            undefined: 1,
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            }, {
                $project: {
                    title: 1,
                    slug: 1,
                },
            }, {
                $limit: 10,
            },
        ];
        const searchSuggestions = await Product.aggregate(agg);
        return res.status(200).json(searchSuggestions);
    } catch (err) {
        return next(err);
    }
};

module.exports.search = async (req, res, next) => {
    try {
        const { q } = req.query;
        const category = req.query.category?.split(',');
        let price = req.query.price?.split('-');
        price = { min: +price?.[0], max: +price?.[1] };

        if (!q?.trim().length) {
            return res.redirect('/');
        }

        const categories = await Category.find();

        const pipeline = [
            {
                $search: {
                    compound: {
                        should: [
                            {
                                text: {
                                    query: q,
                                    path: 'title',
                                    score: {
                                        function: {
                                            multiply: [
                                                {
                                                    score: 'relevance',
                                                }, {
                                                    path: {
                                                        value: 'rating',
                                                        undefined: 1,
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                    fuzzy: {},
                                },
                            }, {
                                text: {
                                    query: q,
                                    path: [
                                        'shortDescription', 'description',
                                    ],
                                },
                            }, {
                                text: {
                                    query: q,
                                    path: 'tags',
                                    score: {
                                        boost: {
                                            value: 1,
                                        },
                                    },
                                    fuzzy: {},
                                },
                            },
                        ],
                    },
                },
            }, {
                $lookup: {
                    from: 'categories',
                    localField: 'categories',
                    foreignField: '_id',
                    as: 'categories',
                },
            }, {
                $limit: 20,
            },
        ];
        const t0 = performance.now();
        let products = await Product.aggregate(pipeline);
        const t1 = performance.now();
        const deference = (t1 - t0).toFixed(2);

        let foundTags = products.map((product) => product.tags);
        foundTags = [...new Set(...foundTags)];

        let foundAllCategories = products.map((product) => product.categories);
        foundAllCategories = foundAllCategories.flat(Infinity);
        foundAllCategories = foundAllCategories.filter(
            (item, index, self) => index === self.findIndex(
                (t) => (t._id.toString() === item._id.toString()),
            ),
        );

        // filter out all products that do not match category
        if (category) {
            products = products.filter(
                (product) => product.categories.find(
                    (item) => category.find((cat) => item.slug === cat),
                ),
            );
        }

        // filter by price range
        if (price.min && price.max) {
            products = products.filter(
                (product) => price.min <= product.price && product.price <= price.max,
            );
        }

        const searchSpeed = `${products.length} product found in ${deference} ms`;
        return res.render('layouts/layout', {
            title: `Searching for '${q}' - Amjad`,
            page: 'pages/search',
            path: '/search',

            data: {
                filterQuery: { ...req.query, price, foundTags },
                products,
                categories,
                foundAllCategories,
                searchSpeed,
            },
        });
    } catch (err) {
        return next(err);
    }
};

module.exports.getProduct = async (req, res, next) => {
    try {
        const { slug } = req.params;

        const categories = await Category.find();
        const product = await Product.findOne({ slug }).populate('categories').populate('reviews.userId');

        res.render('layouts/layout', {
            title: `${product.title} - ${product.categories[0].name}`,
            page: 'pages/product-details',
            path: '/product',

            data: { categories, product },
        });
    } catch (err) {
        next(err);
    }
};

module.exports.getProductModal = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId);

        res.render('components/modals/productModal', {
            data: { product },
        });
    } catch (err) {
        next(err);
    }
};
