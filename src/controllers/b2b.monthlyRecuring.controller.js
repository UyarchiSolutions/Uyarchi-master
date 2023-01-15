const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const monthlyRecuringService = require('../services/b2b.monthlyRecuring.service');

const createRecuring = catchAsync(async (req, res) => {
  const resuring = await monthlyRecuringService.createMonthlyRecuring(req.body);
  res.send(resuring);
});

const getRecuring = catchAsync(async (req, res) => {
  const resuring = await monthlyRecuringService.getAll();
  res.send(resuring);
});

const getMonthlyRecuring = catchAsync(async (req, res) => {
  const wallet = await monthlyRecuringService.getMonthlyRecuring(req.params.page);
  res.send(wallet);
});
const getById = catchAsync(async (req, res) => {
  const sample = await monthlyRecuringService.getById(req.params.id);
  res.send(sample);
});

module.exports = {
  createRecuring,
  getRecuring,
  getMonthlyRecuring,
  getById,
};
