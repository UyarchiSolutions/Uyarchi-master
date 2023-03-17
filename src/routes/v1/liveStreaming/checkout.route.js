const express = require('express');
const validate = require('../../../middlewares/validate');
const authValidation = require('../../../validations/auth.validation');
const authController = require('../../../controllers/auth.controller');
const auth = require('../../../middlewares/auth');
const supplierAuth = require('../../../controllers/supplier.authorizations');
const shopverify = require('../../../controllers/shoptokenverify.controller');

const router = express.Router();
const checkout = require('../../../controllers/liveStreaming/checkout.controller');

router.route('/add-to-cart').post(shopverify, checkout.addTocart);
router.route('/add-to-cart').get(shopverify, checkout.get_addTocart);
router.route('/razorpay/success/confirmorder').post(shopverify, checkout.confirmOrder_razerpay);
router.route('/success/confirmorder').post(shopverify, checkout.confirmOrder_cod);
router.route('/get/streamingorderproducts').get(checkout.get_streamingorderproducts);
router.route('/Buyer/Status/Update/:id').put(checkout.Buyer_Status_Update);
router.route('/proceed/to/pay/start').put(shopverify, checkout.proceed_to_pay_start);
router.route('/proceed/to/pay/stop').put(shopverify, checkout.proceed_to_pay_stop);

module.exports = router;
