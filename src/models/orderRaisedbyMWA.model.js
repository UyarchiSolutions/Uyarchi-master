const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const OrderRaisedByMWASchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  product: {
    type: String,
  },
  orderRaisedByMWA: {
    type: Number,
  },
  requestToSupplier: {
    type: Number,
  },
  pulsePendingKg: {
    type: Number,
  },
  averagePrice: {
    type: Number,
  },
  orderApprovedByPh: {
    type: Number,
  },
  status: {
    type: String,
  },
});

OrderRaisedByMWASchema.plugin(toJSON);
OrderRaisedByMWASchema.plugin(paginate);

const OrderRaisedByMWA = mongoose.model('OrderRaisedByMWASchema', OrderRaisedByMWASchema);

module.exports = OrderRaisedByMWA;
