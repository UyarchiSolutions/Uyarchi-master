const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const b2bBillStatusSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  supplierId: {
    type: String,
  },
  date: {
    type: String,
  },
  BillId: {
    type: String,
  },
  vehicleNumber: {
    type: String,
  },
  callStatusId: {
    type: String,
  },
  logisticsCost: {
    type: Number,
  },
  mislianeousCost: {
    type: Number,
  },
  payAmount: {
    type: Number,
  },
  others: {
    type: Number,
  },
  paymentStatus: {
    type: String,
    default: 'Pending',
  },
  modeOfPayment: {
    type: String,
  },
  totalExpenseAmount: {
    type: Number,
  },
  PendingExpenseAmount: {
    type: Number,
  },
  BillId: {
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
});

const B2bBillStatus = mongoose.model('B2BBillstatus', b2bBillStatusSchema);

module.exports = B2bBillStatus;
