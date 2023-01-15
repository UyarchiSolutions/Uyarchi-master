const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const ManageExpenses = require('../models/manage.expenses.model');
const moment = require('moment');

const createManageExpenses = async (body) => {
  let values = { ...body, ...{ date: moment().format('YYYY-MM-DD'), created: moment() } };
  const manageExpense = await ManageExpenses.create(values);
  return manageExpense;
};

const getAllManageExpenses = async (date, page) => {
  let today = moment().format('YYYY-MM-DD');
  if (date == 'null') {
    date = today;
  }
  let values = await ManageExpenses.aggregate([
    {
      $match: {
        date: date,
      },
    },
    {
      $sort: { created: -1 },
    },
    {
      $skip: 10 * page,
    },
    {
      $limit: 10,
    },
  ]);
  let total = await ManageExpenses.aggregate([
    {
      $match: {
        date: date,
      },
    },
    {
      $sort: { created: -1 },
    },
  ]);
  return { values: values, total: total.length };
};

module.exports = {
  createManageExpenses,
  getAllManageExpenses,
};
