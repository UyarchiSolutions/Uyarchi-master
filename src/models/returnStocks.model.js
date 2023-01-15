const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const ReturnStockSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  groupId: {
    type: String,
  },
  productId: {
    type: String,
  },
  image: {
    type: Array,
  },
  status: {
    type: String,
    default: 'pending',
  },
  totalStocks: {
    type: Number,
    default: 0,
  },
  delivered_As_Per_System: {
    type: Number,
    default: 0,
  },
  returnstockdate: {
    type: Date,
  },
  undelivered_As_Per_System: {
    type: Number,
    default: 0,
  },
  actualStock: {
    type: Number,
    default: 0,
  },
  actualWastage: {
    type: Number,
    default: 0,
  },
  misMatch: {
    type: Number,
  },
  created: {
    type: Date,
  },
  date: {
    type: String,
  },
  time: {
    type: Number,
  },
  stocks: {
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

const ReturnStock = new mongoose.model('ReturnStock', ReturnStockSchema);
module.exports = ReturnStock;
