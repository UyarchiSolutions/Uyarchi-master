const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { categoryService } = require('../services');
const { Category, Subcategory } = require('../models/category.model');

const createCategory = catchAsync(async (req, res) => {
  const { body } = req;

  const category = await categoryService.createcategory(body);
  if (req.files.length != 0) {
    let path = '';
    req.files.forEach(function (files, index, arr) {
      path = 'images/category/' + files.filename;
    });
    category.categoryImage = path;
  }
  await category.save();
  res.status(httpStatus.CREATED).send(category);
});

const categoryduplicte_check = async (req, res, next) => {
  const { body } = req;
  const product = await Category.findOne({
    categoryName: req.body.categoryName,
  }).collation({ locale: 'en', strength: 2 });
  //console.log(product);
  if (product) {
    return res.send(httpStatus.UNAUTHORIZED, 'Exist');
  }
  return next();
};

const subcategoryduplicte_check = async (req, res, next) => {
  const { body } = req;
  const product = await Subcategory.findOne({
    parentCategoryId: req.body.parentCategoryId,
    subcategoryName: req.body.subcategoryName,
  }).collation({ locale: 'en', strength: 2 });
  //console.log(product);
  if (product) {
    return res.send(httpStatus.UNAUTHORIZED, 'Exist');
  }
  return next();
};

const categoryPagination = catchAsync(async (req, res) => {
  const category = await categoryService.categoryPagination(req.params.page);
  res.send(category);
});
const subcategoryPagination = catchAsync(async (req, res) => {
  const category = await categoryService.subcategoryPagination(req.params.page);
  res.send(category);
});

const getproductWithCategory = catchAsync(async (req, res) => {
  const category = await categoryService.getproductWithCategory();
  res.send(category);
});

const getsubcategoryusemain = catchAsync(async (req, res) => {
  const subcategory = await categoryService.getsubcategoryusemain(req.params.id);
  res.send(subcategory);
});

const subcreateCategory = catchAsync(async (req, res) => {
  const { body } = req;
  const subcategory = await categoryService.subCreatecategory(body);
  if (req.files.length != 0) {
    let path = '';
    req.files.forEach(function (files, index, arr) {
      path = 'images/subcategory/' + files.filename;
    });
    subcategory.categoryImage = path;
  }
  await subcategory.save();
  res.status(httpStatus.CREATED).send(subcategory);
});

const getAllCategory = catchAsync(async (req, res) => {
  const cate = await categoryService.getAllCategory();
  res.send(cate);
});

const getAllSubCategory = catchAsync(async (req, res) => {
  const subcate = await categoryService.getAllSubCategory();
  res.send(subcate);
});

const getCategoryhDetailsById = catchAsync(async (req, res) => {
  const category = await categoryService.getcategoryById(req.params.categoryId);
  if (!category || category.active === false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Business_Details not found');
  }
  res.send(category);
});

const getSubCategoryhDetailsById = catchAsync(async (req, res) => {
  const subcategory = await categoryService.getSubcategoryById(req.params.subcategoryId);
  if (!subcategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SubCategory not found');
  }
  res.send(subcategory);
});

const updateCategory = catchAsync(async (req, res) => {
  const category = await categoryService.updatecategoryById(req.params.categoryId, req.body);
  if (req.files.length != 0) {
    let path = '';
    req.files.forEach(function (files, index, arr) {
      path = 'images/category/' + files.filename;
    });
    category.categoryImage = path;
  }
  if (req.body.removeimage == 'true') {
    category.categoryImage = '';
  }
  await category.save();
  res.send(category);
});

const updatesubCategory = catchAsync(async (req, res) => {
  const subcategory = await categoryService.updateSubcategoryById(req.params.subcategoryId, req.body);
  if (req.files.length != 0) {
    let path = '';
    req.files.forEach(function (files, index, arr) {
      path = 'images/subcategory/' + files.filename;
    });
    subcategory.categoryImage = path;
  }
  if (req.body.removeimage == 'true') {
    subcategory.categoryImage = '';
  }
  await subcategory.save();
  res.send(subcategory);
});

const deleteCategory = catchAsync(async (req, res) => {
  await categoryService.deletecategoryById(req.params.categoryId);
  res.status(httpStatus.NO_CONTENT).send();
});

const deleteSubCategory = catchAsync(async (req, res) => {
  await categoryService.deletesubcategoryById(req.params.subcategoryId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getAllSubCategoryFilter = catchAsync(async (req, res) => {
  const subcategory = await categoryService.getAllSubCategoryFilter(req.params.key);
  res.send(subcategory);
});

const categoryFilter = catchAsync(async (req, res) => {
  const category = await categoryService.categoryFilter(req.params.key);
  res.send(category);
});

module.exports = {
  createCategory,
  subcreateCategory,
  getAllCategory,
  getAllSubCategory,
  getSubCategoryhDetailsById,
  updatesubCategory,
  deleteSubCategory,
  getproductWithCategory,
  getCategoryhDetailsById,
  categoryPagination,
  updateCategory,
  subcategoryPagination,
  deleteCategory,
  getsubcategoryusemain,
  getAllSubCategoryFilter,
  categoryFilter,
  subcategoryduplicte_check,
  categoryduplicte_check,
};
