const express = require('express');
const manageExpenseController = require('../../controllers/manage.expenses.controller');
const router = express.Router();

router.route('/').post(manageExpenseController.createManageExpenses);
router.route('/:date/:page').get(manageExpenseController.getAllManageExpenses);

module.exports = router;
