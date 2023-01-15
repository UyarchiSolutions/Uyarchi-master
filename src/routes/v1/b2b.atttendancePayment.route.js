const express = require('express');
const attendancePayemntController = require('../../controllers/b2b.attendancePayment.controller');
const router = express.Router();

router.route('/addPayment').post(attendancePayemntController.createAttendancePayment);

module.exports = router;
