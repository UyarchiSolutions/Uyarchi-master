const express = require('express');
const router = express.Router();
const controller = require('../../../controllers/liveStreaming/videoconvert.controllers');


router.route('/video').get(controller.video_convert_now);




module.exports = router;
