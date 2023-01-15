const express = require('express');
const wardAdminGroupController = require('../../controllers/b2b.wardAdminGroup.controller');
const returnStockWastage = require('../../middlewares/returnStockWastage');
const router = express.Router();
const authorization = require('../../controllers/tokenVerify.controller');
const returnImage = require('../../middlewares/returnStock');

router.route('/craeteGroupId').post(authorization, wardAdminGroupController.createGroupOrder);

router.route('/update/orderpicked/:deliveryExecutiveId').put(wardAdminGroupController.updateOrderPickedStatus);

router.route('/update/pickedPettyStock/:id').put(wardAdminGroupController.updatePickedPettyStock);

router.route('/update/pickedPettyCash/:id').put(wardAdminGroupController.updatePickedPettyCash);
// new Api
router
  .route('/update/pickedPettystock/collected/:id')
  .put(authorization, wardAdminGroupController.updatePickedPettystockcollected);
// new Api
router
  .route('/update/pickedPettycash/collected/:id')
  .put(authorization, wardAdminGroupController.updateManageStatuscashcollect);

router.route('/update/deliveryStarted/:id').put(authorization, wardAdminGroupController.updateDeliveryStarted);

router.route('/update/delivered/:id').put(authorization, wardAdminGroupController.updateDeliveryCompleted);
router.route('/credit/update/delivered/:id').put(authorization, wardAdminGroupController.creditupdateDeliveryCompleted);
router.route('/scheduleshop/assign/:id').put(authorization, wardAdminGroupController.scheduleshopdate);

router.route('/update/unDelivered/:id').put(authorization, wardAdminGroupController.UpdateUnDeliveredStatus);

router.route('/getDetails/groupIdFromOrderId/:id').get(wardAdminGroupController.getByIdGroupOrderDetails);

router.route('/getdetails/product/:id').get(wardAdminGroupController.getproductDetailsPettyStock);

router.route('/getGroup/details').get(wardAdminGroupController.getGroupDetails);

router.route('/getDeliveryExecutivestatus/:id').get(wardAdminGroupController.getDeliveryExecutivestatus);

router.route('/get/billDetails/:id').get(wardAdminGroupController.getBillDetails);

//checked
router.route('/get/assignedOnle').get(wardAdminGroupController.getAssigned);
router.route('/get/assignedOnle/cash').get(wardAdminGroupController.cashgetAssigned);
router.route('/get/assignedOnle/delivery').get(authorization, wardAdminGroupController.deliverygetAssigned);
router.route('/stationery/getself/pickup/delivery').get(wardAdminGroupController.delivery_selfpickup);

router.route('/get/details/deliveryExecutive/:id/:page').get(wardAdminGroupController.getDeliveryOrderSeparate);

router.route('/statusChange/:id').put(wardAdminGroupController.updateManageStatus);

//  new API
router.route('/statusChange/completed/:id').put(authorization, wardAdminGroupController.updateManagecompleted);

router.route('/groupIdClick/:id').get(wardAdminGroupController.groupIdClick);

router.route('/orderIdClickGetProduct/:id').get(wardAdminGroupController.orderIdClickGetProduct);

router.route('/get/getDetailsAfterDeliveryCompletion/:id').get(wardAdminGroupController.getDetailsAfterDeliveryCompletion);

router.route('/get/BillDetails/perOrder/:id').get(wardAdminGroupController.getBillDetailsPerOrder);

router.route('/get/returnWDEtoWLE/:id/:page').get(wardAdminGroupController.getReturnWDEtoWLE);

// router.route('/submit/pettyStockSubmit').post(wardAdminGroupController.pettyStockSubmit);
// checked
router.route('/submit/pettyCashSubmit/:id').put(authorization, wardAdminGroupController.pettyCashSubmit);

router.route('/Update/orderCompleted/:id').put(wardAdminGroupController.orderCompleted);

// router.route('/update/Deliverystart/:id').put(wardAdminGroupController.Deliverystart);

router.route('/update/deliveryCompleted/:id').put(authorization, wardAdminGroupController.deliveryCompleted);

router.route('/get/getPettyStockDetails/:id/:page').get(wardAdminGroupController.getPettyStockDetails);

router
  .route('/get/getdetailsAboutPettyStockByGroupId/:id/:page')
  .get(wardAdminGroupController.getdetailsAboutPettyStockByGroupId);

// router.route('/upload/imgae/wastage/').post(wardAdminGroupController.uploadWastageImage);

// router.route('/create/array/pettyStockData/:id').put(wardAdminGroupController.createData);

router.route('/update/status/allocateStatus/:id').put(wardAdminGroupController.updateAllocate);

// checked
router.route('/update/status/notAloocate/:id').put(authorization, wardAdminGroupController.updateDontAllocate);
router.route('/cash/update/status/notAloocate/:id').put(authorization, wardAdminGroupController.updateDontAllocatecash);

router.route('/get/getPettyCashDetails/:id/:page').get(wardAdminGroupController.getPettyCashDetails);

router.route('/get/AllGroup/details/:id/:date/:FinishingStatus/:page').get(wardAdminGroupController.getAllGroup);

router.route('/update/pettycash/return/:id').put(wardAdminGroupController.updatePettyCashReturnStatus);

// checked Modified
router.route('/create/pettyStock/create/:id').put(authorization, wardAdminGroupController.pettyStockCreate);

router.route('/get/cashDetails/fromDB/:id').get(wardAdminGroupController.getcashAmountViewFromDB);
router.route('/submitPEttyCashGivenByWDE/submit/:id').put(wardAdminGroupController.submitPEttyCashGivenByWDE);

// router.route('/Update/create/pettyStock/details/:id').put(wardAdminGroupController.createDatasInPettyStockModel);

router.route('/get/details/pettyCash/:id').get(wardAdminGroupController.getPEttyCashQuantity);

router
  .route('/create/detatisl/About/pettyStock/returnstock')
  .post(returnStockWastage.array('wastageImageUpload'), wardAdminGroupController.uploadWastageImage);

router.route('/get/return/stock/:id').get(wardAdminGroupController.returnStock);

// checked Modified
router.route('/create/pettyStock/:id').put(wardAdminGroupController.lastPettyStckAdd);

router.route('/get/shop/details/:id').get(wardAdminGroupController.getShopDetailsForProj);

router.route('/submit/pettyCash/AsGivenByWDE/:id').put(wardAdminGroupController.submitCashGivenByWDE);

router.route('/update/groupDetails/:id').put(authorization, wardAdminGroupController.createAddOrdINGrp);
// router.route('/craete/billNo/:id').post(wardAdminGroupController.createBillNo);

// DELIVERY EXECUTIVE

// router.route('/get/getDeliveryDetails/:page').get(wardAdminGroupController.getDeliveryDetails);

router.route('/get/details/finishing/account/:id/:page').get(wardAdminGroupController.finishingAccount);
router.route('/submit/Dispute/:id').put(wardAdminGroupController.submitDispute);
router.route('/returnStockData/:id').get(wardAdminGroupController.returnStockData);
router.route('/updatemismatchStockStatus/:id').put(wardAdminGroupController.updatemismatchStockStatus);
router.route('/createfineData/').post(wardAdminGroupController.createfineData);

router.route('/get/orderData/ByPassing/GroupId/:id').get(wardAdminGroupController.getOrderDataByPassing);

router.route('/get/detatils/dele/name/forSorting').get(wardAdminGroupController.deliveryExecutiveSorting);
router.route('/get/AllGroup/details/:page').get(wardAdminGroupController.getGroupDetailsForDE);

router.route('/getdriver/assign/grouporders').get(wardAdminGroupController.getGroupOrders_driver);
router.route('/getstockreport/selfpickup').get(wardAdminGroupController.get_stock_roport_selfpickup);

router.route('/createArrayPettyCash/:id').put(wardAdminGroupController.createArrayPettyCash);

router
  .route('/return/stock/images/:id')
  .put(returnImage.array('returnStockimages'), wardAdminGroupController.storeReturn_images_toGroup);
router.route('/return/cash/:id').get(authorization, wardAdminGroupController.returnedCash);
router.route('/return/stock/De/:id').get(authorization, wardAdminGroupController.returnedStock);
router.route('/updateFine/Credit/status/update/:id').put(wardAdminGroupController.updateFine_Credit_status);
router.route('/mismatch/products/stocks/by/group/:id').get(wardAdminGroupController.misMatchProducts_by_group);
// updateFine_Stock_status
router.route('/updateFine/Credit/status/update/stock/:id').put(wardAdminGroupController.updateFine_Stock_status);
router.route('/update/fine/status').post(wardAdminGroupController.product_fine);
router.route('/get/existing/groups/all').get(wardAdminGroupController.get_existing_group);
router.route('/assgin/return/order/collection').post(wardAdminGroupController.assign_to_return_orders);





module.exports = router;
