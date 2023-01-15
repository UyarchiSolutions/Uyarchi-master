const express = require('express');
const expenseAnnualRecuringController = require('../../controllers/b2b.expenses.annual.recuring.controller');
const router = express.Router();

router.route('/addAnnualExpense').post(expenseAnnualRecuringController.createAnnualExpense);
router.route('/getAnnualExpense/:page').get(expenseAnnualRecuringController.getAll);

module.exports = router;
