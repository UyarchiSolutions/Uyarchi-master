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

module.exports = router;
