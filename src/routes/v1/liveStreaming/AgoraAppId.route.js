const express = require('express');
const validate = require('../../../middlewares/validate');
const authValidation = require('../../../validations/auth.validation');
const authController = require('../../../controllers/auth.controller');
const auth = require('../../../middlewares/auth');

const router = express.Router();
const AgoraAppId = require('../../../controllers/liveStreaming/AgoraAppId.controller');

router.post('/insert/app/id', AgoraAppId.InsertAppId);


module.exports = router;
