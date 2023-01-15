const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const deliveryAddressService = require('../services/deliveryAddress.service');

const createDeliveryAddress = catchAsync(async (req, res) => {
  const deliveryAddress = await deliveryAddressService.createDeliveryAddress(req.body);
  if (!deliveryAddress) {
    throw new ApiError(httpStatus.NOT_FOUND, 'DeliveryAddress Not Fount.');
  }
  res.status(httpStatus.CREATED).send(deliveryAddress);
});

// const getBusinessDetails = catchAsync(async (req, res) => {
//   const filter = pick(req.query, ['salesProduct', 'shippingCost']);
//   const options = pick(req.query, ['sortBy', 'limit', 'page']);
//   const result = await BusinessService.queryBusiness(filter, options);
//   res.send(result);
// });

const getDeliveryAddressById = catchAsync(async (req, res) => {
  const deliveryAddress = await deliveryAddressService.getDeliveryAddressById(req.params.deliveryAddressId);
  if (!deliveryAddress || deliveryAddress.active === false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'DeliveryAddress not found');
  }
  res.send(deliveryAddress);
});

const updateDeliveryAddress = catchAsync(async (req, res) => {
  const deliveryAddress = await deliveryAddressService.updateDeliveryAddressById(req.params.deliveryAddressId, req.body);
  res.send(deliveryAddress);
});

const deleteDeliveryAddressById = catchAsync(async (req, res) => {
  await deliveryAddressService.deleteDeliveryAddressById(req.params.DeliveryAddressId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createDeliveryAddress,
  getDeliveryAddressById,
  updateDeliveryAddress,
  deleteDeliveryAddressById,
};
