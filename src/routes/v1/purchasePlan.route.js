const express = require('express');
const purchasePlan = require('../../controllers/purchasePlan.controller');
const supplierAuth = require('../../controllers/supplier.authorizations');
const { SetPass, SellerAuth } = require('../../controllers/sellerAuth.controller');

const router = express.Router();

router.route('/purchase/suceess').post(SellerAuth, purchasePlan.create_purchase_plan);
router.route('/purchase/addon/suceess').post(SellerAuth, purchasePlan.create_purchase_plan_addon);
router.route('/getpayment/details/one').get(SellerAuth, purchasePlan.get_order_details);
router.route('/getpayment/details/all').get(SellerAuth, purchasePlan.get_all_my_orders);
router.route('/getpayment/details/all/normal').get(SellerAuth, purchasePlan.get_all_my_orders_normal);
router.route('/mypurchase/plans/gellall').get(SellerAuth, purchasePlan.get_all_purchasePlans);
router.route('/purchase/suceess/private').post(purchasePlan.create_purchase_plan_private);



module.exports = router;
