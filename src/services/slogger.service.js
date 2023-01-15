const httpStatus = require('http-status');
const { Slogger } = require('../models');
const ApiError = require('../utils/ApiError');

const createSlogger = async (sloggerBody) => {
  return Slogger.create(sloggerBody);
};

const getSloggerById = async (id) => {
  const slogger = Slogger.findOne({ active: true });
  if (!slogger) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Slogger Not Found');
  }
  return slogger;
};

const querSlogger = async (filter, options) => {
  return Slogger.paginate(filter, options);
};

const updateSloggerById = async (sloggerId, updateBody) => {
  let slogger = await getSloggerById(sloggerId);
  if (!slogger) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Slogger not found');
  }
  slogger = await slogger.findByIdAndUpdate({ _id: sloggerId }, updateBody, { new: true });
  return slogger;
};

const deleteSloggerById = async (sloggerId) => {
  const slogger = await getSloggerById(sloggerId);
  if (!slogger) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Slogger not found');
  }
  (slogger.active = false), (slogger.archive = true), await slogger.save();
  return slogger;
};

module.exports = {
  createSlogger,
  getSloggerById,
  querSlogger,
  updateSloggerById,
  deleteSloggerById,
};
