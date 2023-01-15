const express = require('express');
const pettyStockController = require('../../controllers/b2b.pettyStock.controller');
const router = express.Router();

router.route('/submit/pettyStockSubmit').post(pettyStockController.pettyStockSubmit);
module.exports = router;