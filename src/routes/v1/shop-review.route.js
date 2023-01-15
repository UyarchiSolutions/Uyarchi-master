const express = require('express');
const router = express.Router();
const shop_Review_Controller = require('../../controllers/shop-review.controller');
const authorization = require('../../controllers/tokenVerify.controller');

router.route('/').post(shop_Review_Controller.create_Shop_Review);
router
  .route('/:id')
  .get(shop_Review_Controller.getTop_20_reviews)
  .put(shop_Review_Controller.updateReviewById)
  .delete(shop_Review_Controller.DeleteReviewById);
router.route('/getSingle/:id').get(shop_Review_Controller.getReviewById);
module.exports = router;
