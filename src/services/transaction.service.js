const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const Transaction = require('../models/transaction.model');
const moment = require('moment');
const ReceivedProduct = require('../models/receivedProduct.model');

const createTransaction = async (body) => {
  let currentDate = moment().format('YYYY-MM-DD');
  let currentTime = moment().format('HHmmss');
  let reci = await ReceivedProduct.findById(body.groupId);
  let values = {
    ...body, ...{
      date: currentDate, created: moment(), time: currentTime, supplierId: reci.supplierId
    }
  };
  const transaction = await Transaction.create(values);
  return transaction;
};

const getAllTrensaction = async () => {
  const transaction = await Transaction.find({ active: true });
  return transaction;
};

const getTransactionById = async (id) => {
  const transaction = await Transaction.findById(id);
  if (!transaction || transaction.active == false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Transaction Not Found');
  }
  return transaction;
};

const updateTransactionbyId = async (id, updateBody) => {
  let transaction = await Transaction.findById(id);
  if (!transaction || transaction.active == false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  transaction = await Transaction.findByIdAndUpdate({ _id: id }, updateBody, { new: true });
  return transaction;
};

const deleteTransactionById = async (id) => {
  let transaction = await Transaction.findById(id);
  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Transaction Not Found');
  }
  transaction.active = false;
  await transaction.save();
};

module.exports = {
  createTransaction,
  getAllTrensaction,
  getTransactionById,
  updateTransactionbyId,
  deleteTransactionById,
};
