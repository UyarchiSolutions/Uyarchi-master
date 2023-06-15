const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const TrackingService = require('../services/tracking.service');

const createTracking = catchAsync(async (req, res) => {
  const tracking = await TrackingService.createTracking(req.body);
  res.send(tracking);
});

const updateTrackingById = catchAsync(async (req, res) => {
  const tracking = await TrackingService.updateTrackingById(req.params.id, req.body);
  res.send(tracking);
});
const getTrackingByUserById = catchAsync(async (req, res) => {
  const tracking = await TrackingService.getTrackingByUserById(req.params.userId);
  //console.log(tracking);
  res.send(tracking);
});

const gettracking = catchAsync(async (req, res) => {
  const tracking = await TrackingService.gettracking(req.params.userId);
  //console.log(tracking);
  res.send(tracking);
});
const gettrackingall = catchAsync(async (req, res) => {
  const tracking = await TrackingService.gettrackingall(req.params.userId);
  //console.log(tracking);
  res.send(tracking);
});

const getusers = catchAsync(async (req, res) => {
  const tracking = await TrackingService.getusers();
  //console.log(tracking);
  res.send(tracking);
});
const updatelocation = catchAsync(async (req, res) => {
  const tracking = await TrackingService.updatelocation(req.shopId, req.body);
  // //console.log(tracking);
  res.send(tracking);
});
module.exports = {
  createTracking,
  updateTrackingById,
  getTrackingByUserById,
  updatelocation,
  gettracking,
  getusers,
  gettrackingall,
};
