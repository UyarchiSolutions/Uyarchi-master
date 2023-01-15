const httpStatus = require('http-status');
const { ManageSalary } = require('../models');
const ApiError = require('../utils/ApiError');

const createManageSalary = async (body) => {
  let managesalary = await ManageSalary.create(body);
  return managesalary;
};

const getSalaryInfoById = async (userid) => {
  let values = await ManageSalary.aggregate([
    {
      $match: {
        $and: [{ userid: { $eq: userid } }],
      },
    },
  ]);
  return values;
};

module.exports = {
  createManageSalary,
  getSalaryInfoById,
};
