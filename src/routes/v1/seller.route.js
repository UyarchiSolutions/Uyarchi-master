const express = require('express');
const SellerController = require('../../controllers/seller.controller');
const router = express.Router();

router.route('/').post(SellerController.createSeller).get(SellerController.GetAllSeller);

router.route('/:id').get(SellerController.GetSellerById).put(SellerController.UpdateSellerById);

module.exports = router;
