const express = require('express');
const cartManagementController = require('../../controllers/cartManagement.controller');
const cartScv = require('../../middlewares/cartScv');
const router = express.Router();
router.route('/').post(cartScv.array('image'), cartManagementController.createCartManagement).get();
router
  .route('/:cartManagementId')
  .get(cartManagementController.getCartManagementDetailsById)
  .put(cartManagementController.updateCartManagement)
  .delete(cartManagementController.deleteCartManagement);

module.exports = router;
