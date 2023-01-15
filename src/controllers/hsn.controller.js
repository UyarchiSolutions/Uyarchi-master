const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const hsnService = require('../services/hsn.service');

const getAllHsn = catchAsync(async (req, res) => {
  const hsn = await hsnService.getAllHsn(req.params.key);
  res.send(hsn);
});

const createHsn = catchAsync(async (req, res) => {
  const hsn = await hsnService.createHsn();
  res.send(hsn);
});

module.exports = { getAllHsn, createHsn };
