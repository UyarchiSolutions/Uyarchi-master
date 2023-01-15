const httpStatus = require('http-status');
const { DeliveryAddress } = require('../models');
const ApiError = require('../utils/ApiError');

const createDeliveryAddress = async (deliveryAddressBody) => {
  return DeliveryAddress.create(deliveryAddressBody);
};

const getDeliveryAddressById = async (id) => {
  const deliveryAddress = DeliveryAddress.findOne({ active: true });
  if (!deliveryAddress) {
    throw new ApiError(httpStatus.NOT_FOUND, ' DeliveryAddress Not Found');
  }
  return deliveryAddress;
};

const queryDeliveryAddress = async (filter, options) => {
  return DeliveryAddress.paginate(filter, options);
};

const updateDeliveryAddressById = async (deliveryAddressId, updateBody) => {
  let deliveryAddress = await getDeliveryAddressById(deliveryAddressId);
  if (!deliveryAddress) {
    throw new ApiError(httpStatus.NOT_FOUND, 'DeliveryAddress not found');
  }
  deliveryAddress = await DeliveryAddress.findByIdAndUpdate({ _id: deliveryAddressId }, updateBody, { new: true });
  return deliveryAddress;
};

const deleteDeliveryAddressById = async (deliveryAddressId) => {
  const deliveryAddress = await getDeliveryAddressById(deliveryAddressId);
  if (!deliveryAddress) {
    throw new ApiError(httpStatus.NOT_FOUND, 'DeliveryAddress not found');
  }
  (deliveryAddress.active = false), (deliveryAddress.archive = true), await deliveryAddress.save();
  return deliveryAddress;
};

module.exports = {
  createDeliveryAddress,
  getDeliveryAddressById,
  queryDeliveryAddress,
  updateDeliveryAddressById,
  deleteDeliveryAddressById,
};
