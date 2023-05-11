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
    cartId: {
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

const ActveCartSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    partnerId: {
      type: String,
    },
    cartId: {
      type: String,
    },
  },
  { timestamps: true }
);

const ActiveCArt = mongoose.model('activeCart', ActveCartSchema);

const PartnerPostOrder = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    orderId: {
      type: String,
    },
    products: {
      type: Array,
    },
    cartId: {
      type: String,
    },
    partnerId: {
      type: String,
    },
    date: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      default: 'Pending',
    },
  },
  { timestamps: true }
);

const PartnercartPostOrder = mongoose.model('PartnerPostOrder', PartnerPostOrder);

const partnerOrderProducts = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    orderId: {
      type: String,
    },
    cartId: {
      type: String,
    },
    productId: {
      type: String,
    },
    productName: {
      type: String,
    },
    QTY: {
      type: String,
    },
    givenQTY: {
      type: Number,
    },
    date: {
      type: String,
    },
  },
  { timestamps: true }
);

const partnerCartOrderProducts = mongoose.model('partnerorderproducts', partnerOrderProducts);

module.exports = {
  partnerPrice,
  PartnerProduct,
  ActiveCArt,
  PartnercartPostOrder,
  partnerCartOrderProducts,
};
