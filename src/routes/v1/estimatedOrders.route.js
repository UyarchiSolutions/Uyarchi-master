const { Router } = require('express');
const express = require('express');
const estimateOrderController = require('../../controllers/estimatedOrders.controller');
const router = express.Router();

router.route('/').post(estimateOrderController.createEstimatedOrders);
router.route('/:date/:page').get(estimateOrderController.getEstimatedByDate);
router.route('/PH/:date/:page').get(estimateOrderController.getEstimatedByDateforPH);
router.route('/product/Estimate/:id').get(estimateOrderController.getSingleProductEstimations);
router.route('/:id').put(estimateOrderController.updateEstimatedOrders);
router.route('/getEstimated/orders/:id').get(estimateOrderController.getEstimated_Orders_By_Id_And_date);
router.route('/getLiveStocks/Info/:id').get(estimateOrderController.liveStockInfo);
module.exports = router;
