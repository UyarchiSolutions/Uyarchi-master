const express = require('express');
const orderRaisedByMWAController = require('../../controllers/orderRaisedbyMWA.controller');

const router = express.Router();

// router.route('/').post(receivedOrderController.creatreceivedOrders).get(receivedOrderController.getAllReceivedOrders);
router.route('/:id').get(orderRaisedByMWAController.createOrderRaised);
//   .delete(receivedOrderController.deleteReceivedOrders)
//   .put(receivedOrderController.updateReceivedOrders);

module.exports = router;
