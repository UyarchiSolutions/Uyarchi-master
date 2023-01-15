const httpStatus = require('http-status');
const ReviewShop = require('../models/shop-review.model');
const ApiError = require('../utils/ApiError');
const moment = require('moment');

const create_Shop_Review = async (body) => {
  let values = { ...body, ...{ created: moment() } };
  let ReviewShops = await ReviewShop.create(values);
  return ReviewShops;
};

const getTop_20_reviews = async (id) => {
  let values = await ReviewShop.find({ shopId: id }).sort({ created: -1 }).limit(20);
  if (!values.length <= 0) {
    return values;
  }
};

const updateReviewById = async (id, updateBody) => {
  let values = await ReviewShop.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No Review Yet');
  }
  values = await ReviewShop.findByIdAndUpdate({ _id: id }, updateBody, { new: true });
  return values;
};

const DeleteReviewById = async (id) => {
  let values = await ReviewShop.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No Review yet');
  }
  values = await ReviewShop.deleteOne({ _id: id });
  return values;
};

const getReviewById = async (id) => {
  let values = await ReviewShop.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No Review Yet');
  }
  return values;
};

module.exports = {
  create_Shop_Review,
  getTop_20_reviews,
  updateReviewById,
  DeleteReviewById,
  getReviewById,
};
