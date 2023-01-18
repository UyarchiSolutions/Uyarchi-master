const express = require('express');
const subHostController = require('../../controllers/subHost.controller');
const router = express.Router();

router.route('/').post(subHostController.createSubHost);

module.exports = router;
