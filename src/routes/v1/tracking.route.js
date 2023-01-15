const express = require('express');
const TrackingController = require('../../controllers/tracking.controller');
const router = express.Router();
const shopverify = require('../../controllers/shoptokenverify.controller');


router.route('/updatelocation/tracking').post(shopverify, TrackingController.updatelocation);
router.route('/').post(TrackingController.createTracking);
router.route('/:userId').put(TrackingController.updateTrackingById).get(TrackingController.getTrackingByUserById);
router.route('/getshop/:userId').get(TrackingController.gettracking);
router.route('/getusers/registered').get(TrackingController.getusers);
router.route('/getallloaction/all/:userId').get(TrackingController.gettrackingall);

module.exports = router;
