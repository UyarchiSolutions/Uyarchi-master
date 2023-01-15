const express = require('express');
const router = express.Router();
const lapsedController = require('../../controllers/lapsed.controller');

router.route('/').post(lapsedController.createLapsed);
module.exports = router;
