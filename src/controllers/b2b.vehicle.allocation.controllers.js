const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const vehicleService = require('../services/b2b.vehicle.allocation.services');
const httpStatus = require('http-status');

const createvehicle = catchAsync(async (req, res) => {
  const vehicle = await vehicleService.createvehicle(req.body);
  // //console.log(wallet);
  if (req.files) {
    let path = '';
    path = 'images//';
    if (req.files.RcBookImage != null) {
        vehicle.RcBookImage =
        path +
        req.files.RcBookImage.map((e) => {
          return e.filename;
        });
    }
    if (req.files.vehicleImage != null) {
        vehicle.vehicleImage =
        path +
        req.files.vehicleImage.map((e) => {
          return e.filename;
        });
    }
    await vehicle.save();
    res.status(httpStatus.CREATED).send(vehicle);
  }
});

module.exports ={
    createvehicle,
}