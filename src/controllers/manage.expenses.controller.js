const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ManageExpensesService = require('../services/manage.expenses.service');

const createManageExpenses = catchAsync(async (req, res) => {
  const manageExpense = await ManageExpensesService.createManageExpenses(req.body);
  res.send(manageExpense);
});

const getAllManageExpenses = catchAsync(async (req, res) => {
  const manageExpense = await ManageExpensesService.getAllManageExpenses(req.params.date, req.params.page);
  res.send(manageExpense);
});

module.exports = {
  createManageExpenses,
  getAllManageExpenses,
};
