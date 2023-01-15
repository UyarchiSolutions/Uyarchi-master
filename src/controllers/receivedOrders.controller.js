const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { receiveOrdersService } = require('../services');

const creatreceivedOrders = catchAsync(async (req, res) => {
  const receive = await receiveOrdersService.createReceivedOrders(req.body);
  if (!receive) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Received Orders Not Fount.');
  }
  res.status(httpStatus.CREATED).send(receive);
});

// const getProducts = catchAsync(async (req, res) => {
//   const filter = pick(req.query, ['productTitle', 'unit']);
//   const options = pick(req.query, ['sortBy', 'limit', 'page']);
//   const result = await productService.queryProduct(filter, options);
//   res.send(result);
// });

const getReceivedOrdersById = catchAsync(async (req, res) => {
  const receive = await receiveOrdersService.getReceivedORderById(req.params.receiveId);
  if (!receive || receive.active === false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Received Orders not found');
  }
  res.send(receive);
});

const getAllReceivedOrders = catchAsync(async (req, res) => {
  const receive = await receiveOrdersService.getAllReceivedOrders(req.params);
  if (!receive) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'ReceiveD Orders Not Found');
  }
  res.send(receive);
});

const updateReceivedOrders = catchAsync(async (req, res) => {
  const receive = await receiveOrdersService.updatereceiveOrdersById(req.params.receiveId, req.body);
  res.send(receive);
});

const deleteReceivedOrders = catchAsync(async (req, res) => {
  await receiveOrdersService.deleteReceivedOrdersById(req.params.receiveId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  creatreceivedOrders,
  getReceivedOrdersById,
  getAllReceivedOrders,
  updateReceivedOrders,
  deleteReceivedOrders,
};
