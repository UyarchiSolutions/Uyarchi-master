const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const transactionService = require('../services/transaction.service');

const createTransaction = catchAsync(async (req, res) => {
  const transaction = await transactionService.createTransaction(req.body);
  res.send(transaction);
});

const getAllTransaction = catchAsync(async (req, res) => {
  const transaction = await transactionService.getAllTrensaction();
  res.send(transaction);
});

const getTransactionById = catchAsync(async (req, res) => {
  const transaction = await transactionService.getTransactionById(req.params.id);
  res.send(transaction);
});

const updateTrendsById = catchAsync(async (req, res) => {
  const transaction = await transactionService.updateTransactionbyId(req.params.id, req.body);
  res.send(transaction);
});

const deleteTransactionById = catchAsync(async (req, res) => {
  const transaction = await transactionService.deleteTransactionById(req.params.id);
  res.send(transaction);
});

module.exports = {
  createTransaction,
  getTransactionById,
  getAllTransaction,
  updateTrendsById,
  deleteTransactionById,
};
