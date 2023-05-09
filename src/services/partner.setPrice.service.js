const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const ApiError = require('../utils/ApiError');
const { partnerPrice, PartnerProduct, ActiveCArt } = require('../models/partner.setPrice.models');
const { Product } = require('../models/product.model');
const moment = require('moment');

const SetPartnerPrice = async (body) => {
  let date = moment().format('YYYY-MM-dd');
  let time = moment().format('HH:mm a');
  let data = { ...body, ...{ date: date, time: time } };
  const creation = await partnerPrice.create(data);
  return creation;
};

const AddProductByPartner = async (body, partnerId) => {
  let date = moment().format('YYYY-MM-dd');
  let time = moment().format('HH:mm a');
  let data = { ...body, ...{ date: date, time: time, partnerId: partnerId } };
  const creation = await PartnerProduct.create(data);
  return creation;
};

const FetchProductbyPartner = async (partnerId, cartId) => {
  const data = await PartnerProduct.aggregate([
    {
      $match: {
        partnerId: partnerId,
        cartId: cartId,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $limit: 1,
    },
  ]);

  let arr = [];

  if (data.length != 0) {
    let val = data[0].product;
    for (let i = 0; i < val.length; i++) {
      let id = val[i];
      const productData = await Product.aggregate([
        {
          $match: { _id: id },
        },
      ]);
      arr.push(productData[0]);
    }
  }
  return arr;
};

const create_Active_cart = async (body, partnerId) => {
  await ActiveCArt.deleteOne({ partnerId: partnerId });
  let data = { ...body, ...{ partnerId: partnerId } };
  let values = await ActiveCArt.create(data);
  return values;
};

const getActiveCartBy_partner = async (partnerId) => {
  const data = await ActiveCArt.findOne({ partnerId: partnerId });
  return data;
};

module.exports = {
  SetPartnerPrice,
  AddProductByPartner,
  FetchProductbyPartner,
  create_Active_cart,
  getActiveCartBy_partner,
};
