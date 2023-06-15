const brand = require('../models/brand.model');

const createbrand = async (brandBody) => {
  return brand.create(brandBody);
};

const getAllBrandFilter = async (key) => {
  return brand.aggregate([
    {
      $match: {
        $and: [{ brandname: { $regex: key, $options: 'i' } }],
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categorydata',
      },
    },
    {
      $unwind: '$categorydata',
    },
    {
      $lookup: {
        from: 'subcategories',
        localField: 'subcategory',
        foreignField: '_id',
        as: 'subcategorydata',
      },
    },
    {
      $unwind: '$subcategorydata',
    },
    {
      $project: {
        _id: 1,
        brandname: 1,
        subcategory: '$subcategorydata.subcategoryName',
        category: '$categorydata.categoryName',
        image: 1,
      },
    },
    { $limit: 10 },
  ]);
};

const brandPagination = async (page) => {
  const brands = await brand.aggregate([
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categorydata',
      },
    },
    {
      $unwind: '$categorydata',
    },
    {
      $lookup: {
        from: 'subcategories',
        localField: 'subcategory',
        foreignField: '_id',
        as: 'subcategorydata',
      },
    },
    {
      $unwind: '$subcategorydata',
    },
    {
      $project: {
        _id: 1,
        brandname: 1,
        subcategory: '$subcategorydata.subcategoryName',
        category: '$categorydata.categoryName',
        image: 1,
      },
    },
    // {
    //   $sort: { _id: 1 },
    // },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);

  let total = await brand.find().count();
  return {
    value: brands,
    total: total,
  };
};

const getbrand = async () => {
  return brand.aggregate([
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categorydata',
      },
    },
    {
      $unwind: '$categorydata',
    },
    {
      $lookup: {
        from: 'subcategories',
        localField: 'subcategory',
        foreignField: '_id',
        as: 'subcategorydata',
      },
    },
    {
      $unwind: '$subcategorydata',
    },
    {
      $project: {
        _id: 1,
        brandname: 1,
        subcategory: '$subcategorydata.subcategoryName',
        category: '$categorydata.categoryName',
        image: 1,
      },
    },
  ]);
};

const getBrandById = async (id) => {
  //console.log(id);
  const brands = await brand.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'categories',
        pipeline: [],
        as: 'categorydata',
      },
    },
    {
      $lookup: {
        from: 'subcategories',
        localField: 'category',
        foreignField: 'parentCategoryId',
        as: 'subcategorydata',
      },
    },
  ]);
  if (brands.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'brand not found');
  }

  return brands[0];
};

const getcategorySubCategories = async (categoryId, subcategoryId) => {
  const brands = await brand.aggregate([
    {
      $match: {
        $and: [{ category: { $eq: categoryId } }],
      },

      $match: {
        $and: [{ subcategory: { $eq: subcategoryId } }],
      },
    },
  ]);
  return brands;
};

const updateBrandById = async (brandId, updateBody) => {
  let cate = await getBrandById(brandId);
  if (!cate) {
    throw new ApiError(httpStatus.NOT_FOUND, 'brand not found');
  }
  cate = await brand.findByIdAndUpdate({ _id: brandId }, updateBody, { new: true });
  return cate;
};

module.exports = {
  createbrand,
  getbrand,
  getBrandById,
  brandPagination,
  getcategorySubCategories,
  updateBrandById,
  getAllBrandFilter,
};
