const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const expensesAnnualRecuringModel = require('../models/b2b.expenses.annual.recuring.model');

const createAnnualExpense = async (body) => {
  //console.log(body);

  const { principal, simpleInterest, periodRepaymentMonth, totalDays } = body;

  let interestPerYear = (principal * simpleInterest * periodRepaymentMonth) / 100;

  //console.log(interestPerYear);

  let totalAmount = principal + interestPerYear;
  // let amountPerMonth = interestPerYear / 12;
  let amountPerMonth = totalAmount / periodRepaymentMonth;

  let amountPerDay = amountPerMonth / 30;

  let values = {
    ...body,
    ...{
      amountPerMonth: Math.round(amountPerMonth),
      amountPerDay: Math.round(amountPerDay),
      totalAmount: totalAmount,
    },
  };

  let expenses = await expensesAnnualRecuringModel.create(values);
  //console.log(values);

  return expenses;
};

const getAll = async (page) => {
  let values = await expensesAnnualRecuringModel.aggregate([{ $skip: 10 * page }, { $limit: 10 }]);
  let total = await expensesAnnualRecuringModel.find().count();
  return { values: values, total: total };
};

module.exports = {
  createAnnualExpense,
  getAll,
};
