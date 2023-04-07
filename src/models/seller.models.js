const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const SellerSchema = new mongoose.Schema(
  {
    _id: {
      type: Boolean,
      default: v4,
    },
    status: {
      type: String,
      default: 'Pending',
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
const Seller = mongoose.model('Seller', SellerSchema);

module.exports = Seller;
