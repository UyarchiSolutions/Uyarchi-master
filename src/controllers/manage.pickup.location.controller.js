const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ManagePickupService = require('../services/manage.pickup.location.service');

const createManagePickupLocation = catchAsync(async (req, res) => {
  let userId = req.userId;
  const pickuplocation = await ManagePickupService.createManagePickupLocation(req.body, userId);
  if (req.files) {
    req.files.forEach(function (files, index, arr) {
      pickuplocation.photoCapture.push('images/pickup/' + files.filename);
    });
  }

  res.send(pickuplocation);
  await pickuplocation.save();
});

const getAllManagepickup = catchAsync(async (req, res) => {
  const pickuplocation = await ManagePickupService.getAllManagepickup(req.params.userId, req.params.date, req.params.page);
  res.send(pickuplocation);
});

const getManagePickupById = catchAsync(async (req, res) => {
  const pickuplocation = await ManagePickupService.getManagePickupById(req.params.id);
  res.send(pickuplocation);
});

const update_pickup_location = catchAsync(async (req, res) => {
  const pickuplocation = await ManagePickupService.update_pickup_location(req);
  res.send(pickuplocation);
});


const getAllManagepickupLocation = catchAsync(async (req, res) => {
  const pickuplocations = await ManagePickupService.getAllManagepickupLocation(
    req.params.userId,
    req.params.date,
    req.params.todate
  );
  res.send(pickuplocations);
});


const getallPickuplocation = catchAsync(async (req, res) => {

  const pickuplocations = await ManagePickupService.getallPickuplocation();
  res.send(pickuplocations);
})

const getNearbypickuplocation = catchAsync(async (req, res) => {

  const pickuplocations = await ManagePickupService.getNearbypickuplocation(req);
  res.send(pickuplocations);
})
const getallPickuplocation_orders = catchAsync(async (req, res) => {

  const pickuplocations = await ManagePickupService.getallPickuplocation_orders(req);
  res.send(pickuplocations);
})
module.exports = {
  createManagePickupLocation,
  getAllManagepickup,
  getManagePickupById,
  getAllManagepickupLocation,
  getallPickuplocation,
  update_pickup_location,
  getNearbypickuplocation,
  getallPickuplocation_orders
};
