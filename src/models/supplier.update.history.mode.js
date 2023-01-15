const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const bcrypt = require('bcryptjs');

const supplierSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  supplierId: {
    type: String,
  },
  tradeName: {
    type: String,
  },
  companytype: {
    type: String,
    // enum: ['Proprietorship', 'LLP', 'Partnership', 'Private Limited', 'Public Limited', 'Others', 'Individual'],
  },
  businesstype: {
    type: String,
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
  OfficeStaffnumber: {
    type: Number,
  },
  ShopNo: {
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
  categoryDealingWith: {
    type: Array,
  },
  createdByStatus: {
    type: String,
  },
  approvedStatus: {
    type: String,
  },
  password: {
    type: String,
  },
  productSold: {
    type: String,
  },
  ShopSize: {
    type: String,
  },
  image: {
    type: Array,
  },
  GateEntryconvenience: {
    type: Number,
  },
  created: {
    type: Date,
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

const Supplierhistory = mongoose.model('Supplierhistory', supplierSchema);

module.exports = Supplierhistory;
