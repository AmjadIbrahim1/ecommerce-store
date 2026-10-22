const mongoose = require('mongoose');

const bannerSchema = mongoose.Schema({
    slug: { type: String, required: true },
    heading: { type: String, required: true },
    image: { type: String, required: true },
    text: { type: String, required: true },
    productCategory: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
