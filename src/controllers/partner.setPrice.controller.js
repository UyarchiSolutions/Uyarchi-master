const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const partnersetpriceService = require('../services/partner.setPrice.service');

const SetPartnerPrice = catchAsync(async (req, res) => {
  const data = await partnersetpriceService.SetPartnerPrice(req.body);
  res.send(data);
});

const AddProductByPartner = catchAsync(async (req, res) => {
  let userId = req.userId;
  const data = await partnersetpriceService.AddProductByPartner(userId);
  res.send(data);
});

module.exports = {
  SetPartnerPrice,
  AddProductByPartner,
};
