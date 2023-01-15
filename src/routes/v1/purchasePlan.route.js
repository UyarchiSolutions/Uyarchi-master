const express = require('express');
const purchasePlan = require('../../controllers/purchasePlan.controller');
const supplierAuth = require('../../controllers/supplier.authorizations');

const router = express.Router();

router.route('/purchase/suceess').post(supplierAuth,purchasePlan.create_purchase_plan);
router.route('/getpayment/details/one').get(supplierAuth,purchasePlan.get_order_details);
router.route('/getpayment/details/all').get(supplierAuth,purchasePlan.get_all_my_orders);

module.exports = router;
