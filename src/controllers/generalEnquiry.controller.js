const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const generalEnquiryservice = require('../services/generalEnquiry.service');

const creategeneralEnquiry = catchAsync(async (req, res) => {
  const generalEnquiry = await generalEnquiryservice.creategeneralEnquiry(req.body);
  res.send(generalEnquiry);
});

const getgeneralEnqiry = catchAsync(async (req, res) => {
  const generalEnquiry = await generalEnquiryservice.getgeneralEnqiry();
  res.send(generalEnquiry);
});

module.exports = { creategeneralEnquiry, getgeneralEnqiry };
