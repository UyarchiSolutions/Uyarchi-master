const express = require('express');
const marketController = require('../../controllers/market.controller');
const upload = require('../../middlewares/marketImage');
const marketImage = require('../../middlewares/marketClone');
const marketShopClone = require('../../middlewares/marketShopClone');
const marketUpload = require('../../middlewares/marketShopImage');
const authorization = require('../../controllers/tokenVerify.controller');
const router = express.Router();

router
  .route('/')
  .post(upload.array('image'), marketController.createmarketService)
  .get(marketController.getmarketServiceAll);
router.route('/marketShop').post(marketUpload.array('image'), marketController.createmarketShopService);
router.route('/:id/:page').get(marketController.getAllMarketTable);
router
  .route('/:marketId')
  .get(marketController.getmarketServiceById)
  .delete(marketController.deletemarketService)
  .put(upload.array('image'), marketController.updatemarketService);
router.route('/shopsAll/all/all/:marketId/:page').get(marketController.getmarketShopAll);
router.route('/shop/:marketShopId/one').get(marketController.getmarketShopServiceById);
router.route('/shop/:marketShopId').put(marketUpload.array('image'), marketController.updatemarketShopService);

// market Clone

router.route('/marketClone').post(authorization, marketImage.array('image'), marketController.createmarketCloneService);
router.route('/marketClone/all/clone').get(marketController.getmarketCloneAll);
router
  .route('/marketClone/getOne/:id')
  .get(marketController.getmarketCloneById)
  .put(marketController.updatemarketClone)
  .delete(marketController.updatemarketClone);
router.route('/marketClone/aggregation/:page').get(marketController.getMarketCloneWithAggregation);
router.route('/marketShopClone/aggregation/Shop/:page').get(marketController.getmarketShopCloneWithAggregation);

// marketShop Clone
router.route('/marketShop/WithMarketId/:id/:page').get(marketController.getMarketShopsbyMarketId);
router
  .route('/market/shop/clone')
  .post(authorization, marketShopClone.array('image'), marketController.createmarketShopCloneService)
  .get(authorization, marketController.getmarketShopCloneAll);
router
  .route('/market/shop/clone/:id')
  .get(marketController.getmarketShopCloneById)
  .put(marketShopClone.array('image'), marketController.updatemarketShopClone);
module.exports = router;
