const express = require('express');
const statusController = require('../../controllers/status.controoler');
const router = express.Router();

router.route('/').post(statusController.createStatus);
router.route('/:statusId').put(statusController.updateStatusById);
router.route('/approved/:date').get(statusController.getApprovedProductDateWise);
module.exports = router;
