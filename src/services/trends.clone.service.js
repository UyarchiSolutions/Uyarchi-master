const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const TrendsClone = require('../models/trendsClone.model');
const { Users } = require('../models/B2Busers.model');
const moment = require('moment');

const createTrendsClone = async (body) => {
  let servertime = moment().format('HHmm');
  let serverdate = moment().format('DD-MM-yyy');
  let values = { ...body, ...{ date: serverdate, time: servertime, timestamps: moment() } };
  const trendsClone = await TrendsClone.create(values);
  return trendsClone;
};

const TrendsClonePagination = async (id) => {
  return TrendsClone.aggregate([
    {
      $sort: { Uid: 1 },
    },
    { $skip: 5 * id },
    { $limit: 5 },
  ]);
};

const getAllTrendsClone = async () => {
  return TrendsClone.find({ active: true });
};

const getTrendsCloneById = async (TrendsCloneId) => {
  const TrendsClone = await TrendsClone.findById(TrendsCloneId);
  if (!TrendsClone || TrendsClone.active === false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'TrendsClone Not Found');
  }
  return TrendsClone;
};

const getTrendsClone = async (wardId, street, page) => {
  let match;
  if (street != 'null') {
    match = { streetId: { $eq: street } };
  } else {
    match = { active: true };
  }
  let wardmatch;
  if (wardId != 'null') {
    wardmatch = { wardId: wardId };
  } else {
    wardmatch = { active: true };
  }
  let values = await TrendsClone.aggregate([
    {
      $match: { $and: [match] },
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'streetId',
        foreignField: '_id',
        as: 'streetData',
        pipeline: [{ $match: wardmatch }],
      },
    },

    {
      $unwind: '$streetData',
    },
    {
      $project: {
        _id: 1,
        product: 1,
        shopid: 1,
        data: 1,
        time: 1,
        street: '$streetData.street',
      },
    },
    {
      $skip: 10 * page,
    },
    {
      $limit: 10,
    },
  ]);
  let total = await TrendsClone.aggregate([
    {
      $match: { $and: [match] },
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'streetId',
        foreignField: '_id',
        as: 'streetData',
        pipeline: [{ $match: wardmatch }],
      },
    },

    {
      $unwind: '$streetData',
    },
  ]);

  return { Values: values, total: total.length };
};

const updateTrendsCloneById = async (TrendsCloneId, updateBody) => {
  let TrendsClone = await getTrendsCloneById(TrendsCloneId);
  if (!TrendsClone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'TrendsClone not found');
  }
  //console.log(TrendsClone);

  TrendsClone = await TrendsClone.findByIdAndUpdate({ _id: TrendsCloneId }, updateBody, { new: true });
  return TrendsClone;
};

const deleteTrendsCloneById = async (TrendsCloneId) => {
  const TrendsClone = await getTrendsCloneById(TrendsCloneId);
  if (!TrendsClone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'TrendsClone not found');
  }
  (TrendsClone.active = false), (TrendsClone.archive = true), await TrendsClone.save();
  return TrendsClone;
};

const updateProductFromTrendsClone = async (id, updateBody) => {
  return await TrendsClone.findByIdAndUpdate({ _id: id }, updateBody, { new: true });
};

const getTrends_Report_by_data = async (date) => {
  let values = await Users.aggregate([
    {
      $lookup: {
        from: 'trendsclones',
        localField: '_id',
        foreignField: 'Uid',
        pipeline: [
          { $match: { date: date } },

          {
            $lookup: {
              from: 'b2bshopclones',
              localField: 'shopid',
              foreignField: '_id',
              as: 'shops',
            },
          },
          {
            $unwind: {
              preserveNullAndEmptyArrays: true,
              path: '$shops',
            },
          },
        ],
        as: 'trends',
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        phoneNumber: 1,
        salary: 1,
        trends: '$trends.shops',
        total: { $size: '$trends.shops' },
      },
    },
    {
      $match: { total: { $gt: 0 } },
    },
  ]);
  return values;
};

module.exports = {
  createTrendsClone,
  TrendsClonePagination,
  getAllTrendsClone,
  getTrendsCloneById,
  updateProductFromTrendsClone,
  updateTrendsCloneById,
  deleteTrendsCloneById,
  getTrendsClone,
  getTrends_Report_by_data,
};
