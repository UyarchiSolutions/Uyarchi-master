const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const TrendProduct = require('../models/trendproduct.model');
const Trends = require('../models/trends.model');
const { Product } = require('../models/product.model');
const { Shop } = require('../models/b2b.ShopClone.model');
const moment = require('moment');
const Street = require('../models/street.model');
const getStreetsByWardIdAndProducts = async (wardId, street, date, page) => {
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

const getProductByProductIdFromTrendProduct = async (wardId, street, productId, date) => {
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

const getProductCalculation = async (wardId, street, productId, date) => {
  let match;
  let wardmatch;
  if (street != 'null') {
    match = { Strid: { $eq: street } };
  } else {
    match = { active: { $eq: true } };
  }

  if (wardId != 'null') {
    wardmatch = { Wardid: { $eq: wardId } };
  } else {
    wardmatch = { active: { $eq: true } };
  }

  let value = await Shop.aggregate([
    {
      $match: {
        $and: [match, wardmatch],
      },
    },
    {
      $lookup: {
        from: 'trendproductsclones',
        localField: '_id',
        foreignField: 'shopId',
        as: 'TrendProductdata',
        pipeline: [{ $match: { date: date } }, { $match: { productId: productId } }],
      },
    },
    {
      $unwind: '$TrendProductdata',
    },
  ]);
  let shopss = [{ date: 'dsf' }];
  if (street != 'null') {
    match = { Strid: { $eq: street } };
  } else {
    match = { active: { $eq: true } };
  }

  if (wardId != 'null') {
    wardmatch = { wardId: { $eq: wardId } };
  } else {
    wardmatch = { active: { $eq: true } };
  }
  if (street == 'null') {
    shopss = await Street.aggregate([
      {
        $match: {
          $and: [match, wardmatch],
        },
      },
      {
        $lookup: {
          from: 'trendproductsclones',
          localField: '_id',
          foreignField: 'steetId',
          pipeline: [
            { $match: { date: date } },
            { $match: { productId: productId } },
            { $group: { _id: null, myCount: { $sum: 1 } } },
          ],
          as: 'TrendProductdata',
        },
      },
      {
        $unwind: '$TrendProductdata',
      },
    ]);
  }
  return { totalshops: value.length, totalStreet: shopss.length };
};

const updateTrendsById = async (id, body) => {
  let trendproduct = await TrendProduct.findOne({});
  if (!trendproduct) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
  }
  //console.log(trendproduct);
  trendproduct = await TrendProduct.findByIdAndUpdate({ _id: id }, body, { new: true });
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
  let match = [{ active: { $eq: true } }];
  if (600 < dt && 1000 > dt) {
    //console.log('1');
    match = [{ shopid: { $eq: id } }, { time: { $gte: 600 } }, { time: { $lte: 1000 } }];
  }
  if (1100 < dt && 1400 > dt) {
    match = [{ shopid: { $eq: id } }, { time: { $gte: 1100 } }, { time: { $lte: 1400 } }];
  }
  if (1500 < dt && 2400 > dt) {
    match = [{ shopid: { $eq: id } }, { time: { $gte: 1500 } }, { time: { $lte: 1800 } }];
  }
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
  getStreetsByWardIdAndProducts,
  getProductByProductIdFromTrendProduct,
  getProductCalculation,
  updateTrendsById,
  getShopsByIdFromTrends,
};
