const httpStatus = require('http-status');
const { ProductCombo } = require('../models');
const ApiError = require('../utils/ApiError');

const createCombo = async (comboBody) => {
  return ProductCombo.create(comboBody);
};

const getProductComboById = async (id) => {
  const product = ProductCombo.findOne({ active: true });
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product Combo Not Found');
  }
  return product;
};

const querCombo = async (filter, options) => {
  return ProductCombo.paginate(filter, options);
};

const updateComboById = async (comboId, updateBody) => {
  let combo = await getProductComboById(comboId);
  if (!combo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Combo not found');
  }
  combo = await ProductCombo.findByIdAndUpdate({ _id: comboId }, updateBody, { new: true });
  return combo;
};

const deleteComboById = async (comboId) => {
  const combo = await getProductComboById(comboId);
  if (!combo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Combo not found');
  }
  (combo.active = false), (combo.archive = true), await combo.save();
  return combo;
};

module.exports = {
  createCombo,
  getProductComboById,
  updateComboById,
  deleteComboById,
};
