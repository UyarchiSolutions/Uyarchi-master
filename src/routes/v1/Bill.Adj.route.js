const express = require('express');
const BillAdjController = require('../../controllers/Bill.Adj.controller');
const authorization = require('../../controllers/tokenVerify.controller');

const router = express.Router();

// create Bill_Adjustment

router.route('/').post(BillAdjController.createBillAdj);
// get billAdjustment By Id
router.route('/:id').get(BillAdjController.getBillAdjustmentById);
router.route('/customer/pendingbills/:page').get(BillAdjController.getCustomer_bills);
router.route('/adjustment/bill/:id').put(authorization, BillAdjController.adjustment_bill);
router.route('/adjustment/pay/bill/:id').put(authorization, BillAdjController.adjustment_bill_pay);
router.route('/unbilled/Amount/report').get(BillAdjController.getUnBilledAmount_With_Shops);
router.route('/unbilled/histories/byId/:id').get(BillAdjController.Unbilled_history);

module.exports = router;
