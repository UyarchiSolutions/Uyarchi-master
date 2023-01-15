const express = require('express');
const deliveryAddressController = require('../../controllers/deliveryAddress.controller');
const router = express.Router();

router.route('/').post(deliveryAddressController.createDeliveryAddress);
router
  .route('/:deliveryAddressId')
  .get(deliveryAddressController.getDeliveryAddressById)
  .delete(deliveryAddressController.deleteDeliveryAddressById)
  .put(deliveryAddressController.updateDeliveryAddress);

module.exports = router;
