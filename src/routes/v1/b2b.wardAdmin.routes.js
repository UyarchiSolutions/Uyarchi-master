const express = require('express');
const wardAdminController = require('../../controllers/b2b.wardAdmin.controller');
const router = express.Router();
const authorization = require('../../controllers/tokenVerify.controller');
router.route('/create/data').post(wardAdminController.createdata);
// checked
router.route('/getDetails/:limit/:page/:status').get(wardAdminController.statusMatchingAppOrModi);

router.route('/getProductDetails/:id').get(wardAdminController.getproductDetails);
// checked modified
router.route('/updateProductById/:orderId').put(authorization, wardAdminController.updateProduct);

// router.route('/getDetails/:limit/:page/:status').get(wardAdminController.statusMatchingAppOrModi);
router.route('/getDetails/:type/:time/:status/:limit/:page').get(wardAdminController.statusMatchingAppOrModi);
// router.route('/getProductDetails/:id').get(wardAdminController.getproductDetails);
// checked modified
// checked
router.route('/updateAcknowledge').put(authorization, wardAdminController.updateAcknowledge);
// checked
router.route('/updateApproved').put(authorization, wardAdminController.updateApproval);

router.route('/updatePacked').put(authorization, wardAdminController.updatePackedStatus);

// checked
router.route('/updateRejected').put(authorization, wardAdminController.updateRejectionStatus);
// Checked;
router.route('/updateApproved/:id').put(authorization, wardAdminController.updateApproved);

// checked not Use
router.route('/updateModified/:id').put(wardAdminController.updateModified);

// checked Modified
router.route('/updateRejected/:id').put(authorization, wardAdminController.updateRejected);

router.route('/wardloadingExecutive/updatePacked/:id').put(authorization, wardAdminController.updatePacked);

router.route('/wardloadingExecutive/updateAssign/:id').put(wardAdminController.updateAssigned);

router.route('/wardloadingExecutive/updateProductBilled/:id').put(wardAdminController.updateBilled);
// checked
router.route('/wardloadingExecutive/getdetails/:id').get(wardAdminController.wardloadExecutive);
router.route('/wardloadingExecutive/getdetails/bygroup/packing').get(wardAdminController.wardloadExecutivebtgroup);
router
  .route('/wardloadingExecutive/getdetails/afterpacked/:status/:date/:page')
  .get(wardAdminController.wardloadExecutivepacked);

router.route('/wardloadingExecutive/getPackedProductDetails').get(wardAdminController.wardloadExecutivePacked);

router.route('/getWardDeliveryExecutive/name').get(wardAdminController.wardDeliveryExecutive);

// router.route('/getWardDeliveryExecutive/name').get(wardAdminController.wardDeliveryExecutive);

router.route('/delivery/Executive/Name/:id').put(wardAdminController.deliveryexecutive);

router.route('/Array/craeteArrayData').post(wardAdminController.createArrayData);
// checked
router.route('/update/acknowleded/status/single/:id').put(authorization, wardAdminController.updateAcknowledgeSingle);

router.route('/get/status/Count').get(wardAdminController.countStatus);
// checked Modified
router.route('/order/Assign').get(wardAdminController.getAssigned_details);
// mismatcheddata
router.route('/mismatchCount/:page').get(wardAdminController.mismatchCount);
router.route('/mismatchGroup/:id').get(wardAdminController.mismatchGroup);
router.route('/Mismatch_Stock_Reconcilation').get(wardAdminController.Mismatch_Stock_Reconcilation);
router.route('/Mismatch_Stock_Reconcilation1/:id').get(wardAdminController.Mismatch_Stock_Reconcilation1);

router.route('/get/shop/details/:id').get(wardAdminController.getshopDetails);
router.route('/manage/group/orders').get(wardAdminController.manage_group_orders);
router.route('/manage/group/orders/bygroup/:id').get(wardAdminController.manage_Orders_ByGroup);
router.route('/manage/group/orders/bygroup/byproducts/:id').get(wardAdminController.trackOrdersByGroupOrder);
router.route('/mis/macthGroupCount/:page').get(wardAdminController.mismacthGroupCount);
router.route('/group/misMatch/de/:id/:page').get(wardAdminController.group_In_misMatch);
router.route('/stock/mis/macthGroupCount/:page').get(wardAdminController.mismacthStock);
router.route('/stcks/mis/match/group/byDe/:id').get(wardAdminController.misMatchStocks);
router.route('/mismatch/amount/groups/:de/:date/:page').get(wardAdminController.MisMatch_Amount_For_Groups);
router.route('/DeliveryExecutive').get(wardAdminController.DeliveryExecutive);
router.route('/getTotal/misMatchStock/:de/:date/:page').get(wardAdminController.getTotalmisMatchStock);
module.exports = router;
