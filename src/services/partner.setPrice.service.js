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
  PartnerOrder,
  PartnerOrderedProductsSeperate,
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
  let findAlreadyExist = await PartnerProduct.findOne({ cartId: body.cartId });
  if (!findAlreadyExist) {
    await PartnerProduct.create(data);
  } else {
    body.product.forEach(async (e) => {
      let i = findAlreadyExist.product.indexOf(e);
      if (i == -1) {
        await PartnerProduct.findByIdAndUpdate({ _id: findAlreadyExist._id }, { $push: { product: e } }, { new: true });
      }
    });
  }
  return { message: 'ProductAdded' };
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
  await ActiveCArt.deleteMany({ _id: { $ne: null } });
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

  let existCartOrder = await PartnercartPostOrder.findOne({ date: date, cartId: cartId });
  if (existCartOrder) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Already Ordered In this Date for this cart');
  } else {
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
  }
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
  const date = moment().format('DD-MM-YYYY');
  const time = moment().format('hh:mm a');

  if (body.message) {
    body.arr.forEach(async (e) => {
      let getValues = await partnerCartOrderProducts.findById(e._id);
      let totalvalue = getValues.balanceQTY ? getValues.balanceQTY : 0 + e.balanceqty;
      await partnerCartOrderProducts.findByIdAndUpdate(
        { _id: e._id },
        { balanceQTY: totalvalue, lastBalanceTime: time },
        { new: true }
      );
      // latestUpdateStock
      await ScvCart.findByIdAndUpdate({ _id: e.cartId }, { latestUpdateStock: time }, { new: true });
      await UpdateStock.create({
        date: date,
        time: time,
        orderId: e.orderId,
        orderProductId: e._id,
        cartId: e.cartId,
        givenQTY: e.givenQTY,
        balanceQTY: e.balanceqty,
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

const Return_Wastage_inCloseStock = async (body) => {
  const { arr, cartId } = body;

  arr.forEach(async (e) => {
    let oneData = await partnerCartOrderProducts.findOne({ _id: e._id });
    let wastage;
    let returnq;
    if (e.wastageqty) {
      wastage = oneData.wastageQTY ? oneData.wastageQTY : 0 + e.wastageqty;
    }
    if (e.returnqty) {
      returnq = oneData.returnQTY ? oneData.returnQTY : 0 + e.returnqty;
    }
    await partnerCartOrderProducts.findByIdAndUpdate(
      { _id: e._id },
      { wastageQTY: wastage, returnQTY: returnq },
      { new: true }
    );
  });
  await ScvCart.findByIdAndUpdate({ _id: cartId }, { cartOnDate: '' }, { new: true });
  return { message: 'Cart Closed' };
};

// partner Request order tot admin Flow

const getCart_Ordered_Products = async (date) => {
  let values = await partnerCartOrderProducts.aggregate([
    {
      $match: {
        date: date,
      },
    },
    {
      $project: {
        productId: 1,
        QTY: { $toDouble: '$QTY' },
      },
    },
    {
      $group: {
        _id: '$productId',
        totalQTY: { $sum: '$QTY' },
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
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
    {
      $project: {
        productId: '$_id',
        scvKG: '$totalQTY',
        productName: '$products.productTitle',
      },
    },
  ]);

  return values;
};

const createPartnerOrder_FromAdmin = async (body, userId) => {
  const { arr, todayDate, tomorrowDate } = body;
  let findOrders = await PartnerOrder.find({ OrderedTo: tomorrowDate }).count();
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

  let data = { products: arr, Posted_date: todayDate, OrderedTo: tomorrowDate, partnerId: userId, orderId: orderId };
  let creation = await PartnerOrder.create(data);

  arr.forEach(async (e) => {
    let datas = {
      productId: e.productId,
      scvOrders: e.scvKG,
      totalQty: e.totalqty,
      agreedPrice: e.price,
      revisedPrice: e.price,
      Posted_date: todayDate,
      OrderedTo: tomorrowDate,
      partnerOrderId: creation._id,
      partnerId: userId,
    };
    await PartnerOrderedProductsSeperate.create(datas);
  });
  return { message: 'OrderCreated' };
};

const getOrdersByPartner = async (id) => {
  let values = await PartnerOrder.aggregate([
    {
      $match: {
        partnerId: id,
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: 'partneradminorders',
        localField: '_id',
        foreignField: 'partnerOrderId',
        pipeline: [
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
        ],
        as: 'orderProducts',
      },
    },
  ]);
  return values;
};

const getOrder_For_CurrentDateByCart = async (query) => {
  const { cartId, date } = query;
  let values = await partnerCartOrderProducts.aggregate([
    {
      $match: {
        cartId: cartId,
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
    {
      $project: {
        _id: 1,
        orderId: 1,
        productId: 1,
        cartId: 1,
        QTY: 1,
        date: 1,
        productName: '$products.productTitle',
      },
    },
  ]);
  return values;
};

const DistributeGIven = async (body) => {
  let { arr } = body;
  arr.forEach(async (e) => {
    await partnerCartOrderProducts.findByIdAndUpdate({ _id: e._id }, { dQTY: e.dQty }, { new: true });
  });
  return { message: 'Ditribution work success.............' };
};

const getPartner_Orders = async () => {
  let values = await PartnerOrder.aggregate([
    {
      $sort: { createdAt: -1 },
    },
    {
      $lookup: {
        from: 'scvcustomers',
        localField: 'partnerId',
        foreignField: '_id',
        as: 'partner',
      },
    },
    { $unwind: { preserveNullAndEmptyArrays: true, path: '$partner' } },

    {
      $lookup: {
        from: 'partneradminorders',
        localField: '_id',
        foreignField: 'partnerOrderId',
        pipeline: [
          {
            $lookup: {
              from: 'products',
              localField: 'productId',
              foreignField: '_id',
              as: 'products',
            },
          },
          {
            $unwind: '$products',
          },
          {
            $project: {
              _id: 1,
              productId: 1,
              scvOrders: 1,
              totalQty: 1,
              agreedPrice: 1,
              Posted_date: 1,
              OrderedTo: 1,
              partnerOrderId: 1,
              revisedPrice: 1,
              partnerId: 1,
              createdAt: 1,
              productName: '$products.productTitle',
            },
          },
        ],
        as: 'orders',
      },
    },
    {
      $lookup: {
        from: 'partneradminorders',
        localField: '_id',
        foreignField: 'partnerOrderId',
        pipeline: [{ $group: { _id: null, total: { $sum: '$totalQty' } } }],
        as: 'TotakQuantity',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$TotakQuantity',
      },
    },
    {
      $project: {
        _id: 1,
        products: '$orders',
        productCount: { $size: '$products' },
        status: 1,
        Posted_date: 1,
        OrderedTo: 1,
        partnerId: 1,
        orderId: 1,
        createdAt: 1,
        partner: '$partner',
        TotakQuantity: '$TotakQuantity.total',
      },
    },
  ]);
  return values;
};

const update_Partner_Individual_Orders = async (body) => {
  const { arr } = body;
  arr.forEach(async (e) => {
    let orders = await PartnerOrderedProductsSeperate.findById(e._id);
    orders = await PartnerOrderedProductsSeperate.findByIdAndUpdate(
      { _id: e._id },
      { revisedPrice: e.revisedPrice },
      { new: true }
    );
  });
  return { message: 'Revised Price Updated.....' };
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
  Return_Wastage_inCloseStock,
  getCart_Ordered_Products,
  createPartnerOrder_FromAdmin,
  getOrdersByPartner,
  getOrder_For_CurrentDateByCart,
  DistributeGIven,
  getPartner_Orders,
  update_Partner_Individual_Orders,
};
