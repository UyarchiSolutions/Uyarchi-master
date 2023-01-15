const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const SupplierUnbilledSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  date: {
    type: String,
  },
  created: {
    type: Date,
  },
  supplierId: {
    type: String,
  },
  un_Billed_amt: {
    type: Number,
  },
  pay_method: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

const SupplierUnbilled = mongoose.model('supplierUnBilled', SupplierUnbilledSchema);

const SupplierUnbilledHistorySchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  date: {
    type: String,
  },
  created: {
    type: Date,
  },
  supplierId: {
    type: String,
  },
  un_Billed_amt: {
    type: Number,
  },
  payment_mode: {
    type: String,
  },
  pay_method: {
    type: String,
  },
  un_BilledId: {
    type: String,
  },
  raisedId: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

const SupplierUnbilledHistory = mongoose.model('supplierUnBilledhistory', SupplierUnbilledHistorySchema);

module.exports = { SupplierUnbilled, SupplierUnbilledHistory };
