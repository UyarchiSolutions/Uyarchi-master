const express = require('express');
// const customerController = require('../../controllers/customer.controller');
const districtListController = require('../../controllers/districtList.controller');
const router = express.Router();
router.route('/').get(districtListController.getAllDistrictList).post(districtListController.createDistrict);

module.exports = router;
