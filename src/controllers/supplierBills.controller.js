const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const SupplierbillsSerive = require('../services/supplierBills.service');

const createSupplierbills = catchAsync(async (req, res) => {
  let sbills = await SupplierbillsSerive.createSupplierbills(req.body);
  res.send(sbills);
});

module.exports = { createSupplierbills };
