const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const orderRaisedByMWAService = require('../services/orderRaisedbyMWA.service');

const createOrderRaised = catchAsync(async (req, res) => {
  const orderRaised = await orderRaisedByMWAService.createOrderRaised(req.params.id);
  res.send(orderRaised);
});

module.exports = {
  createOrderRaised,
};
