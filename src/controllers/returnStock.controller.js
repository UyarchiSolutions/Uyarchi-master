const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ReturnService = require('../services/returnStock.service');

const create_ReturnStock = catchAsync(async (req, res) => {
  let userid = req.userId;
  const returnstock = await ReturnService.create_ReturnStock(req.body, userid);
  res.send(returnstock);
});

module.exports = {
  create_ReturnStock,
};
