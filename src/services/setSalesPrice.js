const httpStatus = require('http-status');
const { SetSalesPrice } = require('../models');
const { Product } = require('../models/product.model');
const ApiError = require('../utils/ApiError');
const moment = require('moment');

const createSetSalesPrice = async (salepriceBody) => {
  const bodycontent = salepriceBody;
  //console.log(bodycontent);

  //console.log(bodycontent.product);
  const productId = bodycontent.product;
  let onlinePrice = bodycontent.onlinePrice;
  let salesmanPrice = bodycontent.salesmanPrice;
  let oldstock = bodycontent.oldstock;
  //console.log(oldstock);
  await Product.findByIdAndUpdate(
    { _id: productId },
    { onlinePrice: onlinePrice, salesmanPrice: salesmanPrice, oldstock: oldstock },
    { new: true }
  );

  return SetSalesPrice.create(salepriceBody);
};

const getSetSalesPriceByDate = async (date, id) => {
  const setSale = await SetSalesPrice.find({ date: date, product: id });
  return setSale;
};

const getAllSetSalesPrice = async () => {
  return SetSalesPrice.find();
};

const getdataByDateWise = async (datawise, id) => {
  //console.log(id);
  let ret = [];
  let count = datawise;
  let index = 0;
  if (count == 0) {
    index = 0;
  } else {
    index = count * 10;
  }
  for (let i = index; i < index + 10; i++) {
    let dates = new Date();
    dates.setDate(dates.getDate() - i);
    const setSale = await SetSalesPrice.find({ date: moment(dates).format('DD-MM-yyyy'), product: id });
    const date = moment(dates).format('DD-MM-yyyy');
    let row = {
      date: date,
      value: setSale,
    };
    ret.push(row);
  }
  return ret;
};

const getSetSalesPriceById = async (salesPriceId) => {
  const salePrice = await SetSalesPrice.findById(salesPriceId);
  if (!salePrice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'salePrice  Not Found');
  }
  return salePrice;
};

const updateSetSalesPriceById = async (salesPriceId, updateBody) => {
  let saleprice = await getSetSalesPriceById(salesPriceId);
  if (!saleprice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'saleprice not found');
  }
  saleprice = await SetSalesPrice.findByIdAndUpdate({ _id: salesPriceId }, updateBody, { new: true });
  return saleprice;
};

const deleteSetSalesPriceById = async (salesPriceId) => {
  const setSales = await getSetSalesPriceById(salesPriceId);
  if (!setSales) {
    throw new ApiError(httpStatus.NOT_FOUND, 'setSales not found');
  }
  (setSales.active = false), (setSales.archive = true), await setSales.save();
  return setSales;
};

module.exports = {
  createSetSalesPrice,
  getSetSalesPriceByDate,
  getAllSetSalesPrice,
  getSetSalesPriceById,
  updateSetSalesPriceById,
  deleteSetSalesPriceById,
  getdataByDateWise,
};
