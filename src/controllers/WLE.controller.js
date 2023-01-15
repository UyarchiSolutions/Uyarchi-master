const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const WLE_Service = require('../services/WLE.service');

const setPackedStatus_By_LoadingExecutice = catchAsync(async (req, res) => {
  const data = await WLE_Service.setPackedStatus_By_LoadingExecutice(req.body,req.userId);
  res.send(data);
});

module.exports = {
  setPackedStatus_By_LoadingExecutice,
};
