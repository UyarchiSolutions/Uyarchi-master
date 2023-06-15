const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const TrendProductClone = require('../models/trendsProduct.clocne.model');
const Trends = require('../models/trendsClone.model');
const { Product } = require('../models/product.model');
const { Shop } = require('../models/apartmentTable.model');
const moment = require('moment');

const getStreetsByWardIdAndProductsClone = async (wardId, street, date, page) => {
  //console.log(date, 'sdfsa');

  let match;
  if (street != 'null') {
    match = { steetId: street };
  } else {
    match = { date: date };
  }
  let wardmatch;

  if (wardId != 'null') {
    wardmatch = { wardId: wardId };
  } else {
    wardmatch = { active: true };
  }
  //console.log(match);

  let values = await Product.aggregate([
    {
      $lookup: {
        from: 'trendproducts',
        localField: '_id',
        foreignField: 'productId',
        as: 'TrendProductdata',
        pipeline: [
          { $match: { date: date } },
          { $match: match },
          {
            $lookup: {
              from: 'streets',
              localField: 'steetId',
              foreignField: '_id',
              as: 'streetsdata',
              pipeline: [{ $match: wardmatch }],
            },
          },
          {
            $unwind: '$streetsdata',
          },
          {
            $group: {
              _id: null,
              averageQuantity: { $avg: '$Rate' },
              minprice: { $min: '$Rate' },
              maxprice: { $max: '$Rate' },
            },
          },
        ],
      },
    },
    {
      $unwind: '$TrendProductdata',
    },
    {
      $project: {
        _id: 1,
        productTitle: 1,
        avg: '$TrendProductdata.averageQuantity',
        maxprice: '$TrendProductdata.maxprice',
        minprice: '$TrendProductdata.minprice',
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await Product.aggregate([
    {
      $lookup: {
        from: 'trendproducts',
        localField: '_id',
        foreignField: 'productId',
        as: 'TrendProductdata',
        pipeline: [
          { $match: { date: date } },
          { $match: match },
          {
            $lookup: {
              from: 'streets',
              localField: 'steetId',
              foreignField: '_id',
              as: 'streetsdata',
              pipeline: [{ $match: wardmatch }],
            },
          },
          {
            $unwind: '$streetsdata',
          },
          {
            $group: {
              _id: null,
              averageQuantity: { $avg: '$Rate' },
              minprice: { $min: '$Rate' },
              maxprice: { $max: '$Rate' },
            },
          },
        ],
      },
    },
    {
      $unwind: '$TrendProductdata',
    },
    {
      $project: {
        _id: 1,
        productTitle: 1,
        avg: '$TrendProductdata.averageQuantity',
        maxprice: '$TrendProductdata.maxprice',
        minprice: '$TrendProductdata.minprice',
      },
    },
  ]);
  return { values: values, total: total.length };
};

const getProductByProductIdFromTrendProductClone = async (wardId, street, productId, date) => {
  let match;
  if (street != 'null') {
    match = { steetId: { $eq: street } };
  } else {
    match = { date: date };
  }
  let wardmatch;

  if (wardId != 'null') {
    wardmatch = { wardId: wardId };
  } else {
    wardmatch = { active: true };
  }
  //console.log(match);
  let value = await TrendProductClone.aggregate([
    {
      $match: {
        $and: [{ date: { $eq: date } }, { productId: { $eq: productId } }],
      },
    },
    {
      $match: match,
    },

    {
      $lookup: {
        from: 'shops',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shopData',
      },
    },
    {
      $unwind: '$shopData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'steetId',
        foreignField: '_id',
        as: 'streetData',
        pipeline: [{ $match: wardmatch }],
      },
    },
    {
      $unwind: '$streetData',
    },
    {
      $lookup: {
        from: 'manageusers',
        localField: 'UserId',
        foreignField: '_id',
        as: 'userData',
      },
    },
    {
      $unwind: '$userData',
    },
    {
      $project: {
        shopName: '$shopData.SName',
        shopId: '$shopData._id',
        streetName: '$streetData.street',
        Rate: 1,
        username: '$userData.name',
      },
    },
  ]);
  return { value: value, total: value.length };
};

const getProductCloneCalculation = async (wardId, street, productId, date) => {
  //console.log(productId);
  let match;
  if (street != 'null') {
    match = { steetId: { $eq: street } };
  } else {
    match = { date: date };
  }
  let wardmatch;
  if (wardId != 'null') {
    wardmatch = { wardId: wardId };
  } else {
    wardmatch = { active: true };
  }
  let value = await TrendProduct.aggregate([
    {
      $match: {
        $and: [{ date: { $eq: date } }, { productId: { $eq: productId } }],
      },
    },
    {
      $match: match,
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'steetId',
        foreignField: '_id',
        as: 'streetData',
        pipeline: [{ $match: wardmatch }],
      },
    },
    {
      $unwind: '$streetData',
    },
    {
      $lookup: {
        from: 'shops',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shopdateData',
      },
    },
  ]);
  let shopss = [{ date: 'dsf' }];
  if (street == 'null') {
    shopss = await Shop.aggregate([
      {
        $lookup: {
          from: 'trendproducts',
          localField: '_id',
          foreignField: 'shopId',
          as: 'TrendProductdata',
          pipeline: [{ $match: { date: date } }, { $match: { productId: productId } }, { $match: wardmatch }],
        },
      },
      {
        $unwind: '$TrendProductdata',
      },
    ]);
  }
  //console.log(shopss.length);

  return { totalshops: value.length, totalStreet: shopss.length };
};

const updateTrendsById = async (id, body) => {
  let trendproduct = await TrendProductClone.findOne({});
  if (!trendproduct) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
  }
  //console.log(trendproduct);
  trendproduct = await TrendProductClone.findByIdAndUpdate({ _id: id }, body, { new: true });
  return trendproduct;
};

const getShopsByIdFromTrends = async (id) => {
  let options = {
      timeZone: 'asia/kolkata',
      hour: 'numeric',
      minute: 'numeric',
    },
    formatter = new Intl.DateTimeFormat([], options);
  var dt = moment(formatter.format(new Date()), ['h:mm A']).format('HHmm');
  let datenow = moment(new Date()).format('DD-MM-YYYY');
  //console.log(dt);
  let match = [{ active: { $eq: false } }];
  if (600 < dt && 1100 > dt) {
    //console.log('1');

    match = [{ date: { $eq: datenow } }, { shopid: { $eq: id } }, { time: { $gte: 600 } }, { time: { $lte: 1100 } }];
  }
  if (1100 < dt && 1500 > dt) {
    match = [{ date: { $eq: datenow } }, { shopid: { $eq: id } }, { time: { $gte: 1100 } }, { time: { $lte: 1500 } }];
  }
  if (1500 < dt && 2400 > dt) {
    match = [{ date: { $eq: datenow } }, { shopid: { $eq: id } }, { time: { $gte: 1500 } }, { time: { $lte: 1800 } }];
  }
  //console.log(match);
  let values = await Trends.aggregate([
    {
      $match: {
        $and: match,
      },
    },
  ]);
  return values;
};

module.exports = {
  getStreetsByWardIdAndProductsClone,
  getProductByProductIdFromTrendProductClone,
  getProductCloneCalculation,
  updateTrendsById,
  getShopsByIdFromTrends,
};
