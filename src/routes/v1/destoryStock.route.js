const express = require('express');
const destroyStockController = require('../../controllers/destoryStock.controller');
const router = express.Router();

router.route('/get/productNAme/fromRandomStock').get(destroyStockController.getProductNAmeFromRandom);
router.route('/create/destoryStock/product').post(destroyStockController.createDestroyStock);
router.route('/get/data/fromdestroyStock/:productId/:date').get(destroyStockController.getdetailsWithSorting);
router.route('/update/destroyStock/:id').put(destroyStockController.updateProduct);
router.route('/getHistory/:id').get(destroyStockController.getHistory);

module.exports = router;