const express = require('express');
// const customerController = require('../../controllers/customer.controller');
const Ecomcontroller = require('../../controllers/ecomplan.controller');
const router = express.Router();
const supplierAuth = require('../../controllers/supplier.authorizations');
const multer = require('multer');
const ecommulter = require('../../middlewares/ecomstrean');
const shopverify = require('../../controllers/shoptokenverify.controller');
const subhostVerify = require('../../controllers/subhostVefify.controller');
const uploadimage = require('../../middlewares/upload');
const { SetPass, SellerAuth } = require('../../controllers/sellerAuth.controller');

const storage = multer.memoryStorage({
  destination: function (req, res, callback) {
    callback(null, '');
  },
});
const upload = multer({ storage }).single('teaser');
const changeVideo = multer({ storage }).single('video');
// plan APIS
router.route('/create/plan').post(Ecomcontroller.create_Plans);
router.route('/create/plan/addon').post(Ecomcontroller.create_Plans_addon);

router.route('/get/all/plan').get(Ecomcontroller.get_all_Plans);
router.route('/get/all/plan/pagination').get(Ecomcontroller.get_all_Plans_pagination);
router.route('/get/all/plan/normal').get(Ecomcontroller.get_all_Plans_normal);
router.route('/get/all/plan/addon').get(Ecomcontroller.get_all_Plans_addon);
router.route('/get/one/plan').get(Ecomcontroller.get_one_Plans);
router.route('/update/one/plan').put(Ecomcontroller.update_one_Plans);
router.route('/delete/one/plan').delete(Ecomcontroller.delete_one_Plans);

// post APIS
router.route('/create/post').post(SellerAuth, uploadimage.fields([{ name: 'galleryImages' }]), Ecomcontroller.create_post);
router.route('/create/post/teaser').post(upload, Ecomcontroller.create_post_teaser);
router.route('/get/all/post').get(SellerAuth, Ecomcontroller.get_all_post);
router.route('/get/all/post').get(SellerAuth, Ecomcontroller.get_all_post);
router.route('/get/all/post/pagenation').get(SellerAuth, Ecomcontroller.get_all_Post_with_page);
router.route('/get/stream/post/view').get(Ecomcontroller.get_post_view);



router.route('/get/one/post').get(SellerAuth, Ecomcontroller.get_one_post);
router
  .route('/update/one/post')
  .put(SellerAuth, uploadimage.fields([{ name: 'galleryImages' }]), Ecomcontroller.update_one_post);
router.route('/delete/one/post').delete(SellerAuth, Ecomcontroller.delete_one_post);
router.route('/remove/one/post').put(SellerAuth, Ecomcontroller.remove_one_post);

// Stream Request APIS
router.route('/create/stream/one').post(SellerAuth, Ecomcontroller.create_stream_one);
router.route('/create/stream/one').put(SellerAuth, Ecomcontroller.find_and_update_one);
router.route('/create/stream/one/image').post(ecommulter.single('image'), Ecomcontroller.create_stream_one_image);
router.route('/create/stream/one/video').post(upload, Ecomcontroller.create_stream_one_video);
router.route('/create/stream/two').post(SellerAuth, Ecomcontroller.create_stream_two);
router.route('/get/all/stream').get(SellerAuth, Ecomcontroller.get_all_stream);
router.route('/get/one/stream').get(SellerAuth, Ecomcontroller.get_one_stream);
router.route('/get/one/stream/assign/host').get(SellerAuth, Ecomcontroller.get_one_stream_assign_host);
router.route('/get/my/stream/step/two').get(SellerAuth, Ecomcontroller.get_one_stream_step_two);
router.route('/update/one/stream').put(SellerAuth, Ecomcontroller.update_one_stream);
router.route('/update/step/one/stream').put(SellerAuth, Ecomcontroller.update_one_stream_one);
router.route('/update/step/two/stream').put(SellerAuth, Ecomcontroller.update_one_stream_two);
router.route('/delete/one/stream').delete(SellerAuth, Ecomcontroller.delete_one_stream);
router.route('/getall/admin/streams').get(Ecomcontroller.get_all_admin);
router.route('/update/approved').put(Ecomcontroller.update_approved);
router.route('/update/reject').put(Ecomcontroller.update_reject);
router.route('/my/approved/streams').get(SellerAuth, Ecomcontroller.get_all_streams);
router.route('/subhost/assign/streams').get(SellerAuth, Ecomcontroller.get_subhost_streams);
router.route('/allot/stream/subhost').put(SellerAuth, Ecomcontroller.allot_stream_subhost);
router.route('/cancel/stream').put(SellerAuth, Ecomcontroller.cancel_stream);
router.route('/cancel/stream/admin').put(Ecomcontroller.cancel_stream);
router.route('/steam/end/now').put(Ecomcontroller.end_stream);

// live Stream APIS

router.route('/golive/host/view').get(SellerAuth, Ecomcontroller.go_live_stream_host);
router.route('/golive/host/view/subhost').get(SellerAuth, Ecomcontroller.get_subhost_token);
router.route('/golive/subhost/view').get(SellerAuth, Ecomcontroller.go_live_stream_host_subhost);

router.route('/getAll/shop/live/stream').get(shopverify, Ecomcontroller.get_watch_live_steams);
router.route('/getAll/shop/live/stream/upcoming').get(shopverify, Ecomcontroller.get_watch_live_steams_upcoming);
router.route('/getAll/shop/live/stream/current').get(shopverify, Ecomcontroller.get_watch_live_steams_current);
router.route('/getAll/shop/live/stream/upcoming/byid').get(shopverify, Ecomcontroller.get_watch_live_steams_upcoming_byid);
router.route('/getAll/shop/live/stream/interested').get(shopverify, Ecomcontroller.get_watch_live_steams_interested);
router.route('/getAll/shop/live/stream/completed').get(shopverify, Ecomcontroller.get_watch_live_steams_completed);
router.route('/getAll/shop/live/stream/watch/admin').get(Ecomcontroller.get_watch_live_steams_admin_watch);
router.route('/watchlive/go/live').get(Ecomcontroller.get_watch_live_token);
router.route('/homepage/streamdatails/all').get(shopverify, Ecomcontroller.getall_homeage_streams);
router.route('/on/going/stream').get(shopverify, Ecomcontroller.on_going_stream);

//live Stream pre register

router.route('/stream/pre/register/live').post(shopverify, Ecomcontroller.regisetr_strean_instrest);
router.route('/stream/pre/unregister/live').post(shopverify, Ecomcontroller.unregisetr_strean_instrest);

// purchase Details

router.route('/purchase/details/pagination').get(Ecomcontroller.purchase_details);
router.route('/purchase/supplier/list').get(Ecomcontroller.purchase_details_supplier);

// purchase plan links

router.route('/purchase/link/plan').post(Ecomcontroller.purchase_link_plan);
router.route('/purchase/link/plan').get(Ecomcontroller.purchase_link_plan_get);

// get stream/posts

router.route('/get/stream/post/all').get(Ecomcontroller.get_stream_post);

router.route('/get/stream/all/alert').get(SellerAuth, Ecomcontroller.get_stream_alert);
router.route('/get/stream/cancel/admin').get(Ecomcontroller.get_cancel_stream);
router.route('/get/admin/completed/stream').get(Ecomcontroller.get_completed_stream);
router.route('/get/admin/completed/stream/byid').get(Ecomcontroller.get_completed_stream_byid);
router.route('/get/buyer/completed/stream/byid').get(Ecomcontroller.get_completed_stream_buyer);

// manage slab
router
  .route('/slab/create')
  .post(Ecomcontroller.create_slab)
  .get(Ecomcontroller.get_by_slab)
  .put(Ecomcontroller.update_slab);
router.route('/slab/getall').get(Ecomcontroller.getallslab);

// after Completed Stream Supplier Flow

router.route('/getStock_Manager/:page').get(SellerAuth, Ecomcontroller.getStock_Manager);
router.route('/getPosted_Details_By_Stream/:id').get(Ecomcontroller.getPosted_Details_By_Stream);
router.route('/fetchStream/details/:id').get(Ecomcontroller.fetchStream_Details_ById);

// intimation Buyer Flow

router.route('/fetch/Stream/Ordered/Details/:id').get(Ecomcontroller.fetch_Stream_Ordered_Details);
router.route('/update/Status/For/StreamingOrders/:id').put(Ecomcontroller.update_Status_For_StreamingOrders);
router.route('/fetch/streaming/Details/Approval').get(Ecomcontroller.fetch_streaming_Details_Approval);
router.route('/update/Multiple/approval/Status').post(Ecomcontroller.update_Multiple_approval_Status);
router.route('/update/approval/Status/:id').put(Ecomcontroller.update_approval_Status);
router.route('/update/productOrders/:id').put(Ecomcontroller.update_productOrders);
router.route('/update/Multiple/productOrders').post(Ecomcontroller.update_Multiple_productOrders);

// Buyer Flow
router.route('/fetch/Stream/Details/For/Buyer').get(shopverify, Ecomcontroller.fetch_Stream_Details_For_Buyer);
router.route('/update/joined/status/:id').put(shopverify, Ecomcontroller.update_Joined_User_Status_For_Buyer);
router.route('/fetch/Stream/Product/Details/:id').get(Ecomcontroller.fetch_Stream_Product_Details);
router.route('/fetch/stream/Payment/Details/:id').get(Ecomcontroller.fetch_stream_Payment_Details);
router.route('/getStreaming/orders/By/orders/:id').get(Ecomcontroller.getStreaming_orders_By_orders);
router.route('/getStreaming/orders/By_orders/for/pay/:id').get(Ecomcontroller.getStreaming_orders_By_orders_for_pay);
router.route('/multipleCancel').post(Ecomcontroller.multipleCancel);

// Account Manager Flow
router.route('/getOrder/For/Account/Manager/:id').get(Ecomcontroller.getOrder_For_Account_Manager);
router.route('/getDetails/:id').get(Ecomcontroller.getDetails);

// notification Detailss
router.route('/get/notification/getall/count').get(shopverify, Ecomcontroller.get_notification_count);
router.route('/get/notification/viewed').put(shopverify, Ecomcontroller.get_notification_viewed);
router.route('/get/notification/getall').get(shopverify, Ecomcontroller.get_notification_getall);

// const changeVideoupload = multer({ dest: 'uploads/' });
const changeVideoupload = multer({ storage: multer.memoryStorage() });

// after live stream videos
router.route('/get/post/after/complete/stream').get(Ecomcontroller.get_stream_post_after_live_stream);
router.route('/update/start/end/time').put(Ecomcontroller.update_start_end_time);

router.route('/update/video/post').put(changeVideo, Ecomcontroller.video_upload_post);

router.route('/get/video/link').get(changeVideo, Ecomcontroller.get_video_link);

// Loading manager

router.route('/loading-manager/get-order-details/:id').get(Ecomcontroller.get_order_details_by_stream);

module.exports = router;
