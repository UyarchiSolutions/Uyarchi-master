const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const sampleService = require('../services/sample.Service');
const create = catchAsync(async (req, res) => {
  const sampleData = await customerService.createCustomer(req.body);
  res.status(httpStatus.CREATED).send(sampleData);
});
