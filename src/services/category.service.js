const httpStatus = require('http-status');
const { Category, Subcategory } = require('../models/category.model');
const ApiError = require('../utils/ApiError');

const createcategory = async (categoryBody) => {
  return Category.create(categoryBody);
};

const getAllCategory = async () => {
  return Category.find();
};
const subCreatecategory = async (subCategoryBody) => {
  return Subcategory.create(subCategoryBody);
};

const getAllSubCategory = async () => {
  return Subcategory.aggregate([
    {
      $lookup: {
        from: 'categories',
        localField: 'parentCategoryId',
        foreignField: '_id',
        as: 'cate',
      },
    },
    {
      $unwind: '$cate',
    },
    {
      $project: {
        subcategoryName: 1,
        id: 1,
        categoryName: '$cate.categoryName',
        description: 1,
        categoryImage: 1,
      },
    },
  ]);
};

const getcategoryById = async (id) => {
  const category = Category.findById(id);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category Not Found');
  }
  return category;
};

const getSubcategoryById = async (subcategoryId) => {
  const subcategory = await Subcategory.findById(subcategoryId);
  if (!subcategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'subCategory Not Found');
  }
  return subcategory;
};

const querycategory = async (filter, options) => {
  return Category.paginate(filter, options);
};

const updatecategoryById = async (categoryId, updateBody) => {
  let cate = await getcategoryById(categoryId);
  if (!cate) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  cate = await Category.findByIdAndUpdate({ _id: categoryId }, updateBody, { new: true });
  return cate;
};

const getproductWithCategory = async () => {
  return await Category.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'category',
        as: 'categoryData',
      },
    },
  ]);
};

const updateSubcategoryById = async (subcategoryId, updateBody) => {
  let subcate = await getSubcategoryById(subcategoryId);
  if (!subcate) {
    throw new ApiError(httpStatus.NOT_FOUND, 'subcategoryId not found');
  }
  subcate = await Subcategory.findByIdAndUpdate({ _id: subcategoryId }, updateBody, { new: true });
  return subcate;
};

const deletecategoryById = async (categoryId) => {
  const category = await getcategoryById(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  (category.active = false), (category.archive = true), await category.save();
  return category;
};

const categoryPagination = async (page) => {
  const cat = await Category.aggregate([
    // {
    //   $sort: { _id: -1 },
    // },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await Category.find().count();
  return {
    total: total,
    value: cat,
  };
};

const subcategoryPagination = async (page) => {
  const subCat = await Subcategory.aggregate([
    {
      $lookup: {
        from: 'categories',
        localField: 'parentCategoryId',
        foreignField: '_id',
        as: 'cate',
      },
    },
    {
      $unwind: '$cate',
    },
    {
      $project: {
        subcategoryName: 1,
        id: 1,
        categoryName: '$cate.categoryName',
        description: 1,
        categoryImage: 1,
      },
    },
    // {
    //   $sort: { _id: 1 },
    // },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await Subcategory.find().count();
  return {
    value: subCat,
    total: total,
  };
};

const deletesubcategoryById = async (subcategoryId) => {
  const subcategory = await getSubcategoryById(subcategoryId);
  if (!subcategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  (subcategory.active = false), (subcategory.archive = true), await subcategory.save();
  return subcategory;
};
const getsubcategoryusemain = async (subid) => {
  // const subcategory = await Subcategory.find({parentCategoryId:subid})
  const subcategory = await Subcategory.aggregate([
    {
      $match: { $and: [{ parentCategoryId: { $eq: subid } }] },
    },
  ]);
  return subcategory;
};

const categoryFilter = async (key) => {
  return Category.aggregate([
    {
      $match: {
        $and: [{ categoryName: { $regex: key, $options: 'i' } }],
      },
    },
  ]);
};

const getAllSubCategoryFilter = async (key) => {
  return Subcategory.aggregate([
    {
      $match: {
        $and: [{ subcategoryName: { $regex: key, $options: 'i' } }],
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'parentCategoryId',
        foreignField: '_id',
        as: 'cate',
      },
    },
    {
      $unwind: '$cate',
    },
    { $limit: 10 },
    {
      $project: {
        subcategoryName: 1,
        id: 1,
        categoryName: '$cate.categoryName',
        description: 1,
        categoryImage: 1,
      },
    },
  ]);
};

module.exports = {
  createcategory,
  subCreatecategory,
  getSubcategoryById,
  getAllSubCategory,
  getAllCategory,
  updateSubcategoryById,
  deletesubcategoryById,
  getcategoryById,
  updatecategoryById,
  deletecategoryById,
  querycategory,
  categoryPagination,
  subcategoryPagination,
  getsubcategoryusemain,
  getproductWithCategory,
  getAllSubCategoryFilter,
  categoryFilter,
};
