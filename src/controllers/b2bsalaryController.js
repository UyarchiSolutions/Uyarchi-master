const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const b2busersalaryController = require('../services/b2buser.salaryInfo.service');
const b2buserSalary = require('../models/b2buserSalaryInfo.model');

const createB2bSalaryInfo = catchAsync(async (req, res) => {
  let center = '';
  let id = 'Emp';
  const salary = await b2buserSalary
    .find({
      active: true,
    })
    .count();
  if (salary < 9) {
    center = '0000';
  }
  if (salary < 99 && salary >= 9) {
    center = '000';
  }
  if (salary < 999 && salary >= 99) {
    center = '00';
  }
  if (salary < 9999 && salary >= 999) {
    center = '0';
    //console.log('4');
  }
  let total = salary + 1;
  let employeId = id + center + total;
  let salaryInfo;
  //console.log(req.body.userId);
  let check = await b2buserSalary.findOne({ userId: req.body.userId });
  if (check != null) {
    let hh = await b2buserSalary.findByIdAndUpdate({ _id: check._id }, req.body, { new: true });
    res.send(hh);
  } else {
    if (employeId != '') {
      salaryInfo = await b2busersalaryController.createB2bSalaryInfo(req.body);
    }
    salaryInfo.empId = employeId;
    await salaryInfo.save();
    res.send(salaryInfo);
  }
});

const getAllDataWithAggregation = catchAsync(async (req, res) => {
  const salaryInfo = await b2busersalaryController.getAllDataWithAggregation(req.params.page);
  res.send(salaryInfo);
});

const updateuserStatus = catchAsync(async (req, res) => {
  const salaryInfo = await b2busersalaryController.updateuserStatus(req.params.id);
  res.send(salaryInfo);
});

const getActiveUsers = catchAsync(async (req, res) => {
  const activeUsers = await b2busersalaryController.getActiveUsers();
  res.send(activeUsers);
});
module.exports = {
  createB2bSalaryInfo,
  getAllDataWithAggregation,
  updateuserStatus,
  getActiveUsers,
};
