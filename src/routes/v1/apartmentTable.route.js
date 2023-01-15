const express = require('express');
const apartmentController = require('../../controllers/apartmentTable.controller');
const shopImage = require('../../middlewares/shopImage');
const apartmentImage = require('../../middlewares/apartmentImage');
const manageUserAttendance = require('../../middlewares/manageUserAttendanceImage');
// const userValidation = require('../../validations/user.validation');

const router = express.Router();

router.route('/').post(apartmentImage.array('photoCapture'), apartmentController.createapartmentTableService);

router.route('/table/:id/:districtId/:zoneId/:wardId/:streetId/:status/:page').get(apartmentController.getAllApartmentTable);
router.route('/shop').post(shopImage.array('photoCapture'), apartmentController.createshopTableService);
router.route('/allShop/table/:id/:districtId/:zoneId/:wardId/:streetId/:status/:page').get(apartmentController.getAllShop);
router.route('/manageUserAttendance').post(apartmentController.createManageUserAttendanceService);
router
  .route('/shopAndApartment/same/:id/:districtId/:zoneId/:wardId/:streetId/:status/:page')
  .get(apartmentController.getallShopApartment);
// router.route('/getAllAttendance').get(validate(userValidation.getUsersAttendance), apartmentController.getManageUserAttendance);
router.route('/getAllAttendance/:ID/:DATE/:TIME/:PAGE').get(apartmentController.getmanageUSerAttendanceAll);
router.route('/Search').post(apartmentController.getSearchUser);
router.route('/getAllAttendance/:id/:date/:fromtime/:totime/:page').get(apartmentController.getmanageUSerAttendanceAll);
router.route('/Search').post(apartmentController.getSearchUser);
router
  .route('/manageUserAttendanceAuto')
  .post(apartmentController.createManageUserAttendanceAutoService)
  .get(apartmentController.getAllmanageUserAttendanceAuto);
router.route('/manageUserAttendanceAuto/table/:id/:date/:page').get(apartmentController.getmanageUSerAttendanceAllAutoTable);
router
  .route('/:apartmentId')
  .get(apartmentController.getApartmentById)
  .put(apartmentImage.array('photoCapture'), apartmentController.updateApartment)
  .delete(apartmentController.deleteApartment);

router
  .route('/shop/:shopId')
  .get(apartmentController.getShopById)
  .put(shopImage.array('photoCapture'), apartmentController.updateShop)
  .delete(apartmentController.deleteshop);
router.route('/apartment/aggregation').get(apartmentController.shopApartmentAggregation);
router.route('/allDataCount/all').get(apartmentController.getAllCount);
router.route('/attendance/lat/long/:id/:date1/:date2').get(apartmentController.getAttendanceLong);
router.route('/apartment/streetIdAll/IdAndStreet/uid/:id/:streetId').get(apartmentController.getApartmentUserAndStreet);
router.route('/shop/streetIdAll/IdAndStreet/uid/:id/:streetId').get(apartmentController.getShopUserAndStreet);
router.route('/attendance/Allattendance').get(apartmentController.getAllAttendance);
// thirdpartyapi
router.route('/groupmap/:from/:to').get(apartmentController.groupMapService);
router.route('/locationmap/:location/:radius/:type/:keyword').get(apartmentController.locationMapService);
router.route('/data/:location').get(apartmentController.WardApi);
router.route('/data/:longi/:lati/:data').get(apartmentController.WardNoApi2);
router.route('/data/try/catch').get(apartmentController.getWardDataForDB);
router.route('/streetSearch/:searchArea').get(apartmentController.getAllSearchApi);
router.route('/wardApi/:location').get(apartmentController.wardApiWardApi);
router.route('/getAllLatLang/AllStreet').get(apartmentController.getAllLATLONG);
router.route('/chennai/decodes').get(apartmentController.chennai_corporation_decodes);

module.exports = router;
