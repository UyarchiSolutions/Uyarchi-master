const express = require('express');
const router = express.Router();
const shopOrderController = require('../../controllers/shopOrder.controller');
const authorization = require('../../controllers/tokenVerify.controller');
const Issue = require('../../middlewares/issue');
const multer = require("multer")
router
  .route('/')
  .post(authorization, shopOrderController.createshopOrder)
  .get(authorization, shopOrderController.getAllShopOrder);
router
  .route('/:shopOrderId')
  .get(shopOrderController.getShopOrderById)
  .put(shopOrderController.updateshopOrderById)
  .delete(shopOrderController.deleteShopOrderById);

router.route('/product/all').get(shopOrderController.getProductDetailsByProductId);
router.route('/shopdata/pagination/:page').get(authorization, shopOrderController.getShopNameWithPagination);

// shopOrderClone Router
router
  .route('/shopOrderClone/pagination/shops/:page')
  .get(authorization, shopOrderController.getShopNameCloneWithPagination);
router.route('/ShopOrderClone').post(authorization, shopOrderController.createshopOrderClone);
router.route('/ShopOrderClone/All/:date/:page').get(authorization, shopOrderController.getAllShopOrderClone);
router
  .route('/shopOrderClone/:id')
  .get(authorization, shopOrderController.getShopOrderCloneById)
  .put(shopOrderController.updateShopOrderCloneById)
  .delete(shopOrderController.deleteShopOrderCloneById);

// ProductOrderClone Routes

router.route('/ProductOrderClone').post(shopOrderController.createsPrductOrderClone);
router.route('/ProductOrderClone/All').get(shopOrderController.getAllProductOrderClone);
router
  .route('/ProductOrderClone/:id')
  .get(shopOrderController.getProductOrderCloneById)
  .put(shopOrderController.updateProductOrderCloneById)
  .delete(shopOrderController.deleteProductOrderCloneById);

router.route('/telecaller').get(shopOrderController.getAll);
router.route('/createorderId').post(shopOrderController.createOrderId);
router.route('/update/:id').put(authorization, shopOrderController.updateshop_order);
router.route('/getShop/details/:id').get(shopOrderController.getShopDetailsByOrder);
// data undelivered
router.route('/undelivered/data/:page').get(shopOrderController.undelivered);
router.route('/B2b/B2BManageOrders/:shopid').get(shopOrderController.B2BManageOrders);
router.route('/B2BManageOrders/:orderId/:date').get(shopOrderController.getManageordersByOrderId);
router.route('/productData/:id').get(shopOrderController.productData);
router.route('/productorders/:orderId').get(shopOrderController.getproductOrders_By_OrderId);
router.route('/getdata/lapster/yesterday/:page').get(shopOrderController.get_data_for_lapster);
router.route('/lapsed/getdata/:status/:page').get(authorization, shopOrderController.getLapsed_Data);
router.route('/lapsed/Reject/getdata/:status/:page').get(authorization, shopOrderController.getLapsed_Rejected);
router.route('/lapsed/Undelivered/getdata/:status/:page').get(authorization, shopOrderController.getLapsed_Undelivered);
router.route('/get/callhistory/last/ten/:shopId').get(shopOrderController.getCallhistories);
router.route('/singleShoprders/:id').get(shopOrderController.getFindbyId);
router.route('/lapsed/ordercount').get(shopOrderController.lapsedordercount);
router.route('/lapsed/ordercount/Reject').get(shopOrderController.lapsedordercountReject);
router.route('/lapsed/ordercount/Undelivered').get(shopOrderController.lapsedordercountUndelivered);
router.route('/getBills/byshop/:shopId').get(shopOrderController.getBills_ByShop);
router.route('/getBills/details/byshop/:shopId/:page').get(shopOrderController.getBills_DetailsByshop);
router.route('/vieworderbill/byshop/:shopId').get(authorization, shopOrderController.vieworderbill_byshop);
router.route('/mismatchstock/bygroup').post(shopOrderController.mismachstockscreate);
router.route('/ward/Admin/order/tracking/:page').get(shopOrderController.WA_Order_status);
router.route('/ward/Admin/order/particular/order/:id').get(shopOrderController.OGorders_MDorders);
router.route('/ward/Admin/order/particular/order/details/:id').get(shopOrderController.details_Of_Payment_by_Id);
router.route('/payment/history/byOrder/:id').get(shopOrderController.getPaymenthistory);
router.route('/getallmanage/issues').get(shopOrderController.getallmanageIssus);
router.route('/getmanage/issues/byID').get(shopOrderController.getmanageIssus_byID);
router.route('/undelivered/ordes/data').get(shopOrderController.UnDeliveredOrders);
router.route('/getall/shoporder/ordered').get(shopOrderController.getall_ordered_shops);
router.route('/getall/shoporder/approved').get(shopOrderController.get_approved_orders);
router.route('/getall/shoporder/rejected').get(shopOrderController.get_rejected_orders);
router.route('/getpincode/getall/orders').get(shopOrderController.get_ward_by_orders);
router.route('/reject/assignorder/timeloss').put(shopOrderController.get_assignorder_timeloss);
router.route('/reject/assignorder/reassgin').put(authorization, shopOrderController.get_assignorder_reassgin);
router.route('/reject/assignorder/remove').put(authorization, shopOrderController.get_assignorder_remove);
router.route('/sort/orders/wde/ordernow').post(shopOrderController.sort_by_order_wde);
router.route('/update/issue/approved').put(shopOrderController.update_issue_status_approved);
router.route('/update/issue/decline').put(shopOrderController.update_issue_status_decline);
router.route('/update/process/to/completed').put(shopOrderController.order_process_to_completed);
router.route('/update/process/to/return').put(shopOrderController.order_process_to_return);
router.route('/get/issue/order/returns').get(shopOrderController.order_issue_return);
router.route('/shopDataMap/ndd').get(shopOrderController.shopDataMap);
router.route('/issueStatus_Update/:id').put(shopOrderController.issueStatus_Update);
router.route('/assign/issueStatus_Update/:id').put(shopOrderController.issueStatus_Update_assign);
router.route('/get/issues/product/list').get(authorization, shopOrderController.get_issue_product_list);

const storage = multer.memoryStorage({
  destination: function (req, res, callback) {
    callback(null, '');
  },
});
const upload = multer({ storage }).single('productvideo');

// issue picked delivery Exc
router.route('/issue/collection/start').put(authorization, shopOrderController.issue_collection_start);
router.route('/issue/collection/reached').put(authorization, shopOrderController.issue_collection_reached);
router.route('/issue/collection/checked').put(authorization, Issue.array('images'), shopOrderController.issue_collection_checked);
router.route('/issue/collection/checked/video').put(authorization, upload, shopOrderController.issue_collection_checked_video);
router.route('/issue/collection/pickedup').put(authorization, shopOrderController.issue_collection_pickedup);
router.route('/issue/collection/rejected').put(authorization, shopOrderController.issue_collection_rejected);
router.route('/issue/collection/returntosm').put(authorization, shopOrderController.issue_collection_returntosm);
router.route('/issue/collection/recieved').put(authorization, shopOrderController.issue_collection_recieved);
router.route('/issue/collection/calculated').put(authorization, shopOrderController.issue_collection_calculated);
router.route('/issue/collection/reconfirm').put(authorization, shopOrderController.issue_collection_reconfirm);


// sde 
router.route('/selfpickup/orders/all').get(shopOrderController.get_selfpickupOrders);
router.route('/selfpickup/orders/group').get(shopOrderController.get_selfpickupOrders_group);




module.exports = router;
