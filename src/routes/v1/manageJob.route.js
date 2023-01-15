const express = require('express');
const manageJobController  = require('../../controllers/manageJob.controller') ;
const router = express.Router();
const jobresume = require('../../middlewares/jobresume')


router.route('/create/user/job').
post(jobresume.fields([{name: 'resume'}]),manageJobController.createUserId);
router.route('/get/data/job').get(manageJobController.getdata);
router.route('/create/enquire').post(manageJobController.createEnquiry);
router.route('/get/getdataEqu').get(manageJobController.getdataEqu)

module.exports = router;

