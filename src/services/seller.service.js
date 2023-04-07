const httpStatus = require('http-status');
const Seller = require('../models/seller.models');
const ApiError = require('../utils/ApiError');

const createSeller = async (body) => {
  let values = await Seller.create(body);
  return values;
};

const GetAllSeller = async () => {
  let values = await Seller.find();
  return values;
};

const GetSellerById = async (id) => {
  let values = await Seller.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Seller Not Found');
  }
  return values;
};

const UpdateSellerById = async (id, body) => {
  let values = await Seller.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Seller Not Found');
  }
  values = await Seller.findByIdAndUpdate({ _id: id }, body, { new: true });
  return values;
};

module.exports = {
  createSeller,
  GetAllSeller,
  GetSellerById,
  UpdateSellerById,
};
