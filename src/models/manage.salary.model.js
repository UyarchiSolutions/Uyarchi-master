const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const moment = require('moment');
const manageSalarySchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  salary: {
    type: Number,
  },
  userid: {
    type: String,
  },
  date: {
    type: String,
    default: moment().utcOffset(330).format('DD-MM-yyy'),
  },
  time: {
    type: String,
    default: moment().utcOffset(330).format('h:mm a'),
  },
  oldSalary: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
});

const manageSalary = mongoose.model('manageSalary', manageSalarySchema);

module.exports = manageSalary;
