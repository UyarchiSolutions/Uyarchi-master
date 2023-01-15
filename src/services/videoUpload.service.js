const httpStatus = require('http-status');
const videoUploadService = require('../models/videoUpload.model');
const moment = require('moment');
const ApiError = require('../utils/ApiError');

const createVideoUpload = async (body) => {
  let values = { ...body, ...{ created: moment() } };
  let shopfind = await videoUploadService.findOne({ shopId: body.shopId });
  if (shopfind) {
    const update = await videoUploadService.findByIdAndUpdate({ _id: shopfind._id }, values, { new: true });
    return update;
  } else {
    const video = await videoUploadService.create(values);
    return video;
  }
};

const getvideoByShopId = async (id) => {
  let values = await videoUploadService.findOne({ shopId: id });
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No Video Found in This Shop');
  }
  return values;
};

const get_Shop_VideoBy_ShopId = async (id) => {
  let values = await videoUploadService.findOne({ shopId: id });
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No Video Fount In This Shop');
  }
  return values;
};

module.exports = {
  createVideoUpload,
  getvideoByShopId,
  get_Shop_VideoBy_ShopId,
};
