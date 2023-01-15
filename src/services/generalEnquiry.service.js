const httpStatus = require('http-status');

const ApiError = require('../utils/ApiError');
const generalEnquirymodel = require('../models/generalEnquiry.model');

const creategeneralEnquiry = async (body) => {
  const generalEnquiry = await generalEnquirymodel.create(body);
  return generalEnquiry;
};

const getgeneralEnqiry = async () => {
  return generalEnquirymodel.find();
};

module.exports = { creategeneralEnquiry, getgeneralEnqiry };
