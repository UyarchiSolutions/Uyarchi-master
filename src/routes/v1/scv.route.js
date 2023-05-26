const express = require('express');
const scvController = require('../../controllers/scv.controller');
const partnerCart = require('../../middlewares/partner.cart');
const scvAdress = require('../../middlewares/scvAdress');
const partnerAddress = require('../../middlewares/partnerProof');
const PartnerAuth = require('../../controllers/PartnerAuth.controller');
const router = express.Router();
router.route('/').post(scvController.createSCV).get(scvController.gertAllSCV);
router.route('/:scvId').get(scvController.getSCVById).put(scvController.updateSCV).delete(scvController.deletescv);
router.route('/Add/cart').post(PartnerAuth, partnerCart.single('image'), scvController.AddCart);
router.route('/DisableCart/:id').get(scvController.DisableCart);
router.route('/getScvCarts/All').get(PartnerAuth, scvController.getScvCarts);
router.route('/updateSCVCart/:id').put(partnerCart.single('image'), scvController.updateSCVCart);
router.route('/getcarts/Allocation').get(scvController.getcarts_Allocation);
router.route('/getAvailable/Scv').get(scvController.getAvailable_Scv);
router.route('/Cart/Allocation/Scv').post(scvController.AllocationScv_ToCart);
router.route('/getScvCartbyId/:id').get(scvController.getScvCartbyId);
// SCV Manage

router
  .route('/add/scv/byPartner')
  .post(scvAdress.fields([{ name: 'addreddProof' }, { name: 'idProof' }]), scvController.addScv);
router.route('/createScv').post(scvAdress.fields([{ name: 'addreddProof' }, { name: 'idProof' }]), scvController.create_scv);
router
  .route('/update/scv/byPartner/:id')
  .put(scvAdress.fields([{ name: 'addreddProof' }, { name: 'idProof' }]), scvController.updateSCVByPartner);
router.route('/getAllScv/ByPartners').get(scvController.getAllScvByPartners);
router.route('/active/Inactive/Scv/ByPartner/:id').put(scvController.active_Inactive_Scv_ByPartner);
router.route('/SCV/Attendance/mange').get(scvController.SCVAttendance);

// scv
router.route('/RegisterScv').post(scvController.RegisterScv);
router.route('/Otpverify').post(scvController.Otpverify);
router.route('/setPassword').post(scvController.setPassword);
router.route('/LoginCustomer').post(scvController.LoginCustomer);
router
  .route('/addPartner')
  .post(partnerAddress.fields([{ name: 'addressProof' }, { name: 'idProof' }]), scvController.addPartner);
router
  .route('/updatePartner/:id')
  .put(partnerAddress.fields([{ name: 'addressProof' }, { name: 'idProof' }]), scvController.updatePartner);
router.route('/getPartners/all').get(scvController.getPartners);
router.route('/enable/disable/partner/:id').put(scvController.enable_disable_partner);

module.exports = router;
