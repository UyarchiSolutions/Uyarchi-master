
const mongoose = require('mongoose');
const { v4 } = require('uuid');
const moment = require('moment');

const purchasePlanSchema = mongoose.Schema({
    _id: {
        type: String,
        default: v4,
    },
    planId: {
        type: String,
    },
    suppierId: {
        type: String,
    },
    created: {
        type: Date,
    },
    DateIso: {
        type: Number
    },
    paidAmount: {
        type: Number
    },
    paymentStatus: {
        type: String,
    },
    order_id: {
        type: String,
    },
    razorpay_order_id: {
        type: String,
    },
    razorpay_payment_id: {
        type: String,
    },
    razorpay_signature: {
        type: String,
    },
    active: {
        type: Boolean,
        default: true
    },
    archived: {
        type: Boolean,
        default: false
    },
    numberOfStreamused:{
        type: Number,
        default:0,
    }
});

const purchasePlan = mongoose.model('purchasedPlans', purchasePlanSchema);

module.exports = { purchasePlan };
