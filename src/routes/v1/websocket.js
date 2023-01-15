const express = require('express');
const webSocketController = require('../../controllers/websocket.controller');

const router = express.Router();

router.route('/').get(webSocketController.web);

module.exports = router;
