const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const walletPaymentModel = require('../models/b2b.walletPayment.model');
const wallet = require('../models/b2b.walletAccount.model');

const createWalletPayment = async (walletPaymentbody) => {
  let walletPayment = await walletPaymentModel.create(walletPaymentbody);

  return walletPayment;
};

const getWalletPayment = async (page) => {
  let values = await wallet.aggregate([
    {
      $lookup: {
        from: 'walletpayments',
        localField: '_id',
        foreignField: 'walletId',
        as: 'data',
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await wallet.find().count();
  return { values: values, total: total };
};

module.exports = {
  createWalletPayment,
  getWalletPayment,
};
