const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const moment = require('moment');

const ShopOrderPriceSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  shopId: {
    type: String,
    default: '',
  },
  product: {
    type: Array,
    default: [],
  },
  total: {
    type: Number,
  },
  paymentValue: {
    type: Number,
  },
  oldBalance: {
    type: Number,
  },
  status: {
    type: String,
  },
  timeslot: {
    type: Number,
  },
  Uid: {
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
  location: {
    type: Object,
  },
  primary_Pickup: {
    type: String,
  },
  secondary_Pickup: {
    type: String,
  },
  third_Pickup: {
    type: String,
  },
});
ShopOrderPriceSchema.index({ location: '2dsphere' });
ShopOrderPriceSchema.plugin(toJSON);
ShopOrderPriceSchema.plugin(paginate);
const ShopOrder = mongoose.model('ShopOrder', ShopOrderPriceSchema);

const ShopOrderClonePriceSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  shopId: {
    type: String,
    default: '',
  },
  product: {
    type: Array,
    default: [],
  },
  total: {
    type: Number,
  },
  paymentValue: {
    type: Number,
  },
  oldBalance: {
    type: Number,
  },
  paymentmode: {
    type: String,
  },
  subtotal: {
    type: Number,
  },
  GST: {
    type: Array,
  },
  SGST: {
    type: Number,
  },
  created: {
    type: Date,
  },
  CGST: {
    type: Number,
  },
  paidamount: {
    type: Number,
  },
  gsttotal: {
    type: Number,
  },
  delivery_type: {
    type: String,
  },
  time_of_delivery: {
    type: String,
  },
  status: {
    type: String,
    default: 'ordered',
  },
  productStatus: {
    type: String,
    default: 'pending',
  },
  overallTotal: {
    type: Number,
  },
  Uid: {
    type: String,
  },
  OrderId: {
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
  orderType: {
    type: String,
  },
  paymentStatus: {
    type: String,
  },
  devevery_mode: {
    type: String,
  },
  Payment: {
    type: String,
  },
  selfPickup: {
    type: String,
  },
  deliveryExecutiveId: {
    type: String,
  },
  reason: {
    type: String,
  },
  undeliveyreason: {
    type: String,
  },
  undeliveytype: {
    type: String,
  },
  payType: {
    type: String,
  },
  billNo: {
    type: String,
  },
  billTime: {
    type: String,
  },
  billDate: {
    type: String,
  },
  customerDeliveryStatus: {
    type: String,
    default: 'Pending',
  },
  GroupId: {
    type: String,
  },
  receiveStatus: {
    type: String,
    default: 'Pending',
  },
  pettyCashReceiveStatus: {
    type: String,
    default: 'Pending',
  },
  modifiedStatus: {
    type: String,
    default: 'Pending',
  },
  AssignedStatus: {
    type: String,
    default: 'Pending',
  },
  completeStatus: {
    type: String,
    default: 'Pending',
  },
  WA_assigned_Time: {
    type: Date,
  },
  WL_Packed_Time: {
    type: Date,
  },
  finalProductTotal: {
    type: String,
  },
  reason: {
    type: String,
  },
  rbRefund: {
    type: String,
  },
  RedeliveredDate: {
    type: String,
  },
  RedeliveredTime: {
    type: String,
  },
  UnDeliveredStatus: {
    type: String,
    default: 'Pending',
  },
  statusUpdate: {
    type: Date,
  },
  customerBillId: {
    type: String,
  },
  customerBilldate: {
    type: String,
    default: moment().utcOffset(330).format('DD-MM-yyy'),
  },
  customerBilltime: {
    type: String,
    default: moment().utcOffset(330).format('h:mm a'),
  },
  lapsedOrder: {
    type: Boolean,
    default: false,
  },
  timeslot: {
    type: Number,
  },
  callstatus: {
    type: String,
  },
  callhistoryId: {
    type: String,
  },
  pay_type: {
    type: String,
  },
  paymentMethod: {
    type: String,
  },
  RE_order_status: {
    type: String,
  },
  Re_order_userId: {
    type: String,
  },
  RE_order_Id: {
    type: String,
  },
  reorder_status: {
    type: Boolean,
  },
  creditBillAssignedStatus: {
    type: String,
    default: 'Pending',
  },
  statusOfBill: {
    type: String,
    default: 'Pending',
  },
  delivered_date: {
    type: Date,
  },
  un_delivered_date: {
    type: Date,
  },
  raiseissue: {
    type: Boolean,
    default: false,
  },
  issueDate: {
    type: Date,
  },
  Scheduledate: {
    type: String,
  },
  Schedulereason: {
    type: String,
  },
  creditApprovalStatus: {
    type: String,
    default: 'Pending',
  },
  AssignedCreated: {
    type: Date,
  },
  statusActionArray: {
    type: Array,
    default: [],
  },
  AcknowledgeCreated: {
    type: Date,
  },
  rejectCreated: {
    type: Date,
  },
  approveCreated: {
    type: Date,
  },
  modifiedCreated: {
    type: Date,
  },
  PackedCreated: {
    type: Date,
  },
  orderType: {
    type: String,
    default: 'Salesman',
  },
  returnedCash: {
    type: Date,
  },
  startSlot: {
    type: Number,
  },
  endSlot: {
    type: Number,
  },
  finalStatus: {
  type: String,
  },
  sort_wde: {
    type: Number,
  },
  issueStatus: {
    type: String,
    default: 'Pending',
  },
  order_issues: {
    type: String,
    default: 'Pending',
  },
  issueAssign: {
    type: String,
  },
  location: {
    type: Object,
  },
  primary_Pickup: {
    type: String,
  },
  secondary_Pickup: {
    type: String,
  },
  third_Pickup: {
    type: String,
  },
});
ShopOrderClonePriceSchema.index({ location: '2dsphere' });
ShopOrderClonePriceSchema.plugin(toJSON);
ShopOrderClonePriceSchema.plugin(paginate);
const ShopOrderClone = mongoose.model('ShopOrderClone', ShopOrderClonePriceSchema);

const productorderSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  productid: {
    type: String,
  },
  quantity: {
    type: Number,
  },
  priceperkg: {
    type: Number,
  },
  orderId: {
    type: String,
  },
  customerId: {
    type: String,
  },
  modifyquantity: {
    type: Number,
  },
  modifypriceperkg: {
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
  archive: {
    type: Boolean,
    default: false,
  },
});

productorderSchema.plugin(toJSON);
productorderSchema.plugin(paginate);
const ProductorderSchema = mongoose.model('ProductOrder', productorderSchema);

const productorderCloneSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  productid: {
    type: String,
  },
  preOrderClose: {
    type: Boolean,
    default: false,
  },
  GST_Number: {
    type: Number,
  },
  videos: {
    type: Array,
  },
  HSN_Code: {
    type: String,
  },
  issueDate_Time: {
    type: String,
  },
  packtypeId: {
    type: String,
  },
  issueId: {
    type: String,
  },
  issStatus: {
    type: String,
  },
  issue_Res: {
    type: String,
  },
  issue_assgin_by: {
    type: String,
  },
  issue_collection_status: {
    type: String,

  },
  issue_returnImage: {
    type: Array,
    default: [],
  },
  issue_returnVideo: {
    type: String,
  },
  image: {
    type: Array,
  },
  unit: {
    type: String,
  },
  packKg: {
    type: Number,
  },
  quantity: {
    type: Number,
  },
  priceperkg: {
    type: Number,
  },
  orderId: {
    type: String,
  },
  OrderId: {
    type: String,
  },
  customerId: {
    type: String,
  },
  modifyquantity: {
    type: Number,
  },
  modifypriceperkg: {
    type: Number,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  productpacktypeId: {
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
  created: {
    type: Date,
  },
  status: {
    type: String,
    default: 'ordered',
  },
  finalQuantity: {
    type: Number,
  },
  finalPricePerKg: {
    type: Number,
  },
  amountwithGST: {
    type: Number,
  },
  issueraised: {
    type: Boolean,
    default: false,
  },
  issuetype: {
    type: String,
  },
  issue: {
    type: String,
  },
  issuediscription: {
    type: String,
  },
  issuequantity: {
    type: Number,
  },
  issueDate: {
    type: Date,
  },
  issueStatus: {
    type: String,
    default: 'Pending',
  },
  pick_up_charge: {
    type: Number,
    default: 0,
  },
  advance_delivery_charge: {
    type: Number,
    default: 0,
  },
  damage_deduction: {
    type: Number,
    default: 0,
  },
});

productorderCloneSchema.plugin(toJSON);
productorderCloneSchema.plugin(paginate);
const ProductorderClone = mongoose.model('ProductOrderClone', productorderCloneSchema);

const mismatchStock = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  productId: {
    type: String,
  },
  groupId: {
    type: String,
  },
  type: {
    type: String,
  },
  mismatchQty: {
    type: Number,
  },
  receivedQty: {
    type: Number,
  },
  mismatchAmount: {
    type: Number,
  },
  receivedAmount: {
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
  archive: {
    type: Boolean,
    default: false,
  },
  created: {
    type: Date,
  },
  status: {
    type: String,
  },
});

mismatchStock.plugin(toJSON);
mismatchStock.plugin(paginate);
const MismatchStock = mongoose.model('mismatchstocks', mismatchStock);

module.exports = { ShopOrder, ProductorderSchema, ShopOrderClone, ProductorderClone, MismatchStock };
