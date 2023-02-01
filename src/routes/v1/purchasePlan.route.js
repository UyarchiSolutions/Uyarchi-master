const express = require('express');
const purchasePlan = require('../../controllers/purchasePlan.controller');
const supplierAuth = require('../../controllers/supplier.authorizations');

const router = express.Router();

router.route('/purchase/suceess').post(supplierAuth,purchasePlan.create_purchase_plan);
router.route('/purchase/addon/suceess').post(supplierAuth,purchasePlan.create_purchase_plan_addon);
router.route('/getpayment/details/one').get(supplierAuth,purchasePlan.get_order_details);
router.route('/getpayment/details/all').get(supplierAuth,purchasePlan.get_all_my_orders);
router.route('/getpayment/details/all/normal').get(supplierAuth,purchasePlan.get_all_my_orders_normal);
router.route('/mypurchase/plans/gellall').get(supplierAuth,purchasePlan.get_all_purchasePlans);



module.exports = router;
