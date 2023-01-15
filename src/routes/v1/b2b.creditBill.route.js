const express = require('express');
const creditBillController = require('../../controllers/b2b.creditBill.controller');
const authorization = require('../../controllers/tokenVerify.controller');

const router = express.Router();

router.route('/get/getShopWithBill/:page').get(creditBillController.getShopWithBill);
router.route('/get/wardAdmin/delivery/ExecutiveName').get(creditBillController.getWardExecutiveName);
router.route('/get/wardAdmin/salesMAn/name').get(creditBillController.getsalesmanName);
router.route('/get/shop/hostory/detatisl/:id').get(authorization, creditBillController.getShopHistory);
router.route('/post/creditBill/details/create').post(creditBillController.createGroupcredit);
router.route('/put/payingCash/with/DE/SM/:id').put(creditBillController.payingCAshWithDEorSM);
router
  .route('/get/getManageCreditBillAssigning/deliveryExecutivename')
  .get(creditBillController.getManageCreditBillAssigning);
router.route('/get/details/getcreditBillDetailsByPassExecID/:id').get(creditBillController.getcreditBillDetailsByPassExecID);
router.route('/get/history/data/ByPassing/orderId/:id').get(creditBillController.getHistoryByPassOrderId);
router.route('/get/DelNmae/AfterAssign').get(creditBillController.getDElExecutiveName);
router.route('/get/salesman/name').get(creditBillController.getsalesName);
router.route('/get/data/notAssigned/:page').get(creditBillController.getNotAssignData);
router.route('/get/shop/pending/:id').get(creditBillController.getShopPendingByPassingShopId);
router.route('/get/getDeliDetails').get(creditBillController.getDeliDetails);
router.route('/get/getFineAccount/:id').get(creditBillController.getFineAccount);
router.route('/get/deliveryExecutiveNmae').get(creditBillController.getDeliveryExecutiveName);
router.route('/get/details/Group/:id').get(creditBillController.getgetGroupAndBill);
router.route('/getgroup/orderdetails/:id').get(creditBillController.getgroupbilldetails);
router.route('/get/payment/overAll/:id').get(creditBillController.getPaymentTypeCount);
router.route('/get/group/data/:id').get(creditBillController.GroupDetails);
router.route('/submit/Dispute/:id').put(creditBillController.submitDispute);
router.route('/getdelivery/excutive/all/:page').get(authorization, creditBillController.getdeliveryExcutive);
router.route('/update/finish/credit/:id').put(authorization, creditBillController.submitfinish);
router.route('/get/creditBill/master').get(creditBillController.getCreditBillMaster);
// group credit bill master
router.route('/get/group/master/credit/Bill/:AssignedUserId/:date/:page').get(creditBillController.groupCreditBill);
router.route('/get/payment/history/:id/').get(creditBillController.getPaymenthistory);

router.route('/billdetails/getorderdetails').get(authorization, creditBillController.getbilldetails);
router.route('/after/completion/delivered/:shop/:date/:userId/:page').get(creditBillController.afterCompletion_Of_Delivered);
router.route('/last/paid/:id').get(creditBillController.last_Paid_amt);
router.route('/history/ByOrder/:id').get(creditBillController.getPaidHistory_ByOrder);
router.route('/approved/mismatch/amount/:page').get(creditBillController.Approved_Mismatch_amount);
router.route('/getDisputegroupeOnly/:de/:date/:page').get(creditBillController.getDisputegroupeOnly);
router.route('/update/FineStatus/:id').put(creditBillController.updateFineStatus);
router.route('/getOrdersBills/:id/:page').get(creditBillController.getOrdersBills);
router.route('/fineAnd/Execuse').post(creditBillController.fineAnd_Execuse);

module.exports = router;
