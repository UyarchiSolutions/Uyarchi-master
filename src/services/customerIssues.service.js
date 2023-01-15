const httpStatus = require('http-status');
const CustomeIssues = require('../models/customerIssues.model');
const ApiError = require('../utils/ApiError');
const moment = require('moment');

const createCustomerIssues = async (body) => {
  let values = { ...body, ...{ created: moment() } };
  const customerissues = await CustomeIssues.create(values);
  return customerissues;
};


const productData = async(page) =>{
  let data = await CustomeIssues.aggregate([
    // {
    //   $match: { _id: id },
    // },
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'productsData',
      },
    },
    {
      $unwind: '$productsData',
    },
    {
      $lookup: {
        from: 'shoporderclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shoporderclonesData',
      },
    },
    {
      $unwind: '$shoporderclonesData',
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shoporderclonesData.shopId',
        foreignField: '_id',
        as: 'b2bshopclonesData',
      },
    },
    {
      $unwind: '$b2bshopclonesData',
    },
    {
      $project: {
        product:'$productsData.productTitle',
        price:1,
        quantity:1,
        total:1,
        issue:1,
        OrderId:'$shoporderclonesData.OrderId',
        SName:'$b2bshopclonesData.SName',
        status:1,
        shoporderclonesId:'$shoporderclonesData._id'
      },
    },
    {
      $skip: 10 * parseInt(page),
    },
    {
      $limit: 10,
    },

  ])
  let total = await CustomeIssues.aggregate([
    // {
    //   $match: { _id: id },
    // },
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'productsData',
      },
    },
    {
      $unwind: '$productsData',
    },
    {
      $lookup: {
        from: 'shoporderclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shoporderclonesData',
      },
    },
    {
      $unwind: '$shoporderclonesData',
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shoporderclonesData.shopId',
        foreignField: '_id',
        as: 'b2bshopclonesData',
      },
    },
    {
      $unwind: '$b2bshopclonesData',
    },
    {
      $project: {
        product:'$productsData.productTitle',
        price:1,
        quantity:1,
        total:1,
        issue:1,
        OrderId:'$shoporderclonesData.OrderId',
        SName:'$b2bshopclonesData.SName',
        shoporderclonesId:'$shoporderclonesData._id'
      },
    },
    {
      $skip: 10 * parseInt(page),
    },
    {
      $limit: 10,
    },

  ])
  return {data:data, count:total.length}
}

const getById  = async (id) =>{
  const data = await CustomeIssues.findById(id)
  if(!data){
    throw new ApiError(httpStatus.NOT_FOUND, 'CustomerIssues nnot found');
  }
  return data
}

const updateCustomerId = async (id, updateBody) => {
  let data = await getById(id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'CustomerIssues not found');
  }
  data = await CustomeIssues.findByIdAndUpdate({ _id: id }, updateBody, { new: true });
  return data;
};

const updateRefund = async (id, updateBody) => {
  let data = await getById(id);

  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'CustomerIssues not found');
  }
  data = await CustomeIssues.findByIdAndUpdate({ _id: id }, {status:"refund"}, { new: true });
  return data;
};

const updateRedeliver = async (id, updateBody) => {
  let data = await getById(id);

  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'CustomerIssues not found');
  }
  data = await CustomeIssues.findByIdAndUpdate({ _id: id }, {status:"redeliver"}, { new: true });
  return data;
};

const updateReject = async (id, updateBody) => {
  let data = await getById(id);

  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'CustomerIssues not found');
  }
  data = await CustomeIssues.findByIdAndUpdate({ _id: id }, {status:"reject"}, { new: true });
  return data;
};


module.exports = {
  createCustomerIssues,
  productData,
  updateCustomerId,
  updateReject,
  updateRedeliver,
  updateRefund,
  getById,
};
