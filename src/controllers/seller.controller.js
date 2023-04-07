const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const SellerService = require('../services/seller.service');

const createSeller = catchAsync(async (req, res) => {
  const data = await SellerService.createSeller(req.body);
  res.send(data);
});

const GetAllSeller = catchAsync(async (req, res) => {
  const data = await SellerService.GetAllSeller();
  res.send(data);
});

const GetSellerById = catchAsync(async (req, res) => {
  const data = await SellerService.GetSellerById(req.params.id);
  res.send(data);
});

const UpdateSellerById = catchAsync(async (req, res) => {
  const data = await SellerService.UpdateSellerById(req.params.id, req.body);
  res.send(data);
});

module.exports = {
  createSeller,
  GetAllSeller,
  GetSellerById,
  UpdateSellerById,
};
