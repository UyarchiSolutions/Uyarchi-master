const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const supplierUnBilledService = require('../services/supplier.unBilled.service');
const Supplier = require('../models/supplier.model');
const createSupplierUnBilled = catchAsync(async (req, res) => {
  let data = await supplierUnBilledService.createSupplierUnBilled(req.body);
  res.send(data);
});

const getUnBilledBySupplier = catchAsync(async (req, res) => {
  let data = await supplierUnBilledService.getUnBilledBySupplier(req.query);
  res.send(data);
});

const getSupplierAdvance = catchAsync(async (req, res) => {
  const data = await supplierUnBilledService.getSupplierAdvance(req.params.supplierId);
  res.send(data);
});

const getSupplierOrdered_Details = catchAsync(async (req, res) => {
  const data = await supplierUnBilledService.getSupplierOrdered_Details(req.params.id);
  res.send(data);
});

const Unbilled_Details_bySupplier = catchAsync(async (req, res) => {
  const data = await supplierUnBilledService.Unbilled_Details_bySupplier(req.params.id, req.query);
  res.send(data);
});

const getSupplierbill_amt = catchAsync(async (req, res) => {
  const data = await supplierUnBilledService.getSupplierbill_amt(req.params.page);
  res.send(data);
});

const getBillDetails_bySupplier = catchAsync(async (req, res) => {
  const data = await supplierUnBilledService.getBillDetails_bySupplier(req.params.id);
  res.send(data);
});

const supplierOrders_amt_details = catchAsync(async (req, res) => {
  const data = await supplierUnBilledService.supplierOrders_amt_details(req.params.id, req.query);
  res.send(data);
});

const getPaid_history = catchAsync(async (req, res) => {
  const data = await supplierUnBilledService.getPaid_history(req.params.id);
  res.send(data);
});

const billAdjust = catchAsync(async (req, res) => {
  const data = await supplierUnBilledService.billAdjust(req.body);
  res.send(data);
});

const PayPendingAmount = catchAsync(async (req, res) => {
  const data = await supplierUnBilledService.PayPendingAmount(req.body);
  res.send(data);
});

const getUnBilledDetails = catchAsync(async (req, res) => {
  const data = await supplierUnBilledService.getUnBilledDetails(req.query.id);
  res.send(data);
});

const supplierUnBilledBySupplier = catchAsync(async (req, res) => {
  let userId = req.userId;
  //console.log(userId);
  const data = await supplierUnBilledService.supplierUnBilledBySupplier(userId);
  res.send(data);
});

const getUnBilledhistoryBySupplier = catchAsync(async (req, res) => {
  const data = await supplierUnBilledService.getUnBilledhistoryBySupplier(req.params.id);
  res.send(data);
});

const getUnBilledRaisedhistoryBySupplier = catchAsync(async (req, res) => {
  const data = await supplierUnBilledService.getUnBilledRaisedhistoryBySupplier(req.params.id);
  res.send(data);
});

const getUnBilledRaisedhistory = catchAsync(async (req, res) => {
  const data = await supplierUnBilledService.getUnBilledRaisedhistory();
  res.send(data);
});

const getpaidraisedbyindivitual = catchAsync(async (req, res) => {
  const data = await supplierUnBilledService.getpaidraisedbyindivitual(req.params.id, req.params.supplierId);
  res.send(data);
});

const getRaisedUnBilled_PaidUnbilled_Details = catchAsync(async (req, res) => {
  let userId = req.userId;
  //console.log(userId);
  let supplierData = await Supplier.findById(userId);
  if (supplierData.active === false) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Supplier Not Active');
  }
  const data = await supplierUnBilledService.getRaisedUnBilled_PaidUnbilled_Details(req.params.page, userId);
  res.send(data);
});

const getPaidUnBilledHistory = catchAsync(async (req, res) => {
  const data = await supplierUnBilledService.getPaidUnBilledHistory(req.params.id);
  res.send(data);
});

module.exports = {
  createSupplierUnBilled,
  getUnBilledBySupplier,
  getSupplierAdvance,
  getSupplierOrdered_Details,
  Unbilled_Details_bySupplier,
  getSupplierbill_amt,
  getBillDetails_bySupplier,
  supplierOrders_amt_details,
  getPaid_history,
  billAdjust,
  PayPendingAmount,
  getUnBilledDetails,
  supplierUnBilledBySupplier,
  getUnBilledhistoryBySupplier,
  getUnBilledRaisedhistoryBySupplier,
  getUnBilledRaisedhistory,
  getpaidraisedbyindivitual,
  getRaisedUnBilled_PaidUnbilled_Details,
  getPaidUnBilledHistory,
};
