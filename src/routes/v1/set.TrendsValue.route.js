const express = require('express');
const setTrendsController = require('../../controllers/set.TrendsValue.Controller');

const router = express.Router();
router.route('/').post(setTrendsController.createSetTrends).get(setTrendsController.getAllSetTrends);

router
  .route('/:id')
  .get(setTrendsController.getSetTrendsById)
  .put(setTrendsController.updateSetSalesPriceById)
  .delete(setTrendsController.deleteTrendsSetValue);
router.route('/products/details').get(setTrendsController.getProductDetailsByProductId);
module.exports = router;
