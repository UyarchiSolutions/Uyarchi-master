const express = require('express');
const scvController = require('../../controllers/scv.controller');
const partnerCart = require('../../middlewares/partner.cart');
const router = express.Router();
router.route('/').post(scvController.createSCV).get(scvController.gertAllSCV);
router.route('/:scvId').get(scvController.getSCVById).put(scvController.updateSCV).delete(scvController.deletescv);
router.route('/Add/cart').post(partnerCart.single('image'), scvController.AddCart);
module.exports = router;
