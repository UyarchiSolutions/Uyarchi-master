const express = require('express');
const vendorController = require('../../controllers/vendor.controller');

const router = express.Router();

router.route('/register').post(vendorController.createVenor);
router.post('/login', vendorController.login);

router.route('/:vendorId').get(vendorController.getVendorById);

module.exports = router;
