const express = require('express');
const router = express.Router();
const shopEnrollmentEnquiryController = require('../../controllers/shopEnrollmentEnquiry.controller');
const authorization = require('../../controllers/tokenVerify.controller');
const b2bCloneshopImage = require('../../middlewares/shopCloneImage');


router.route('/').post(authorization, shopEnrollmentEnquiryController.createEnquiry);
router.route('/getAllEnquiryDatas/:pincode/:page').get(shopEnrollmentEnquiryController.getAllEnquiryDatas);
router.route('/update/:id').put(shopEnrollmentEnquiryController.updateEnquiryById);

router.route('/AssignShops').post(shopEnrollmentEnquiryController.AssignShops);
router.route('/pincode').get(shopEnrollmentEnquiryController.pincode);
router.route('/viewdatagetById').get(authorization, shopEnrollmentEnquiryController.viewdatagetById);

router.route('/createShops').post(b2bCloneshopImage.array('photoCapture'), shopEnrollmentEnquiryController.createShops);
router.route('/getAllSupplierDatas').get(shopEnrollmentEnquiryController.getAllSupplierDatas);
router.route('/getIdEnquiryShops/:id').get(shopEnrollmentEnquiryController.getIdEnquiryShops);
router.route('/createSupplierEnquiry').post(authorization, shopEnrollmentEnquiryController.createSupplierEnquiry);
router.route('/product/:id').get(shopEnrollmentEnquiryController.product);
module.exports = router;