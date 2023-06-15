const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const shopEnrollmentEnquiryService = require('../services/shopEnrollmentEnquiry.service');

const createEnquiry = catchAsync(async (req, res) => {
    let userId = req.userId;
    //console.log(userId);
  const data = await shopEnrollmentEnquiryService.createEnquiry(userId, req.body);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ShopEnrollmentEnquiry Not Fount');
  }
  res.status(httpStatus.CREATED).send(data);
});


const getAllEnquiryDatas = catchAsync(async (req, res) => {
    const data = await shopEnrollmentEnquiryService.getAllEnquiryDatas(req.params.pincode, req.params.page);
    res.send(data);
  });

const updateEnquiryById = catchAsync(async (req, res) => {
    const data = await shopEnrollmentEnquiryService.updateEnquiryById(req.params.id, req.body);
    res.send(data);
});



const AssignShops = catchAsync(async (req, res) => {
  const data = await shopEnrollmentEnquiryService.AssignShops(req.body);
  res.send(data);
});

const pincode = catchAsync(async (req, res) => {
    const data = await shopEnrollmentEnquiryService.pincode();
    res.send(data);
  });

  const viewdatagetById = catchAsync(async (req, res) => {
    const data = await shopEnrollmentEnquiryService.viewdatagetById(req.userId);
    res.send(data);
  });

  const createShops = catchAsync(async (req, res) => {
  const data = await shopEnrollmentEnquiryService.createShops(req.body);
//   //console.log(req.files)
  if (req.files) {
    req.files.forEach(function (files, index, arr) {
        data.photoCapture.push('images/shopClone/' + files.filename);
    });
  }
  res.send(data);
  await data.save();
});

const getAllSupplierDatas = catchAsync(async (req, res) => {
    const data = await shopEnrollmentEnquiryService.getAllSupplierDatas();
    res.send(data);
  });

  const getIdEnquiryShops = catchAsync(async (req, res) => {
    const data = await shopEnrollmentEnquiryService.getIdEnquiryShops(req.params.id);
    res.send(data);
  });

  const createSupplierEnquiry = catchAsync(async (req, res) => {
    //console.log(req.userId)
    const data = await shopEnrollmentEnquiryService.createSupplierEnquiry(req.userId, req.body);
    res.send(data);
  });

  const product = catchAsync(async (req, res) => {
    const data = await shopEnrollmentEnquiryService.product(req.params.id);
    res.send(data);
  });

module.exports = {
    createEnquiry,
    getAllEnquiryDatas,
    updateEnquiryById,
    AssignShops,
    pincode,
    viewdatagetById,
    createShops,
    getAllSupplierDatas,
    getIdEnquiryShops,
    createSupplierEnquiry,
    product,
};
