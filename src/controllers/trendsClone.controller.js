const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const trendsCloneService = require('../services/trends.clone.service');
const TrendproductClone = require('../models/trendsProduct.clocne.model');
const TrendsClone = require('../models/trendsClone.model');
const Street = require('../models/street.model');
const { MarketShopsClone } = require('../models/market.model');
const { Shop } = require('../models/b2b.ShopClone.model');
const { MarketClone } = require('../models/market.model');
const moment = require('moment');

const createTrends = catchAsync(async (req, res) => {
  let userId = req.userId;
  const trends = await trendsCloneService.createTrendsClone(req.body);
  let shopclone = await Shop.findById({ _id: req.body.shopid });
  let marketshopclone = await MarketShopsClone.findById({ _id: req.body.shopid });
  let streetId;
  // //console.log(shopclone,"sdfsfd")
  let servertime = moment().format('HHmm');
  let serverdate = moment().format('DD-MM-yyy');
  let created = moment().format('hh:mm a');
  if (shopclone) {
    streetId = shopclone.Strid;
  }
  if (marketshopclone) {
    let mid = marketshopclone.MName;
    let market = await MarketClone.findById(mid);
    streetId = market.Strid;
  }
  req.body.product.forEach(async (e) => {
    let row = {
      productId: e.Pid,
      productName: e.PName,
      Unit: e.Unit,
      Rate: e.Rate,
      Weight: e.Weight,
      orderId: trends._id,
      shopId: req.body.shopid,
      steetId: streetId,
      UserId: userId,
      date: serverdate,
      time: servertime,
      // fulldate: req.body.fulldate,
      created: created,
      timestamp: moment(),
    };
    await TrendproductClone.create(row);
  });

  await TrendsClone.findByIdAndUpdate({ _id: trends._id }, { streetId: streetId, Uid: userId }, { new: true });
  // trends.streetId = streetId;

  res.status(httpStatus.CREATED).send(trends);
});

const updateProductFromTrendsClone = catchAsync(async (req, res) => {
  const trends = await trendsCloneService.updateProductFromTrendsClone(req.params.id, req.body);
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
    let oldid = await TrendproductClone.findOne({ orderId: req.params.id, productId: e.Pid });
    if (oldid) {
      await TrendproductClone.findOneAndUpdate({ _id: oldid._id }, { Rate: e.Rate }, { new: true });
    } else {
      await TrendproductClone.create(row);
    }
  });
  res.send(trends);
});

const getAllTrends = catchAsync(async (req, res) => {
  const trends = await trendsCloneService.getAllTrendsClone();
  res.send(supplier);
});

const getTrendsById = catchAsync(async (req, res) => {
  const trends = await trendsCloneService.updateTrendsCloneById(req.params.trendsId);
  if (!trends || trends.active == false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Trends Not Found');
  }
  res.send(trends);
});

const trendsPagination = catchAsync(async (req, res) => {
  const trends = await trendsCloneService.TrendsClonePagination(req.params.id);
  res.send(trends);
});

const updateTrendsById = catchAsync(async (req, res) => {
  const trends = await trendsCloneService.updateTrendsCloneById(req.params.trendsId, req.body);
  if (!trends || trends.active == false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Trends Not Found');
  }
  res.send(trends);
});

const getTrendsClone = catchAsync(async (req, res) => {
  const trends = await trendsCloneService.getTrendsClone(req.params.wardId, req.params.street, req.params.page);
  res.send(trends);
});
const getTrends_Report_by_data = catchAsync(async (req, res) => {
  const data = await trendsCloneService.getTrends_Report_by_data(req.params.date);
  res.send(data);
});
module.exports = {
  createTrends,
  getAllTrends,
  getTrendsById,
  trendsPagination,
  updateProductFromTrendsClone,
  updateTrendsById,
  getTrendsClone,
  getTrends_Report_by_data,
};
