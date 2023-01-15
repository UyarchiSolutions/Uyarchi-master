const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const callStatusSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  qtyOffered: {
    type: Number,
  },
  strechedUpto: {
    type: Number,
  },
  Expdate: {
    type: String,
  },
  Type: {
    type: String
  },
  price: {
    type: Number,
  },
  confirmprice: {
    type: Number,
  },
  status: String,
  requestAdvancePayment: {
    type: String,
  },
  callstatus: {
    type: String,
  },
  confirmcallstatus: {
    type: String,
  },
  callDetail: {
    type: String,
  },
  confirmcallDetail: {
    type: String,
  },
  productid: {
    type: String,
  },
  supplierid: {
    type: String,
  },
  confirmOrder: {
    type: Number,
  },
  phStatus: {
    type: String,
  },
  phreason: {
    type: String,
  },
  phApproved: {
    type: Number,
  },
  date: {
    type: String,
  },
  showWhs: {
    type: Boolean,
    default: false,
  },
  time: {
    type: Number,
  },
  active: {
    type: Boolean,
    default: true,
  },
  exp_date: {
    type: String,
  },
  orderType: {
    type: String,
  },
  StockReceived: {
    type: String,
    default: 'Pending',
  },
  archive: {
    type: Boolean,
    default: false,
  },
  created: {
    type: Date,
  },
  order_Type: {
    type: String,
  },
  OrderId: {
    type: String,
  },
  TotalAmount: {
    type: Number,
  },
  SuddenCreatedBy: {
    type: String,
  },
  SuddenStatus: {
    type: String,
    default:"Approve"
  },
});

callStatusSchema.plugin(toJSON);
callStatusSchema.plugin(paginate);

const CallStatus = mongoose.model('callStatus', callStatusSchema);

module.exports = CallStatus;
