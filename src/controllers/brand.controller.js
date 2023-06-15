const brand = require('../services/brand.service');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const brandModel = require('../models/brand.model');

const createbrand = catchAsync(async (req, res) => {
  const { body } = req;
  //console.log(body);
  const brands = await brand.createbrand(body);
  if (req.files.length != 0) {
    let path = '';
    req.files.forEach(function (files, index, arr) {
      path = 'images/brands/' + files.filename;
    });
    brands.image = path;
  }

  await brands.save();

  res.status(httpStatus.CREATED).send(brands);
});

const getbrand = catchAsync(async (req, res) => {
  const brands = await brand.getbrand(req.body);
  if (!brands) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Assign Not Fount');
  }
  res.status(httpStatus.CREATED).send(brands);
});

const getcategorySubCategories = catchAsync(async (req, res) => {
  const brands = await brand.getcategorySubCategories(req.params.categoryId, req.params.subcategoryId);
  res.send(brands);
});

const getBrandServicebyId = catchAsync(async (req, res) => {
  const business = await brand.getBrandById(req.params.brandId);
  // if (!business || !business.active === true) {
  //   throw new ApiError(httpStatus.NOT_FOUND, 'Brand not found');
  // }
  res.send(business);
});

const brandPagination = catchAsync(async (req, res) => {
  const brands = await brand.brandPagination(req.params.page);
  res.send(brands);
});

const updateShop = catchAsync(async (req, res) => {
  const brands = await brand.updateBrandById(req.params.brandId, req.body);
  if (req.files.length != 0) {
    let path = '';
    req.files.forEach(function (files, index, arr) {
      path = 'images/brands/' + files.filename;
    });
    brands.image = path;
  }
  if (req.body.removeimage == 'true') {
    brands.image = '';
  }
  res.send(brands);
  await brands.save();
});

const doplicte_check = async (req, res, next) => {
  const { body } = req;
  const product = await brandModel
    .findOne({
      subcategory: req.body.subcategory,
      category: req.body.category,
      // $text:{$search:req.body.productTitle, $caseSensitive:false}
      brandname: req.body.brandname,
    })
    .collation({ locale: 'en', strength: 2 });
  //console.log(product);
  if (product) {
    return res.send(httpStatus.UNAUTHORIZED, 'Exist');
  }
  return next();
};

const getAllBrandFilter = catchAsync(async (req, res) => {
  const brands = await brand.getAllBrandFilter(req.params.key);
  res.send(brands);
});

module.exports = {
  createbrand,
  getbrand,
  getcategorySubCategories,
  getBrandServicebyId,
  updateShop,
  brandPagination,
  doplicte_check,
  getAllBrandFilter,
};
