const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Trends } = require('../models');

const createTrends = async (trendsbody) => {
  const trends = await Trends.create(trendsbody);
  return trends;
};

const trendsPagination = async (id) => {
  return Trends.aggregate([
    {
      $sort: { Uid: 1 },
    },
    { $skip: 5 * id },
    { $limit: 5 },
  ]);
};

const getAllTrends = async () => {
  return Trends.find({ active: true });
};

const getTrendsById = async (trendsId) => {
  const trends = await Trends.findById(trendsId);
  if (!trends || trends.active === false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Trends Not Found');
  }
  return trends;
};

const updateTrendsById = async (trendsId, updateBody) => {
  let trends = await getTrendsById(trendsId);
  if (!trends) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Trends not found');
  }
  //console.log(trends);

  trends = await Trends.findByIdAndUpdate({ _id: trendsId }, updateBody, { new: true });
  return trends;
};

const deleteTrendsById = async (trendsId) => {
  const trends = await getTrendsById(trendsId);
  if (!trends) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Trends not found');
  }
  (trends.active = false), (trends.archive = true), await trends.save();
  return trends;
};

const updateProductFromTrends = async (id, updateBody) => {
  return await Trends.findByIdAndUpdate({ _id: id }, updateBody, { new: true });
};

module.exports = {
  createTrends,
  trendsPagination,
  getAllTrends,
  getTrendsById,
  updateProductFromTrends,
  updateTrendsById,
  deleteTrendsById,
};
