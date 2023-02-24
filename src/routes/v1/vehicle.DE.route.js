const express = require('express');
const middleware = require('../../middlewares/vehicle');
const vehicleController = require('../../controllers/vehicle.DE.controller');
const router = express.Router();

// create Vehicle Route && fetch Active Vehicles
router
  .route('/')
  .post(middleware.fields([{ name: 'RC_book_image' }, { name: 'vehicle_image' }]), vehicleController.createVehicle)
  .get(vehicleController.getAll_Vehicle_Details);
router.route('/:page').get(vehicleController.getVehicle);

// fect deliveryExecutives && activeVehicles
router.route('/De/vehicles').get(vehicleController.getVehicle_and_DE);
router.route('/assign/driver/group').post(vehicleController.assigndriverVehile);
router.route('/getall/assign/driver/group').get(vehicleController.getallassigngroups);
router.route('/drivergroups/byid').get(vehicleController.drivergroups);
router.route('/updateVehicle/:id').put(vehicleController.updateVehicle_Details);
router.route('/getVehicleById/:id').get(vehicleController.getVehicleById);

// exports
module.exports = router;
