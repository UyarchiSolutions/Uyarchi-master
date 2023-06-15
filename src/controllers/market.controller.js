const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const marketService = require('../services/market.service');
const { Market, MarketClone, MarketShopsClone } = require('../models/market.model');

const createmarketService = catchAsync(async (req, res) => {
  const pro = await marketService.createmarket(req.body);
  if (req.files) {
    //   let path = [];
    req.files.forEach(function (files, index, arr) {
      pro.image.push('images/market/' + files.filename);
      // //console.log(shop.photoCapture)
    });
  }
  res.status(httpStatus.CREATED);
  res.send(pro);
  await pro.save();
});

const createmarketCloneService = catchAsync(async (req, res) => {
  // req.body.(req.userId)
  const pro = await marketService.createmarketClone(req.body);
  const userId = req.userId;
  if (pro) {
    await MarketClone.findByIdAndUpdate({ _id: pro.id }, { Uid: userId }, { new: true });
  }
  if (req.files) {
    //   let path = [];
    req.files.forEach(function (files, index, arr) {
      pro.image.push('images/marketClone/' + files.filename);
      // //console.log(shop.photoCapture)
    });
  }
  res.status(httpStatus.CREATED);
  res.send(pro);
  await pro.save();
});

const createmarketShopCloneService = catchAsync(async (req, res) => {
  // req.body.(req.userId)
  const pro = await marketService.createmarketShopClone(req.body);
  const userId = req.userId;
  if (pro) {
    await MarketShopsClone.findByIdAndUpdate({ _id: pro.id }, { Uid: userId }, { new: true });
  }
  if (req.files) {
    //   let path = [];
    req.files.forEach(function (files, index, arr) {
      pro.image.push('images/marketShopClone/' + files.filename);
      // //console.log(shop.photoCapture)
    });
  }
  res.status(httpStatus.CREATED);
  res.send(pro);
  await pro.save();
});

const getmarketShopCloneById = catchAsync(async (req, res) => {
  const pro = await marketService.getmarketShopcloneById(req.params.id);
  if (!pro || pro.active === false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'market not found');
  }
  res.send(pro);
});

const getmarketShopCloneAll = catchAsync(async (req, res) => {
  const manage = await marketService.getAllmarketShopClone();
  res.send(manage);
});

const updatemarketShopClone = catchAsync(async (req, res) => {
  const pro = await marketService.updatemarketShopCloneById(req.params.id, req.body);
  if (req.files) {
    //   let path = [];
    //console.log(req.files);
    req.files.forEach(function (files, index, arr) {
      pro.image.push('images/marketShopClone/' + files.filename);
      // //console.log(shop.photoCapture)
    });
  }
  await pro.save();
  res.send(pro);
});

const getMarketCloneWithAggregation = catchAsync(async (req, res) => {
  const market = await marketService.getMarketCloneWithAggregation(req.params.page);
  res.send(market);
});

const getMarketShopsbyMarketId = catchAsync(async (req, res) => {
  const marketShop = await marketService.getMarketShopsbyMarketId(req.params.id, req.params.page);
  res.send(marketShop);
});

const getmarketShopCloneWithAggregation = catchAsync(async (req, res) => {
  const market = await marketService.getmarketShopCloneWithAggregation(req.params.page);
  res.send(market);
});

const getmarketCloneById = catchAsync(async (req, res) => {
  const pro = await marketService.getmarketcloneById(req.params.id);
  if (!pro || pro.active === false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'market not found');
  }
  res.send(pro);
});

const getmarketCloneAll = catchAsync(async (req, res) => {
  const manage = await marketService.getAllmarketClone();
  //console.log(manage);
  res.send(manage);
});

const updatemarketClone = catchAsync(async (req, res) => {
  const pro = await marketService.updatemarketCloneById(req.params.id, req.body);
  if (req.files) {
    //   let path = [];
    //console.log(req.files);
    req.files.forEach(function (files, index, arr) {
      pro.image.push('images/marketClone/' + files.filename);
      // //console.log(shop.photoCapture)
    });
  }
  // await pro.save();
  res.send(pro);
});

const createmarketShopService = catchAsync(async (req, res) => {
  const pro = await marketService.createMarketShops(req.body);
  if (req.files) {
    //   let path = [];
    //console.log(req.files);
    req.files.forEach(function (files, index, arr) {
      pro.image.push('images/marketShop/' + files.filename);
      // //console.log(shop.photoCapture)
    });
  }
  res.status(httpStatus.CREATED).send(pro);
  await pro.save();
});

const getmarketServiceById = catchAsync(async (req, res) => {
  const pro = await marketService.getmarketById(req.params.marketId);
  if (!pro || pro.active === false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'market not found');
  }
  res.send(pro);
});

const getmarketShopServiceById = catchAsync(async (req, res) => {
  const pro = await marketService.getMarketShopsById(req.params.marketShopId);
  if (!pro || pro.active === false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'marketShop not found');
  }
  res.send(pro);
});

const getmarketServiceAll = catchAsync(async (req, res) => {
  const manage = await marketService.getAllmarket(req.params);
  res.send(manage);
});

const getAllMarketTable = catchAsync(async (req, res) => {
  const manage = await marketService.getAllmarketTable(req.params.id, req.params.page);
  if (!manage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Market Not Available');
  }
  res.send(manage);
});

const getmarketShopAll = catchAsync(async (req, res) => {
  const manage = await marketService.getMarketShops(req.params.marketId, req.params.page);
  if (!manage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'marketShop Not Available ');
  }
  res.send(manage);
});

const updatemarketService = catchAsync(async (req, res) => {
  const pro = await marketService.updatemarketById(req.params.marketId, req.body);
  if (req.files) {
    //   let path = [];
    //console.log(req.files);
    req.files.forEach(function (files, index, arr) {
      pro.image.push('images/market/' + files.filename);
      // //console.log(shop.photoCapture)
    });
  }
  // await pro.save();
  res.send(pro);
});

const updatemarketShopService = catchAsync(async (req, res) => {
  const pro = await marketService.updatemarketShopsById(req.params.marketShopId, req.body);
  if (req.files) {
    //   let path = [];
    //console.log(req.files);
    req.files.forEach(function (files, index, arr) {
      pro.image.push('images/marketShop/' + files.filename);
      // //console.log(shop.photoCapture)
    });
  }
  // await pro.save();
  res.send(pro);
});

const deletemarketService = catchAsync(async (req, res) => {
  await marketService.deletemarketById(req.params.marketId);
  res.status(httpStatus.NO_CONTENT).send();
});
module.exports = {
  createmarketService,
  getmarketServiceAll,
  updatemarketService,
  deletemarketService,
  getmarketServiceById,
  createmarketShopService,
  getmarketShopAll,
  getmarketShopServiceById,
  updatemarketShopService,
  getAllMarketTable,
  createmarketCloneService,
  getmarketShopCloneWithAggregation,
  getmarketCloneById,
  getmarketCloneAll,
  updatemarketClone,
  createmarketShopCloneService,
  getmarketShopCloneAll,
  getMarketShopsbyMarketId,
  getMarketCloneWithAggregation,
  getmarketShopCloneById,
  updatemarketShopClone,
};
