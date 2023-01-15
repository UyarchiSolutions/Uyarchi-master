const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const CustomerIssuesService = require('../services/customerIssues.service');

const createCustomerIssues = catchAsync(async (req, res) => {
  const customerIssues = await CustomerIssuesService.createCustomerIssues(req.body);
  res.send(customerIssues);
});

const getAll = catchAsync(async (req, res) => {
  const data = await CustomerIssuesService.productData(req.params.page);
  res.send(data);
});

const updateCustomerId = catchAsync(async (req, res) => {
  const data = await CustomerIssuesService.updateCustomerId(req.params.id, req.body);
  res.send(data);
});

const updateRedeliver = catchAsync(async (req, res) => {
  const data = await CustomerIssuesService.updateRedeliver(req.params.id, req.body);
  res.send(data);
});

const updateRefund = catchAsync(async (req, res) => {
  const data = await CustomerIssuesService.updateRefund(req.params.id, req.body);
  res.send(data);
});

const updateReject = catchAsync(async (req, res) => {
  const data = await CustomerIssuesService.updateReject(req.params.id, req.body);
  res.send(data);
});

const  getById= catchAsync(async (req, res) => {
  const data = await CustomerIssuesService.getById(req.params.id);
  res.send(data);
});
module.exports = {
  createCustomerIssues,
  getAll,
  updateCustomerId,
  updateReject,
  updateRefund,
  updateRedeliver,
  getById,
};
