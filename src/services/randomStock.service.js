const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const moment = require('moment');
const randomStockModel = require('../models/randomStock.model');
const { Product } = require('../models/product.model');

const getProduct = async () => {
  let productName = await Product.aggregate([
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'productid',
        as: 'clonedProducts',
      },
    },
    {
      $project: {
        _id: 1,
        productTitle: 1,
      },
    },
  ]);
  return productName;
};

const createrandomStock = async (body) => {
  let time = moment().format('hh:mm a');
  let date = moment().format('yyyy-MM-DD');
  let created = moment();
  let datas = {
    time : time,
    date : date,
    created : created,
  };
  let bodyData = { ...datas, ...body};
  return randomStockModel.create(bodyData);
};

const getAll = async (product, date) => {
  let match;
  if (product != 'null' && date != 'null') {
    match = [{ product: { $eq: product } }, { date: { $eq: date } }, { active: { $eq: true } }];
  } else if (product != 'null') {
    match = [{ product: { $eq: product } }, { active: { $eq: true } }];
   
  } else if (date != 'null') {
    match = [{ date: { $eq: date } }, { active: { $eq: true } }];
  } else {
    match = [{ product: { $ne: null } }, { active: { $eq: true } }];
  }

  let values = await randomStockModel.aggregate([
    {
      $match: {
        $and: match,
       
      }
    
      
    },
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'clonedProducts',
      },
    },
    {
      $unwind: '$clonedProducts',
    },
    {
      $lookup: {
        from: 'destroystocks',
        localField: '_id',
        foreignField: 'product',
        as: 'destroystocksData'
      }
    },
    {
      $project: {
        NSFQ1: 1,
        NSFQ2: 1,
        NSFQ3: 1,
        NSFW_Wastage: 1,
        product: 1,
        productTitle: '$clonedProducts.productTitle',
        _id: 1,
        date: 1,
        time: 1,
        wastedImageFile:1,
        quantityToDestroy:1,
        status:1,
        totalDestroyCount: {  $sum:"$destroystocksData.quantityToDestroy"},
        result: { 
          $subtract: [ "$NSFW_Wastage",  {$sum:"$destroystocksData.quantityToDestroy"} ] } 
      //   equal : {
      //     $ne : [{$sum:"$destroystocksData.quantityToDestroy"}, "$NSFW_Wastage"] 
      // },
        
      },
    },
    // {
    //   $match : {
    //       equal : true   
    //   }
    // }
  ]);
  return values;
};

const getProductNameDetails = async () => {
  let values = await randomStockModel.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'productName',
      },
    },
    {
      $unwind: '$productName',
    },
    // { $group : { _id : "$product" ,Names : { $addToSet : "$productName.productTitle" } }}
  
  ]);
  let datas = await randomStockModel.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'productName',
      },
    },
    {
      $unwind: '$productName',
    },
    {
      $project: {
        NSFQ1: 1,
        NSFQ2: 1,
        NSFQ3: 1,
        NSFW_Wastage: 1,
        wastedImageFile: 1,
        product: 1,
        _id: 1,
        productName: '$productName.productTitle',
       
       
      },
    },
  ]);
  return { values: values, datas:datas }
};

module.exports = {
  getProduct,
  createrandomStock,
  getAll,
  getProductNameDetails,
};
