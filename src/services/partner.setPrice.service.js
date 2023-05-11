const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const ApiError = require('../utils/ApiError');
const {
  partnerPrice,
  PartnerProduct,
  ActiveCArt,
  PartnercartPostOrder,
  partnerCartOrderProducts,
  UpdateStock,
} = require('../models/partner.setPrice.models');
const { ScvCart } = require('../models/Scv.mode');
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
      orderId: orderCreations._id,
      productId: e._id,
      productName: e.ProductTitle,
      cartId: cartId,
      QTY: parseInt(e.qty),
      date: date,
    };
    await partnerCartOrderProducts.create(values);
  });
  return orderCreations;
};

const getOrdersbycart = async (cartId) => {
  const orders = await PartnercartPostOrder.aggregate([
    {
      $match: {
        cartId: cartId,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $lookup: {
        from: 'scvcarts',
        localField: 'cartId',
        foreignField: '_id',
        as: 'carts',
      },
    },
  ]);

  const cartDetails = await ScvCart.findById(cartId);
  return { orders: orders, cartDetails: cartDetails };
};

const getOrderedProducts = async (cartId, date) => {
  console.log(date);
  let data = await partnerCartOrderProducts.distinct('productId');
  let values = [];
  for (let i = 0; i < data.length; i++) {
    let id = data[i];
    let datas = await partnerCartOrderProducts.aggregate([
      {
        $match: {
          cartId: cartId,
          productId: id,
          date: date,
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'products',
        },
      },
      {
        $unwind: {
          preserveNullAndEmptyArrays: true,
          path: '$products',
        },
      },
    ]);
    if (datas[0] != null) {
      values.push(datas[0]);
    }
  }

  let cartDetails = await ScvCart.findById(cartId);

  return { values: values, cartDetails: cartDetails };
};

const updateAddOnStock = async (body) => {
  const date = moment().format('dd-MM-YYYY');
  const time = moment().format('HH:mm a');

  if (body.message) {
    body.arr.forEach(async (e) => {
      let getValues = await partnerCartOrderProducts.findById(e._id);
      let totalvalue = getValues.balanceQTY ? getValues.balanceQTY : 0 + e.balanceqty;
      await partnerCartOrderProducts.findByIdAndUpdate({ _id: e._id }, { balanceQTY: totalvalue }, { new: true });
      await UpdateStock.create({
        date: date,
        time: time,
        orderId: e.orderId,
        orderProductId: e._id,
        cartId: e.cartId,
        givenQTY: e.givenQTY,
        balanceQTY: e.balanceQTY,
      });
    });
  } else {
    body.forEach(async (e) => {
      let getValues = await partnerCartOrderProducts.findById(e._id);
      let totalvalue = parseInt(getValues.givenQTY ? getValues.givenQTY : 0 + e.given);
      await partnerCartOrderProducts.findByIdAndUpdate({ _id: e._id }, { givenQTY: totalvalue }, { new: true });
    });
  }

  return { message: 'Add On Stock Succeeded' };
};

module.exports = {
  SetPartnerPrice,
  AddProductByPartner,
  FetchProductbyPartner,
  create_Active_cart,
  getActiveCartBy_partner,
  create_PartnerShopOrder,
  getOrdersbycart,
  getOrderedProducts,
  updateAddOnStock,
};
