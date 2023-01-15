const mongoose = require('mongoose');
const { v4 } = require('uuid');

const moment = require('moment');

const pettyStockSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  wardAdminId: {
    type: String,
  },
  productName: {
    type: String,
  },
  productId: {
    type: String,
  },
  QTY: {
    type: Number,
  },
  pettyStock: {
    type: Number,
  },
  totalQtyIncludingPettyStock: {
    type: Number,
  },
  pettyStockReceiveStatus: {
    type: String,
    default: 'Pending',
  },
  // stockReturnedByWDE: {
  //   type: Number,
  // },
  // wastageReturnedByWDE: {
  //   type: Number,
  // },
  // wastageImageUpload: {
  //   type: String,
  // },
  // mismatch: {
  //   type: Number,
  // },
  // DeliverAsPerSystem: {
  //   type: Number,
  // },
  // UnDeliveredAsPerSystem: {
  //   type: Number,
  // },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  created: {
    type: Date,
  },
  groupId: {
    type: String,
  },
});

const pettyStockModel = mongoose.model('pettyStockModel', pettyStockSchema);
module.exports = pettyStockModel;
