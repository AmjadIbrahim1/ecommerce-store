// order mongoose modal
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    division: {
        type: String,
        required: true,
    },
    district: {
        type: String,
        required: true,
    },
    upazilla: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
    products: [
        {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
        },
    ],
});

module.exports = mongoose.model('Order', orderSchema);
