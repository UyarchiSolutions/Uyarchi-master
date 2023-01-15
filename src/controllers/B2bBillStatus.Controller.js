const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const b2bBillStatusService = require('../services/b2bBillStatus.service');

const createB2bBillStatus = catchAsync(async (req, res) => {
  const billStatus = await b2bBillStatusService.createB2bBillStatus(req.body);
  res.status(httpStatus.CREATED).send(billStatus);
});

const getDataForAccountExecutive = catchAsync(async (req, res) => {
  const billStatus = await b2bBillStatusService.getDataForAccountExecutive(req.params.page);
  res.send(billStatus);
});

const ManageDeliveryExpenseBillEntry = catchAsync(async (req, res) => {
  const billStatus = await b2bBillStatusService.ManageDeliveryExpenseBillEntry(req.params.id, req.body);
  res.status(httpStatus.CREATED).send(billStatus);
});

const getBilledDataForSupplierBills = catchAsync(async (req, res) => {
  const billStatus = await b2bBillStatusService.getBilledDataForSupplierBills(req.params.date, req.params.page);
  res.send(billStatus);
});

const getBillstatusById = catchAsync(async (req, res) => {
  const billStatus = await b2bBillStatusService.getBillstatusById(req.params.id);
  res.send(billStatus);
});

module.exports = {
  createB2bBillStatus,
  getDataForAccountExecutive,
  ManageDeliveryExpenseBillEntry,
  getBilledDataForSupplierBills,
  getBillstatusById,
};
