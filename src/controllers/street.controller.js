const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const Street = require('../models/street.model.js');
const catchAsync = require('../utils/catchAsync');
const StreetService = require('../services/street.service');

const createStreet = catchAsync(async (req, res) => {
  const street = await StreetService.createStreet(req.body);
  res.status(httpStatus.CREATED).send(street);
});

const updates = catchAsync(async (req, res) => {
  const street = await StreetService.updates();
  res.send(street);
});

const getAllStreet = catchAsync(async (req, res) => {
  const street = await StreetService.getAllStreet();
  res.send(street);
});

const closedStatus = catchAsync(async (req, res) => {
  const street = await StreetService.closedStatus(req.params.streetId, {
    ...req.body,
    ...{ filter: 'fullypending' },
  });
  if (!street) {
    // throw new ApiError(httpStatus.NOT_FOUND, 'street Not found');
  }
  res.send(street);
});

const getAllocatedStreeOnly = catchAsync(async (req, res) => {
  const street = await StreetService.getAllocatedStreeOnly();
  res.send(street);
});

const getAllDeAllocatedStreetOnly = catchAsync(async (req, res) => {
  const street = await StreetService.getAllDeAllocatedStreetOnly();
  res.send(street);
});

const streetPagination = catchAsync(async (req, res) => {
  const pagination = await StreetService.streetPagination(req.params.key, req.params.id);
  res.send(pagination);
});

const getStreetByWard = catchAsync(async (req, res) => {
  const streetWard = await StreetService.getWardByStreet(req.params.wardId, req.params.status);
  res.send(streetWard);
});

const streetAllocation = catchAsync(async (req, res) => {
  const { arr, userId, date } = req.body;
  arr.forEach(async (e) => {
    let streetId = e;
    const streets = await Street.findById(streetId);
    await Street.updateOne(
      { _id: streetId },
      { AllocatedUser: userId, AllocationStatus: 'Allocated', date: date, filter: 'userpending' },
      { new: true }
    );
    // res.status(httpStatus.CREATED).send('Allocated Successfully');
  });

  res.status(httpStatus.CREATED).send('Allocated Successfully');
});

const streetDeAllocation = catchAsync(async (req, res) => {
  const streets = await StreetService.streetDeAllocation(req.body);
  res.send(streets);
});

const streetorder = catchAsync(async (req, res) => {
  const streets = await StreetService.getAllStreetById(req.params.id);
  res.send(streets);
});

const getStreetByWardId = catchAsync(async (req, res) => {
  const street = await StreetService.getStreetByWardId(req.params.wardId);
  res.send(street);
});

const getStreetDetailsById = catchAsync(async (req, res) => {
  const street = await StreetService.getStreetById(req.params.streetId);
  if (!street || street.active === false) {
    // throw new ApiError(httpStatus.NOT_FOUND, 'Street_Details not found');
  }
  res.send(street);
});

const getaggregationByUserId = catchAsync(async (req, res) => {
  const street = await StreetService.getaggregationByUserId(req.params.AllocatedUser);
  res.send(street);
});

const getDeAllocationaggregationByUserId = catchAsync(async (req, res) => {
  const street = await StreetService.getDeAllocationaggregationByUserId(req.params.AllocatedUser);
  res.send(street);
});
``;
const updateStreet = catchAsync(async (req, res) => {
  const street = await StreetService.updateStreetById(req.params.streetId, req.body);
  res.send(street);
});

const deleteStreet = catchAsync(async (req, res) => {
  await StreetService.deleteStreetById(req.params.streetId);
  res.status(httpStatus.NO_CONTENT).send();
});

const areaSearchApi = catchAsync(async (req, res) => {
  let street = await StreetService.areaSearchApi(req.params.key);
  res.send(street);
});

const getDummyStreet = catchAsync(async (req, res) => {
  let street = await StreetService.getDummy();
  res.send(street);
});

const getStreetWard = catchAsync(async (req, res) => {
  let ward = await StreetService.getStreetByWard(req.params.wardId);
  res.send(ward);
});

const renameStreet = catchAsync(async (req, res) => {
  const street = await StreetService.rename(req.body);
  res.status(httpStatus.CREATED).send(street);
});

const getwardBystreetAngular = catchAsync(async (req, res) => {
  const street = await StreetService.getwardBystreetAngular(req.params.wardId);
  res.send(street);
});

const getAllUnAssignedStreetandCount = catchAsync(async (req, res) => {
  const street = await StreetService.getAllUnAssignedStreetandCount(req.params.wardId);
  res.send(street);
});

const getTelecallerAllUnAssignedStreetandCount = catchAsync(async (req, res) => {
  const street = await StreetService.getTelecallerAllUnAssignedStreetandCount(req.params.wardId);
  res.send(street);
});

const getSalesmanAllUnAssignedStreetandCount = catchAsync(async (req, res) => {
  const street = await StreetService.getSalesmanAllUnAssignedStreetandCount(req.params.wardId);
  res.send(street);
});

module.exports = {
  createStreet,
  getStreetDetailsById,
  updateStreet,
  deleteStreet,
  getStreetByWard,
  streetAllocation,
  streetDeAllocation,
  getaggregationByUserId,
  getDeAllocationaggregationByUserId,
  getStreetByWardId,
  updates,
  streetPagination,
  getAllStreet,
  getAllocatedStreeOnly,
  closedStatus,
  getAllDeAllocatedStreetOnly,
  streetorder,
  areaSearchApi,
  getDummyStreet,
  getStreetWard,
  renameStreet,
  getwardBystreetAngular,
  getAllUnAssignedStreetandCount,
  getTelecallerAllUnAssignedStreetandCount,
  getSalesmanAllUnAssignedStreetandCount,
};
