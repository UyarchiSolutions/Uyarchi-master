const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const packTypeService = require('../services/packType.service');

const createpack = catchAsync(async (req, res) => {
  const postorder = await packTypeService.createpackTypeData(req.body);
  res.status(httpStatus.CREATED).send(postorder);
});

const getallPack = catchAsync(async (req, res) => {
  const postorder = await packTypeService.getAllpackTypeAll(req.params.unit, req.params.page);
  res.send(postorder);
});

const getallPackUnit = catchAsync(async (req, res) => {
  const postorder = await packTypeService.getAllpackTypeUnitAll(req.params.unit, req.params.date,req.params.Pid);
  res.send(postorder);
});

const getpackrById = catchAsync(async (req, res) => {
  const postorder = await packTypeService.getpackTypeById(req.params.id);
  res.send(postorder);
});

const updatepackById = catchAsync(async (req, res) => {
  const postorder = await packTypeService.updatepackTypeId(req.params.id, req.body);
  res.send(postorder);
});
const deletepack = catchAsync(async (req, res) => {
  await packTypeService.deletePackTypeById(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = { createpack, getallPack, getpackrById, updatepackById, deletepack, getallPackUnit };
