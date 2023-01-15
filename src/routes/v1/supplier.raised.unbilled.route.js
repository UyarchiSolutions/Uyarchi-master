const express = require('express');
const supplierraisedunbilled = require('../../controllers/supplier.raised.unbilled.controller');
const router = express.Router();

router.route('/').post(supplierraisedunbilled.createSupplierRaised);
router.route('/raised').get(supplierraisedunbilled.getRaisedSupplier);
router.route('/getRaised/:id').get(supplierraisedunbilled.getRaisedAmountHistory);

module.exports = router;
