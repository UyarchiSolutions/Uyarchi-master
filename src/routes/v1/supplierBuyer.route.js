const express = require('express');
const supplierBuyerController = require('../../controllers/supplierBuyer.controller');
const router = express.Router();
router
  .route('/')
  .post(supplierBuyerController.createSupplierService)
  .get(supplierBuyerController.getAllSupplierBuyerService);
router.route('/allData').get(supplierBuyerController.getAllSupplierBuyerDeleteService);
router
  .route('/:supplierBuyerId')
  .get(supplierBuyerController.getSupplierBuyerByIdService)
  .put(supplierBuyerController.updateSupplierBuyerByIdService)
  .delete(supplierBuyerController.deleteSupplierBuyerByIdService);

router.route('/type/getName/:type').get(supplierBuyerController.createSupplierBuyerwithType);

module.exports = router;
