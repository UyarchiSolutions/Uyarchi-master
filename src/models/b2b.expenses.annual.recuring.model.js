const mongoose = require('mongoose');
const { v4 } = require('uuid');
const moment = require('moment');
// const { number } = require('joi');

const expensesAnnualRecuring = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  principal: {
    type: Number,
  },
  simpleInterest: {
    type: Number,
  },
  periodRepaymentMonth: {
    type: Number,
  },
  totalAmount: {
    type: Number,
  },
  amountPerMonth: {
    type: Number,
  },
  amountPerDay: {
    type: Number,
  },
  totalDays: {
    type: Number,
  },
  date: {
    type: String,
    default: moment().utcOffset(330).format('DD-MM-yyy'),
  },
  time: {
    type: String,
    default: moment().utcOffset(330).format('h:mm a'),
  },
});

const annualRecuring = mongoose.model('AnnualRecuring', expensesAnnualRecuring);

module.exports = annualRecuring;
