const express = require('express');
const subHostController = require('../../controllers/subHost.controller');
const auth = require('../../controllers/supplierAppAuth.controller');
const router = express.Router();
const subhostVerify = require('../../controllers/subhostVefify.controller');
const { SetPass, SellerAuth } = require('../../controllers/sellerAuth.controller');

router.route('/').post(auth, subHostController.createSubHost).get(auth, subHostController.getActiveSubHosts);
router.route('/send-OTP').post(subHostController.SendOtp);
router.route('/verify-OTP').post(subHostController.verifyOTP);
router.route('/SetPassword/:number').put(subHostController.SetPassword);
router.route('/login').post(subHostController.login);
router.route('/subhost/verify').get(subhostVerify, subHostController.get_subhost_tokens);
router.route('/get/subhost/free').get(SellerAuth, subHostController.get_subhost_free);


module.exports = router;
