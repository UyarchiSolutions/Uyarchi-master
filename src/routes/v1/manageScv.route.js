const express = require('express');
const manageScvController = require('../../controllers/manageScv.controller');

const router = express.Router();

router.route('/').post(manageScvController.createManageScv).get(manageScvController.getAllManageSCVOrders);
router
  .route('/:manageScvId')
  .get(manageScvController.getManageSCVById)
  .delete(manageScvController.deleteManageScvOrdersById)
  .put(manageScvController.updateManageScvById);

module.exports = router;
