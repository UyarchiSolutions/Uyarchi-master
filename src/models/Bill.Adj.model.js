const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const Bill_Adjustment_Schema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  shopId: {
    type: String,
  },
  un_Billed_amt: {
    type: Number,
  },
  payment_method: {
    type: String,
  },
  active: {
    type: Boolean,
  },
  archive: {
    type: Boolean,
    default: false,
  },
  created: {
    type: Date,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
});

const BillAdjustment = mongoose.model('BillAdjustment', Bill_Adjustment_Schema);

module.exports = BillAdjustment;
