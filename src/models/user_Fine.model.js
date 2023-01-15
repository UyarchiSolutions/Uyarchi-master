const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const userFineSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  lastPaidamt: {
    type: Number,
  },
  customerClaimedAmt: {
    type: Number,
  },
  orderId: {
    type: String,
  },
  Difference_Amt: {
    type: Number,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  create: {
    type: Date,
  },
  comments: {
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
  userId: {
    type: String,
  },
  orderpaymentId: {
    type: String,
  },
});

const UserFine = mongoose.model('Userfine', userFineSchema);

module.exports = UserFine;
