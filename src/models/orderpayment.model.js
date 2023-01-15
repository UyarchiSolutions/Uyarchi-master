const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const OrderPaymentSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  date: {
    type: String,
  },
  time: {
    type: Number,
  },
  created: {
    type: Date,
  },
  paidAmt: {
    type: Number,
  },
  type: {
    type: String,
  },
  orderId: {
    type: String,
  },
  uid: {
    type: String,
  },
  payment: {
    type: String,
    // default: 'Paynow',
  },
  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
  pay_type: {
    type: String,
  },
  paymentMethod: {
    type: String,
  },
  paymentstutes: {
    type: String,
  },
  RE_order_Id: {
    type: String,
  },
  reorder_status: {
    type: Boolean,
  },
  creditBillStatus: {
    type: String,
  },
  reasonScheduleOrDate: {
    type: String,
  },
  creditID: {
    type: String,
  },
  Schedulereason: {
    type: String,
  },
  creditApprovalStatus: {
    type: String,
    default: "Pending"
  },
  onlinepaymentId: {
    type: String,
  },
  onlineorderId: {
    type: String,
  },
  paymentTypes: {
    type: String,
    default: "offline",
  },
  paymentGatway:{
    type: String,
  }
});

const OrderPayment = new mongoose.model('orderPayment', OrderPaymentSchema);

module.exports = OrderPayment;
