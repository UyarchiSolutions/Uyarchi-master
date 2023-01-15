const express = require('express');
const router = express.Router();
const authorization = require('../../controllers/tokenVerify.controller');
const MessageController = require('../../controllers/verifyMessage.controller');
router.route('/').get(authorization, MessageController.Message);

module.exports = router;
