const express = require('express');
const DemoController = require('../../controllers/demoReg.controller');
const router = express.Router();


router.route('/').post(DemoController.createDemo)
router.route('/Fetch').get(DemoController.Fetch_All_Demo)



module.exports = router;