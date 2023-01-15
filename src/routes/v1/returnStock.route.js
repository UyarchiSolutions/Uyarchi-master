const express = require('express');
const returnStockController = require('../../controllers/returnStock.controller');
const router = express.Router();
const returnStockImage = require('../../middlewares/returnStock');
const authorization = require('../../controllers/tokenVerify.controller');

router.route('/').post(authorization, returnStockController.create_ReturnStock);
module.exports = router;
