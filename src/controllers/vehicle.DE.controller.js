const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const VehicleService = require('../services/vehicle.DE.service');

// create new vehicle Controller

const createVehicle = catchAsync(async (req, res) => {
  const data = await VehicleService.createVehicle(req.body);
  if (req.files) {
    if (req.files.RC_book_image != null) {
      req.files.RC_book_image.forEach((e) => {
        data.RC_book_image.push('images/vehicle/' + e.filename);
      });
      if (req.files.vehicle_image != null) {
        req.files.vehicle_image.forEach((e) => {
          data.vehicle_image.push('images/vehicle/' + e.filename);
        });
      }
    }
  }
  res.send(data);
  await data.save();
});

// Fetch Active Vehicle Controller

const getVehicle = catchAsync(async (req, res) => {
  const data = await VehicleService.getVehicle(req.params.page);
  res.send(data);
});

// fetch ward DeliveryExecutives && active Vehicles

const getVehicle_and_DE = catchAsync(async (req, res) => {
  const data = await VehicleService.getVehicle_and_DE();
  res.send(data);
});

const getAll_Vehicle_Details = catchAsync(async (req, res) => {
  const data = await VehicleService.getAll_Vehicle_Details();
  res.send(data);
});

const assigndriverVehile = catchAsync(async (req, res) => {
  const data = await VehicleService.assigndriverVehile(req.body);
  res.send(data);
});

const getallassigngroups = catchAsync(async (req, res) => {
  const data = await VehicleService.getallassigngroups(req.query);
  res.send(data);
});

const drivergroups = catchAsync(async (req, res) => {
  const data = await VehicleService.drivergroups(req.query);
  res.send(data);
});

const updateVehicle_Details = catchAsync(async (req, res) => {
  const data = await VehicleService.updateVehicle_Details(req.params.id, req.body);
  res.send(data);
});

const getVehicleById = catchAsync(async (req, res) => {
  const data = await VehicleService.getVehicleById(req.params.id);
  res.send(data);
});

module.exports = {
  createVehicle,
  getVehicle,
  getVehicle_and_DE,
  getAll_Vehicle_Details,
  assigndriverVehile,
  getallassigngroups,
  drivergroups,
  updateVehicle_Details,
  getVehicleById,
};
