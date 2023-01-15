const express = require('express');
const router = express.Router();
const setSalesPriceController = require('../../controllers/setSalesPrice.controller');

router.route('/').post(setSalesPriceController.createSetSalesPrice).get(setSalesPriceController.getAllSetSalesPrice);
router
  .route('/:salesPriceId')
  .get(setSalesPriceController.getSetSalesPriceById)
  .put(setSalesPriceController.updateSetSalesPriceById)
  .delete(setSalesPriceController.deleterolesById);
router.route('/date/:date/:id').get(setSalesPriceController.getSetSalesPriceByDate);
router.route('/dates/:date/:id').get(setSalesPriceController.getdataByDateWise);
module.exports = router;
