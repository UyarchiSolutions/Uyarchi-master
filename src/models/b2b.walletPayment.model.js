const mongoose = require('mongoose');
const { v4 } = require('uuid');
const moment = require('moment');

const walletPaymentSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  walletId: {
    type: String,
  },
  currentAmount: {
    type: Number,
    default: 0,
  },
  walletAmountAdded: {
    type: Number,
  },
  paymentMode: {
    type: String,
  },
  lastWalletAddedDate: {
    type: String,
    default: 'Nil',
  },
  date: {
    type: String,
    default: moment().utcOffset(331).format('DD-MM-yyy'),
  },
  time: {
    type: String,
    default: moment().utcOffset(331).format('h:mm a'),
  },
});

const walletPayment = mongoose.model('walletPayment', walletPaymentSchema);

module.exports = walletPayment;
