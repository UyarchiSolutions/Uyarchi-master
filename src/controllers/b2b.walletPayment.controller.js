const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const walletPaymentService = require('../services/b2b.walletPayment.service');
const httpStatus = require('http-status');

const createWalletPayment = catchAsync(async (req, res) => {
  const payment = await walletPaymentService.createWalletPayment(req.body);
  res.send(payment);
});

const getWallet = catchAsync(async (req, res) => {
  const payment = await walletPaymentService.getWalletPayment(req.params.page);
  res.send(payment);
});

module.exports = {
  createWalletPayment,
  getWallet,
};
