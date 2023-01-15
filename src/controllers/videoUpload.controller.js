const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const videoUploadService = require('../services/videoUpload.service');

const createVideoUpload = catchAsync(async (req, res) => {
  const video = await videoUploadService.createVideoUpload(req.body);
  video.video = [];
  if (req.files) {
    req.files.forEach(function (files, index, arr) {
      video.video.push('images/video/' + files.filename);
    });
  }
  res.send(video);
  await video.save();
});

const getvideoByShopId = catchAsync(async (req, res) => {
  const video = await videoUploadService.getvideoByShopId(req.params.id);
  res.send(video);
});

const get_Shop_VideoBy_ShopId = catchAsync(async (req, res) => {
  const video = await videoUploadService.get_Shop_VideoBy_ShopId(req.params.id);
  res.send(video);
});

module.exports = {
  createVideoUpload,
  getvideoByShopId,
  get_Shop_VideoBy_ShopId,
};
