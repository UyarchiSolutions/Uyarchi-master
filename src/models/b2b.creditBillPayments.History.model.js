const mongoose = require('mongoose');
const { v4 } = require('uuid');
const moment = require('moment');


const creditBillPaymentsSchema = mongoose.Schema({
    _id: {
        type: String,
        default: v4,
    },
    orderId: {
        type: String,
        
    },
    shopId: {
        type: String
    },
    date: {
        type: String,
    },
    time: {
        type: String,
    },
    // creditbillId: {
    //     type: String,
    // },
    // bill: {
    //     type:String,
    // },
    pay_By:{
        type: String,
    },
    pay_type:{
        type:String
    },
    upiStatus:{
        type: String,
    },
    amountPayingWithDEorSM: {
        type: Number,
        default: 0,
    },
    actionStatus: {
        type: String
    },
    creditBillId:{
        type: String
    },
    reasonScheduleOrDate: {
        type: String
    },
    disputeAmount: {
        type: Number
    },


});

const creditBillPayments = mongoose.model('creditBillPaymentHistory',creditBillPaymentsSchema);
module.exports = creditBillPayments;