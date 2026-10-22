const mongoose = require('mongoose');

const adSchema = mongoose.Schema({
    slug: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    imageSize: { type: String, required: true }, // large || small
}, { timestamps: true });

module.exports = mongoose.model('Ad', adSchema);
