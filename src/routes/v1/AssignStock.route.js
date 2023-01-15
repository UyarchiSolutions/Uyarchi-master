const express = require('express');
const AssignStockController = require('../../controllers/AssignStock.contreller');
const router = express.Router();

router.route('/').post(AssignStockController.createAssignStock);
router.route('/currentStock/:id/:date').get(AssignStockController.get_Current_Stock);
module.exports = router;
