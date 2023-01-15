const express = require('express');
const manageUserController = require('../../controllers/manageUser.controller');
const uploadImage = require('../../middlewares/uploadImage');
const proof = require('../../middlewares/proof');
// const upload = require('../../middlewares/upload')
const router = express.Router();

router
  .route('/')
  .post(
    proof.fields([{ name: 'idProofUpload' }, { name: 'addressProofUpload' }, { name: 'twoWheelerUpload' }]),
    manageUserController.createmanageUserService
  );
router.route('/').get(manageUserController.getmanageUserServiceAll);
router.route('/login').post(manageUserController.login);
router.route('/:id/:districtId/:zoneId/:wardId/:status/:page').get(manageUserController.getAllManageUserTable);
router.route('/manageUserAllData/all').get(manageUserController.getmanageUserServiceAllenable);
router
  .route('/manageUserStreet/all/count/:id/:streetId/:status/:page')
  .get(manageUserController.getmanageUserServiceByIdstatus);
router
  .route('/:manageUserId')
  .get(manageUserController.getmanageUserServiceById)
  .put(
    proof.fields([{ name: 'idProofUpload' }, { name: 'addressProofUpload' }, { name: 'twoWheelerUpload' }]),
    manageUserController.updatemanageUserService
  )
  .delete(manageUserController.deletemanageUserService);

module.exports = router;
