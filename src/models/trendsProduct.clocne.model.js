const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { v4 } = require('uuid');

const trendsProductCloneSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  shopId: {
    type: String,
  },
  steetId: {
    type: String,
  },
  UserId: {
    type: String,
  },
  productId: {
    type: String,
  },
  Weight: {
    type: String,
  },
  Rate: {
    type: Number,
  },
  productName: {
    type: String,
  },
  Unit: {
    type: String,
  },
  orderId: {
    type: String,
  },
  date: {
    type: String,
  },
  time: {
    type: Number,
  },
  fulldate: {
    type: Number,
  },
  created: {
    type: String,
  },
  timestamp: {
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

trendsProductCloneSchema.plugin(toJSON);
trendsProductCloneSchema.plugin(paginate);
const Trends = mongoose.model('TrendproductsClone', trendsProductCloneSchema);

module.exports = Trends;
