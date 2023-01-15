const express = require('express');
const slowController = require('../../controllers/slow.sample.controller');
const router = express.Router();

router.route('/attendanceClone/Admin/:id/:date/:fromtime/:totime/:page').get(slowController.getAlAttendanceClone);

module.exports = router;
