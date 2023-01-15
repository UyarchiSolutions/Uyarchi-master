const express = require('express');
const productpackTypeController = require('../../controllers/productPacktype.controller');

const router = express.Router();

router.route('/').post(productpackTypeController.createproductpack);
router.route('/showChange/:id').get(productpackTypeController.getproductpackShowById);
router
  .route('/:id')
  .get(productpackTypeController.getproductpackrById)
  .delete(productpackTypeController.deleteproductpack)
  .put(productpackTypeController.updateproductpackById);

router.route('/All/:page').get(productpackTypeController.getAllproductpackrById);
router.route('/shopodrer/:search/:page').get(productpackTypeController.get_product_withpacktype);

module.exports = router;
