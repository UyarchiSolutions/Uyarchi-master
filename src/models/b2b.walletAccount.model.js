const mongoose = require('mongoose');
const { v4 } = require('uuid');
const moment = require('moment');
const walletSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  shopName: {
    type: String,
  },
  type: {
    type: String,
  },
  date: {
    type: String,
    default: moment().utcOffset(331).format('DD-MM-yyy'),
  },
  time: {
    type: String,
    default: moment().utcOffset(331).format('h:mm a'),
  },
  email: {
    type: String,
  },
  address: {
    type: String,
  },
  idProof: {
    type: String,
  },
  addressProof: {
    type: String,
  },
  idProofNo: {
    type: String,
  },
  addressProofNo: {
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
  contactNumber: {
    type: Number,
  },
  shopId: {
    type: String,
  },
  // date: {
  //   type: String,
  //   default: moment().utcOffset(331).format('DD-MM-yyy'),
  // },
});

const wallet = mongoose.model('wallet', walletSchema);

module.exports = wallet;
