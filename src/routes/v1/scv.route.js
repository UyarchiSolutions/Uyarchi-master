const express = require('express');
const scvController = require('../../controllers/scv.controller');
const partnerCart = require('../../middlewares/partner.cart');
const scvAdress = require('../../middlewares/scvAdress');

const router = express.Router();
router.route('/').post(scvController.createSCV).get(scvController.gertAllSCV);
router.route('/:scvId').get(scvController.getSCVById).put(scvController.updateSCV).delete(scvController.deletescv);
router.route('/Add/cart').post(partnerCart.single('image'), scvController.AddCart);
router.route('/DisableCart/:id').get(scvController.DisableCart);
router.route('/getScvCarts/All').get(scvController.getScvCarts);
router.route('/updateSCVCart/:id').put(partnerCart.single('image'), scvController.updateSCVCart);
router.route('/getcarts/Allocation').get(scvController.getcarts_Allocation);
router.route('/getAvailable/Scv').get(scvController.getAvailable_Scv);
router.route('/Cart/Allocation/Scv').post(scvController.AllocationScv_ToCart);
// SCV Manage

router
  .route('/add/scv/byPartner')
  .post(scvAdress.fields([{ name: 'addreddProof' }, { name: 'idProof' }]), scvController.addScv);
router
  .route('/update/scv/byPartner/:id')
  .put(scvAdress.fields([{ name: 'addreddProof' }, { name: 'idProof' }]), scvController.updateSCVByPartner);
router.route('/getAllScv/ByPartners').get(scvController.getAllScvByPartners);
router.route('/active/Inactive/Scv/ByPartner/:id').put(scvController.active_Inactive_Scv_ByPartner);
module.exports = router;
