const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ManageSalaryService = require('../services/manage.salary.service');

const createManageSalary = catchAsync(async (req, res) => {
  const managesalary = await ManageSalaryService.createManageSalary(req.body);
  res.send(managesalary);
});

const getSalaryInfoById = catchAsync(async (req, res) => {
  const salary = await ManageSalaryService.getSalaryInfoById(req.params.userid);
  res.send(salary);
});

module.exports = {
  createManageSalary,
  getSalaryInfoById,
};
