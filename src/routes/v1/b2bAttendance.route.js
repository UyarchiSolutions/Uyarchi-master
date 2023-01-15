const express = require('express');
const attendanceController = require('../../controllers/b2bAttendance.controller');
const router = express.Router();

router.route('/').post(attendanceController.createAttendance);
router.route('/getAll/:page').get(attendanceController.getAll);
router.route('/editById/:id').put(attendanceController.updateAttendance);
router.route('/getSalaryInfo/:page').get(attendanceController.getSalaryInfo);
router.route('/getEmpName/:input').get(attendanceController.getempName);

module.exports = router;
