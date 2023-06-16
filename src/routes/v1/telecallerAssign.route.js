const express = require('express');
const telecallerAssignController = require('../../controllers/telecallerAssign.controller');
const router = express.Router();
const authorization = require('../../controllers/tokenVerify.controller');
// telecallerheadAssings
router.route('/createtelecallerAssignReassign').post(telecallerAssignController.createtelecallerAssignReassign);

router.route('/getAllTelecallerHead').get(telecallerAssignController.getAllTelecallerHead);
router.route('/getUnassignedtelecaller/:page').get(telecallerAssignController.getUnassignedtelecaller);
router.route('/gettelecallerheadTelecallerdata/:id').get(telecallerAssignController.gettelecallerheadTelecallerdata);

//telecallerShops
router.route('/createTelecallerShop').post(telecallerAssignController.createTelecallerShop);
router.route('/getAllTelecaller').get(telecallerAssignController.getAllTelecaller);
router.route('/getTelecallerAssignedShops/:id').get(telecallerAssignController.getTelecallerAssignedShops);
router
  .route('/getnotAssignShops/:zone/:id/:street/:page/:limit/:uid/:date/:dastatus/:pincode')
  .get(telecallerAssignController.getnotAssignShops);
router.route('/getUsersWith_skiped/:id').get(telecallerAssignController.getUsersWith_skiped);
router.route('/Return_Assign_To_telecaller/:id').put(telecallerAssignController.Return_Assign_To_telecaller);
router.route('/createtemperaryAssigndata').post(telecallerAssignController.createtemperaryAssigndata);
router.route('/getAssignData_by_Telecaller/:page').get(telecallerAssignController.getAssignData_by_Telecaller);
router
  .route('/history_Assign_Reaasign_datatelecaller/:id')
  .get(telecallerAssignController.history_Assign_Reaasign_datatelecaller);

// report
router.route('/assignShopsTelecaller/:id/:page').get(telecallerAssignController.assignShopsTelecaller);
router
  .route('/assignShopsTelecallerdatewise/:id/:wardid/:page')
  .get(telecallerAssignController.assignShopsTelecallerdatewise);
router.route('/assignShopsOnlydatewise/:id/:wardid/:page').get(telecallerAssignController.assignShopsOnlydatewise);

// salemanOrder
router.route('/createsalesmanAssignReassign').post(telecallerAssignController.createsalesmanAssignReassign);
router.route('/getAllAsmSalesmanHead').get(telecallerAssignController.getAllAsmSalesmanHead);
router.route('/getUnassignedsalesmanOrder/:page').get(telecallerAssignController.getUnassignedsalesmanOrder);
router.route('/getsalemanOrderSalesman/:id').get(telecallerAssignController.getsalemanOrderSalesman);

//salesmanshops
router.route('/createsalesmanOrderShop').post(telecallerAssignController.createsalesmanOrderShop);
router.route('/getAllSalesman').get(telecallerAssignController.getAllSalesman);
router.route('/getsalesmanOrderAssignedShops/:id').get(telecallerAssignController.getsalesmanOrderAssignedShops);
router.route('/get_my_shops/assigned').get(authorization, telecallerAssignController.get_my_shops_assigned);
router
  .route('/getnotAssignsalesmanOrderShops/:zone/:id/:street/:page/:limit/:uid/:date/:dastatus/:pincode/:Da')
  .get(telecallerAssignController.getnotAssignsalesmanOrderShops);
router.route('/getUserssalesmanWith_skiped/:id').get(telecallerAssignController.getUserssalesmanWith_skiped);
router.route('/Return_Assign_To_salesmanOrder/:id').put(telecallerAssignController.Return_Assign_To_salesmanOrder);
router.route('/createsalesmantemperaryAssigndata').post(telecallerAssignController.createsalesmantemperaryAssigndata);
router.route('/getAssignData_by_SalesmanOrders/:page').get(telecallerAssignController.getAssignData_by_SalesmanOrders);
router
  .route('/history_Assign_Reaasign_datasalesman/:id')
  .get(telecallerAssignController.history_Assign_Reaasign_datasalesman);

//report
router.route('/assignShopsSalesmanOrder/:id/:page').get(telecallerAssignController.assignShopsSalesmanOrder);
router.route('/assignShopssalesmandatewise/:id/:wardid/:page').get(telecallerAssignController.assignShopssalesmandatewise);
router
  .route('/assignShopssalesmanOnlydatewise/:id/:wardid/:page')
  .get(telecallerAssignController.assignShopssalesmanOnlydatewise);
//pincode
router.route('/pincode').get(telecallerAssignController.pincode);
//lat
router
  .route('/getnotAssignsalesmanOrderShops_lat/:zone/:id')
  .get(telecallerAssignController.getnotAssignsalesmanOrderShops_lat);
router
  .route('/getnotAssignShops/without/Page/map/view/:zone/:id/:street/:uid/:date/:dastatus/:pincode')
  .get(telecallerAssignController.getnotAssignShops_without_Page);
router.route('/AssignedData/By/users/:id').get(telecallerAssignController.AssignedData_By_users);
router.route('/getLat/long').post(telecallerAssignController.getLat_long);
router.route('/tempAssign').post(telecallerAssignController.tempAssign);
router.route('/getNewEdite/:page/:limit/:mobile/:status/:pincode/:verify').get(telecallerAssignController.getNewEdite);
router.route('/newliEdit/:id').put(telecallerAssignController.newliEdit);
module.exports = router;
