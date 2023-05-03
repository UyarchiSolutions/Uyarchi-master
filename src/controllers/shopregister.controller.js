const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const moment = require('moment');
const catchAsync = require('../utils/catchAsync');
const registerShop = require('../services/shopregister.service');
const tokenService = require('../services/token.service');
const AWS = require('aws-sdk');
const { ShopOrder, ProductorderSchema, ShopOrderClone, ProductorderClone } = require('../models/shopOrder.model');

const register_shop = catchAsync(async (req, res) => {
  const shop = await registerShop.register_shop(req.body);
  res.status(httpStatus.CREATED).send(shop);
});

const forget_password = catchAsync(async (req, res) => {
  const shop = await registerShop.forget_password(req.body);
  res.status(httpStatus.CREATED).send(shop);
});

const verify_otp = catchAsync(async (req, res) => {
  const otp = await registerShop.verify_otp(req.body);
  res.status(httpStatus.CREATED).send(otp);
});

const set_password = catchAsync(async (req, res) => {
  const password = await registerShop.set_password(req.body);
  res.status(httpStatus.CREATED).send(password);
});

const change_password = catchAsync(async (req, res) => {
  const password = await registerShop.change_password(req.body, req.shopId);
  res.status(httpStatus.CREATED).send(password);
});

const login_now = catchAsync(async (req, res) => {
  const shop = await registerShop.login_now(req.body);
  const tokens = await tokenService.generateAuthTokens_shop(shop);

  res.status(httpStatus.CREATED).send(tokens);
});

const get_myDetails = catchAsync(async (req, res) => {
  const shop = await registerShop.get_myDetails(req);
  res.status(httpStatus.CREATED).send(shop);
});
const get_myorder = catchAsync(async (req, res) => {
  const shop = await registerShop.get_myorder(req, req.query);
  res.status(httpStatus.CREATED).send(shop);
});
const get_mypayments = catchAsync(async (req, res) => {
  const shop = await registerShop.get_mypayments(req);
  res.status(httpStatus.CREATED).send(shop);
});

const getpayment_history = catchAsync(async (req, res) => {
  const shop = await registerShop.getpayment_history(req.shopId, req.params.id);
  res.status(httpStatus.CREATED).send(shop);
});

const get_pendung_amount = catchAsync(async (req, res) => {
  const shop = await registerShop.get_pendung_amount(req.shopId, req.params.id);
  res.status(httpStatus.CREATED).send(shop);
});
const get_orderamount = catchAsync(async (req, res) => {
  const shop = await registerShop.get_orderamount(req.shopId, req.body);
  res.status(httpStatus.CREATED).send(shop);
});

const get_raiseonissue = catchAsync(async (req, res) => {
  const shop = await registerShop.get_raiseonissue(req.shopId);
  res.status(httpStatus.CREATED).send(shop);
});
const get_raiseorder_issue = catchAsync(async (req, res) => {
  const shop = await registerShop.get_raiseorder_issue(req.shopId, req.params.id);
  res.status(httpStatus.CREATED).send(shop);
});
const get_my_issue_byorder = catchAsync(async (req, res) => {
  const shop = await registerShop.get_my_issue_byorder(req.shopId, req.params.id);
  res.status(httpStatus.CREATED).send(shop);
});

const get_raiseproduct = catchAsync(async (req, res) => {
  let shop = await registerShop.get_raiseproduct(req.shopId, req.params.id, req.body);
  const s3 = new AWS.S3({
    accessKeyId: 'AKIA3323XNN7Y2RU77UG',
    secretAccessKey: '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',
    region: 'ap-south-1',
  });
  let Data = [];
  req.files.forEach((e) => {
    let params = {
      Bucket: 'realestatevideoupload',
      Key: e.originalname,
      Body: e.buffer,
    };
    s3.upload(params, async (err, data) => {
      if (err) {
        res.status(500).send(err);
      } else {
        Data.push(data);
        if (Data.length === req.files.length) {
          await ProductorderClone.findByIdAndUpdate({ _id: req.params.id }, { $set: { videos: [] } }, { new: true });
          Data.forEach(async (e) => {
            await ProductorderClone.findByIdAndUpdate(
              { _id: req.params.id },
              { $push: { videos: e.Location } },
              { new: true }
            );
          });
        }
      }
    });
  });
  res.status(httpStatus.CREATED).send(shop);
});

const get_myissues = catchAsync(async (req, res) => {
  const shop = await registerShop.get_myissues(req.shopId, req.params.id, req.body);
  res.status(httpStatus.CREATED).send(shop);
});

const getmyorder_byId = catchAsync(async (req, res) => {
  const shop = await registerShop.getmyorder_byId(req.shopId, req.query);
  res.status(httpStatus.CREATED).send(shop);
});

const cancelorder_byshop = catchAsync(async (req, res) => {
  const shop = await registerShop.cancelorder_byshop(req.shopId, req.query);
  res.status(httpStatus.CREATED).send(shop);
});

const cancelbyorder = catchAsync(async (req, res) => {
  const shop = await registerShop.cancelbyorder(req.shopId, req.query);
  res.status(httpStatus.CREATED).send(shop);
});

const imageUpload_For_Issues = catchAsync(async (req, res) => {
  const shop = await registerShop.imageUpload_For_Issues(req.params.id, req.body);
  if (req.files) {
    if (req.files.length != 0) {
      let images = [];
      req.files.forEach(function (files, index, arr) {
        images.push('images/issue/' + files.filename);
      });
      shop.image = images;
      shop.save();
    }
  }
  res.send(shop);
});

const getIssuedProduct = catchAsync(async (req, res) => {
  const data = await registerShop.getIssuedProduct(req.params.id);
  res.send(data);
});

const getissuedOrders = catchAsync(async (req, res) => {
  const data = await registerShop.getissuedOrders(req.params.page);
  res.send(data);
});

const update_profile = catchAsync(async (req, res) => {
  const data = await registerShop.update_profile(req);
  res.send(data);
});

const update_changepassword= catchAsync(async (req, res) => {
  const data = await registerShop.update_changepassword(req);
  res.send(data);
});

const get_my_orders_all= catchAsync(async (req, res) => {
  const data = await registerShop.get_my_orders_all(req);
  res.send(data);
});

const get_my_orders_single= catchAsync(async (req, res) => {
  const data = await registerShop.get_my_orders_single(req);
  res.send(data);
});


module.exports = {
  register_shop,
  verify_otp,
  set_password,
  login_now,
  get_myDetails,
  get_myorder,
  change_password,
  get_mypayments,
  getpayment_history,
  get_pendung_amount,
  get_orderamount,
  get_raiseonissue,
  get_raiseorder_issue,
  get_raiseproduct,
  get_myissues,
  get_my_issue_byorder,
  getmyorder_byId,
  cancelorder_byshop,
  cancelbyorder,
  forget_password,
  imageUpload_For_Issues,
  getIssuedProduct,
  getissuedOrders,
  update_profile,
  update_changepassword,
  get_my_orders_all,
  get_my_orders_single
};
