const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const pettyStockModel = require('../models/b2b.pettyStock.model');

const pettyStockSubmit = async (body) => {
  let sample = await pettyStockModel.create(body);
  return sample;
};

module.exports = {
  pettyStockSubmit,
};
