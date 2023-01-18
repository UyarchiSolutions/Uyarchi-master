const express = require('express');
const subHostController = require('../../controllers/subHost.controller');
const router = express.Router();

router.route('/').post(subHostController.createSubHost).get(subHostController.getActiveSubHosts);
router.route('/send-OTP').post(subHostController.SendOtp);
router.route('/verify-OTP').post(subHostController.verifyOTP);
router.route('/SetPassword/:number').put(subHostController.SetPassword);
router.route('/login').post(subHostController.login);
module.exports = router;
