
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
    numberOfStreamused: {
        type: Number,
        default: 0,
    },
    noOfParticipants: {
        type: Number
    },
    chat: {
        type: String
    },
    max_post_per_stream: {
        type: Number
    },
    Duration: {
        type: Number
    },
    planType: {
        type: String,
        default: "normal"
    },
    streamId: {
        type: String,
    },
    planName: {
        type: String,
    },
    DurationType: {
        type: String,
    },
    numberOfParticipants: {
        type: Number,
    },
    numberofStream: {
        type: Number,
    },
    validityofplan: {
        type: Number,
    },
    noOfParticipantsCost: {
        type: Number,
    },
    chatNeed: {
        type: String,
    },
    commision: {
        type: String,
    },
    commition_value: {
        type: Number,
    },
    stream_expire_hours: {
        type: Number,
    },
    stream_expire_days: {
        type: Number,
    },
    stream_expire_minutes: {
        type: Number,
    },
    regularPrice: {
        type: Number,
    },
    salesPrice: {
        type: Number,
    },
    description: {
        type: String,
    },
    planmode: {
        type: String,
    },
    expireDate: {
        type: Number,
    },
    streamvalidity: {
        type: Number,
        default: 30
    },
    no_of_host: {
        type: Number,

    }

});

const purchasePlan = mongoose.model('purchasedPlans', purchasePlanSchema);

module.exports = { purchasePlan };
