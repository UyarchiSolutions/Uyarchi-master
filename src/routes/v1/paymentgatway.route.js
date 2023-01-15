const express = require('express');
const paymentgatway = require('../../controllers/paymentgatway.controller');

const router = express.Router();

router.route('/create/razorpay/orderid').post(paymentgatway.razorpayOrderId);
router.route('/getpaidbills/razorpay/all').get(paymentgatway.getallrazorpaypayment);




module.exports = router;
