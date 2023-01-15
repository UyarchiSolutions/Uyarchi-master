const express = require('express');
const checkOut = require("../../controllers/checkout.controller");
const router = express.Router();
const shopverify = require('../../controllers/shoptokenverify.controller');

router.route('/verifycart/customer').get(shopverify, checkOut.verifycheckout);
router.route('/getcartproduct/customer').get(shopverify, checkOut.getcartProduct);
router.route('/addtocart/product').post(shopverify, checkOut.add_to_cart);

router.route("/razorpay/success/confirmorder").post(shopverify,checkOut.confirmOrder_razerpay)
router.route("/cod/success/confirmorder").post(shopverify,checkOut.confirmOrder_cod)
router.route("/getorder/orderid").get(shopverify,checkOut.getshoporder_byID)


module.exports = router;

