const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { manageScvService } = require('../services');

const createManageScv = catchAsync(async (req, res) => {
  const scv = await manageScvService.createManageScv(req.body);
  res.status(httpStatus.CREATED).send(scv);
});

const getManageSCVById = catchAsync(async (req, res) => {
  const scv = await manageScvService.getManageScvOrdersById(req.params.manageScvId);
  if (!scv || scv.active === false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SCV not found');
  }
  res.send(scv);
});

const getAllManageSCVOrders = catchAsync(async (req, res) => {
  const scv = await manageScvService.getAllManageSCVOrders(req.params);
  res.send(scv);
});

const updateManageScvById = catchAsync(async (req, res) => {
  const scv = await manageScvService.updateManageScvById(req.params.manageScvId, req.body);
  res.send(scv);
});

const deleteManageScvOrdersById = catchAsync(async (req, res) => {
  await manageScvService.deleteManageScvOrdersById(req.params.manageScvId);
  res.status(httpStatus.NO_CONTENT).send();
});
module.exports = {
  createManageScv,
  getAllManageSCVOrders,
  getManageSCVById,
  updateManageScvById,
  deleteManageScvOrdersById,
};
