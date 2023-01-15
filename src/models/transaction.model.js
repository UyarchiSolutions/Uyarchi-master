const mongoose = require('mongoose');
const { v4, stringify } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const transactionSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  groupId: {
    type: String,
  },
  billId: {
    type: String,
  },
  paymentId: {
    type: String,
  },
  Amount: {
    type: Number,
  },
  pendingAmount: {
    type: Number,
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
  active: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
  },
  paymentMethod: {
    type: String,
  },
  archive: {
    type: Boolean,
    default: false,
  },
  paidTO: {
    type: String,
  },
  supplierId: {
    type: String,

  }
});

const transaction = mongoose.model('ExpensesBills', transactionSchema);

module.exports = transaction;
