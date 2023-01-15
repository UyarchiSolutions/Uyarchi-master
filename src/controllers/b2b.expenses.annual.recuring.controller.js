const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const expenseAnnualRecuringService = require('../services/b2b.expenses.annual.recuring.service');

const createAnnualExpense = catchAsync(async (req, res) => {
  const annualExpense = await expenseAnnualRecuringService.createAnnualExpense(req.body);
  res.send(annualExpense);
});
const getAll = catchAsync(async (req, res) => {
  const annualRecuring = await expenseAnnualRecuringService.getAll(req.params.page);
  res.send(annualRecuring);
});

module.exports = {
  createAnnualExpense,
  getAll,
};
