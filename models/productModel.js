const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    images: [{
        thumb: String,
        normal: { type: String, required: true },
        large: { type: String, required: true },
        extraLarge: String,
    }],
    price: { type: Number, required: true },
    discount: Number,
    totalSale: { type: Number, default: 0 },
    shortDescription: { type: String, required: true },
    description: { type: String, required: true },
    categories: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Category' }],
    // brand: { type: mongoose.Types.ObjectId, required: false, ref: 'Brand' },
    featured: { type: Boolean, default: false },
    tags: [{ type: String, required: true }],
    flag: { type: String },
    rating: { type: Number, required: true, default: 0 },
    reviews: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        rating: { type: Number, required: true },
        description: String,
    }],
}, { timestamps: true });

productSchema.methods.addReview = function ({ userId, rating, description }) {
    this.reviews = [{ userId, rating, description }, ...this.reviews];
    const newRating = this.reviews.reduce(
        (previous, current) => previous + current.rating, 0,
    );
    this.rating = (newRating / this.reviews.length).toFixed(1);

    return this.save();
};

module.exports = mongoose.model('Product', productSchema);
