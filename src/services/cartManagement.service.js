const httpStatus = require('http-status');
const { CartManagement } = require('../models');
const ApiError = require('../utils/ApiError');

const createCartManagement = async (cartManagementBody) => {
  return CartManagement.create(cartManagementBody);
};

const getCartManagementById = async (id) => {
  const cartManagement = CartManagement.findOne({ active: true });
  if (!cartManagement) {
    throw new ApiError(httpStatus.NOT_FOUND, 'CartManagement Not Found');
  }
  return cartManagement;
};

const queryCartManagement = async (filter, options) => {
  return CartManagement.paginate(filter, options);
};

const updateCartManagementById = async (cartManagementId, updateBody) => {
  let cartManagement = await getCartManagementById(cartManagementId);
  if (!cartManagement) {
    throw new ApiError(httpStatus.NOT_FOUND, 'CartManagement not found');
  }
  cartManagement = await CartManagement.findByIdAndUpdate({ _id: cartManagementId }, updateBody, { new: true });
  return cartManagement;
};
const deleteCartManagementById = async (cartManagementId) => {
  const cartManagement = await getCartManagementById(cartManagementId);
  if (!cartManagement) {
    throw new ApiError(httpStatus.NOT_FOUND, 'CartManagement not found');
  }
  (cartManagement.active = false), (cartManagement.archive = true), await cartManagement.save();
  return cartManagement;
};
module.exports = {
  createCartManagement,
  getCartManagementById,
  updateCartManagementById,
  deleteCartManagementById,
  queryCartManagement,
};
