const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const productSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  SubCatId: {
    type: String,
  },
  brandStatus: {
    type: String,
  },
  Brand: {
    type: String,
  },
  productTitle: {
    type: String,
  },
  category: {
    type: String,
  },
  subCategory: {
    type: String,
  },
  unit: {
    type: Number,
  },
  tags: {
    type: String,
  },
  image: {
    type: String,
  },
  galleryImages: {
    type: Array,
  },
  subscrption: {
    type: String,
    enum: ['yes', 'no'],
  },
  GST_Number: {
    type: Number,
  },
  HSN_Code: {
    type: String,
  },
  cess: {
    type: Number,
  },
  TrendspreferredQuantity: {
    type: Number,
  },
  TrendspreferredUnit: {
    type: String,
  },
  setTrendsDate: {
    type: String,
  },
  description: {
    type: String,
    default: '',
  },
  enquiry: {
    type: String,
    enum: ['yes', 'no'],
  },
  salePrice: {
    type: Number,
  },
  stock: {
    type: Number,
  },
  purchasePrice: {
    type: Number,
  },
  shippingPrice: {
    type: Number,
  },
  productTax: {
    type: Number,
  },
  productDiscount: {
    type: Number,
  },
  needBidding: {
    type: String,
    enum: ['yes', 'no'],
  },
  biddingStartDate: {
    type: Date,
  },
  biddingStartTime: {
    type: String,
  },
  biddingEndDate: {
    type: Date,
  },
  biddingEndTime: {
    type: String,
  },
  maxBidAomunt: {
    type: Number,
  },
  minBidAmount: {
    type: Number,
  },
  onlinePrice: {
    type: Number,
  },
  salesmanPrice: {
    type: Array,
  },
  oldstock: {
    type: Number,
  },
  newstock: {
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
});
productSchema.plugin(toJSON);
productSchema.plugin(paginate);
const Product = mongoose.model('Product', productSchema);

const stockSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  supplierId: {
    type: String,
  },
  supplierName: {
    type: String,
  },
  product: {
    type: Array,
  },
  productName: {
    type: String,
  },
  totalPrice: {
    type: Number,
  },
  logisticCost: {
    type: Number,
  },
  coolieCost: {
    type: Number,
  },
  misAllianceCost: {
    type: Number,
  },
  orderId: {
    type: String,
  },
  productQuantity: {
    type: Number,
    default: 0,
  },
  wastage: {
    type: Number,
    default: 0,
  },
  netKg: {
    type: Number,
    default: 0,
  },
  vehicleType: {
    type: String,
    default: '',
  },
  vehicleNumber: {
    type: String,
    default: '',
  },
  driverName: {
    type: String,
    default: '',
  },
  weighbridgeBill: {
    type: String,
    default: '',
  },
  incomingQuantity: {
    type: Number,
    default: 0,
  },
  incomingWastage: {
    type: Number,
    default: 0,
  },
  arrived: {
    type: Boolean,
    default: false,
  },
  date: {
    type: String,
    default: Date().toString({ timeZone: 'IST' }),
  },
  status: {
    type: String,
    enum: ['Created', 'Pending', 'Rised', 'Delivered', 'Closed'],
    default: 'Created',
  },
  loadingExecute: {
    type: Boolean,
    default: false,
  },
  billId: {
    type: Number,
    unique: true,
  },
  closeOrder: {
    type: Boolean,
    default: false,
  },

  vehicleType: {
    type: String,
  },
  driverName: {
    type: String,
  },
  vehicleNumber: {
    type: String,
  },
  weighbridgeBill: {
    type: String,
  },
});

stockSchema.plugin(toJSON);
stockSchema.plugin(paginate);

const Stock = mongoose.model('Stock', stockSchema);

const confirmStock = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  stockId: {
    type: String,
    required: true,
  },
  products: {
    type: Array,
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
confirmStock.plugin(toJSON);
confirmStock.plugin(paginate);

const ConfirmStock = mongoose.model('ConfirmStock', confirmStock);

const loadingExecuteSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  productId: {
    type: String,
  },
  quantity: {
    type: Number,
  },
  wastage: {
    type: Number,
  },
  netWeight: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['Delivered', 'UnDelivered'],
    default: 'UnDelivered',
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
loadingExecuteSchema.plugin(toJSON);
loadingExecuteSchema.plugin(paginate);
const LoadingExecute = mongoose.model('MainWharehouseLoadingExecute', loadingExecuteSchema);

const billRaiseSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  productId: {
    type: String,
  },
  pricingInKg: {
    type: Number,
  },
  quantityInKg: {
    type: Number,
  },
  netRate: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['Deliverd', 'UnDelivered'],
    default: 'UnDelivered',
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

billRaiseSchema.plugin(toJSON);
billRaiseSchema.plugin(paginate);

const BillRaise = mongoose.model('BillRaise', billRaiseSchema);

const manageBillSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  billId: {
    type: String,
  },
  supplierId: {
    type: String,
  },
  orderId: {
    type: String,
  },
  orderQuantity: {
    type: Number,
  },
  receivedQuanity: {
    type: Number,
  },
  amountOriginal: {
    type: Number,
  },
  amountFixed: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending'],
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
});
manageBillSchema.plugin(toJSON);
manageBillSchema.plugin(paginate);

const ManageBill = mongoose.model('manageBill', manageBillSchema);
const shopListSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  shopList: {
    type: String,
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

const ShopList = mongoose.model('shopList', shopListSchema);
module.exports = {
  Stock,
  Product,
  ConfirmStock,
  LoadingExecute,
  BillRaise,
  ManageBill,
  ShopList,
};
