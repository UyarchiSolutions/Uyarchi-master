const express = require('express');
const productComboController = require('../../controllers/productCombo.controller');

const router = express.Router();

router.route('/').post(productComboController.createCombo);
router
  .route('/:comboId')
  .get(productComboController.getCombo)
  .delete(productComboController.deleteCombo)
  .put(productComboController.updateCombo);

module.exports = router;
