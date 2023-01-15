const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const Ecomserive = require('../services/ecomplan.service');

const create_Plans = catchAsync(async (req, res) => {
  const value = await Ecomserive.create_Plans(req);
  res.send(value);
});
const get_all_Plans = catchAsync(async (req, res) => {
  const value = await Ecomserive.get_all_Plans(req);
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
  const value = await Ecomserive.create_post(req);
  res.send(value);
});
const get_all_post = catchAsync(async (req, res) => {
  const value = await Ecomserive.get_all_Post(req);
  res.send(value);
});

const get_one_post = catchAsync(async (req, res) => {
  const value = await Ecomserive.get_one_Post(req);
  res.send(value);
});
const update_one_post = catchAsync(async (req, res) => {
  const value = await Ecomserive.update_one_Post(req);
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

const create_stream_one_image = catchAsync(async (req, res) => {
  console.log(req.files)
  // const value = await Ecomserive.create_stream_one_image(req);
  res.send({mzsd:"sa"});
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
const update_one_stream_one= catchAsync(async (req, res) => {
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

const get_all_admin= catchAsync(async (req, res) => {
  const value = await Ecomserive.get_all_admin(req);
  res.send(value);
});
const update_approved= catchAsync(async (req, res) => {
  const value = await Ecomserive.update_approved(req);
  res.send(value);
});
const update_reject= catchAsync(async (req, res) => {
  const value = await Ecomserive.update_reject(req);
  res.send(value);
});

const get_all_streams= catchAsync(async (req, res) => {
  console.log("sdas")
  const value = await Ecomserive.get_all_streams(req);
  res.send(value);
});

const go_live_stream_host= catchAsync(async (req, res) => {
  console.log("sdas")
  const value = await Ecomserive.go_live_stream_host(req);
  res.send(value);
});


const get_watch_live_steams= catchAsync(async (req, res) => {
  console.log("sdas")
  const value = await Ecomserive.get_watch_live_steams(req);
  res.send(value);
});

const get_watch_live_token= catchAsync(async (req, res) => {
  console.log("sdas")
  const value = await Ecomserive.get_watch_live_token(req);
  res.send(value);
});

module.exports = {
  create_Plans,
  get_all_Plans,
  get_one_Plans,
  update_one_Plans,
  delete_one_Plans,
  create_post,
  get_all_post,
  get_one_post,
  update_one_post,
  delete_one_post,

  
  create_stream_one,
  create_stream_two,
  get_all_stream,
  get_one_stream,
  update_one_stream,
  delete_one_stream,
  create_stream_one_image,
  get_one_stream_step_two,
  update_one_stream_two,
  update_one_stream_one,
  get_all_admin,
  update_approved,
  update_reject,
  get_all_streams,


  go_live_stream_host,
  get_watch_live_steams,
  get_watch_live_token

};
