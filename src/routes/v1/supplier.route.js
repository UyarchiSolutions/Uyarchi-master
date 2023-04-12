const express = require('express');
const supplierController = require('../../controllers/supplier.controller');
const auth = require('../../controllers/supplierAppAuth.controller');
const router = express.Router();
const supplierupload = require('../../middlewares/supplier');
const authorization = require('../../controllers/tokenVerify.controller');




router.route('/').post(supplierController.createSupplier).get(supplierController.getAllSupplier);
// appSupplier
router.route('/login').post(supplierController.UsersLogin);
router.route('/otp_verify').post(supplierController.otpVerify_Setpassword);
router.route('/Supplier_setPassword/:id').put(supplierController.Supplier_setPassword);
router.route('/forgotPassword').post(supplierController.forgotPassword);
router.route('/getAppSupplier').get(auth, supplierController.getAllAppSupplier);
router.route('/getAllAppOnly_Supplier').get(auth, supplierController.getAllAppOnly_Supplier);
router.route('/getAllAppOnly_Supplier_Update').put(auth, supplierController.getAllAppOnly_Supplier_Update);
router.route('/getAllAppSupplierApproved').get(auth, supplierController.getAllAppSupplierApproved);
router.route('/already_Customer').post(supplierController.already_Customer);
router.route('/checkApproved').get(auth, supplierController.checkApproved);

router.route('/:supplierId').get(supplierController.getSupplierById).put(supplierController.updateSupplierById).delete(supplierController.deleteSupplierById);
router.route('/enable/:supplierId').put(supplierController.recoverById);
router.route('/disable/All').get(supplierController.getAllDisableSupplier);
router.route('/disable/:id').get(supplierController.getDisableSupplierById).put(supplierController.updateDisableSupplierById);
router.route('/products/dealing/:id/').get(supplierController.productDealingWithsupplier);
router.route('/dealing/:date').get(supplierController.getSupplierWithApprovedstatus);
router.route('/product/supplier/:supplierId/:date').get(supplierController.getproductsWithSupplierId);
router.route('/products/aggregate/:date').get(supplierController.getproductfromCallStatus);
router.route('/supplierPendingAmounts/:page').get(supplierController.getSupplierAmountDetailsForSupplierBills);
router.route('/supplier/paymend/details/:id').get(supplierController.getSupplierPaymentDetailsBySupplierId);
router.route('/productData/:id').get(supplierController.getSupplierPaymentDetailsByProductId);
router.route('/getSupplierWith/Advanced').get(supplierController.getSupplierWith_Advanced);
// create supplier fot third version
router.route('/third/supplier').post(authorization, supplierController.createSuppliers);
router.route('/third/supplier/:key/:page').get(supplierController.getSupplierthird);
router.route('/third/update/Supplier/:id').put(authorization, supplierupload.array('image'), supplierController.updateSupplierthird);
router.route('/supplier/get/single/:id').get(supplierController.getSupplierDetails);
router.route('/store/:id').put(authorization, supplierController.Store_lat_long);
router.route('/getSupplier/WithverifiedUser/:key/:date/:page').get(supplierController.getSupplierWithverifiedUser);
router.route('/checkMobile/ExestOrNot/:number').get(supplierController.checkMobileExestOrNot);
router.route('/UpdateSupplierBy/IdThird/:id').put(supplierupload.array('image'), supplierController.UpdateSupplierByIdThird);
router.route('/ValidateMobileNumber/:id/:phone').get(supplierController.ValidateMobileNumber);
router.route('/search/supplier/find').get(supplierController.filter_supplier);
router.route('/getsupplier/register/getall').get(supplierController.get_registered_supplier);
module.exports = router;
