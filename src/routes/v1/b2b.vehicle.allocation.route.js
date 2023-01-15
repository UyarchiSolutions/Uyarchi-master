const express = require('express');
const vehicleController = require('../../controllers/b2b.vehicle.allocation.controllers');
const router = express.Router();
const vehicle = require('../../middlewares/vehicle');

router
  .route('/createvehicle')
  .post(vehicle.fields([{ name: 'RcBookImage' }, { name: 'vehicleImage' }]), vehicleController.createvehicle);

  module.exports = router;