const express = require('express');
const TrendProductCloneController = require('../../controllers/trendsProduct.clone.controller');
const router = express.Router();

router
  .route('/getStreetByWardIdAndProducts/:wardId/:street/:date/:page')
  .get(TrendProductCloneController.getStreetsByWardIdAndProducts);
router
  .route('/getProduct/:wardId/:street/:productId/:date')
  .get(TrendProductCloneController.getProductByProductIdFromTrendProduct);
router.route('/getproductsingle/:wardId/:street/:productId/:date').get(TrendProductCloneController.getProductCalculation);
router.route('/getshops/:id').get(TrendProductCloneController.getShopsByIdFromTrends);

module.exports = router;
