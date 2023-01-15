const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const moment = require('moment');

const wardAdminGroupSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  groupId: {
    type: String,
  },
  assignDate: {
    type: String,
  },
  assignTime: {
    type: String,
  },
  Orderdatas: {
    type: Array,
    default: [],
  },
  // pettyStockData: {
  //   type: Array,
  //   default: [],
  // },
  active: {
    type: Boolean,
    default: true,
  },
  returnstockdate: {
    type: Date,
  },
  vehicleId: {
    type: String,
  },
  archive: {
    type: Boolean,
    default: false,
  },
  deliveryExecutiveId: {
    type: String,
  },
  returnStockimages: {
    type: Array,
  },
  totalOrders: {
    type: Number,
  },
  status: {
    type: String,
    default: 'Assigned',
  },
  manageDeliveryStatus: {
    type: String,
    default: 'Pending',
  },
  pettyCashAllocateStatus: {
    type: String,
    default: 'Pending',
  },
  pettyStockAllocateStatus: {
    type: String,
    default: 'Pending',
  },
  pettyStockAllocateStatusNumber: {
    type: Number,
  },
  returnStockstatus: {
    type: String,
    default: 'Pending',
  },
  AllocateStatus: {
    type: String,
    default: 'Assigned',
  },
  cashReturned: {
    type: Date,
  },
  misMatchAmountStatus: {
    type: String,
    default: "Pending"
  },
  mismatchStockStatus: {
    type: String,
    default: "Pending"
  },
  // NotAllocateStatus: {
  //   type: String,
  //   default: "Pending",
  // },
  pettyCash: {
    type: Number,
  },
  pettyStock: {
    type: Array,
    default: [],
  },
  totalQtyIncludingPettyStock: {
    type: Number,
  },

  stockReturnedByWDE: {
    type: Number,
  },
  wastageReturnedByWDE: {
    type: Number,
  },
  wastageImageUpload: {
    type: String,
  },
  mismatchAmount: {
    type: Number,
  },
  DeliverAsPerSystem: {
    type: Number,
  },
  UnDeliveredAsPerSystem: {
    type: Number,
  },
  cashAsGivenByWDE: {
    type: Number,
  },
  shopOrderCloneID: {
    type: String,
  },
  route: {
    type: String,
  },
  GroupBillId: {
    type: String,
  },
  GroupBillDate: {
    type: String,
  },
  GroupBillTime: {
    type: String,
  },
  ByCashIncPettyCash: {
    type: Number,
  },
  Disputestatus: {
    type: String,
  },
  mismatchStockStatus: {
    type: String,
  },
  FinishingStatus: {
    type: String,
    default: 'Pending',
  },
  zone: {
    type: String,
  },
  ward: {
    type: String,
  },
  pickuplocation: {
    type: String,
  },
  pickputype: {
    type: String,
  },
  stockmismatch: {
    type: String,
  },
  cashmismatch: {
    type: String,
  },
  pettyCashDetails: {
    type: Array,
    default: [],
  },
  PettyStockCreate: {
    type: Date,
  },
  PettyCashCreate: {
    type: Date,
  },
  pettyStockUnAllocateCreated: {
    type: Date,
  },
  pettyCashNotAllocateCreate: {
    type: Date,
  },
  StockUid: {
    type: String,
  },
  CashUid: {
    type: String,
  },
  CashPickedCreated: {
    type: Date,
  },
  CashPickedUserId: {
    type: String,
  },
  StockPickedCreated: {
    type: Date,
  },
  StockPickedUserId: {
    type: String,
  },
  DeliveryStartCreate: {
    type: Date,
  },
  DeliveryStartUserId: {
    type: String,
  },
  deliveryCompleteCreate: {
    type: Date,
  },
  deliveryCompleteUserId: {
    type: String,
  },
  orderPickedCreate: {
    type: Date,
  },
  orderPickedUserId: {
    type: String,
  },
  cashReturnedDE: {
    type: String,
  },
  StockReturnedDE: {
    type: String,
  },
  sort_wde: {
    type:Boolean,
  }
});

const wardAdminGroup = mongoose.model('wardAdminGroup', wardAdminGroupSchema);

const wardAdminGroupSchema_ORDER = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  orderId: {
    type: String,
  },
  wardAdminGroupID: {
    type: String,
  },
  status: {
    type: String,
    default: 'Assigned',
  },
  vehicleId: {
    type: String,
  },
  created: {
    type: Date,
  },
  date: {
    type: String,
    default: moment().utcOffset(330).format('DD-MM-yyy'),
  },
  time: {
    type: String,
    default: moment().utcOffset(330).format('h:mm a'),
  },
  AssignedstatusPerDay: {
    type: String,
  },
});

const wardAdminGroupModel_ORDERS = mongoose.model('orderAssign', wardAdminGroupSchema_ORDER);


const wardAdminGroupSchema_issue = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  orderId: {
    type: String,
  },
  wardAdminGroupID: {
    type: String,
  },
  status: {
    type: String,
    default: 'Assigned',
  },
  vehicleId: {
    type: String,
  },
  created: {
    type: Date,
  },
  date: {
    type: String,
    default: moment().utcOffset(330).format('DD-MM-yyy'),
  },
  time: {
    type: String,
    default: moment().utcOffset(330).format('h:mm a'),
  },
  AssignedstatusPerDay: {
    type: String,
  },
  deliveryExecutiveId:{
    type: String,
  }
});

const wardAdminGroupModel_issue = mongoose.model('issueAssign', wardAdminGroupSchema_issue);

const wardAdminGroupfineSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  groupId: {
    type: String,
  },
  deliveryExecutiveId: {
    type: String,
  },
  status: {
    type: String,
  },
  productId: {
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

  archive: {
    type: Boolean,
    default: false,
  },
});

const WardAdminGroupfine = mongoose.model('wardAdminGroupfine', wardAdminGroupfineSchema);
module.exports = { wardAdminGroup, wardAdminGroupModel_ORDERS, WardAdminGroupfine ,wardAdminGroupModel_issue};
