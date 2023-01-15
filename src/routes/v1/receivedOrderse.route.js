const express = require('express');
const receivedOrderController = require('../../controllers/receivedOrders.controller');

const router = express.Router();

router.route('/').post(receivedOrderController.creatreceivedOrders).get(receivedOrderController.getAllReceivedOrders);
router
  .route('/:receiveId')
  .get(receivedOrderController.getReceivedOrdersById)
  .delete(receivedOrderController.deleteReceivedOrders)
  .put(receivedOrderController.updateReceivedOrders);

module.exports = router;
