const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const OtherExpensesService = require('../services/expenses.service');

const createOtherExpenses = catchAsync(async (req, res) => {
  const { body } = req;
  const otherExp = await OtherExpensesService.createOtherExpenses(body);
  if (req.files) {
    let path = '';
    req.files.forEach(function (files, index, arr) {
      path = 'images/bills/' + files.filename;
    });
    otherExp.billUpload = path;
  }
  await otherExp.save();
  res.status(httpStatus.CREATED).send(otherExp);
});

const getAllOtherExp = catchAsync(async (req, res) => {
  const otherExp = await OtherExpensesService.getAllOtherExpenses();
  res.send(otherExp);
});

const getotherExp = catchAsync(async (req, res) => {
  const otherExp = await OtherExpensesService.getOtherExpById(req.params.otherExpId);
  if (!otherExp) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OtherExpenses not found');
  }
  res.send(otherExp);
});

const updateOtherExp = catchAsync(async (req, res) => {
  const otherExp = await OtherExpensesService.updateProductById(req.params.otherExpId, req.body);
  res.send(otherExp);
});

const deleteOtherExp = catchAsync(async (req, res) => {
  await OtherExpensesService.deleteOtherExpById(req.params.otherExpId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createOtherExpenses,
  getAllOtherExp,
  getotherExp,
  updateOtherExp,
  deleteOtherExp,
};
