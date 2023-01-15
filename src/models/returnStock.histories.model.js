const { boolean } = require('joi');
const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const ReturnStock_history = new mongoose.Schema({
    _id: {
        type: String,
        default: v4
    },
    groupId: {
        type: String,
    },
    returnStockId: {
        type: String,
    },
    productId: {
        type: String,
    },
    product: {
        type: String,
    },
    actualStock: {
        type: Number,
    },
    mismatch: {
        type: Number,
    },
    wastageStock: {
        type: Number,
    },
    created: {
        type: Date
    },
    fineStatus: {
        type: String,
        default: "Pending"
    },
    active: {
        type: Boolean,
        default: true
    }
})

const ReturnStockHistory = mongoose.model('returnStockhistories', ReturnStock_history)

module.exports = ReturnStockHistory