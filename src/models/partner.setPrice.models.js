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

    dQTY: {
      type: Number,
    },

    balanceQTY: {
      type: Number,
    },
    returnQTY: {
      type: Number,
    },
    wastageQTY: {
      type: Number,
    },
    date: {
      type: String,
    },
    lastBalanceTime: {
      type: String,
    },
    report: {
      type: Array,
    },
  },
  { timestamps: true }
);

const partnerCartOrderProducts = mongoose.model('partnerorderproducts', partnerOrderProducts);

const UpdateStockSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    cartId: {
      type: String,
    },
    productId: {
      type: String,
    },
    orderId: {
      type: String,
    },
    orderProductId: {
      type: String,
    },
    balanceQTY: {
      type: Number,
    },
    givenQTY: {
      type: Number,
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

const UpdateStock = mongoose.model('updateStock', UpdateStockSchema);

const PartnerOrderSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    orderId: {
      type: String,
    },
    productId: {
      type: String,
    },
    products: {
      type: Array,
    },
    closingStock: {
      type: String,
    },
    scvOrders: {
      type: Number,
    },
    AdditionalStock: {
      type: String,
    },
    totalQty: {
      type: String,
    },
    Posted_date: {
      type: String,
    },
    time: {
      type: String,
    },
    OrderedTo: {
      type: String,
    },
    partnerId: {
      type: String,
    },
    transport: {
      type: String,
    },
    vehicleType: {
      type: String,
    },
    vehicleNo: {
      type: String,
    },
    driverName: {
      type: String,
    },
    driverNo: {
      type: String,
    },
    capaCity: {
      type: String,
    },
    status: {
      type: String,
      default: 'Pending',
    },
    BillNo: {
      type: String,
    },
    BillingDate: String,
    BillingTime: String,
    BillingAmt: Number,
  },
  { timestamps: true }
);

const PartnerOrder = mongoose.model('partnerorders', PartnerOrderSchema);

const PartnerOrderSeperationSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    productId: {
      type: String,
    },
    closingStock: {
      type: String,
    },
    scvOrders: {
      type: Number,
    },
    AdditionalStock: {
      type: String,
    },
    partnerOrderId: {
      type: String,
    },
    totalQty: {
      type: Number,
    },
    Posted_date: {
      type: String,
    },
    agreedPrice: {
      type: Number,
    },
    time: {
      type: String,
    },
    OrderedTo: {
      type: String,
    },
    partnerId: {
      type: String,
    },
    revisedPrice: {
      type: Number,
    },
    givenStock: {
      type: String,
    },
  },
  { timestamps: true }
);

const PartnerOrderedProductsSeperate = mongoose.model('partneradminorders', PartnerOrderSeperationSchema);

const VehicleSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    vehicleName: {
      type: String,
    },
    vehicleNumber: {
      type: String,
    },
    vehicleType: {
      type: String,
    },
    Permissible: {
      type: String,
    },
    extendable: {
      type: String,
    },
  },
  { timestamps: true }
);

const ManageVehicle = mongoose.model('manageVehicles', VehicleSchema);

module.exports = {
  partnerPrice,
  PartnerProduct,
  ActiveCArt,
  PartnercartPostOrder,
  partnerCartOrderProducts,
  UpdateStock,
  PartnerOrder,
  PartnerOrderedProductsSeperate,
  ManageVehicle,
};
