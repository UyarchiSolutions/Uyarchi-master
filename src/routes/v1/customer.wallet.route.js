const express = require('express');
const customerWalletController = require('../../controllers/customer.wallet.controller');
const shopAuth = require('../../controllers/shoptokenverify.controller');
const router = express.Router();

router.route('/').post(shopAuth, customerWalletController.createCustomerWallet);
router.route('/getwallet').get(shopAuth, customerWalletController.getCustomerWallet);
module.exports = router;
