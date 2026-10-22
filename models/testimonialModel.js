const mongoose = require('mongoose');

const testimonialSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    testimonial: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
