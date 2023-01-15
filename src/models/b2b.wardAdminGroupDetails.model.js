const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const moment = require('moment');

const wardAdminGroupDetailsSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  wardAdminId: {
    type: String,
},
product: {
    type: String,
},


totalQtyIncludingPettyStock: {
    type: Number,
},
pettyStockReceiveStatus: {
    type: String,
    default: "Pending"
},
  stockReturnedByWDE: {
    type: Number,
  },
  wastageReturnedByWDE: {
    type: Number,
  },
  wastageImageUpload: {
    type: Array,
  },
  mismatch: {
    type: Number,
  },
  DeliverAsPerSystem: {
    type: Number,
  },
  UnDeliveredAsPerSystem: {
    type: Number,
  },
  date: {
    type: String,
    default: moment().utcOffset(331).format('DD-MM-yyy'),
  },
  time: {
    type: String,
    default: moment().utcOffset(331).format('h:mm a'),
  },

  wardAdminGroupModelId: {
    type: String,
  }

  // productid: {
  //   type: String,
  // },
  // quantity: {
  //   type: Number,
  // },
  // priceperkg: {
  //   type: Number,
  // },
  // wardadmingroupsId: {
  //   type: String,
  // },
  // userId: {
  //   type: String,
  // },
  // date: {
  //   type: String,
  // },
  // time: {
  //   type: String,
  // },
  // active: {
  //   type: Boolean,
  //   default: true,
  // },
  // orderedTime: {
  //   type: String,
  // },
  // archive: {
  //   type: Boolean,
  //   default: false,
  // },
  // // pettyStockData: {
  // //   type: Array,
  // //   default: [],
  // // },
  // // groupId: {
  // //   type: String,
  // // },
});

const wardAdminGroupDetailsModel = mongoose.model('wardAdminGroupDetails', wardAdminGroupDetailsSchema);

module.exports = wardAdminGroupDetailsModel;
