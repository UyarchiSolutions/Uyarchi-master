const mongoose = require('mongoose');
const { v4, stringify } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const receivedProducrSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  callstatus: {
    type: Array,
  },
  date: {
    type: String,
  },
  driverName: {
    type: String,
  },
  driverNumber: {
    type: String,
  },
  status: {
    type: String,
    default: 'Acknowledged',
  },
  supplierId: {
    type: String,
  },
  time: {
    type: Number,
  },
  vehicleNumber: {
    type: String,
  },
  vehicleType: {
    type: String,
  },
  weighBridgeEmpty: {
    type: String,
  },
  weighBridgeLoadedProduct: {
    type: String,
  },
  billingQuantity: {
    type: Number,
  },
  billingPrice: {
    type: Number,
  },
  BillNo: {
    type: String,
  },
  supplierBillNo: {
    type: String,
  },
  weighBridgeBillImg: {
    type: Array,
  },
  supplierBilldate: {
    type: String,
  },
  supplierBillImg: {
    type: Array,
  },
  pendingAmount: {
    type: Number,
  },
  active: {
    type: Boolean,
    default: true,
  },
  supplierBillAmount: {
    type: Number,
  },
  supplierBillproductcount: {
    type: Number,
  },
  created: {
    type: Date,
  },
  archive: {
    type: Boolean,
    default: false,
  },
});

const ReceivedProduct = mongoose.model('ReceivedProduct', receivedProducrSchema);

module.exports = ReceivedProduct;
