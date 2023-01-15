const express = require('express');
const supplierBillsController = require('../../controllers/supplierBills.controller');
const router = express.Router();

router.route('/').post(supplierBillsController.createSupplierbills);

module.exports = router;
