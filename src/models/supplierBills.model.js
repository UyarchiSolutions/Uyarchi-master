const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const moment = require('moment');

const supplierbillsSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  groupId: {
    type: String,
  },
  pendingAmount: {
    type: Number,
  },
  Amount: {
    type: Number,
  },
  supplierId: {
    type: String,
  },
  transactionId: {
    type: String,
  },
  date: {
    type: String,
  },
  time: {
    type: Number,
  },
  paymentMethod: {
    type: String,
  },
  paidTo: {
    type: String,
  },
  status: {
    type: String,
    default: 'Paid',
  },
  created: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
  },
  PaidToBe: {
    type: String,
  },
  archive: {
    type: Boolean,
    default: false,
  },
});

const SupplierBills = mongoose.model('SupplierBills', supplierbillsSchema);
module.exports = SupplierBills;
