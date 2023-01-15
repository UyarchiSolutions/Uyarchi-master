const httpStatus = require('http-status');
const { ReceivedOrders } = require('../models');
const ApiError = require('../utils/ApiError');
const vendor = require('../models/vendor.model');

const createReceivedOrders = async (receivedBody) => {
  const { scvId } = receivedBody;
  const vend = await vendor.findById(scvId);
  if (vend === null) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Wrong SCV ID 😞');
  }
  return ReceivedOrders.create(receivedBody);
};

const getReceivedORderById = async (id, active) => {
  return ReceivedOrders.findById(id);
};

const getAllReceivedOrders = async () => {
  return ReceivedOrders.find();
};

const querReceivedOrders = async (filter, options) => {
  return ReceivedOrders.paginate(filter, options);
};

const updatereceiveOrdersById = async (receiveId, updateBody) => {
  let received = await getReceivedORderById(receiveId);
  if (!received) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Received Orders not found');
  }
  received = await ReceivedOrders.findByIdAndUpdate({ _id: receiveId }, updateBody, { new: true });
  return received;
};

const deleteReceivedOrdersById = async (receiveId) => {
  const received = await getReceivedORderById(receiveId);
  if (!received) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ward not found');
  }
  (received.active = false), (received.archive = true), await received.save();
  return received;
};

module.exports = {
  createReceivedOrders,
  getAllReceivedOrders,
  querReceivedOrders,
  getReceivedORderById,
  updatereceiveOrdersById,
  deleteReceivedOrdersById,
};
