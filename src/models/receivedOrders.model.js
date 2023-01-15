const mongoose = require('mongoose');
const { v4, stringify } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const receivedOrderSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    scvId: {
      type: String,
    },
    balanceAmount: {
      type: Number,
    },
    currentOrderValue: {
      type: Number,
    },
    paymentValue: {
      type: Number,
    },
    status: {
      type: Boolean,
    },
    archive: {
      type: Boolean,
      default: false,
    },
    active: {
      type: String,
      enum: ['Hold', 'Approved', 'Pending'],
      default: true,
    },
  },
  {
    timestamp: true,
  }
);

receivedOrderSchema.plugin(toJSON);
receivedOrderSchema.plugin(paginate);
const ReceivedOrder = mongoose.model('ReceivedOrder', receivedOrderSchema);

module.exports = ReceivedOrder;
