const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const trendsService = require('../services/trends.service');
const Trendproduct = require('../models/trendproduct.model');
const createTrends = catchAsync(async (req, res) => {
  const trends = await trendsService.createTrends(req.body);
  req.body.product.forEach(async (e) => {
    let row = {
      productId: e.Pid,
      productName: e.PName,
      Unit: e.Unit,
      Rate: e.Rate,
      Weight: e.Weight,
      orderId: trends._id,
      shopId: req.body.shopid,
      steetId: req.body.street,
      UserId: req.body.Uid,
      date: req.body.date,
      time: req.body.time,
      fulldate: req.body.fulldate,
      created: req.body.created,
    };
    await Trendproduct.create(row);
  });
  res.status(httpStatus.CREATED).send(trends);
});

const updateProductFromTrends = catchAsync(async (req, res) => {
  const trends = await trendsService.updateProductFromTrends(req.params.id, req.body);
  //console.log(trends);
  req.body.product.forEach(async (e) => {
    let row = {
      productId: e.Pid,
      productName: e.PName,
      Unit: e.Unit,
      Rate: e.Rate,
      Weight: e.Weight,
      orderId: req.params.id,
      shopId: trends.shopid,
      steetId: trends.street,
      UserId: trends.Uid,
      date: trends.date,
      time: trends.time,
      fulldate: trends.fulldate,
      created: trends.created,
    };
    let oldid = await Trendproduct.findOne({ orderId: req.params.id, productId: e.Pid });
    if (oldid) {
      await Trendproduct.findOneAndUpdate({ _id: oldid._id }, { Rate: e.Rate }, { new: true });
    } else {
      await Trendproduct.create(row);
    }
  });

  res.send(trends);
});

const getAllTrends = catchAsync(async (req, res) => {
  const trends = await trendsService.getAllTrends();
  res.send(supplier);
});

const getTrendsById = catchAsync(async (req, res) => {
  const trends = await trendsService.updateTrendsById(req.params.trendsId);
  if (!trends || trends.active == false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Trends Not Found');
  }
  res.send(trends);
});

const trendsPagination = catchAsync(async (req, res) => {
  const trends = await trendsService.trendsPagination(req.params.id);
  res.send(trends);
});

const updateTrendsById = catchAsync(async (req, res) => {
  const trends = await trendsService.updateTrendsById(req.params.trendsId, req.body);
  if (!trends || trends.active == false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Trends Not Found');
  }
  res.send(trends);
});

const deleteTrendsById = catchAsync(async (req, res) => {
  const trends = await trendsService.deleteTrendsById(req.params.trendsId);
  res.send();
});

module.exports = {
  createTrends,
  getAllTrends,
  getTrendsById,
  trendsPagination,
  updateProductFromTrends,
  updateTrendsById,
  deleteTrendsById,
};
