const express = require('express');
const otherexpensesController = require('../../controllers/expenses.controller');
const billUpload = require('../../middlewares/bill.upload');
const router = express.Router();
router
  .route('/')
  .post(billUpload.array('billUpload'), otherexpensesController.createOtherExpenses)
  .get(otherexpensesController.getAllOtherExp);

router
  .route('/:otherExpId')
  .get(otherexpensesController.getotherExp)
  .put(otherexpensesController.updateOtherExp)
  .delete(otherexpensesController.deleteOtherExp);

module.exports = router;
