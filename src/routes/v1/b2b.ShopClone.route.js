const express = require('express');
const b2bShopCloneController = require('../../controllers/b2b.ShopClone.Controller');
const b2bCloneshopImage = require('../../middlewares/shopCloneImage');
const AttendanceImage = require('../../middlewares/attendanceCloneImage');
const authorization = require('../../controllers/tokenVerify.controller');
const router = express.Router();
const supplierAuth = require('../../controllers/supplierAppAuth.controller');

// Shop Clone
router.get('/filter/shopName/Contact/:key', b2bShopCloneController.filterShopwithNameAndContact);
router
  .route('/')
  .post(authorization, b2bCloneshopImage.array('photoCapture'), b2bShopCloneController.createB2bShopClone)
  .get(authorization, b2bShopCloneController.getAllB2BshopClone);
router.route('/aggregation/Names/:page').get(b2bShopCloneController.getshopWardStreetNamesWithAggregation);
router.route('/myshops/assigned/Names/:page').get(authorization, b2bShopCloneController.getshopmyshops);
router
  .route('/aggregation/filter/:district/:zone/:ward/:street/:status/:page')
  .get(b2bShopCloneController.getshopWardStreetNamesWithAggregation_withfilter);
router
  .route('/aggregation/filter/daily/:user/:startdata/:enddate/:starttime/:endtime/:status/:page')
  .get(b2bShopCloneController.getshopWardStreetNamesWithAggregation_withfilter_daily);

// clone
router
  .route('/aggregationgetAll/filter/:district/:zone/:ward/:street')
  .get(b2bShopCloneController.getshopWardStreetNamesWithAggregation_withfilter_all);
router
  .route('/aggregationdaily/filter/daily/:user/:startdata/:enddate/:starttime/:endtime')
  .get(b2bShopCloneController.getshopWardStreetNamesWithAggregation_withfilter_daily_all);

router

  .route('/:id')
  .get(b2bShopCloneController.getB2BShopById)
  .put(b2bShopCloneController.updateB2BShopById)
  .delete(b2bShopCloneController.deleteB2BShopById);

// Attendance Clone
router
  .route('/attendance/create/new')
  .post(authorization, AttendanceImage.array('image'), b2bShopCloneController.creatAttendanceClone_new);
router
  .route('/attendance/create')
  .post(authorization, AttendanceImage.array('image'), b2bShopCloneController.creatAttendanceClone)
  .get(authorization, b2bShopCloneController.getAlAttendanceClone);
router.route('/attendanceClone/Admin/:id/:date/:fromtime/:totime/:page').get(b2bShopCloneController.getAlAttendanceClone);
router
  .route('/attendance/:id')
  .get(authorization, b2bShopCloneController.getAttendanceById)
  .put(authorization, b2bShopCloneController.updateAttendanceById)
  .delete(authorization, b2bShopCloneController.deleteAttendanceById);

router.route('/totalCount/counts').get(authorization, b2bShopCloneController.getTotalCounts);
// getmarket shop route

router.route('/getMarket/shop/:marketId/:page').get(b2bShopCloneController.getMarkeShop);

//
router.route('/gomapView/viewfirst/:id').put(b2bShopCloneController.gomap_view_now);

router.route('/sales/registerUser').post(b2bShopCloneController.registerUser);
// router.route('/sales/forgot-password').post(b2bShopCloneController.forgotPassword);
// router.route('/sales/otpverify').post(b2bShopCloneController.verfiOtp);

// verify register Mobile OTP

router.route('/verify-RegisterOTP').post(b2bShopCloneController.verifyRegisterOTP);
router.route('/shopdetails/:id').get(b2bShopCloneController.getStreetAndShopDetails);

router
  .route('/attendanceclone/Admin/map/View/:id/:date/:fromtime/:totime')
  .get(b2bShopCloneController.getAllAttendanceCloneforMapView);

router.route('/update/data/approved/:id').put(authorization, b2bShopCloneController.updateShopStatusdataapproved);
router.route('/re/update/data/approved/:id').put(authorization, b2bShopCloneController.update_reverification);
router.route('/customer/update/data/approved/:id').put(authorization, b2bShopCloneController.update_reverification_custmer);
router.route('/update/phone/approved/:id').put(b2bShopCloneController.updateShopStatusphoneapproved);
router.route('/update/kyc/approved/:id').put(b2bShopCloneController.updateShopStatuskycapproved);
router.route('/getshopData/:id').get(b2bShopCloneController.getshopDataById);
router.route('/deleteshop/permenent/:id').delete(b2bShopCloneController.perdeleteShopById);
// shop search by shop Name

router.route('/shopSearch/:key').get(b2bShopCloneController.searchShops);
router.route('/getVendorShops/uyar-dial/:key').get(b2bShopCloneController.getVendorShops);

// salesmanShops
router
  .route('/getNotAssignReassignSalesman/data/:zone/:id/:street/:page/:limit/:uid/:date')
  .get(b2bShopCloneController.getNotAssignSalesManData);
router
  .route('/getnotAssignSalesmanDataMap/data/:zone/:id/:street/:uid/:date')
  .get(b2bShopCloneController.getnotAssignSalesmanDataMap);
router.route('/getShops/By/type/:id/:page').get(b2bShopCloneController.GetShopsByShopType);
router.route('/getShops/By/type/reviews/:id/:page').get(b2bShopCloneController.GetShopsReviewsByShopType);
router.route('/getShop/Review/ByShop/:id').get(b2bShopCloneController.getShopReviewByShopid);
router.route('/data1/data').put(b2bShopCloneController.data1);
router.route('/data2/data').put(b2bShopCloneController.data2);
router.route('/data3/data').put(b2bShopCloneController.data3);
router.route('/order/id').get(b2bShopCloneController.insertOrder);
router.route('/vendor/shop/:page').get(b2bShopCloneController.get_total_vendorShop);
router.route('/search/shops/bySname/:key').get(b2bShopCloneController.searchShops_By_Name);
router.route('/getshops/from/ward').get(b2bShopCloneController.get_wardby_shops);
router.route('/addpincode/update/DAdata').put(b2bShopCloneController.update_pincode);
router.route('/wardby/shop/assigned').get(b2bShopCloneController.ward_by_users);
router.route('/getuser/based/assignshops/dataapproved').get(b2bShopCloneController.get_userbased_dataapproved);
router.route('/getmapview/data/approved').get(b2bShopCloneController.managemap_data_approved);
router.route('/getmyshop/re/verification/byuser').get(authorization, b2bShopCloneController.reverifiction_byshop);
router.route('/get/shops/reassigin').get(b2bShopCloneController.get_reassign_temp);
router.route('/update/re/shops/reassigin/myshop').put(b2bShopCloneController.update_reassign_temp);
router.route('/get/datapproved/shops/assign').get(b2bShopCloneController.get_data_approved_date);
router.route('/get/approved/getall/reapproved/data').get(b2bShopCloneController.get_data_approved_details);
router.route('/get/pincode/all/group').get(b2bShopCloneController.get_updated_pincode);
router.route('/getshops/bypincode/all').get(b2bShopCloneController.get_shop_in_pincode);
router.route('/update/pincode').put(b2bShopCloneController.update_pincode_map);
router
  .route('/getindividual/SupplierAttendence/:user/:date/:page')
  .get(b2bShopCloneController.getindividualSupplierAttendence);
router.route('/Highly/IntrestedShops/:type').get(b2bShopCloneController.HighlyIntrestedShops);
router.route('/ChangeOneMap/AnotherMap').post(b2bShopCloneController.ChangeOneMap_to_AnotherMap);
router.route('/getRevertShops/onlyMap').get(b2bShopCloneController.getRevertShops);
router.route('/DummySort').post(b2bShopCloneController.DummySort);
router.route('/getShopByPincode/:pincode').get(b2bShopCloneController.getShopByPincode);
router.route('/get/final/map/view').get(b2bShopCloneController.finalmap_view);
router.route('/get/final/map/view/pincode').get(b2bShopCloneController.finalmap_view_picode);
router.route('/get/final/customer/final').get(b2bShopCloneController.get_final_customer_shops);
router.route('/getSales/Executives').get(b2bShopCloneController.getSalesExecutives);
module.exports = router;
