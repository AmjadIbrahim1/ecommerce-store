const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String },
    label: { type: String, required: true }, // one of 'main', 'sub', 'pro-sub'
    parent: { type: String },
    isFeatured: { type: Boolean, required: true, default: false },
    imageSize: { type: String }, // large || small
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
