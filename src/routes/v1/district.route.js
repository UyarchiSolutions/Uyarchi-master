const express = require('express');
// const customerController = require('../../controllers/customer.controller');
const districtController = require('../../controllers/district.controller');
const router = express.Router();
router.route('/').post(districtController.createDistrict).get(districtController.getAllDistrictDetails);
  
router
  .route('/:districtId')
  .get(districtController.getDistrictDetailsById)
  .put(districtController.updateDistrict)
  .delete(districtController.deleteDistrict);

module.exports = router;
