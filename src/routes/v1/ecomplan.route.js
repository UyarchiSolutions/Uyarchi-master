const express = require('express');
// const customerController = require('../../controllers/customer.controller');
const Ecomcontroller = require('../../controllers/ecomplan.controller');
const router = express.Router();
const supplierAuth = require('../../controllers/supplier.authorizations');
const multer = require('multer');
const ecommulter = require('../../middlewares/ecomstrean')
const shopverify = require('../../controllers/shoptokenverify.controller');
const subhostVerify = require('../../controllers/subhostVefify.controller');
const uploadimage = require('../../middlewares/upload');

const storage = multer.memoryStorage({
    destination: function (req, res, callback) {
        callback(null, '');
    },
});
const upload = multer({ storage }).single('teaser');
// plan APIS
router.route('/create/plan').post(Ecomcontroller.create_Plans)
router.route('/create/plan/addon').post(Ecomcontroller.create_Plans_addon)


router.route('/get/all/plan').get(Ecomcontroller.get_all_Plans)
router.route('/get/all/plan/pagination').get(Ecomcontroller.get_all_Plans_pagination)
router.route('/get/all/plan/normal').get(Ecomcontroller.get_all_Plans_normal)
router.route('/get/all/plan/addon').get(Ecomcontroller.get_all_Plans_addon)
router.route('/get/one/plan').get(Ecomcontroller.get_one_Plans)
router.route('/update/one/plan').put(Ecomcontroller.update_one_Plans)
router.route('/delete/one/plan').delete(Ecomcontroller.delete_one_Plans)

// post APIS
router.route('/create/post').post(supplierAuth, uploadimage.fields([{ name: 'galleryImages' }]), Ecomcontroller.create_post)
router.route('/create/post/teaser').post(upload, Ecomcontroller.create_post_teaser)
router.route('/get/all/post').get(supplierAuth, Ecomcontroller.get_all_post)
router.route('/get/all/post/pagenation').get(supplierAuth, Ecomcontroller.get_all_Post_with_page)

router.route('/get/one/post').get(supplierAuth, Ecomcontroller.get_one_post)
router.route('/update/one/post').put(supplierAuth, uploadimage.fields([{ name: 'galleryImages' }]), Ecomcontroller.update_one_post)
router.route('/delete/one/post').delete(supplierAuth, Ecomcontroller.delete_one_post)


// Stream Request APIS
router.route('/create/stream/one').post(supplierAuth, Ecomcontroller.create_stream_one)
router.route('/create/stream/one').put(supplierAuth, Ecomcontroller.find_and_update_one)
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
router.route('/subhost/assign/streams').get(subhostVerify, Ecomcontroller.get_subhost_streams)
router.route('/allot/stream/subhost').put(supplierAuth, Ecomcontroller.allot_stream_subhost)
router.route('/cancel/stream').put(supplierAuth, Ecomcontroller.cancel_stream)
router.route('/cancel/stream/admin').put(Ecomcontroller.cancel_stream)


// live Stream APIS


router.route('/golive/host/view').get(supplierAuth, Ecomcontroller.go_live_stream_host)
router.route('/golive/host/view/subhost').get(subhostVerify, Ecomcontroller.get_subhost_token)
router.route('/golive/subhost/view').get(subhostVerify, Ecomcontroller.go_live_stream_host_subhost)

router.route('/getAll/shop/live/stream').get(shopverify, Ecomcontroller.get_watch_live_steams)
router.route('/getAll/shop/live/stream/watch/admin').get(Ecomcontroller.get_watch_live_steams_admin_watch)
router.route('/watchlive/go/live').get(Ecomcontroller.get_watch_live_token)


//live Stream pre register


router.route('/stream/pre/register/live').post(shopverify, Ecomcontroller.regisetr_strean_instrest)
router.route('/stream/pre/unregister/live').post(shopverify, Ecomcontroller.unregisetr_strean_instrest)




// purchase Details

router.route('/purchase/details/pagination').get(Ecomcontroller.purchase_details)
router.route('/purchase/supplier/list').get(Ecomcontroller.purchase_details_supplier)



// purchase plan links

router.route('/purchase/link/plan').post(Ecomcontroller.purchase_link_plan)
router.route('/purchase/link/plan').get(Ecomcontroller.purchase_link_plan_get)


// get stream/posts

router.route('/get/stream/post/all').get(Ecomcontroller.get_stream_post)

router.route('/get/stream/all/alert').get(supplierAuth, Ecomcontroller.get_stream_alert)
router.route('/get/stream/cancel/admin').get(Ecomcontroller.get_cancel_stream)


// manage slab
router.route('/slab/create').post(Ecomcontroller.create_slab).get(Ecomcontroller.get_by_slab).put(Ecomcontroller.update_slab)



module.exports = router;
