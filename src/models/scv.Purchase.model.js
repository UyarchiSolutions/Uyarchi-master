const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const SCVPurchaseScham = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    product: {
      type: String,
    },
    currentStock: {
      type: Number,
    },
    quantity: {
      type: Number,
    },
    price: {
      type: Number,
    },
    totalPrice: {
      type: Number,
    },
    session: {
      type: String,
    },
    date: {
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
  },
  {
    timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' },
  }
);

SCVPurchaseScham.plugin(toJSON);
SCVPurchaseScham.plugin(paginate);
const SCV = mongoose.model('SCVPurchase', SCVPurchaseScham);

module.exports = SCV;
