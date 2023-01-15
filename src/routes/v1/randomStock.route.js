const express = require('express');
const randomStockController = require('../../controllers/randomStock.controller');
const router = express.Router();
const  randomStock= require('../../middlewares/randomStock');

router.route('/get/product/name').get(randomStockController.getProductName);
router.route('/create/stock/random').post(randomStock.fields([{ name: 'wastedImageFile'}]),randomStockController.createrandomStock);
router.route('/get/date/time/:product/:date').get(randomStockController.getAll);
router.route('/get/product/name/withDetails').get(randomStockController.getProductNameDetails);


module.exports = router;