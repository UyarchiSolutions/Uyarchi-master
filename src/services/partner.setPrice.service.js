const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const ApiError = require('../utils/ApiError');
const {
  partnerPrice,
  PartnerProduct,
  ActiveCArt,
  PartnercartPostOrder,
  partnerCartOrderProducts,
} = require('../models/partner.setPrice.models');
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

const create_PartnerShopOrder = async (body, partnerId) => {
  const { products, cartId, date } = body;
  let findOrders = await PartnercartPostOrder.find({ date: date }).count();
  let center = '';
  if (findOrders < 9) {
    center = '0000';
  }
  if (findOrders < 99 && findOrders >= 9) {
    center = '000';
  }
  if (findOrders < 999 && findOrders >= 99) {
    center = '00';
  }
  if (findOrders < 9999 && findOrders >= 999) {
    center = '0';
  }
  let count = findOrders + 1;
  let orderId = `OD${center}${count}`;
  let createOrders = { ...body, ...{ orderId: orderId, partnerId: partnerId } };
  let orderCreations = await PartnercartPostOrder.create(createOrders);
  orderCreations.products.map(async (e) => {
    let values;
    values = {
      orderId: orderCreations.orderId,
      productId: e._id,
      productName: e.ProductTitle,
      cartId: cartId,
      QTY: parseInt(e.qty),
    };
    await partnerCartOrderProducts.create(values);
  });
  return orderCreations;
};

module.exports = {
  SetPartnerPrice,
  AddProductByPartner,
  FetchProductbyPartner,
  create_Active_cart,
  getActiveCartBy_partner,
  create_PartnerShopOrder,
};
