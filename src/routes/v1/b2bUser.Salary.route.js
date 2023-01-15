const express = require('express');
const b2bUserSalaryInfo = require('../../controllers/b2bsalaryController');
const router = express.Router();
const authorization = require('../../controllers/tokenVerify.controller');

router.route('/').post(b2bUserSalaryInfo.createB2bSalaryInfo);
router.route('/getAll/:page').get(b2bUserSalaryInfo.getAllDataWithAggregation);
router.route('/:id').put(b2bUserSalaryInfo.updateuserStatus);
router.route('/getActiveUsers').get(b2bUserSalaryInfo.getActiveUsers);

module.exports = router;
