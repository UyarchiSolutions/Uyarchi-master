const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const phBillingSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  productId: {
    type: String,
  },
  date: {
    type: String,
  },
  logisticsCost: {
    type: Number,
  },
  mislianeousCost: {
    type: Number,
  },
  others: {
    type: Number,
  },
  stockStatus: {
    type: String,
  },
});
