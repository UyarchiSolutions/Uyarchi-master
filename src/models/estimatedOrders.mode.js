const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const estimatedSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  productId: {
    type: String,
  },
  avgPrice: {
    type: Number,
  },
  status: {
    type: String,
    default: 'Pending',
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  estimatedQty: {
    type: Number,
  },
  estimatedStatus: {
    type: String,
    default: 'Pending',
  },
  closedQty: {
    type: Number,
  },
  active: {
    type: Boolean,
    default: false,
  },
});

const EstimatedOrders = mongoose.model('estimatedOrder', estimatedSchema);

module.exports = EstimatedOrders;
