const mongoose = require('mongoose');
const { v4, stringify } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const receivedStockSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  callstatusId: {
    type: String,
  },
  groupId: {
    type: String,
  },
  status: {
    type: String,
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
  archive: {
    type: Boolean,
    default: false,
  },
  productId: {
    type: String,
  },
  supplierId: {
    type: String,
  },
  orderId: {
    type: String,
  },
  incomingQuantity: {
    type: Number,
  },
  FQ1: {
    type: Number,
  },
  FQ2: {
    type: Number,
  },
  FQ3: {
    type: Number,
  },
  seg_wastage: {
    type: Number,
  },
  incomingWastage: {
    type: Number,
  },
  segStatus: {
    type: String,
    default: 'Pending',
  },
  wastageImg: {
    type: Array,
  },
  billingQuantity: {
    type: Number,
  },
  billingPrice: {
    type: Number,
  },
  billingTotal: {
    type: Number,
  },
});

const ReceivedStock = mongoose.model('receivedStock', receivedStockSchema);

module.exports = ReceivedStock;
