const express = require('express');
const warehouseStockController = require('../../controllers/warehouseStock.controller');
const router = express.Router();

router.route('/').post(warehouseStockController.createWarehouseStock).get(warehouseStockController.getAllWarehouseStock);
router
  .route('/:warehouseStockId')
  .get(warehouseStockController.getWarehouseStockById)
  .delete(warehouseStockController.deleteWarehouseStockById)
  .put(warehouseStockController.updateWarehouseStock);

module.exports = router;
