const express = require('express');
const PuserSalaryInfoController = require('../../controllers/purchaseUserSalary.controller');

const router = express.Router();

router.route('/').post(PuserSalaryInfoController.createPusersalaryInfo).get(PuserSalaryInfoController.getAllPusers);
router
  .route('/:id')
  .get(PuserSalaryInfoController.getPusersalaryInfoById)
  .delete(PuserSalaryInfoController.deletePuserSalaryInfo)
  .put(PuserSalaryInfoController.updatePusersById);
router.route('/status/:id').put(PuserSalaryInfoController.updateUserStatus);
module.exports = router;
