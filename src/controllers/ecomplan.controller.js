const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const Ecomserive = require('../services/ecomplan.service');

const create_Plans = catchAsync(async (req, res) => {
  const value = await Ecomserive.create_Plans(req);
  res.send(value);
});
const create_Plans_addon = catchAsync(async (req, res) => {
  const value = await Ecomserive.create_Plans_addon(req);
  res.send(value);
});
const get_all_Plans = catchAsync(async (req, res) => {
  const value = await Ecomserive.get_all_Plans(req);
  res.send(value);
});

const get_all_Plans_pagination = catchAsync(async (req, res) => {
  const value = await Ecomserive.get_all_Plans_pagination(req);
  res.send(value);
});

const get_all_Plans_addon = catchAsync(async (req, res) => {
  const value = await Ecomserive.get_all_Plans_addon(req);
  res.send(value);
});
const get_all_Plans_normal = catchAsync(async (req, res) => {
  const value = await Ecomserive.get_all_Plans_normal(req);
  res.send(value);
});
const get_one_Plans = catchAsync(async (req, res) => {
  const value = await Ecomserive.get_one_Plans(req);
  res.send(value);
});
const update_one_Plans = catchAsync(async (req, res) => {
  const value = await Ecomserive.update_one_Plans(req);
  res.send(value);
});
const delete_one_Plans = catchAsync(async (req, res) => {
  const value = await Ecomserive.delete_one_Plans(req);
  res.send(value);
});

const create_post = catchAsync(async (req, res) => {
  let images = [];
  if (req.files) {
    let path = '';
    path = 'images/';
    if (req.files.galleryImages != null) {
      req.files.galleryImages.forEach((e) => {
        images.push(path + e.filename);
      });
    }
  }
  console.log(images)
  const value = await Ecomserive.create_post(req, images);
  res.send(value);
});
const create_post_teaser = catchAsync(async (req, res) => {
  const value = await Ecomserive.create_teaser_upload(req);
  res.send(value);
});
const get_all_post = catchAsync(async (req, res) => {
  const value = await Ecomserive.get_all_Post(req);
  res.send(value);
});
const get_all_Post_with_page = catchAsync(async (req, res) => {
  const value = await Ecomserive.get_all_Post_with_page(req);
  res.send(value);
});
const get_one_post = catchAsync(async (req, res) => {
  const value = await Ecomserive.get_one_Post(req);
  res.send(value);
});
const update_one_post = catchAsync(async (req, res) => {
  console.log(req.files)
  let images = [];
  if (req.files) {
    let path = '';
    path = 'images/';
    if (req.files.galleryImages != null) {
      req.files.galleryImages.forEach((e) => {
        images.push(path + e.filename);
      });
    }
  }
  const value = await Ecomserive.update_one_Post(req, images);
  res.send(value);
});
const delete_one_post = catchAsync(async (req, res) => {
  const value = await Ecomserive.delete_one_Post(req);
  res.send(value);
});

const create_stream_one = catchAsync(async (req, res) => {
  const value = await Ecomserive.create_stream_one(req);
  res.send(value);
});

const find_and_update_one = catchAsync(async (req, res) => {
  const value = await Ecomserive.find_and_update_one(req);
  res.send(value);
});


const create_stream_one_image = catchAsync(async (req, res) => {
  console.log('asdasasas')
  console.log(req.file)
  const value = await Ecomserive.create_stream_one_image(req);
  res.send(value);
});

const create_stream_one_video = catchAsync(async (req, res) => {
  console.log('asdasasas')
  console.log(req.file)
  const value = await Ecomserive.create_stream_one_video(req);
  res.send(value);
});

const create_stream_two = catchAsync(async (req, res) => {
  const value = await Ecomserive.create_stream_two(req);
  res.send(value);
});
const get_all_stream = catchAsync(async (req, res) => {
  const value = await Ecomserive.get_all_stream(req);
  res.send(value);
});
const get_one_stream = catchAsync(async (req, res) => {
  console.log("asdaszas")
  const value = await Ecomserive.get_one_stream(req);
  res.send(value);
});

const get_one_stream_step_two = catchAsync(async (req, res) => {
  console.log("zas")
  const value = await Ecomserive.get_one_stream_step_two(req);
  res.send(value);
});
const update_one_stream = catchAsync(async (req, res) => {
  const value = await Ecomserive.update_one_stream(req);
  res.send(value);
});
const update_one_stream_one = catchAsync(async (req, res) => {
  const value = await Ecomserive.update_one_stream_one(req);
  res.send(value);
});
const update_one_stream_two = catchAsync(async (req, res) => {
  const value = await Ecomserive.update_one_stream_two(req);
  res.send(value);
});
const delete_one_stream = catchAsync(async (req, res) => {
  const value = await Ecomserive.delete_one_stream(req);
  res.send(value);
});

const get_all_admin = catchAsync(async (req, res) => {
  const value = await Ecomserive.get_all_admin(req);
  res.send(value);
});
const update_approved = catchAsync(async (req, res) => {
  const value = await Ecomserive.update_approved(req);
  res.send(value);
});
const update_reject = catchAsync(async (req, res) => {
  const value = await Ecomserive.update_reject(req);
  res.send(value);
});

const get_all_streams = catchAsync(async (req, res) => {
  console.log("sdas")
  const value = await Ecomserive.get_all_streams(req);
  res.send(value);
});
const get_subhost_streams = catchAsync(async (req, res) => {
  console.log("sdas")
  const value = await Ecomserive.get_subhost_streams(req);
  res.send(value);
});
const allot_stream_subhost = catchAsync(async (req, res) => {
  console.log("sdas")
  const value = await Ecomserive.allot_stream_subhost(req);
  res.send(value);
});

const cancel_stream = catchAsync(async (req, res) => {
  console.log("sdas")
  const value = await Ecomserive.cancel_stream(req);
  res.send(value);
});


const go_live_stream_host = catchAsync(async (req, res) => {
  console.log("sdas")
  const value = await Ecomserive.go_live_stream_host(req, req.userId);
  res.send(value);
});

const get_subhost_token = catchAsync(async (req, res) => {
  console.log("sdas")
  const value = await Ecomserive.get_subhost_token(req, req.subhostId);
  res.send(value);
});


const go_live_stream_host_subhost = catchAsync(async (req, res) => {
  console.log("sdas")
  const value = await Ecomserive.go_live_stream_host_SUBHOST(req, req.createdBy);
  res.send(value);
});


const get_watch_live_steams = catchAsync(async (req, res) => {
  console.log("sdas")
  const value = await Ecomserive.get_watch_live_steams(req);
  res.send(value);
});

const get_watch_live_steams_admin_watch = catchAsync(async (req, res) => {
  console.log("sdas")
  const value = await Ecomserive.get_watch_live_steams_admin_watch(req);
  res.send(value);
});

const get_watch_live_token = catchAsync(async (req, res) => {
  console.log("sdas")
  const value = await Ecomserive.get_watch_live_token(req);
  res.send(value);
});

const regisetr_strean_instrest = catchAsync(async (req, res) => {
  console.log("sdas")
  const value = await Ecomserive.regisetr_strean_instrest(req);
  res.send(value);
});

const unregisetr_strean_instrest = catchAsync(async (req, res) => {
  console.log("sdas")
  const value = await Ecomserive.unregisetr_strean_instrest(req);
  res.send(value);
});

const purchase_details = catchAsync(async (req, res) => {
  console.log("sdas")
  const value = await Ecomserive.purchase_details(req);
  res.send(value);
});


const purchase_details_supplier = catchAsync(async (req, res) => {
  const value = await Ecomserive.purchase_details_supplier(req);
  res.send(value);
});

const purchase_link_plan = catchAsync(async (req, res) => {
  const value = await Ecomserive.purchase_link_plan(req);
  res.send(value);
});

const purchase_link_plan_get = catchAsync(async (req, res) => {
  const value = await Ecomserive.purchase_link_plan_get(req);
  res.send(value);
});

const get_stream_post = catchAsync(async (req, res) => {
  const value = await Ecomserive.get_stream_post(req);
  res.send(value);
});
const get_stream_alert = catchAsync(async (req, res) => {
  const value = await Ecomserive.get_stream_alert(req);
  res.send(value);
});
const get_cancel_stream = catchAsync(async (req, res) => {
  const value = await Ecomserive.get_cancel_stream(req);
  res.send(value);
});

const get_completed_stream = catchAsync(async (req, res) => {
  let value;
  let status = req.query.status;
  if (status == 'upcomming') {
    value = await Ecomserive.get_completed_stream_upcommming(req);
  }
  if (status == 'live') {
    value = await Ecomserive.get_completed_stream_live(req);
  }
  if (status == 'completed') {
    value = await Ecomserive.get_completed_stream_completed(req);
  }
  if (status == 'expired') {
    value = await Ecomserive.get_completed_stream_expired(req);
  }
  if (status == 'removed') {
    value = await Ecomserive.get_completed_stream_removed(req);
  }
  if (status == 'cancelled') {
    value = await Ecomserive.get_completed_stream_cancelled(req);
  }
  res.send(value);
});

const get_completed_stream_byid = catchAsync(async (req, res) => {
  const value = await Ecomserive.get_completed_stream_byid(req);
  res.send(value);
});
const create_slab = catchAsync(async (req, res) => {
  const value = await Ecomserive.create_slab(req);
  res.send(value);
});

const get_by_slab = catchAsync(async (req, res) => {
  const value = await Ecomserive.get_by_slab(req);
  res.send(value);
});

const getallslab = catchAsync(async (req, res) => {
  const value = await Ecomserive.getallslab(req);
  res.send(value);
});


const update_slab = catchAsync(async (req, res) => {
  const value = await Ecomserive.update_slab(req);
  res.send(value);
});


module.exports = {
  create_Plans,
  create_Plans_addon,
  get_all_Plans,
  get_all_Plans_addon,
  get_all_Plans_normal,
  get_one_Plans,
  update_one_Plans,
  delete_one_Plans,
  create_post,
  get_all_post,
  get_one_post,
  update_one_post,
  delete_one_post,
  get_all_Post_with_page,
  create_post_teaser,


  create_stream_one,
  find_and_update_one,
  create_stream_two,
  get_all_stream,
  get_one_stream,
  update_one_stream,
  delete_one_stream,
  create_stream_one_image,
  create_stream_one_video,
  get_one_stream_step_two,
  update_one_stream_two,
  update_one_stream_one,
  get_all_admin,
  update_approved,
  update_reject,
  get_all_streams,
  get_subhost_token,
  get_subhost_streams,
  get_all_Plans_pagination,
  allot_stream_subhost,
  cancel_stream,
  get_completed_stream,
  get_completed_stream_byid,


  go_live_stream_host,
  get_watch_live_steams,
  get_watch_live_steams_admin_watch,
  get_watch_live_token,


  // 
  regisetr_strean_instrest,
  unregisetr_strean_instrest,
  go_live_stream_host_subhost,



  purchase_details,
  purchase_details_supplier,


  purchase_link_plan,
  purchase_link_plan_get,


  get_stream_post,
  get_stream_alert,
  get_cancel_stream,



  create_slab,
  get_by_slab,
  update_slab,
  getallslab

};
