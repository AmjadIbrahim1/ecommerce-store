const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,

    isActive: { type: Boolean, default: true },
    isSuperAdmin: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    isGuest: { type: Boolean, default: false },

    emailVerified: { type: Boolean, default: false },
    resetToken: String,
    resetTokenExpire: Date,

    cart: {
        items: [{
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true },
        }],
    },
    wishList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    }],
}, { timestamps: true });

userSchema.methods.cartTotal = function () {
    let total = 0;
    this.populate('cart.items.productId');
    this.cart.items.forEach((item) => {
        const product = item.productId;
        total += (product.price - product.price * (product.discount / 100)) * item.quantity;
    });
    return Math.round(total);
};

userSchema.methods.addToCart = function (productId, quantity = 1) {
    const updatedCartItems = [...this.cart.items];
    const productIndex = updatedCartItems.findIndex(
        (item) => item.productId._id.toString() === productId.toString(),
    );

    if (productIndex >= 0) {
        updatedCartItems[productIndex].quantity += quantity;
    } else {
        updatedCartItems.push({ productId, quantity });
    }
    this.cart = { items: updatedCartItems };
    return this.save();
};

userSchema.methods.getCartProducts = async function () {
    const products = [];
    await this.populate('cart.items.productId');
    this.cart.items.forEach((item) => {
        const product = item.productId;
        products.push({
            id: product.id,
            title: product.title,
            quantity: item.quantity,
            price: product.price - product.price * (product.discount / 100),
            discount: product.discount,
        });
    });
    return products;
};

userSchema.methods.removeFromCart = function async(productId) {
    const updatedCartItems = this.cart.items;
    const productIndex = updatedCartItems.findIndex(
        (item) => item.productId.toString() === productId,
    );
    updatedCartItems.splice(productIndex, 1);
    this.cart = { items: updatedCartItems };
    return this.save();
};

userSchema.methods.clearCart = function () {
    this.cart = { items: [] };
    return this.save();
};

userSchema.methods.addToWishList = function (productId) {
    const updatedWishList = [...this.wishList];
    const productIndex = updatedWishList.findIndex(
        (item) => item.toString() === productId.toString(),
    );

    if (productIndex >= 0) {
        return this;
    }
    updatedWishList.push(productId);
    this.wishList = [...updatedWishList];
    return this.save();
};

userSchema.methods.removeFromWishlist = function (productId) {
    const updatedWishList = this.wishList;
    const productIndex = updatedWishList.findIndex(
        (item) => item.toString() === productId,
    );
    if (productIndex < 0) {
        return this;
    }
    updatedWishList.splice(productIndex, 1);
    this.wishList = [...updatedWishList];
    return this.save();
};

module.exports = mongoose.model('User', userSchema);
