const express = require('express');
const supplierController = require('../../controllers/supplier.unBilled.controller');
const router = express.Router();
const supplierAuth = require('../../controllers/supplier.authorizations');

router.route('/').post(supplierController.createSupplierUnBilled);
router.route('/unBilled').get(supplierController.getUnBilledBySupplier);
router.route('/advance/:supplierId').get(supplierController.getSupplierAdvance);
router.route('/ordered/details/:id').get(supplierController.getSupplierOrdered_Details);
router.route('/Unbilled/Details/bySupplier/:id').get(supplierController.Unbilled_Details_bySupplier);
router.route('/supplier/Bill/payments/:page').get(supplierController.getSupplierbill_amt);
router.route('/supplier/Bills/:id').get(supplierController.getBillDetails_bySupplier);
router.route('/supplier/amount/details/:id').get(supplierController.supplierOrders_amt_details);
router.route('/getPaid/history/:id').get(supplierController.getPaid_history);
router.route('/bill/adjust').post(supplierController.billAdjust);
router.route('/pay/pending/Amount').post(supplierController.PayPendingAmount);
router.route('/get/UnBilled/Details').get(supplierController.getUnBilledDetails);
router.route('/supplier/unBilled/supplier').get(supplierAuth, supplierController.supplierUnBilledBySupplier);
router.route('/get/UnBilled/history/BySupplier/:id').get(supplierController.getUnBilledhistoryBySupplier);
router.route('/getUnBilled/Raisedhistory/BySupplier/:id').get(supplierController.getUnBilledRaisedhistoryBySupplier);
router.route('/getUnBilled/Raisedhistory').get(supplierController.getUnBilledRaisedhistory);
router.route('/getpaidraisedby/indivitual/:id/:supplierId').get(supplierController.getpaidraisedbyindivitual);
router
  .route('/getRaisedUnBilled/PaidUnbilled/Details/:page')
  .get(supplierAuth, supplierController.getRaisedUnBilled_PaidUnbilled_Details);
router.route('/getPaidUnBilledHistory/:id').get(supplierController.getPaidUnBilledHistory);
module.exports = router;
