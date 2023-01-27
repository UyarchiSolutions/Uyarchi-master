const express = require('express');
// const customerController = require('../../controllers/customer.controller');
const Ecomcontroller = require('../../controllers/ecomplan.controller');
const router = express.Router();
const supplierAuth = require('../../controllers/supplier.authorizations');
const multer = require('multer');
const ecommulter = require('../../middlewares/ecomstrean')
const shopverify = require('../../controllers/shoptokenverify.controller');
const subhostVerify = require('../../controllers/subhostVefify.controller');

// plan APIS
router.route('/create/plan').post(Ecomcontroller.create_Plans)
router.route('/create/plan/addon').post(Ecomcontroller.create_Plans_addon)


router.route('/get/all/plan').get(Ecomcontroller.get_all_Plans)
router.route('/get/all/plan/normal').get(Ecomcontroller.get_all_Plans_normal)
router.route('/get/all/plan/addon').get(Ecomcontroller.get_all_Plans_addon)
router.route('/get/one/plan').get(Ecomcontroller.get_one_Plans)
router.route('/update/one/plan').put(Ecomcontroller.update_one_Plans)
router.route('/delete/one/plan').delete(Ecomcontroller.delete_one_Plans)

// post APIS
router.route('/create/post').post(supplierAuth, Ecomcontroller.create_post)
router.route('/get/all/post').get(supplierAuth, Ecomcontroller.get_all_post)
router.route('/get/one/post').get(supplierAuth, Ecomcontroller.get_one_post)
router.route('/update/one/post').put(supplierAuth, Ecomcontroller.update_one_post)
router.route('/delete/one/post').delete(supplierAuth, Ecomcontroller.delete_one_post)


const storage = multer.memoryStorage({
    destination: function (req, res, callback) {
        callback(null, '');
    },

});
const upload = multer({ storage }).single('teaser');
// Stream Request APIS
router.route('/create/stream/one').post(supplierAuth, Ecomcontroller.create_stream_one)
router.route('/create/stream/one/image').post(ecommulter.single('image'), Ecomcontroller.create_stream_one_image)
router.route('/create/stream/one/video').post(upload, Ecomcontroller.create_stream_one_video)
router.route('/create/stream/two').post(supplierAuth, Ecomcontroller.create_stream_two)
router.route('/get/all/stream').get(supplierAuth, Ecomcontroller.get_all_stream)
router.route('/get/one/stream').get(supplierAuth, Ecomcontroller.get_one_stream)
router.route('/get/my/stream/step/two').get(supplierAuth, Ecomcontroller.get_one_stream_step_two)
router.route('/update/one/stream').put(supplierAuth, Ecomcontroller.update_one_stream)
router.route('/update/step/one/stream').put(supplierAuth, Ecomcontroller.update_one_stream_one)
router.route('/update/step/two/stream').put(supplierAuth, Ecomcontroller.update_one_stream_two)
router.route('/delete/one/stream').delete(supplierAuth, Ecomcontroller.delete_one_stream)
router.route('/getall/admin/streams').get(Ecomcontroller.get_all_admin)
router.route('/update/approved').put(Ecomcontroller.update_approved)
router.route('/update/reject').put(Ecomcontroller.update_reject)
router.route('/my/approved/streams').get(supplierAuth, Ecomcontroller.get_all_streams)


// live Stream APIS


router.route('/golive/host/view').get(supplierAuth, Ecomcontroller.go_live_stream_host)
router.route('/golive/subhost/view').get(subhostVerify, Ecomcontroller.go_live_stream_host_subhost)

router.route('/getAll/shop/live/stream').get(shopverify, Ecomcontroller.get_watch_live_steams)
router.route('/watchlive/go/live').get(Ecomcontroller.get_watch_live_token)


//live Stream pre register


router.route('/stream/pre/register/live').post(shopverify, Ecomcontroller.regisetr_strean_instrest)
router.route('/stream/pre/unregister/live').post(shopverify, Ecomcontroller.unregisetr_strean_instrest)



module.exports = router;
