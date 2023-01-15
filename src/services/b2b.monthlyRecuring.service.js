const httpStatus = require('http-status');
const monthlyRecuringModel = require('../models/b2b.monthlyRecuring.model');
const ApiError = require('../utils/ApiError');

const createMonthlyRecuring = async (body) => {
  let recuring = await monthlyRecuringModel.create(body);
  return recuring;
};

const getAll = async () => {
  return monthlyRecuringModel.find();
};

const getMonthlyRecuring = async (page) => {
  let recurring = await monthlyRecuringModel.aggregate([{ $skip: 10 * page }, { $limit: 10 }]);
  let total = await monthlyRecuringModel.find().count();
  return { Recurring: recurring, total: total };
};

const getById = async (id) => {
  let getsample = await monthlyRecuringModel.findById(id);
  return getsample;
};

module.exports = {
  createMonthlyRecuring,
  getAll,
  getMonthlyRecuring,
  getById,
};
