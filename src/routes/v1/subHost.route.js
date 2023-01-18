const express = require('express');
const subHostController = require('../../controllers/subHost.controller');
const router = express.Router();

router.route('/').post(subHostController.createSubHost).get(subHostController.getActiveSubHosts);

module.exports = router;
