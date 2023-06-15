const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const customerWalletService = require('../services/customer.wallet.service');

const createCustomerWallet = catchAsync(async (req, res) => {
  let userId = req.shopId;
  //console.log(userId);
  const data = await customerWalletService.createWallet(req.body, userId);
  res.send(data);
});

const getCustomerWallet = catchAsync(async (req, res) => {
  let userId = req.shopId;
  const data = await customerWalletService.getCustomerWallet(userId);
  res.send(data);
});

module.exports = {
  createCustomerWallet,
  getCustomerWallet,
};
