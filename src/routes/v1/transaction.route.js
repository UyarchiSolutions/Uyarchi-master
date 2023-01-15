const express = require('express');
const TransactionController = require('../../controllers/transaction.controller');
const router = express.Router();

router.route('/').post(TransactionController.createTransaction).get(TransactionController.getAllTransaction);
router
  .route('/:id')
  .get(TransactionController.getTransactionById)
  .put(TransactionController.updateTrendsById)
  .delete(TransactionController.deleteTransactionById);

module.exports = router;
