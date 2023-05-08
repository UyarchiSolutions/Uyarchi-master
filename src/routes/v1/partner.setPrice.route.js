const express = require('express');
const PartnerSetPriceController = require('../../controllers/partner.setPrice.controller');
const PartnerAuth = require('../../controllers/PartnerAuth.controller');
const router = express.Router();
router.route('/').post(PartnerSetPriceController.SetPartnerPrice);
router.route('/AddProductByPartner').post(PartnerAuth, PartnerSetPriceController.AddProductByPartner);
router.route('/Fetch/Productby/Partner').get(PartnerAuth, PartnerSetPriceController.FetchProductbyPartner);
module.exports = router;
