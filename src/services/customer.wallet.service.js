const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const ApiError = require('../utils/ApiError');
const { customerWallet, customerWalletHistory } = require('../models/customer.wallet.model');
const moment = require('moment');

const createWallet = async (body, userId) => {
  let values = { ...body, ...{ created: moment(), date: moment().format('YYYY-MM-DD'), customerId: userId } };
  let wallet = await customerWallet.findOne({ customerId: userId });
  if (!wallet) {
    let wallets = await customerWallet.create(values);
    let wallethistory = { ...values, ...{ walletId: wallets._id } };
    await customerWalletHistory.create(wallethistory);
    return wallets;
  }
  let oldAmount = parseInt(wallet.Amount);
  let newAmount = parseInt(body.Amount);
  let total = oldAmount + newAmount;
  let wallets = await customerWallet.findByIdAndUpdate({ _id: wallet._id }, { Amount: total }, { new: true });
  let values1 = { ...values, ...{ walletId: wallet._id } };
  await customerWalletHistory.create(values1);
  return wallets;
};

const getCustomerWallet = async (userId) => {
  let wallet = await customerWallet.findOne({ customerId: userId });
  let values = await customerWalletHistory.aggregate([
    {
      $match: {
        customerId: userId,
      },
    },
  ]);
  return { wallet: wallet, values: values };
};

module.exports = {
  createWallet,
  getCustomerWallet,
};
