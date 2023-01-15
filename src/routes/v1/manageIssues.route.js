const express = require('express');
const manageIssuesController = require('../../controllers/manageIssues.controller');
const router = express.Router();

router.route('/').post(manageIssuesController.createManageIssues).get(manageIssuesController.getAllManageIssues);
router
  .route('/:manageIssuesId')
  .get(manageIssuesController.getManageIssuesById)
  .delete(manageIssuesController.deleteManageIssuesById)
  .put(manageIssuesController.updateManageIssues);

module.exports = router;
