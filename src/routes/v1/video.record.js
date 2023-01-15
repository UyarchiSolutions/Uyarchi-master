const express = require('express');
const videoController = require('../../controllers/recorder.controller');

const router = express.Router();

router.route('/').post(videoController.createVideoToken).get(videoController.getVideoToken);
router.route('/greeting').get(videoController.greeting);

module.exports = router;
