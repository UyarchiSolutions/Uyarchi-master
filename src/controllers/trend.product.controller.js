const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const TrendProductService = require('../services/trend.product.service');

const getStreetsByWardIdAndProducts = catchAsync(async (req, res) => {
  const trendProduct = await TrendProductService.getStreetsByWardIdAndProducts(
    req.params.wardId,
    req.params.street,
    req.params.date,
    req.params.page
  );
  res.send(trendProduct);
});

const getProductByProductIdFromTrendProduct = catchAsync(async (req, res) => {
  const trendProduct = await TrendProductService.getProductByProductIdFromTrendProduct(
    req.params.wardId,
    req.params.street,
    req.params.productId,
    req.params.date
  );
  res.send(trendProduct);
});

const getProductCalculation = catchAsync(async (req, res) => {
  const trendProduct = await TrendProductService.getProductCalculation(
    req.params.wardId,
    req.params.street,
    req.params.productId,
    req.params.date
  );
  res.send(trendProduct);
});

const updateTrendsById = catchAsync(async (req, res) => {
  const trendProduct = await TrendProductService.updateTrendsById(req.params.id, req.body);
  res.send(trendProduct);
});

const getShopsByIdFromTrends = catchAsync(async (req, res) => {
  const trends = await TrendProductService.getShopsByIdFromTrends(req.params.id);
  res.send(trends);
});

module.exports = {
  getStreetsByWardIdAndProducts,
  getProductByProductIdFromTrendProduct,
  getProductCalculation,
  updateTrendsById,
  getShopsByIdFromTrends,
};
