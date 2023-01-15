const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const manageExpenseSchma = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  seletcType: {
    type: String,
  },
  subType: {
    type: String,
  },
  payAmount: {
    type: Number,
  },
  payTo: {
    type: String,
  },
  payType: {
    type: String,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  created: {
    type: Date,
  },
  others: {
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
  reason: {
    type: String,
  },
});

const ManageExpenses = mongoose.model('ManageExpenses', manageExpenseSchma);

module.exports = ManageExpenses;
