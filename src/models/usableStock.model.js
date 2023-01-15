const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const moment = require('moment');

const usableStockSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
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
  productId: {
    type: String,
  },
  wastage: {
    type: Number,
  },
  status: {
    type: String,
    default: "Pending"
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  totalStock: {
    type: Number,
  },
  closingStock: {
    type: Number,
    default: 0,
  },
  // status: {
  //   type: Number,
  //   default: 0,
  // },
  closingWastage: {
    type: Number,
    default: 0,
  },
  closingTime: {
    type: Date,
    default: 0,
  },
  oldStock: {
    type: Number,
    default: 0,
  },
  openingStock: {
    type: Number,
    default: 0,
  },
  openingWastage: {
    type: Number,
    // default: 0,
  },
  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
  created: {
    type: Date,
  },
  b2bStock: {
    type: Number,
    default: 0,
  },
  b2cStock: {
    type: Number,
    default: 0,
  },
  randomStock_History: {
    type: Array,
  },
  random_stock: {
    type: Boolean,
  }
});

const usableStock = mongoose.model('usableStock', usableStockSchema);

const usableStockhistory = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
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

  wastage: {
    type: Number,
  },
  status: {
    type: String,
  },
  date: {
    type: String,
    // default: moment().format('DD-MM-yyy'),
  },
  time: {
    type: String,
    // default: moment().format('h:mm a'),
  },
  timeFilter: {
    type: String,
    // default: moment().format('Hmm'),
  },
  created: {
    type: Date,
  },
  usableStock: {
    type: String,
  },
  wastageImage: {
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

const Stockhistory = mongoose.model('usableStockhistory', usableStockhistory);

module.exports = { usableStock, Stockhistory };
