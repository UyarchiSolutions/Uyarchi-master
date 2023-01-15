const express = require('express');
const CallStatusController = require('../../controllers/callStatus.controller');
const router = express.Router();
const stockImage = require('../../middlewares/stock');
const authorization = require('../../controllers/supplierAppAuth.controller');

router.route('/').post(CallStatusController.createCallStatus);
router.route('/suppierApp').post(authorization, CallStatusController.createCallStatus_suppierApp);
router
  .route('/:id')
  .get(CallStatusController.getCallStatusbyId)
  .put(CallStatusController.updateCallStatusById)
  .delete(CallStatusController.deleteBusinessById);
router.route('/:id/:date').put(CallStatusController.updateCallStatusById);
router.route('/getSuppplier/getproduct/details/:page').get(CallStatusController.getProductAndSupplierDetails);
router.route('/getDataWithSupplierId/:id/:page').get(CallStatusController.getDataWithSupplierId);
router.route('/order/finished/:pId/:date').get(CallStatusController.finishOrder);
router.route('/callstatusData/SuddenOrders/:page').get(CallStatusController.getCallstatusForSuddenOrders);
router.route('/suddenOrdersDisplay/:productId').get(CallStatusController.suddenOrdersDisplay);
router.route('/getData/reportSupplierId/:page/:search/:date').get(CallStatusController.getReportWithSupplierId);
module.exports = router;
