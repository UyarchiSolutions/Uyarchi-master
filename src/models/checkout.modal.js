const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const addtocart = mongoose.Schema({
    _id: {
        type: String,
        default: v4,
    },
    shopId: {
        type: String,
    },
    cart: {
        type: Array,
    },
    date: {
        type: String,
    },
    created: {
        type: Date,
    },
    status: {
        type: String,
        default: "Pending"
    },
    active: {
        type: Boolean,
        default: true,
    },
    delivery_type:{
        type: String, 
    },
    archive: {
        type: Boolean,
        default: false,
    },
});
addtocart.plugin(toJSON);
addtocart.plugin(paginate);
const AddToCart = mongoose.model('addtocart', addtocart);

module.exports = { AddToCart };