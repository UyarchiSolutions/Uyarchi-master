const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const supplierBuyerSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  type: {
    type: String,
  },
  tradeName: {
    type: String,
  },
  companytype: {
    type: String,
    enum: ['Proprietorship', 'LLP', 'Patnership', 'Private Limited', 'Public Limited', 'Others'],
  },
  primaryContactNumber: {
    type: String,
  },
  primaryContactName: {
    type: String,
  },
  secondaryContactName: {
    type: String,
  },
  secondaryContactNumber: {
    type: String,
  },
  RegisteredAddress: {
    type: String,
  },
  countries: {
    type: String,
  },
  state: {
    type: String,
  },
  district: {
    type: String,
  },
  gpsLocat: {
    type: String,
  },
  gstNo: {
    type: String,
  },
  email: {
    type: String,
  },
  pinCode: {
    type: Number,
  },
  productDealingWith: {
    type: Array,
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

const SupplierBuyer = mongoose.model('SupplierBuyer', supplierBuyerSchema);

module.exports = SupplierBuyer;
