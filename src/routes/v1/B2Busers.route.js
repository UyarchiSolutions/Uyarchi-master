const express = require('express');
const b2bUsersController = require('../../controllers/B2BUser.Controller');
const router = express.Router();
const authorization = require('../../controllers/tokenVerify.controller');

router.post('/', b2bUsersController.createB2bUsers);
router.get('/All/:page', b2bUsersController.getAllUsers);
router.post('/login', b2bUsersController.B2bUsersLogin);
router.get('/logout', b2bUsersController.B2bUsersLogout);
router.route('/getForMyAccount').get(authorization, b2bUsersController.getForMyAccount);
router.route('/shopOrder/login').post(b2bUsersController.B2bUsersAdminLogin);
router.route('/:id').get(b2bUsersController.getUsersById);
// metaUser Route
router.route('/meta/user').post(b2bUsersController.createMetaUSers);
router
  .route('/metauser/:id')
  .get(b2bUsersController.getusermetaDataById)
  .put(b2bUsersController.updateMetaUsers)
  .delete(b2bUsersController.deleteMetaUser);
router.route('/changePassword').put(authorization, b2bUsersController.changePassword);
router.route('/getusers/salesExecute').get(b2bUsersController.getsalesExecuteRolesUsers);
router.route('/updatemeta/byuser').post(b2bUsersController.updatemetadata);
router.route('/forgot-password').post(b2bUsersController.forgotPassword);
router.route('/verfy-otp').post(b2bUsersController.verfiOtp);
router.route('/updateB2bUsers/:id').put(b2bUsersController.updateB2bUsers);
router.route('/getUsersById/allData/:id').get(b2bUsersController.getUsersDataById);
router.route('/delete/Users/:id').delete(b2bUsersController.deleteB2bUsersbyId);
router.route('/shopverification/asm').get(authorization, b2bUsersController.shopverification);

router.route('/getrolebyuser/userid').get(authorization, b2bUsersController.getrolebyuser_user);
router.route('/gettargetedusers/userid').get(authorization, b2bUsersController.gettargetedusers);
router.route('/getuser/filter/roles').get(authorization, b2bUsersController.gettargetedusers_credit);
router.route('/stationeryuser/getall').get(authorization, b2bUsersController.get_stationery_user);
router.route('/getdrivers/getall').get(authorization, b2bUsersController.get_drivers_all);
router.route('/delivery/executive').get(b2bUsersController.deliveryExecutive);
// third purchaseExecutive flow

router.route('/Purchase/Executivelogin').post(b2bUsersController.PurchaseExecutivelogin);
router.route('/send/OTP').post(b2bUsersController.sendOTP);
router.route('/otpVerfiy/PurchaseExecutive').post(b2bUsersController.otpVerfiyPurchaseExecutive);
router.route('/PurchaseExecutive/setPassword/:id').put(b2bUsersController.PurchaseExecutive_setPassword);
router.route('/supplier/Enrolls').get(b2bUsersController.supplierEnroll);
// salary Attendance
router.route('/getUser/Attendance/:page').get(b2bUsersController.getUserAttendance);
router.route('/getFines/Details/ByUsers/:id').get(b2bUsersController.getFines_Details);
// chatBot
router.route('/chatBotOtp').post(b2bUsersController.chatBotOtp);
router.route('/chatBotOtpVerify').post(b2bUsersController.chatBotOtpVerify);
module.exports = router;
