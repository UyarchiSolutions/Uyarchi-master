const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const ExecutiveFineSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  orderId: {
    type: String,
  },
  shopId: {
    type: String,
  },
  userId: {
    type: String,
  },
  status: {
    type: String,
  },
  fineAmount: {
    type: Number,
  },
  created: {
    type: Date,
  },
  date: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

const ExecutiveFine = mongoose.model('executivefines', ExecutiveFineSchema);

module.exports = ExecutiveFine;
