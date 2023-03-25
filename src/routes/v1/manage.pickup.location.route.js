const express = require('express');
const managePickupController = require('../../controllers/manage.pickup.location.controller');
const router = express.Router();
const pickup = require('../../middlewares/pickup');
const authorization = require('../../controllers/tokenVerify.controller');
router.route('/').post(authorization, pickup.array('photoCapture'), managePickupController.createManagePickupLocation);

router.route('/getAll/:userId/:date/:page').get(managePickupController.getAllManagepickup);
router.route('/:id').get(managePickupController.getManagePickupById);
router.route('/update/pickup').put(managePickupController.update_pickup_location);
router.route('/getAll/pickup/:userId/:date/:todate').get(managePickupController.getAllManagepickupLocation);

router.route('/getAll/pickuploaction').get(authorization, managePickupController.getallPickuplocation);
router.route('/getAll/pickuploaction/orders').get( managePickupController.getallPickuplocation_orders);

router.route('/get/near/pickuplocation').get(managePickupController.getNearbypickuplocation);

module.exports = router;
