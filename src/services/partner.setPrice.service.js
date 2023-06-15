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
  ManageVehicle,
} = require('../models/partner.setPrice.models');
const { ScvCart, Scv } = require('../models/Scv.mode');
const { Product } = require('../models/product.model');
const moment = require('moment');
const Api = require('twilio/lib/rest/Api');

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
        from: 'partnerorderproducts',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $lookup: {
              from: 'products',
              localField: 'productId',
              foreignField: '_id',
              as: 'product',
            },
          },
          {
            $unwind: {
              preserveNullAndEmptyArrays: true,
              path: '$product',
            },
          },
          {
            $project: {
              _id: 1,
              report: 1,
              orderId: 1,
              productId: 1,
              cartId: 1,
              QTY: 1,
              date: 1,
              createdAt: 1,
              updatedAt: 1,
              dQTY: 1,
              productName: '$product.productTitle',
            },
          },
        ],
        as: 'ordersDetails',
      },
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
  //console.log(date);
  let yersterday = moment().subtract('days', 1).format('DD/MM/YYYY');
  let data = await partnerCartOrderProducts.distinct('productId');
  let values = [];
  // for (let i = 0; i < data.length; i++) {
  //   let id = data[i];
  //console.log(data.length);
  let datas = await partnerCartOrderProducts.aggregate([
    {
      $match: {
        cartId: cartId,
        // productId: { $in: data },
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
      $lookup: {
        from: 'partnerorderproducts',
        localField: 'productId',
        foreignField: 'productId',
        pipeline: [{ $match: { date: yersterday, cartId: cartId } }],
        as: 'products2',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$products2',
      },
    },
    {
      $project: {
        _id: 1,
        report: 1,
        orderId: 1,
        productId: 1,
        cartId: 1,
        QTY: 1,
        date: 1,
        createdAt: 1,
        updatedAt: 1,
        dQTY: 1,
        products: 1,
        // products2: '$products2',
        givenQTY: 1,
        balanceQTY: 1,
        yersterdayReturn: { $ifNull: ['$products2.returnQTY', 0] },
      },
    },
    { $sort: { dQTY: 1 } },
    { $sort: { givenQTY: -1 } },
    // { $match: { dQTY: { $ne: null } } },
  ]);
  // if (datas[0] != null) {
  //   values.push(datas[0]);
  // }
  // }

  let cartDetails = await ScvCart.findById(cartId);

  return { values: datas, cartDetails: cartDetails };
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
      let totalvalue = parseInt((getValues.givenQTY ? getValues.givenQTY : 0) + e.given);
      await partnerCartOrderProducts.findOneAndUpdate(
        { _id: e._id },
        { givenQTY: totalvalue, dQTY: getValues.dQTY ? getValues.dQTY : 0 + totalvalue },
        { new: true }
      );
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
  let cart = await ScvCart.findById(cartId);
  // await Scv.findByIdAndUpdate({ _id: cart.allocatedScv }, { workingStatus: 'no' }, { new: true });
  await ScvCart.findByIdAndUpdate({ _id: cartId }, { cartOnDate: '' }, { new: true });
  return { message: 'Cart Closed' };
};

// partner Request order tot admin Flow

const getCart_Ordered_Products = async (date, userId) => {
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
        orderId: 1,
      },
    },
    {
      $lookup: {
        from: 'partnerpostorders',
        localField: 'orderId',
        foreignField: '_id',
        pipeline: [{ $match: { partnerId: userId } }],
        as: 'cart',
      },
    },
    {
      $unwind: '$cart',
    },
    {
      $group: {
        _id: '$productId',
        totalQTY: { $sum: '$QTY' },
        cartId: { $first: '$cartId' },
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
        orderId: 1,
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
  let yersterday = moment().subtract('days', 1).format('DD/MM/YYYY');
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
      $lookup: {
        from: 'partnerorderproducts',
        localField: 'productId',
        foreignField: 'productId',
        pipeline: [{ $match: { date: yersterday, cartId: cartId } }],
        as: 'products2',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$products2',
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
        yersterdayReturn: { $ifNull: ['$products2.returnQTY', 0] },
      },
    },
  ]);
  return values;
};

const DistributeGIven = async (body) => {
  let { arr, cartId, cartOnDate } = body;
  arr.forEach(async (e) => {
    await partnerCartOrderProducts.findByIdAndUpdate({ _id: e._id }, { dQTY: e.dQty }, { new: true });
  });
  await ScvCart.findByIdAndUpdate({ _id: cartId }, { cartOnDate: cartOnDate }, { new: true });
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

const orderChange_Status = async (id, body) => {
  let order = await PartnerOrder.findById(id);
  if (!order) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Bad Request for Not Found');
  }
  order = await PartnerOrder.findByIdAndUpdate({ _id: id }, { status: body.status }, { new: true });
  return order;
};

const getAck_Orders = async () => {
  let values = await PartnerOrder.aggregate([
    { $match: { status: 'Acknowledged' } },
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

const getPartner_Ordered_Products = async (id) => {
  let values = await PartnerOrderedProductsSeperate.aggregate([
    {
      $match: { partnerOrderId: id },
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
  return values;
};

// manage Vehicle

const Add_new_vehicle = async (body) => {
  const creations = await ManageVehicle.create(body);
  return creations;
};

const getAll_Vehicles = async () => {
  const vehicles = await ManageVehicle.find();
  return vehicles;
};

const UpdateVehicleById = async (id, body) => {
  let vehicle = await ManageVehicle.findById(id);
  if (!vehicle) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Vehicle Not Available');
  }
  vehicle = await ManageVehicle.findByIdAndUpdate({ _id: id }, body, { new: true });
  return vehicle;
};

const update_Partnwe_Order = async (id, body) => {
  const { data, arr } = body;
  let values = await PartnerOrder.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Order Not Availabale');
  }

  arr.forEach(async (e) => {
    await PartnerOrderedProductsSeperate.findByIdAndUpdate({ _id: e._id }, e, { new: true });
  });

  values = await PartnerOrder.findByIdAndUpdate({ _id: id }, data, { new: true });
  return values;
};

const getLoadedOrders = async () => {
  let values = await PartnerOrder.aggregate([
    { $match: { status: 'billed' } },
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
        pipeline: [
          {
            $group: {
              _id: null,
              total: { $sum: '$totalQty' },
              totalAmt: { $sum: { $multiply: ['$totalQty', '$revisedPrice'] } },
            },
          },
        ],
        as: 'TotakQuantity',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$TotakQuantity',
      },
    },
    { $addFields: { paidAmt: 0 } },
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
        totalAmt: '$TotakQuantity.totalAmt',
        paidAmt: 1,
      },
    },
  ]);
  return values;
};

const getFetchdata_For_bills = async (id) => {
  let values = await PartnerOrder.aggregate([
    { $match: { _id: id, status: 'Loaded' } },
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
              givenStock: { $toInt: '$givenStock' },
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
        pipeline: [
          {
            $group: {
              _id: null,
              total: { $sum: '$totalQty' },
              totalAmt: { $sum: { $multiply: ['$totalQty', '$revisedPrice'] } },
            },
          },
        ],
        as: 'TotakQuantity',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$TotakQuantity',
      },
    },
    { $addFields: { paidAmt: 0 } },
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
        totalAmt: '$TotakQuantity.totalAmt',
        paidAmt: 1,
      },
    },
  ]);
  return values;
};

const Bill_GenerateById = async (body) => {
  const { orderId, billingAmt } = body;
  let date = moment().format('YYYY-MM-DD');
  let time = moment().format('HH:mm a');
  let status = 'billed';
  let findorder = await PartnerOrder.findById(orderId);
  if (!findorder) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Order Not Found');
  }
  let findOrders = await PartnerOrder.find({ billingDate: date }).count();
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
  let BId = `Bill${center}${count}`;
  findorder = await PartnerOrder.findByIdAndUpdate(
    { _id: orderId },
    { BillingDate: date, BillingTime: time, status: status, BillingAmt: billingAmt, BillNo: BId },
    { new: true }
  );
  return findorder;
};

const stockUpdateByCart = async (body) => {
  const { arr, cartId } = body;
  let cart = await ScvCart.findById(cartId);
  let date = moment().format('DD-MM-YYYY');
  let time = moment().format('h:mm a');
  //console.log(cart.cartUpdateHistory[date]);
  if (cart.cartUpdateHistory[date] == null) {
    cart = await ScvCart.updateOne(
      { _id: cartId },
      { latestUpdateStock: time, $set: { ['cartUpdateHistory.' + date]: [time] } },
      { new: true }
    );
  } else {
    cart = await ScvCart.updateOne(
      { _id: cartId },
      { latestUpdateStock: time, $push: { ['cartUpdateHistory.' + date]: time } },
      { new: true }
    );
  }

  arr.forEach(async (e) => {
    await partnerCartOrderProducts.findByIdAndUpdate(
      { _id: e._id },
      { balanceQTY: e.balanceqty, lastBalanceTime: time, $push: { report: { time: time, qty: e.balanceqty } } },
      { new: true }
    );
  });
  return cart;
};

const getCartReports = async (id) => {
  const today = moment().format('DD/MM/YYYY');
  //console.log(today);
  const data = await ScvCart.aggregate([
    { $match: { _id: id } },
    {
      $addFields: {
        currentDate: { $dateToString: { format: '%d-%m-%Y', date: new Date() } },
      },
    },
    {
      $lookup: {
        from: 'partnerorderproducts',
        localField: '_id',
        foreignField: 'cartId',
        pipeline: [
          { $match: { date: today } },
          {
            $lookup: {
              from: 'products',
              localField: 'productId',
              foreignField: '_id',
              as: 'product',
            },
          },
          { $unwind: { preserveNullAndEmptyArrays: true, path: '$product' } },
          {
            $project: {
              _id: 1,
              orderId: 1,
              productId: 1,
              cartId: 1,
              QTY: 1,
              date: 1,
              createdAt: 1,
              updatedAt: 1,
              dQTY: 1,
              balanceQTY: 1,
              lastBalanceTime: 1,
              report: 1,
              productName: '$product.productTitle',
            },
          },
        ],
        as: 'orders',
      },
    },
    {
      $project: {
        _id: 0, // Exclude the _id field from the result
        cartUpdateArray: {
          $filter: {
            input: { $objectToArray: '$cartUpdateHistory' },
            cond: {
              $eq: ['$$this.k', '$currentDate'],
            },
          },
        },
        orders: '$orders',
      },
    },
    {
      $project: {
        time: {
          $arrayElemAt: ['$cartUpdateArray.v', 0],
        },
        products: '$orders',
      },
    },
  ]);
  return data;
};

const getCartOrderByProduct = async (query, userId) => {
  const { date, productId } = query;
  const values = await partnerCartOrderProducts.aggregate([
    {
      $match: { productId: productId, date: date },
    },
    {
      $lookup: {
        from: 'partnerpostorders',
        localField: 'orderId',
        foreignField: '_id',
        pipeline: [{ $match: { partnerId: userId } }],
        as: 'cart',
      },
    },
    {
      $unwind: '$cart',
    },
    {
      $lookup: {
        from: 'scvcarts',
        localField: 'cartId',
        foreignField: '_id',
        as: 'carts',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$carts',
      },
    },
    {
      $project: {
        _id: 1,
        productId: 1,
        cartId: 1,
        QTY: 1,
        date: 1,
        cartName: '$carts.cartName',
      },
    },
  ]);
  const product = await Product.findById(productId);

  return { values: values, product: product };
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
  orderChange_Status,
  getAck_Orders,
  getPartner_Ordered_Products,
  Add_new_vehicle,
  getAll_Vehicles,
  UpdateVehicleById,
  update_Partnwe_Order,
  getLoadedOrders,
  getFetchdata_For_bills,
  Bill_GenerateById,
  stockUpdateByCart,
  getCartReports,
  getCartOrderByProduct,
};
