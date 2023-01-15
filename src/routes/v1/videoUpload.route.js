const express = require('express');
const videoController = require('../../controllers/videoUpload.controller');
const router = express.Router();
const middlware = require('../../middlewares/video');

router.route('/').post(middlware.array('video'), videoController.createVideoUpload);
router.route('/:id').get(videoController.getvideoByShopId);
router.route('/shop/:id').get(videoController.get_Shop_VideoBy_ShopId);
module.exports = router;
