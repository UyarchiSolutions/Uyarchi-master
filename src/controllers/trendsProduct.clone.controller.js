const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const TrendProductCloneService = require('../services/trendsProduct.Clone.service');

const getStreetsByWardIdAndProducts = catchAsync(async (req, res) => {
  const trendProduct = await TrendProductCloneService.getStreetsByWardIdAndProductsClone(
    req.params.wardId,
    req.params.street,
    req.params.date,
    req.params.page
  );
  res.send(trendProduct);
});

const getProductByProductIdFromTrendProduct = catchAsync(async (req, res) => {
  const trendProduct = await TrendProductCloneService.getProductByProductIdFromTrendProductClone(
    req.params.wardId,
    req.params.street,
    req.params.productId,
    req.params.date
  );
  res.send(trendProduct);
});

const getProductCalculation = catchAsync(async (req, res) => {
  const trendProduct = await TrendProductCloneService.getProductCloneCalculation(
    req.params.wardId,
    req.params.street,
    req.params.productId,
    req.params.date
  );
  //console.log(trendProduct);
  res.send(trendProduct);
});

const updateTrendsById = catchAsync(async (req, res) => {
  const trendProduct = await TrendProductCloneService.updateTrendsById(req.params.id, req.body);
  res.send(trendProduct);
});

const getShopsByIdFromTrends = catchAsync(async (req, res) => {
  const trends = await TrendProductCloneService.getShopsByIdFromTrends(req.params.id);
  res.send(trends);
});



module.exports = {
  getStreetsByWardIdAndProducts,
  getProductByProductIdFromTrendProduct,
  getProductCalculation,
  updateTrendsById,
  getShopsByIdFromTrends,
};
