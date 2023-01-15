const express = require('express');
// const customerController = require('../../controllers/customer.controller');
const Ecomcontroller = require('../../controllers/ecomplan.controller');
const router = express.Router();
const supplierAuth = require('../../controllers/supplier.authorizations');
const multer=require('multer');
const ecommulter=require('../../middlewares/ecomstrean')

// plan APIS
router.route('/create/plan').post(Ecomcontroller.create_Plans)
router.route('/get/all/plan').get(Ecomcontroller.get_all_Plans)
router.route('/get/one/plan').get(Ecomcontroller.get_one_Plans)
router.route('/update/one/plan').put(Ecomcontroller.update_one_Plans)
router.route('/delete/one/plan').delete(Ecomcontroller.delete_one_Plans)

// post APIS
router.route('/create/post').post(supplierAuth,Ecomcontroller.create_post)
router.route('/get/all/post').get(supplierAuth,Ecomcontroller.get_all_post)
router.route('/get/one/post').get(supplierAuth,Ecomcontroller.get_one_post)
router.route('/update/one/post').put(supplierAuth,Ecomcontroller.update_one_post)
router.route('/delete/one/post').delete(supplierAuth,Ecomcontroller.delete_one_post)


// const storage = multer.memoryStorage({
//     destination: function (req, res, callback) {
//         callback(null, '');
//     },
    
// });
// const upload = multer({ storage }).single('image');


// Stream Request APIS
router.route('/create/stream/one').post(supplierAuth,Ecomcontroller.create_stream_one)
router.route('/create/stream/one/image').post(ecommulter.single('image') ,Ecomcontroller.create_stream_one_image)
router.route('/create/stream/two').post(supplierAuth,Ecomcontroller.create_stream_two)
router.route('/get/all/stream').get(supplierAuth,Ecomcontroller.get_all_stream)
router.route('/get/one/stream').get(supplierAuth,Ecomcontroller.get_one_stream)
router.route('/get/my/stream/step/two').get(supplierAuth,Ecomcontroller.get_one_stream_step_two)
router.route('/update/one/stream').put(supplierAuth,Ecomcontroller.update_one_stream)
router.route('/update/step/one/stream').put(supplierAuth,Ecomcontroller.update_one_stream_one)
router.route('/update/step/two/stream').put(supplierAuth,Ecomcontroller.update_one_stream_two)
router.route('/delete/one/stream').delete(supplierAuth,Ecomcontroller.delete_one_stream)
router.route('/getall/admin/streams').get(Ecomcontroller.get_all_admin)
router.route('/update/approved').put(Ecomcontroller.update_approved)
router.route('/update/reject').put(Ecomcontroller.update_reject)
router.route('/my/approved/streams').get(supplierAuth,Ecomcontroller.get_all_streams)


// live Stream APIS


router.route('/golive/host/view').get(supplierAuth,Ecomcontroller.go_live_stream_host)

router.route('/getAll/shop/live/stream').get(Ecomcontroller.get_watch_live_steams)
router.route('/watchlive/go/live').get(Ecomcontroller.get_watch_live_token)



module.exports = router;
