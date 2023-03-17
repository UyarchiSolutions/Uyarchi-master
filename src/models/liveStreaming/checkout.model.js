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
    type: Number,
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
    default: 'Pending',
  },
  proceed_To_Pay: {
    type: String,
  },
  startTime: {
    type: Number,
  },
  endTime: {
    type: Number,
  },

});

const streamingCart = mongoose.model('streamingcart', streamingCartschema);


const streamingCartProductschema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  DateIso: {
    type: Number,
  },
  categoryId: {
    type: String,
  },
  created: {
    type: String,
  },
  image: {
    type: String,
  },
  incrementalLots: {
    type: Number,
  },
  marketPlace: {
    type: Number,
  },
  offerPrice: {
    type: Number,
  },
  postLiveStreamingPirce: {
    type: Number,
  },
  productTitle: {
    type: String,
  },
  minLots: {
    type: Number,
  },
  suppierId: {
    type: String,
  },
  cartQTY: {
    type: Number,
  },
  productId: {
    type: String,
  },
  bookingAmount: {
    type: String,
  },
  streamPostId: {
    type: String,
  },
  streamrequestpostId: {
    type: String,
  },
  streamingCart: {
    type: String,
  },
  cardStatus: {
    type: Boolean,
    default: true
  },
  add_to_cart: {
    type: Boolean,
  },
  quantity: {
    type: Number,
  },
  proceed_To_Pay: {
    type: String,
  },
  startTime: {
    type: Number,
  },
  endTime: {
    type: Number,
  },
});

const streamingCartProduct = mongoose.model('streamingcartproducts', streamingCartProductschema);

const streamingOrderschema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  DateIso: {
    type: Number,
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
    default: 'ordered',
  },
  orderStatus: {
    type: String,
    default: 'Pending',
  },
  approvalStatus: {
    type: String,
    default: 'Pending',
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
  Amount: {
    type: Number,
  },
  bookingtype: {
    type: String,
  },
  totalAmount: {
    type: Number,
  },
});

const streamingOrder = mongoose.model('streamingorder', streamingOrderschema);

const streamingproductschema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  DateIso: {
    type: Number,
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
    type: Number,
  },
  purchase_quantity: {
    type: Number,
  },
  shopId: {
    type: String,
  },
  streamId: {
    type: String,
  },
  status: {
    type: String,
    default: 'Pending',
  },
  streamPostId: {
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
    type: Number,
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
    default: 'Pending',
  },
  onlinepaymentId: {
    type: String,
  },
  onlineorderId: {
    type: String,
  },
  paymentTypes: {
    type: String,
    default: 'offline',
  },
  paymentGatway: {
    type: String,
  },
  shopId: {
    type: String,
  },
  streamId: {
    type: String,
  },
  bookingtype: {
    type: String,
  },
  totalAmount: {
    type: Number,
  },
});
const streamingorderPayments = mongoose.model('streamingorderpayment', streamingPaymant);

module.exports = { streamingCart, streamingCartProduct, streamingOrder, streamingorderProduct, streamingorderPayments };
