const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');


const Razorpayschema = new mongoose.Schema({
    _id: {
        type: String,
        default: v4,
    },
    unit: {
        type: String,
    },
    quantity: {
        type: Number,
    },
    material: {
        type: String,
    },
    active: {
        type: Boolean,
        default: true,
    },
    archive: {
        type: Boolean,
        default: false,
    },
});
Razorpayschema.plugin(toJSON);
Razorpayschema.plugin(paginate);

const Razorpaypaymet = mongoose.model('razorpay', Razorpayschema);

module.exports = { Razorpaypaymet };
