const express = require('express');
const router = express.Router();
const WLE_Controller = require('../../controllers/WLE.controller');
const authorization = require('../../controllers/tokenVerify.controller');
router.route('/SetPackedStatus').post(authorization,WLE_Controller.setPackedStatus_By_LoadingExecutice);

module.exports = router;
