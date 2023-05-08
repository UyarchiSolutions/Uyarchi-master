const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const partnerSetPriceSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    productId: {
      type: String,
    },
    productName: {
      type: String,
    },
    partnerPrice: {
      type: Object,
    },
    costPrice_Kg: {
      type: Number,
    },
    marketPrice: {
      type: Number,
    },
    availableStock: {
      type: String,
    },
    date: {
      type: String,
    },
    time: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const partnerPrice = mongoose.model('partnersetprice', partnerSetPriceSchema);

const PartnerProductSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    partnerId: {
      type: String,
    },
    product: {
      type: Array,
      default: [],
    },
    date: {
      type: String,
    },
    time: String,
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const PartnerProduct = mongoose.model('partnerProduct', PartnerProductSchema);

module.exports = {
  partnerPrice,
  PartnerProduct,
};
