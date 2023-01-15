const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const businessSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    salesPrice: {
      type: Number,
    },
    productPrice: {
      type: Number,
    },
    shippingCost: {
      type: Number,
    },
    productTax: {
      type: Number,
    },
    productDiscount: {
      type: Number,
    },
    cashBack: {
      type: Number,
    },
    needBidding: {
      type: String,
      Enum: ['Yes', 'No'],
      default: 'Yes',
    },
    startDate: {
      type: Date,
      default: Date.now(),
    },
    endDate: {
      type: Date,
      default: Date.now(),
    },
    maxAmount: {
      type: Number,
    },
    minAmount: {
      type: Number,
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
  { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } }
);

businessSchema.plugin(toJSON);
businessSchema.plugin(paginate);

const Business = mongoose.model('BusinessDetails', businessSchema);

module.exports = Business;
