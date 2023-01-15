const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const CallStatusService = require('../services/callStatus');
const CallStatus = require('../models/callStatus');
const moment = require('moment');
const corrundDate = moment().format('DD-MM-YYYY');

const createCallStatus = catchAsync(async (req, res) => {
  const callStatus = await CallStatusService.createCallStatus(req.body);
  if (!callStatus) {
    throw new ApiError(httpStatus.NOT_FOUND, 'CallStatus Not Fount.');
  }
  res.status(httpStatus.CREATED).send(callStatus);
});
const createCallStatus_suppierApp = catchAsync(async (req, res) => {
  const userId = req.userId
  const callStatus = await CallStatusService.createCallStatus_suppierApp(userId, req.body);
  if (!callStatus) {
    throw new ApiError(httpStatus.NOT_FOUND, 'CallStatus Not Fount.');
  }
  res.status(httpStatus.CREATED).send(callStatus);
});
const getProductAndSupplierDetails = catchAsync(async (req, res) => {
  const callStatus = await CallStatusService.getProductAndSupplierDetails(req.params.page);
  res.send(callStatus);
});

const getCallStatusbyId = catchAsync(async (req, res) => {
  const callStatus = await CallStatusService.getCallStatusById(req.params.id);
  if (!callStatus || !callStatus.active === true) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Call Status Not Found');
  }
  res.send(callStatus);
});

const updateCallStatusById = catchAsync(async (req, res) => {
  const callStatus = await CallStatusService.updateCallStatusById(req.params.id, req.body);
  res.send(callStatus);
});

const getDataWithSupplierId = catchAsync(async (req, res) => {
  const callStatus = await CallStatusService.getDataWithSupplierId(
    req.params.id,
    req.params.page,
    req.params.search,
    req.params.date
  );
  res.send(callStatus);
});

const getReportWithSupplierId = catchAsync(async (req, res) => {
  const callStatus = await CallStatusService.getReportWithSupplierId(req.params.page, req.params.search, req.params.date);
  res.send(callStatus);
});

const deleteBusinessById = catchAsync(async (req, res) => {
  await CallStatusService.deleteCallStatusById(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const finishOrder = catchAsync(async (req, res) => {
  const callStatus = await CallStatusService.finishOrder(req.params.pId, req.params.date);
  res.status(httpStatus.OK).send(callStatus);
});

const getCallstatusForSuddenOrders = catchAsync(async (req, res) => {
  const callstatus = await CallStatusService.getCallstatusForSuddenOrders(req.params.page);
  res.send(callstatus);
});

const suddenOrdersDisplay = catchAsync(async (req, res) => {
  const callstatus = await CallStatusService.suddenOrdersDisplay(req.params.productId);
  res.send(callstatus);
});

module.exports = {
  createCallStatus,
  getProductAndSupplierDetails,
  getCallStatusbyId,
  updateCallStatusById,
  deleteBusinessById,
  getDataWithSupplierId,
  finishOrder,
  getCallstatusForSuddenOrders,
  suddenOrdersDisplay,
  getReportWithSupplierId,
  createCallStatus_suppierApp,
};
