const express = require('express');
const AssignController = require('../../controllers/assign.controller');
const router = express.Router();

router.route('/').post(AssignController.createAssign).get(AssignController.getAllAssign);

router
  .route('/:assignId')
  .get(AssignController.getAssignbyId)
  .put(AssignController.updateAssignById)
  .delete(AssignController.deleteAssignById);

module.exports = router;
