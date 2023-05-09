const express = require('express');
const PartnerSetPriceController = require('../../controllers/partner.setPrice.controller');
const PartnerAuth = require('../../controllers/PartnerAuth.controller');
const router = express.Router();
router.route('/').post(PartnerSetPriceController.SetPartnerPrice);
router.route('/AddProductByPartner').post(PartnerAuth, PartnerSetPriceController.AddProductByPartner);
router.route('/Fetch/Productby/Partner').get(PartnerAuth, PartnerSetPriceController.FetchProductbyPartner);
router.route('/create/Active/Cart').post(PartnerAuth, PartnerSetPriceController.create_Active_cart);
module.exports = router;
