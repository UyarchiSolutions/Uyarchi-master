const mongoose = require('mongoose');
const { v4 } = require('uuid');

const customerWallet_Schema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  customerId: {
    type: String,
  },
  Amount: {
    type: Number,
  },
  Type: {
    type: String,
  },
  date: {
    type: String,
  },
  created: {
    type: Date,
  },
});

const customerWallet = mongoose.model('customerWallet', customerWallet_Schema);

const customerWalletHistory_Schema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  customerId: {
    type: String,
  },
  walletId: {
    type: String,
  },
  Amount: {
    type: Number,
  },
  Type: {
    type: String,
  },
  date: {
    type: String,
  },
  created: {
    type: Date,
  },
});

const customerWalletHistory = mongoose.model('customerWalletHistory', customerWalletHistory_Schema);

module.exports = {
  customerWallet,
  customerWalletHistory,
};
