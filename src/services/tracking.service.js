const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const Tracking = require('../models/tracking.model');
const { Users } = require('../models/B2Busers.model');
const moment = require('moment');
const { Shop } = require('../models/b2b.ShopClone.model');

const createTracking = async (body) => {
  let values = { ...body, ...{ created: moment() } };
  let users = await Tracking.findOne({ userId: body.userId });
  if (!users) {
    await Tracking.create(values);
  } else {
    await Tracking.findByIdAndUpdate({ _id: users._id }, values, { new: true });
  }
  return 'Success';
};

const updateTrackingById = async (id, body) => {
  let values = await Tracking.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tracking Not Found');
  }
  values = await Tracking.findByIdAndUpdate({ _id: id }, updateBody, { new: true });
  return values;
};

const getTrackingByUserById = async (userId) => {
  //console.log(userId);
  let values = await Tracking.findOne({ userId: userId });
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
  }
  return values;
};

const gettracking = async (userId) => {
  //console.log(userId);

  let values = await Tracking.aggregate([
    { $match: { userId: userId } },
    { $unwind: '$capture' },
    { $sort: { 'capture.CreatedDate': -1, 'capture:CreatedDate': -1 } },
    {
      $project: {
        capture: 1,
        _id: 1,
        userId: 1,
      },
    },
    { $limit: 1 },
  ]);
  if (values.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
  }
  return values[0];
};

const gettrackingall = async (userId) => {
  //console.log(userId);
  let today = moment().format('YYYY-MM-DD');
  let values = await Tracking.findOne({ userId: userId, date: today });
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
  }
  return values;
};

const getusers = async () => {
  let values = await Shop.find({ registered: true });
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shop Not Found');
  }
  return values;
};

const updatelocation = async (shopId, body) => {
  //console.log(shopId);
  let today = moment().format('YYYY-MM-DD');
  let update = { ...body, ...{ date: today, userId: shopId } };
  let values = await Tracking.findOne({ userId: shopId, date: today });
  if (!values) {
    await Tracking.create(update);
  } else {
    let capture = body.capture;
    if (values.capture.length != 0) {
      capture = values.capture.concat(body.capture);
    }
    await Tracking.findByIdAndUpdate({ _id: values._id }, { capture: capture }, { new: true });
  }
  return values;
};

module.exports = {
  createTracking,
  updateTrackingById,
  getTrackingByUserById,
  updatelocation,
  gettracking,
  getusers,
  gettrackingall,
};
