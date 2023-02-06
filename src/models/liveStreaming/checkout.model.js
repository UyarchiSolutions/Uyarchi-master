const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('../plugins');
const { roles } = require('../../config/roles');
const { StringDecoder } = require('string_decoder');
const { v4 } = require('uuid');

const streamingCartschema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  DateIso: {
    type: Number
  },
  date: {
    type: String,
  },
  created: {
    type: Date,
  },
  time: {
    type: Number,
  },
  streamId: {
    type: String,
  },
  cart: {
    type: Array,
  },
  shopId: {
    type: String,
  },
  status: {
    type: String,
    default: 'Pending'
  },

});

const streamingCart = mongoose.model('streamingcart', streamingCartschema);


const streamingOrderschema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  DateIso: {
    type: Number
  },
  date: {
    type: String,
  },
  created: {
    type: Date,
  },
  time: {
    type: Number,
  },
  streamId: {
    type: String,
  },
  cartId: {
    type: Array,
  },
  shopId: {
    type: String,
  },
  status: {
    type: String,
    default: 'ordered',
  },
  orderId: {
    type: String,
  },
  name: {
    type: String,
  },
  state: {
    type: String,
  },
  city: {
    type: String,
  },
  pincode: {
    type: String,
  },
  address: {
    type: String,
  },
  paymantMethod: {
    type: String,
  },
  paidAmount: {
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
  }


});

const streamingOrder = mongoose.model('streamingorder', streamingOrderschema);



const streamingproductschema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  DateIso: {
    type: Number
  },
  date: {
    type: String,
  },
  created: {
    type: Date,
  },
  time: {
    type: Number,
  },
  orderId: {
    type: String,
  },
  postId: {
    type: String,
  },
  productId: {
    type: String,
  },
  purchase_price: {
    type: String,
  },
  purchase_quantity: {
    type: String,
  },
  shopId:{
    type: String,

  }

});
const streamingorderProduct = mongoose.model('streamingorderproduct', streamingproductschema);


const streamingPaymant = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  DateIso: {
    type: Number
  },
  date: {
    type: String,
  },
  created: {
    type: Date,
  },
  time: {
    type: Number,
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
  paymentGatway: {
    type: String,
  }
})
const streamingorderPayments = mongoose.model('streamingorderpayment', streamingPaymant);

module.exports = { streamingCart, streamingOrder, streamingorderProduct, streamingorderPayments };
