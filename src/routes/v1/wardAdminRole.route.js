const express = require('express');
const wardAdminRoleController = require('../../controllers/wardAdminRole.controller');
const router = express.Router();
const authorization = require('../../controllers/tokenVerify.controller');

router.route('/').post(wardAdminRoleController.createwardAdminRoleService);
router.route('/:date').get(wardAdminRoleController.getAllwardAdminRole);
router.route('/getAllData/:id').get(wardAdminRoleController.getDataById);
router.route('/createwardAdminRoleAsm/data').post(wardAdminRoleController.createwardAdminRoleAsmService);
router.route('/data/:id').get(wardAdminRoleController.getAllWardAdminRoleData);
router.route('/smData/data/:date').get(wardAdminRoleController.smData);
router.route('/totalChange/:id').put(wardAdminRoleController.total);
router.route('/createAsmSamesman').post(wardAdminRoleController.createAsmSalesman);
router.route('/getAllSalesmanData/:id').get(wardAdminRoleController.allAsmSalesmanData);
router.route('/getAllAssignReassign/:id').get(wardAdminRoleController.getAllAssignReassignData);
router.route('/createSalesmanShop').post(wardAdminRoleController.createSalesmanShop);
router.route('/data/getAllAssignSalesmanShopData/data/:id').get(wardAdminRoleController.getAllAssignSalesmanShopData);
router.route('/getAllSalesMandataCurrentdate/:id').get(wardAdminRoleController.getAllSalesMandataCurrentdate);
router.route('/createwithoutoutAsmSalesman').post(wardAdminRoleController.createwithoutoutAsmSalesman);
router.route('/withoutoutAsmSalesmanCurrentDate/:id').get(wardAdminRoleController.withoutoutAsmSalesmanCurrentDate);
router.route('/withoutoutAsmSalesman/data/:date').get(wardAdminRoleController.withoutoutAsmSalesman);
router.route('/dataAllSalesManhistry/:id').get(wardAdminRoleController.dataAllSalesManhistry);
router.route('/allocateDeallocateCount/:id').get(wardAdminRoleController.allocateDeallocateCount);
router.route('/createtemperaryAssigndata').post(wardAdminRoleController.createtemperaryAssigndata);
router.route('/getAllTempReassigndata/data').get(wardAdminRoleController.getAllTempReassigndata);
router.route('/getAssign/dataBy/salesMan/:page').get(wardAdminRoleController.getAssignData_by_SalesMan);
router.route('/getAssign/dataBy/salesMan/Id/:id').get(wardAdminRoleController.get_Assign_data_By_SalesManId);
router.route('/getData/without/given/:id').get(wardAdminRoleController.getUsersWith_skiped);
router.route('/Return_Assign_To_SalesMan/:id').get(wardAdminRoleController.Return_Assign_To_SalesMan);
router
  .route('/history_Assign_Reaasign_data/:id/:date/:idSearch/:tempid')
  .get(wardAdminRoleController.history_Assign_Reaasign_data);
router.route('/getAllSalesmanShops/data').get(wardAdminRoleController.getAllSalesmanShops);
router.route('/getAllSalesmanShopsData/data/:id').get(wardAdminRoleController.getAllSalesmanShopsData);
router.route('/getDataAll/data').get(wardAdminRoleController.getDataAll);
router.route('/getAllAsmCurrentdata/data/:id').get(wardAdminRoleController.getAllAsmCurrentdata);
router.route('/createwithAsmwithoutAsm/data').post(wardAdminRoleController.createwithAsmwithoutAsm);
router.route('/getwithAsmwithoutAsm/data/:type/:date').get(wardAdminRoleController.getwithAsmwithoutAsm);
router.route('/WardAdminRoleHistor/:id/:date/:page').get(wardAdminRoleController.WardAdminRoleHistor);
router.route('/getAllWithAsmwithout/:sm/:asm/:date').get(wardAdminRoleController.getAllWithAsmwithout);
router.route('/asmdata/data').get(wardAdminRoleController.asmdata);
router.route('/asmSalesman/data/:id').get(wardAdminRoleController.asmSalesman);
router.route('/telecallerHead/data/data1').get(wardAdminRoleController.telecallerHead);
router.route('/wardwcce/All').get(wardAdminRoleController.wardwcce);
router.route('/getAlldataAsm/data/:id').get(wardAdminRoleController.getAlldataASm);
router
  .route('/getAllDatasalesmanDataAndAssign/data/:id/:date/:page')
  .get(wardAdminRoleController.getAllDatasalesmanDataAndAssign);
router.route('/getAlldataSalesmanandtele_wcce/:id').get(wardAdminRoleController.getAlldataSalesmanandtele_wcce);
router.route('/telecallernames/data').get(wardAdminRoleController.telecallernames);
router.route('/WardAdminRoleHistorydata/:id/:date').get(wardAdminRoleController.WardAdminRoleHistorydata);
router.route('/WardAdminRoledatas/:id/:date/:page').get(wardAdminRoleController.WardAdminRoledatas);
router.route('/assignShopsSalesman/data/:id/:page').get(wardAdminRoleController.assignShopsSalesman);
router.route('/assignShopsSalesmandatewise/data/:id/:wardid/:page').get(wardAdminRoleController.assignShopsSalesmandatewise);
router.route('/assignShopsOnlydatewise/data/:id/:wardid/:page').get(wardAdminRoleController.assignShopsOnlydatewise);

//  08-11-2022

router.route('/createtarget/byuser').post(authorization, wardAdminRoleController.createtartget);
router.route('/getuserTartget/byuser').get(authorization, wardAdminRoleController.get_user_target);
router.route('/getall/targets/byuser').get(authorization, wardAdminRoleController.getall_targets);
router.route('/getuser/target/byusers').get(authorization, wardAdminRoleController.getusertarget);

// map view
router.route('/get/Assign/shops/BySalesman').get(authorization, wardAdminRoleController.getAssign_bySalesman);
router.route('/mycapture/re/get/Assign/shops/BySalesman').get(authorization, wardAdminRoleController.re_getAssign_bySalesman);
router.route('/mycapture/re/get/Assign/shops/BySalesman/final/customer').get(authorization, wardAdminRoleController.re_getAssign_bySalesman_final_customer);



// 26-11-2022
router.route('/overall_Count_And_Data/:id/:uid').get(wardAdminRoleController.overall_Count_And_Data);
router.route('/map1/:id').get(wardAdminRoleController.map1);
router.route('/map2/:id').get(wardAdminRoleController.map2);
router.route('/map3/:id').get(wardAdminRoleController.map3);
router.route('/assignData/:id/:uid').get(wardAdminRoleController.assignData);
module.exports = router;
