const httpStatus = require('http-status');
const {
  ShopOrder,
  ProductorderSchema,
  ShopOrderClone,
  ProductorderClone,
  MismatchStock,
} = require('../models/shopOrder.model');
const ProductPacktype = require('../models/productPacktype.model');
const { Product } = require('../models/product.model');
const { Shop } = require('../models/b2b.ShopClone.model');
const OrderPayment = require('../models/orderpayment.model');
const UserRole = require('../models/roles.model.js');
const ApiError = require('../utils/ApiError');
const moment = require('moment');
const { Users } = require('../models/B2Busers.model');
const CallHistory = require('../models/b2b.callHistory.model');
const BillAdj = require('../models/Bill.Adj.model');
const { wardAdminGroup, wardAdminGroupModel_ORDERS } = require('../models/b2b.wardAdminGroup.model');
const AWS = require('aws-sdk');
const PickupLocation = require('../models/manage.pickupLocation.model');

const createshopOrder = async (shopOrderBody, userid) => {
  let { product, date, time, shopId, time_of_delivery } = shopOrderBody;
  let timeslot = time_of_delivery.replace('-', '');
  let body = { ...shopOrderBody, ...{ Uid: userid, timeslot: timeslot, primary_Pickup: primary, secondary_Pickup: secondary, third_Pickup, third } };
  let createShopOrder = await ShopOrder.create(body);
  product.forEach(async (e) => {
    ProductorderSchema.create({
      orderId: createShopOrder.id,
      productid: e.productid,
      quantity: e.quantity,
      priceperkg: e.priceperkg,
      date: date,
      time: time,
      customerId: shopId,
    });
  });
  return createShopOrder;
};

const createshopOrderClone = async (body, userid) => {
  let currentDate = moment().format('YYYY-MM-DD');
  let currenttime = moment().format('HHmmss');
  const Buy = await ShopOrderClone.find({ date: currentDate });
  let center = '';
  if (Buy.length < 9) {
    center = '0000';
  }
  if (Buy.length < 99 && Buy.length >= 9) {
    center = '000';
  }
  if (Buy.length < 999 && Buy.length >= 99) {
    center = '00';
  }
  if (Buy.length < 9999 && Buy.length >= 999) {
    center = '0';
  }
  let userId = '';
  let totalcount = Buy.length + 1;

  userId = 'OD' + center + totalcount;

  let centerdata = '';
  if (Buy.length < 9) {
    centerdata = '0000';
  }
  if (Buy.length < 99 && Buy.length >= 9) {
    centerdata = '000';
  }
  if (Buy.length < 999 && Buy.length >= 99) {
    centerdata = '00';
  }
  if (Buy.length < 9999 && Buy.length >= 999) {
    centerdata = '0';
  }
  let BillId = '';
  let totalcounts = Buy.length + 1;

  BillId = 'B' + centerdata + totalcounts;
  let timeslot = body.time_of_delivery.replace('-', '');
  let startSlot = body.time_of_delivery.split('-')[0];
  let endSlot = body.time_of_delivery.split('-')[1];

  let paidamount = body.paidamount;
  if (body.paidamount == null) {
    paidamount = 0;
  }
  let reorder_status = false;
  if (body.RE_order_Id != null) {
    reorder_status = true;
    let shoss = await ShopOrderClone.findByIdAndUpdate(
      { _id: body.RE_order_Id },
      { RE_order_status: 'Re-Ordered', Re_order_userId: userid },
      { new: true }
    );
    // if (body.pay_type != 'Fully') {
    //   paidamount = shoss.paidamount + paidamount;
    // }
  }
  let Payment = body.Payment;
  if (body.Payment == 'Continue' || body.Payment == 'addmore') {
    Payment = 'Paynow';
  }
  let shops = await Shop.findById(body.shopId)
  let pickpulocation = await PickupLocation.aggregate([
    {
      $geoNear: {
        includeLocs: "location",
        near: {
          type: "Point",
          coordinates: [shops.da_long, shops.da_lot]
        },
        distanceField: "distance",
        spherical: true
      }
    },
    { $match: { $and: [{ active: { $eq: true } },] } },
    { $limit: 3 }
  ]);
  let primary;
  let secondary;
  let third;
  if (pickpulocation.length == 3) {
    primary = pickpulocation[0]._id;
    secondary = pickpulocation[1]._id;
    third = pickpulocation[2]._id;
  }
  if (pickpulocation.length == 2) {
    primary = pickpulocation[0]._id;
    secondary = pickpulocation[1]._id;
  }
  if (pickpulocation.length == 1) {
    primary = pickpulocation[0]._id;
  }
  let bod = {
    ...body,
    ...{
      Uid: userid,
      OrderId: userId,
      customerBillId: BillId,
      date: currentDate,
      time: currenttime,
      created: moment(),
      timeslot: timeslot,
      paidamount: paidamount,
      reorder_status: reorder_status,
      Payment: Payment,
      startSlot: startSlot,
      endSlot: endSlot,
      primary_Pickup: primary,
      secondary_Pickup: secondary,
      third_Pickup: third
    },
  };


  let createShopOrderClone = await ShopOrderClone.create(bod);
  let Payment_type = body.paymentMethod;
  if (body.Payment == 'cod') {
    Payment_type = null;
  }
  if (reorder_status) {
    let paid = await OrderPayment.find({ orderId: body.RE_order_Id });
    paid.forEach(async (e) => {
      await OrderPayment.create({
        uid: e.uid,
        paidAmt: e.paidAmt,
        date: e.date,
        time: e.time,
        created: e.created,
        orderId: createShopOrderClone._id,
        type: e.type,
        pay_type: e.pay_type,
        payment: e.payment,
        paymentMethod: e.paymentMethod,
        RE_order_Id: body.RE_order_Id,
        reorder_status: true,
      });
    });
  }
  await OrderPayment.create({
    uid: userid,
    paidAmt: paidamount,
    date: currentDate,
    time: currenttime,
    created: moment(),
    orderId: createShopOrderClone._id,
    type: 'advanced',
    pay_type: body.pay_type,
    payment: body.Payment,
    paymentMethod: Payment_type,
    RE_order_Id: body.RE_order_Id,
    reorder_status: reorder_status,
  });
  let { product, time, shopId } = body;
  await Shop.findByIdAndUpdate({ _id: shopId }, { callingStatus: 'accept', callingStatusSort: 6 }, { new: true });
  product.forEach(async (e) => {
    let priceperkg = e.priceperkg;
    if (body.RE_order_Id != null) {
      priceperkg = e.salesmanprice;
    }
    ProductorderClone.create({
      orderId: createShopOrderClone.id,
      productid: e.productid,
      quantity: e.quantity,
      priceperkg: priceperkg,
      GST_Number: e.GST_Number,
      HSN_Code: e.HSN_Code,
      packtypeId: e.packtypeId,
      productpacktypeId: e._id,
      packKg: e.packKg,
      unit: e.unit,
      date: currentDate,
      time: currenttime,
      customerId: shopId,
      finalQuantity: e.quantity,
      finalPricePerKg: e.priceperkg,
      created: moment(),
    });
  });
  return createShopOrderClone;
};

const getAllShopOrderClone = async (date, page) => {
  let values = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [{ date: { $eq: date } }],
      },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        as: 'productOrderdata',
      },
    },
    {
      $unwind: '$productOrderdata',
    },

    { $skip: 10 * page },
    { $limit: 10 },
  ]);

  let total = await ShopOrderClone.find().count();
  return { values: values, total: total };
};

const getShopOrderCloneById = async (id) => {
  //////console.log('hello');
  let Values = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shopData',
      },
    },
    {
      $unwind: '$shopData',
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $lookup: {
              from: 'products',
              localField: 'productid',
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
              status: 1,
              orderId: 1,
              productid: 1,
              quantity: 1,
              priceperkg: 1,
              GST_Number: 1,
              HSN_Code: 1,
              packtypeId: 1,
              packKg: 1,
              unit: 1,
              productTitle: '$products.productTitle',
              created: 1,
              finalQuantity: 1,
              finalPricePerKg: 1,
              GST_Number: 1,
              GSTamount: {
                $divide: [{ $multiply: [{ $multiply: ['$finalQuantity', '$priceperkg'] }, '$GST_Number'] }, 100],
              },
            },
          },
        ],
        as: 'productData',
      },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $group: {
              _id: null,
              amount: {
                $sum: {
                  $multiply: ['$finalQuantity', '$priceperkg'],
                },
              },
            },
          },
        ],
        as: 'productDatadetails',
      },
    },
    {
      $unwind: {
        path: '$productDatadetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'orderpayments',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $group: {
              _id: null,
              amount: {
                $sum: '$paidAmt',
              },
            },
          },
        ],
        as: 'orderpayments',
      },
    },
    {
      $unwind: {
        path: '$orderpayments',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        status: 1,
        delivery_type: 1,
        time_of_delivery: 1,
        total: 1,
        gsttotal: 1,
        subtotal: 1,
        SGST: 1,
        Uid: 1,
        shopId: 1,
        CGST: 1,
        paidamount: 1,
        OrderId: 1,
        created: 1,
        devevery_mode: 1,
        Payment: 1,
        productData: '$productData',
        shopName: '$shopData.SName',
        mobile: '$shopData.mobile',
        pay_type: 1,
        paymentMethod: 1,
        productDatadetails: '$productDatadetails',
        total: '$productDatadetails.amount',
        TotalGstAmount: { $sum: '$productData.GSTamount' },
        totalSum: { $round: { $add: ['$productDatadetails.amount', { $sum: '$productData.GSTamount' }] } },
        paidamount: '$orderpayments.amount',
        shoporderclones: '$shoporderclones',
      },
    },
  ]);
  return Values;
};

const undelivered = async (page) => {
  let data = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [{ customerDeliveryStatus: { $eq: 'UnDelivered' } }],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shopData',
      },
    },
    {
      $unwind: '$shopData',
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'deliveryExecutiveId',
        foreignField: '_id',
        as: 'b2busersData',
      },
    },
    {
      $unwind: '$b2busersData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'shopData.Strid',
        foreignField: '_id',
        as: 'streetsData',
      },
    },
    {
      $unwind: '$streetsData',
    },
    {
      $project: {
        _id: 1,
        OrderId: 1,
        Payment: 1,
        UnDeliveredStatus: 1,
        street: '$streetsData.street',
        type: '$shopData.type',
        SName: '$shopData.SName',
        name: '$b2busersData.name',
      },
    },
    {
      $skip: 10 * parseInt(page),
    },
    {
      $limit: 10,
    },
  ]);
  let total = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [{ customerDeliveryStatus: { $eq: 'UnDelivered' } }],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shopData',
      },
    },
    {
      $unwind: '$shopData',
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'deliveryExecutiveId',
        foreignField: '_id',
        as: 'b2busersData',
      },
    },
    {
      $unwind: '$b2busersData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'shopData.Strid',
        foreignField: '_id',
        as: 'streetsData',
      },
    },
    {
      $unwind: '$streetsData',
    },
    {
      $project: {
        _id: 1,
        OrderId: 1,
        payType: 1,
        UnDeliveredStatus: 1,
        street: '$streetsData.street',
        type: '$shopData.type',
        SName: '$shopData.SName',
        name: '$b2busersData.name',
      },
    },
  ]);
  return { data: data, total: total.length };
};

const updateShopOrderCloneById = async (id, updatebody) => {
  let shoporderClone = await ShopOrderClone.findById(id);
  if (!shoporderClone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ShopOrderClone Not Found');
  }
  shoporderClone = await ShopOrderClone.findByIdAndUpdate({ _id: id }, updatebody, { new: true });
  return shoporderClone;
};

const updateshop_order = async (id, body, userid) => {
  let shoporder = await ShopOrderClone.findById(id);
  if (!shoporder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  let timeslot = body.time_of_delivery.replace('-', '');
  let Payment = body.Payment;
  if (body.Payment == 'Continue' || body.Payment == 'addmore') {
    Payment = 'Paynow';
  }
  shoporder = await ShopOrderClone.findByIdAndUpdate(
    { _id: id },
    { ...body, ...{ timeslot: timeslot, Payment: Payment } },
    { new: true }
  );
  let currentDate = moment().format('YYYY-MM-DD');
  let currenttime = moment().format('HHmmss');
  if (body.Payment == 'addmore' || body.Payment == 'Paynow') {
    await OrderPayment.create({
      uid: userid,
      paidAmt: body.paidamount,
      date: currentDate,
      time: currenttime,
      created: moment(),
      orderId: shoporder._id,
      type: 'advanced',
    });
  }

  await ProductorderClone.deleteMany({ orderId: id });
  let { product, date, time, shopId } = body;
  product.forEach(async (e) => {
    let packtypeId = await ProductPacktype.findOne({ packtypeId: e.packtypeId, productId: e.productid });
    await ProductorderClone.create({
      orderId: id,
      productid: e.productid,
      quantity: e.quantity,
      priceperkg: e.priceperkg,
      GST_Number: e.GST_Number,
      HSN_Code: e.HSN_Code,
      packtypeId: e.packtypeId,
      productpacktypeId: packtypeId._id,
      packKg: e.packKg,
      unit: e.unit,
      date: shoporder.date,
      time: shoporder.time,
      customerId: shopId,
      finalQuantity: e.quantity,
      finalPricePerKg: e.priceperkg,
      created: shoporder.created,
    });
  });
  return shoporder;
};

const deleteShopOrderCloneById = async (id) => {
  let shoporderClone = await ShopOrderClone.findById(id);
  if (!shoporderClone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ShopOrderClone Not Found');
  }
  (shoporderClone.active = false), (shoporderClone.archive = true);
  await shoporderClone.save();
};

const createProductOrderClone = async (body) => {
  const productorderClone = await ProductorderClone.create(body);
  return productorderClone;
};

const getAllProductOrderClone = async () => {
  return await ProductorderClone.find();
};

const getProductOrderCloneById = async (id) => {
  const productorderClone = await ProductorderClone.findById(id);
  if (!productorderClone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ProductOrderClone not found');
  }
  return productorderClone;
};

const updateProductOrderCloneById = async (id, updateBody) => {
  let productorderClone = await ProductorderClone.findById(id);
  if (!productorderClone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ProductOrderClone not found');
  }
  productorderClone = await ProductorderClone.findByIdAndUpdate({ _id: id }, updateBody, { new: true });

  return productorderClone;
};

const deleteProductOrderClone = async (id) => {
  let productorderClone = await ProductorderClone.findById(id);
  if (!productorderClone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ProductOrderClone not found');
  }
  (productorderClone.active = false), (productorderClone.archive = true);
  await productorderClone.save();
};

const getShopNameWithPagination = async (page, userId) => {
  //////console.log(userId);
  return ShopOrder.aggregate([
    {
      $match: {
        $and: [{ Uid: { $eq: userId } }],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shopData',
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
};

const getShopNameCloneWithPagination = async (page, userId) => {
  let today = moment().format('yyyy-MM-DD');
  let value = await ShopOrderClone.aggregate([
    {
      $sort: { date: -1, time: -1 },
    },
    {
      $match: {
        $and: [{ Uid: { $eq: userId } }],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shopData',
      },
    },
    {
      $unwind: '$shopData',
    },
    {
      $lookup: {
        from: 'orderpayments',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $group: {
              _id: null,
              amount: {
                $sum: '$paidAmt',
              },
            },
          },
        ],
        as: 'orderpayments',
      },
    },
    {
      $unwind: {
        path: '$orderpayments',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $project: {
              Amount: { $multiply: ['$finalQuantity', '$finalPricePerKg'] },
              GST_Number: 1,
            },
          },
          {
            $project: {
              sum: '$sum',
              percentage: {
                $divide: [
                  {
                    $multiply: ['$GST_Number', '$Amount'],
                  },
                  100,
                ],
              },
              value: '$Amount',
            },
          },
          {
            $project: {
              price: { $sum: ['$value', '$percentage'] },
              value: '$value',
              GST: '$percentage',
            },
          },
          { $group: { _id: null, price: { $sum: '$price' } } },
        ],
        as: 'productorderclones',
      },
    },
    {
      $unwind: '$productorderclones',
    },
    {
      $project: {
        _id: 1,
        created: 1,
        delivery_type: 1,
        time_of_delivery: 1,
        total: 1,
        gsttotal: 1,
        subtotal: { $round: '$productorderclones.price' },
        productorderclones: '$productorderclones',
        SGST: 1,
        CGST: 1,
        OrderId: 1,
        productTotal: { $size: '$product' },
        paidamount: '$orderpayments.amount',
        shopName: '$shopData.SName',
        contact: '$shopData.mobile',
        status: 1,
        timeslot: 1,
        date: 1,
        datematch: { $eq: ['$date', today] },
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let retrunValue = [];
  let total = await ShopOrderClone.find({ Uid: { $eq: userId } }).count();
  let yesterday = moment().subtract(1, 'days').format('yyyy-MM-DD');
  let threeDay = moment().subtract(2, 'days').format('yyyy-MM-DD');
  let hover = moment().subtract(-1, 'hours').format('H');
  let timeslot = [
    { start: 10, end: 20 },
    { start: 20, end: 30 },
    { start: 30, end: 40 },
    { start: 40, end: 50 },
    { start: 50, end: 60 },
    { start: 60, end: 70 },
    { start: 70, end: 80 },
    { start: 80, end: 90 },
    { start: 900, end: 1000 },
    { start: 1000, end: 1100 },
    { start: 1100, end: 1200 },
    { start: 1200, end: 1300 },
    { start: 1300, end: 1400 },
    { start: 1400, end: 1500 },
    { start: 1500, end: 1600 },
    { start: 1600, end: 1700 },
    { start: 1700, end: 1800 },
    { start: 1800, end: 1900 },
    { start: 1900, end: 2000 },
    { start: 2000, end: 2100 },
    { start: 2100, end: 2200 },
    { start: 2200, end: 2300 },
    { start: 2300, end: 2400 },
    { start: 2400, end: 2500 },
  ];
  let lapsed = timeslot[hover].start;
  let statuss = [
    'Acknowledged',
    'Approved',
    'Modified',
    'Packed',
    'Assigned',
    'Order Picked',
    'Delivery start',
    'UnDelivered',
    'ordered',
  ];
  value.forEach((e) => {
    //////console.log(statuss.find((element) => element == e.status));
    let lapsedd = false;
    if (
      (e.date = today && e.delivery_type == 'IMD' && e.timeslot <= lapsed) ||
      (e.date = yesterday && e.delivery_type == 'NDD' && e.timeslot <= lapsed) ||
      (e.date = threeDay && e.status == 'Acknowledged' && e.status == '' && e.status == '')
    ) {
      lapsedd = true;
      //////console.log(e);
    }
    retrunValue.push({ ...e, ...{ lapsed: lapsedd } });
  });
  // //////console.log(value);
  return {
    value: retrunValue,
    total: total,
    // retrunValue: retrunValue,
  };
};

const getAllShopOrder = async (UserRole) => {
  let value;
  if (UserRole == '')
    //////console.log(UserRole);
    return ShopOrder.find();
};

const getShopOrderById = async (shopOrderId) => {
  const shoporder = await ShopOrder.findById(shopOrderId);
  if (!shoporder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'shoporder  Not Found');
  }
  return shoporder;
};

const getProductDetailsByProductId = async (id) => {
  return await ShopOrder.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: 'product.productid',
        foreignField: '_id',
        as: 'products',
      },
    },
    {
      $unwind: '$products',
    },

    {
      $project: {
        districtName: { $eq: ['$_id', '$products.productid'] },
        product: 1,
      },
    },
  ]);
};

const updateShopOrderById = async (shopOrderId, updateBody) => {
  let shoporder = await getShopOrderById(shopOrderId);
  if (!shoporder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'shoporder not found');
  }
  let timeslot = updateBody.time_of_delivery.replace('-', '');
  let body = { ...updateBody, ...{ timeslot: parseInt(timeslot) } };
  shoporder = await ShopOrder.findByIdAndUpdate({ _id: shopOrderId }, body, { new: true });
  return shoporder;
};

const deleteShopOrderById = async (shopOrderId) => {
  const shoporder = await getSetSalesPriceById(shopOrderId);
  if (!shoporder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'shoporder not found');
  }
  (shoporder.active = false), (shoporder.archive = true), await shoporder.save();
  return shoporder;
};

// TELECALLER

const getAll = async () => {
  return ShopOrderClone.find();
};

const createOrderId = async (body) => {
  return ShopOrderClone.create(body);
};

const getShopDetailsByOrder = async (id) => {
  let values = await ShopOrderClone.aggregate([
    {
      $match: { _id: id },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'b2bshopclones',
      },
    },
    {
      $unwind: '$b2bshopclones',
    },
    {
      $project: {
        _id: 1,
        shopId: '$b2bshopclones._id',
        shopName: '$b2bshopclones.SName',
        shopOwner: '$b2bshopclones.SOwner',
        shopMobile: '$b2bshopclones.mobile',
        shoplatitude: '$b2bshopclones.Slat',
        shoplongitude: '$b2bshopclones.Slong',
        shopAddress: '$b2bshopclones.address',
      },
    },
  ]);
  return values;
};

const B2BManageOrders = async (shopid) => {
  let values = await ShopOrderClone.aggregate([
    {
      $match: {
        _id: shopid,
      },
    },
    {
      $project: {
        _id: 1,
        total: 1,
        shopId: 1,
        status: 1,
        OrderId: 1,
        date: 1,
      },
    },
  ]);
  return values;
};

const getManageordersByOrderId = async (orderId, date) => {
  let values = await ShopOrderClone.aggregate([
    {
      $match: {
        OrderId: orderId,
        date: date,
      },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        as: 'orders',
      },
    },
    {
      $unwind: '$orders',
    },
    {
      $lookup: {
        from: 'products',
        localField: 'orders.productid',
        foreignField: '_id',
        as: 'products',
      },
    },
    {
      $unwind: '$products',
    },
    {
      $project: {
        productTitle: '$products.productTitle',
        Qty: '$orders.quantity',
        price: '$orders.priceperkg',
        productId: '$products._id',
        productOrdersCloneId: '$orders._id',
        totalValue: { $multiply: ['$orders.quantity', '$orders.priceperkg'] },
      },
    },
    // {
    //   $group: { _id: null, Qty: { $sum: '$totalValue' } },
    // },
  ]);
  let total = await ShopOrderClone.aggregate([
    {
      $match: {
        OrderId: orderId,
        date: date,
      },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        as: 'orders',
      },
    },
    {
      $unwind: '$orders',
    },
    {
      $lookup: {
        from: 'products',
        localField: 'orders.productid',
        foreignField: '_id',
        as: 'products',
      },
    },
    {
      $unwind: '$products',
    },
    {
      $project: {
        productTitle: '$products.productTitle',
        Qty: '$orders.quantity',
        price: '$orders.priceperkg',
        productId: '$products._id',
        productOrdersCloneId: '$orders._id',
        totalValue: { $multiply: ['$orders.quantity', '$orders.priceperkg'] },
      },
    },
    {
      $group: { _id: null, Qty: { $sum: '$+' } },
    },
  ]);
  let totalqty = total[0];
  return { values: values, total: totalqty.Qty };
};
const getproductOrders_By_OrderId = async (orderId) => {
  let todaydate = moment().subtract(1, 'days').format('YYYY-MM-DD');
  let values = await ShopOrderClone.aggregate([
    {
      $match: {
        OrderId: orderId,
        date: todaydate,
      },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $lookup: {
              from: 'products',
              localField: 'productid',
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
              priceperkg: 1,
              quantity: 1,
              productTitle: '$products.productTitle',
              productId: '$products._id',
              Amount: { $multiply: ['$priceperkg', '$quantity'] },
            },
          },
        ],
        as: 'productData',
      },
    },
    {
      $project: {
        _id: 1,
        productData: '$productData',
        shopId: 1,
      },
    },
  ]);
  return values;
};

const productData = async (id) => {
  let data = await ShopOrderClone.aggregate([
    {
      $match: { _id: id },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        as: 'orders',
      },
    },
    {
      $unwind: '$orders',
    },
    {
      $lookup: {
        from: 'products',
        localField: 'orders.productid',
        foreignField: '_id',
        as: 'products',
      },
    },
    {
      $unwind: '$products',
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'b2bshopclonesData',
      },
    },
    {
      $unwind: '$b2bshopclonesData',
    },
    {
      $project: {
        productTitle: '$products.productTitle',
        Qty: '$orders.finalQuantity',
        price: '$orders.finalPricePerKg',
        productid: '$orders.productid',
        shop: '$b2bshopclonesData.SName',
        totalValue: { $multiply: ['$orders.finalQuantity', '$orders.finalPricePerKg'] },
      },
    },
  ]);
  let total = await ShopOrderClone.aggregate([
    {
      $match: { _id: id },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        as: 'orders',
      },
    },
    {
      $unwind: '$orders',
    },
    {
      $lookup: {
        from: 'products',
        localField: 'orders.productid',
        foreignField: '_id',
        as: 'products',
      },
    },
    {
      $unwind: '$products',
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'b2bshopclonesData',
      },
    },
    {
      $unwind: '$b2bshopclonesData',
    },
    {
      $project: {
        productTitle: '$products.productTitle',
        Qty: '$orders.finalQuantity',
        price: '$orders.finalPricePerKg',
        totalValue: { $multiply: ['$orders.finalQuantity', '$orders.finalPricePerKg'] },
      },
    },
    {
      $group: { _id: null, Qty: { $sum: '$totalValue' } },
    },
  ]);
  let totalqty = total[0];
  return { data: data, total: totalqty.Qty };
};

const get_data_for_lapster = async (page) => {
  var today = moment().format('YYYY-MM-DD');
  var yersterday = moment().subtract(1, 'days').format('YYYY-MM-DD');

  //////console.log(today);
  let todaydata = await ShopOrderClone.aggregate([
    {
      $project: {
        statusupdate: { $dateToString: { format: '%Y-%m-%d', date: '$statusUpdate' } },
        _id: 1,
        shopId: 1,
        OrderId: 1,
        status: 1,
        statusUpdate: 1,
      },
    },
    {
      $match: {
        statusupdate: { $ne: null },
        statusupdate: { $eq: today },
        status: { $ne: 'Assigned', $ne: 'Rejected' },
      },
    },
    {
      $lookup: {
        from: 'callhistories',
        localField: 'shopId',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: {
              date: today,
            },
          },
        ],
        as: 'callhistory',
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shops',
      },
    },
    {
      $unwind: '$shops',
    },
    {
      $project: {
        _id: 1,
        shopId: 1,
        status: 1,
        statusUpdate: 1,
        statusupdate: 1,
        OrderId: 1,
        callhistory: { $size: '$callhistory' },
        shopName: '$shops.SName',
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let yersterdaydata = await ShopOrderClone.aggregate([
    {
      $project: {
        statusupdate: { $dateToString: { format: '%Y-%m-%d', date: '$statusUpdate' } },
        _id: 1,
        shopId: 1,
        OrderId: 1,
        status: 1,
        statusUpdate: 1,
      },
    },
    {
      $match: {
        statusupdate: { $ne: null },
        statusupdate: { $eq: yersterday },
        status: { $ne: 'Assigned', $ne: 'Rejected' },
      },
    },
    {
      $lookup: {
        from: 'callhistories',
        localField: 'shopId',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: {
              date: yersterday,
            },
          },
        ],
        as: 'callhistory',
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shops',
      },
    },
    {
      $unwind: '$shops',
    },
    {
      $project: {
        _id: 1,
        shopId: 1,
        status: 1,
        statusUpdate: 1,
        statusupdate: 1,
        OrderId: 1,
        callhistory: { $size: '$callhistory' },
        shopName: '$shops.SName',
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let yersterdaytotal = await ShopOrderClone.aggregate([
    {
      $project: {
        statusupdate: { $dateToString: { format: '%Y-%m-%d', date: '$statusUpdate' } },
        _id: 1,
        shopId: 1,
        OrderId: 1,
        status: 1,
        statusUpdate: 1,
      },
    },
    {
      $match: {
        statusupdate: { $ne: null },
        statusupdate: { $eq: yersterday },
        status: { $ne: 'Assigned', $ne: 'Rejected' },
      },
    },
    {
      $lookup: {
        from: 'callhistories',
        localField: 'shopId',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: {
              date: yersterday,
            },
          },
        ],
        as: 'callhistory',
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shops',
      },
    },
    {
      $unwind: '$shops',
    },
  ]);
  let todaytotal = await ShopOrderClone.aggregate([
    {
      $project: {
        statusupdate: { $dateToString: { format: '%Y-%m-%d', date: '$statusUpdate' } },
        _id: 1,
        shopId: 1,
        OrderId: 1,
        status: 1,
        statusUpdate: 1,
      },
    },
    {
      $match: {
        statusupdate: { $ne: null },
        statusupdate: { $eq: today },
        status: { $ne: 'Assigned', $ne: 'Rejected' },
      },
    },
    {
      $lookup: {
        from: 'callhistories',
        localField: 'shopId',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: {
              date: today,
            },
          },
        ],
        as: 'callhistory',
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shops',
      },
    },
    {
      $unwind: '$shops',
    },
  ]);
  return {
    todaydata: todaydata,
    yersterdaydata: yersterdaydata,
    yersterdaytotal: yersterdaytotal.length,
    todaytotal: todaytotal.length,
  };
};
const getLapsed_Data = async (page, userRoles, userId, method) => {
  //////console.log(userRoles, userId);
  let yersterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
  let todaydate = moment().format('YYYY-MM-DD');
  let matchvalue;
  if (method == 'lp') {
    matchvalue = [
      {
        callstatus: { $ne: 'callback' },
      },
      {
        callstatus: { $ne: 'accept' },
      },
      {
        callstatus: { $ne: 'declined' },
      },
      {
        callstatus: { $ne: 'reschedule' },
      },
      { status: { $ne: 'UnDelivered' } },
      { date: yersterday },
      { status: { $ne: 'Delivered' } },
      { status: { $ne: 'Rejected' } },
    ];
  }
  if (method == 're') {
    matchvalue = [
      {
        callstatus: { $ne: 'callback' },
      },
      {
        callstatus: { $ne: 'accept' },
      },
      {
        callstatus: { $ne: 'declined' },
      },
      {
        callstatus: { $ne: 'reschedule' },
      },
      { status: { $eq: 'Rejected' } },
    ];
  }
  if (method == 'un') {
    matchvalue = [
      {
        callstatus: { $ne: 'callback' },
      },
      {
        callstatus: { $ne: 'accept' },
      },
      {
        callstatus: { $ne: 'declined' },
      },
      {
        callstatus: { $ne: 'reschedule' },
      },
      { status: { $eq: 'UnDelivered' } },
    ];
  }
  let values = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: matchvalue,
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'shoplists',
              localField: 'SType',
              foreignField: '_id',
              as: 'shoplists',
            },
          },
          {
            $unwind: '$shoplists',
          },
          {
            $project: {
              SName: 1,
              _id: 1,
              shopType: '$shoplists.shopList',
            },
          },
        ],
        as: 'shops',
      },
    },
    {
      $unwind: '$shops',
    },

    {
      $lookup: {
        from: 'callhistories',
        localField: 'shopId',
        foreignField: 'shopId',
        pipeline: [{ $match: { date: todaydate } }],
        as: 'callhistories',
      },
    },
    {
      $project: {
        _id: 1,
        shopId: 1,
        status: 1,
        OrderId: 1,
        customerBillId: 1,
        date: 1,
        delivery_type: 1,
        devevery_mode: 1,
        time_of_delivery: 1,
        Payment: 1,
        shops: '$shops.SName',
        shopType: '$shops.shopType',
        calls: { $size: '$callhistories' },
        callhistories: '$callhistories',
        created: 1,
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);

  let total = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: matchvalue,
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        // pipeline:[{$match:{lapsed:{$ne:true}}}],
        as: 'shops',
      },
    },
    {
      $unwind: '$shops',
    },
    {
      $lookup: {
        from: 'callhistories',
        localField: 'shopId',
        foreignField: 'shopId',
        pipeline: [{ $match: { date: todaydate } }],
        as: 'callhistories',
      },
    },
  ]);
  let userRole = await UserRole.findById(userRoles);
  let User = await Users.findById(userId);
  //////console.log(userRoles, userId);
  return { values: values, total: total.length, Role: userRole.roleName, User: User.name };
};

const getLapsed_Rejected = async (page, userRoles, userId) => {
  let yersterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
  let todaydate = moment().format('YYYY-MM-DD');
  let values = await ShopOrderClone.aggregate([
    {
      $match: { status: 'Rejected' },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shops',
      },
    },
    {
      $unwind: '$shops',
    },
    {
      $lookup: {
        from: 'callhistories',
        localField: 'shopId',
        foreignField: 'shopId',
        pipeline: [{ $match: { date: todaydate } }],
        as: 'callhistories',
      },
    },
    {
      $project: {
        _id: 1,
        shopId: 1,
        status: 1,
        OrderId: 1,
        customerBillId: 1,
        date: 1,
        delivery_type: 1,
        devevery_mode: 1,
        time_of_delivery: 1,
        Payment: 1,
        shops: '$shops.SName',
        calls: { $size: '$callhistories' },
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);

  let total = await ShopOrderClone.aggregate([
    {
      $match: { status: 'Rejected' },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shops',
      },
    },
    {
      $unwind: '$shops',
    },
    {
      $lookup: {
        from: 'callhistories',
        localField: 'shopId',
        foreignField: 'shopId',
        pipeline: [{ $match: { date: todaydate } }],
        as: 'callhistories',
      },
    },
  ]);
  let Pending = await ShopOrderClone.aggregate([
    {
      $match: { $and: [{ status: { $ne: 'UnDelivered' } }, { date: yersterday }, { status: { $ne: 'Delivered' } }] },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [{ $match: { lapsed: { $ne: true } } }],
        as: 'shops',
      },
    },
    {
      $unwind: '$shops',
    },
    {
      $lookup: {
        from: 'callhistories',
        localField: 'shopId',
        foreignField: 'shopId',
        pipeline: [{ $match: { date: todaydate } }],
        as: 'callhistories',
      },
    },
  ]);
  let userRole = await UserRole.findById(userRoles);
  let User = await Users.findById(userId);
  return { values: values, total: total.length, Role: userRole.roleName, User: User.name, Pending: Pending.length };
};

const getLapsed_Undelivered = async (page, userRoles, userId) => {
  let todaydate = moment().format('YYYY-MM-DD');
  let yersterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
  let values = await ShopOrderClone.aggregate([
    {
      $match: { status: 'UnDelivered' },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shops',
      },
    },
    {
      $unwind: '$shops',
    },
    {
      $lookup: {
        from: 'callhistories',
        localField: 'shopId',
        foreignField: 'shopId',
        pipeline: [{ $match: { date: todaydate } }],
        as: 'callhistories',
      },
    },
    {
      $project: {
        _id: 1,
        shopId: 1,
        status: 1,
        OrderId: 1,
        customerBillId: 1,
        date: 1,
        delivery_type: 1,
        devevery_mode: 1,
        time_of_delivery: 1,
        Payment: 1,
        shops: '$shops.SName',
        calls: { $size: '$callhistories' },
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);

  let total = await ShopOrderClone.aggregate([
    {
      $match: { status: 'UnDelivered' },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shops',
      },
    },
    {
      $unwind: '$shops',
    },
    {
      $lookup: {
        from: 'callhistories',
        localField: 'shopId',
        foreignField: 'shopId',
        pipeline: [{ $match: { date: todaydate } }],
        as: 'callhistories',
      },
    },
  ]);
  let Pending = await ShopOrderClone.aggregate([
    {
      $match: { $and: [{ status: { $ne: 'UnDelivered' } }, { date: yersterday }, { status: { $ne: 'Delivered' } }] },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [{ $match: { lapsed: { $ne: true } } }],
        as: 'shops',
      },
    },
    {
      $unwind: '$shops',
    },
    {
      $lookup: {
        from: 'callhistories',
        localField: 'shopId',
        foreignField: 'shopId',
        pipeline: [{ $match: { date: todaydate } }],
        as: 'callhistories',
      },
    },
  ]);
  let userRole = await UserRole.findById(userRoles);
  let User = await Users.findById(userId);
  return { values: values, total: total.length, Role: userRole.roleName, User: User.name, Pending: Pending.length };
};

const getCallhistories = async (shopId) => {
  let values = await CallHistory.find({ shopId: shopId }).sort({ date: -1, historytime: -1 }).limit(10);
  return values;
};

const getFindbyId = async (id) => {
  let values = await ShopOrderClone.aggregate([
    {
      $match: {
        _id: id,
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shops',
      },
    },
    {
      $unwind: '$shops',
    },
    // {
    //   $lookup: {
    //     from: 'productorderclones',
    //     localField: '_id',
    //     foreignField: 'orderId',
    //     // pipeline: [
    //     //   {
    //     //     $match:{
    //     //       orderId:id,
    //     //       date:date
    //     //     }
    //     //   }
    //     // ],
    //     as: 'productOrders',
    //   },
    // },
    {
      $project: {
        _id: 1,
        shopId: 1,
        status: 1,
        delivery_type: 1,
        Payment: 1,
        OrderId: 1,
        devevery_mode: 1,
        time_of_delivery: 1,
        OrderId: 1,
        date: 1,
        time: 1,
        product: 1,
        shopsName: '$shops.SName',
        productOrders: '$productOrders',
      },
    },
  ]);
  return values;
};

const lapsed_callBack = async (page, userRoles, userId, method) => {
  let yersterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
  let todaydate = moment().format('YYYY-MM-DD');
  if (method == 'lp') {
    matchvalue = [
      { callstatus: { $eq: 'callback' } },
      { status: { $ne: 'UnDelivered' } },
      { date: yersterday },
      { status: { $ne: 'Delivered' } },
      { status: { $ne: 'Rejected' } },
    ];
  }
  if (method == 're') {
    matchvalue = [{ callstatus: { $eq: 'callback' } }, { status: { $eq: 'Rejected' } }];
  }
  if (method == 'un') {
    matchvalue = [{ callstatus: { $eq: 'callback' } }, { status: { $eq: 'UnDelivered' } }];
  }
  let values = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: matchvalue,
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'shoplists',
              localField: 'SType',
              foreignField: '_id',
              as: 'shoplists',
            },
          },
          {
            $unwind: '$shoplists',
          },
          {
            $project: {
              SName: 1,
              _id: 1,
              shopType: '$shoplists.shopList',
            },
          },
        ],
        as: 'shops',
      },
    },
    {
      $unwind: '$shops',
    },

    {
      $lookup: {
        from: 'callhistories',
        localField: 'shopId',
        foreignField: 'shopId',
        pipeline: [{ $match: { date: todaydate } }],
        as: 'callhistories',
      },
    },
    {
      $project: {
        _id: 1,
        shopId: 1,
        status: 1,
        OrderId: 1,
        customerBillId: 1,
        date: 1,
        delivery_type: 1,
        devevery_mode: 1,
        time_of_delivery: 1,
        Payment: 1,
        shops: '$shops.SName',
        shopType: '$shops.shopType',
        calls: { $size: '$callhistories' },
        callhistories: '$callhistories',
        created: 1,
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);

  let total = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: matchvalue,
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shops',
      },
    },
    {
      $unwind: '$shops',
    },
    {
      $lookup: {
        from: 'callhistories',
        localField: 'shopId',
        foreignField: 'shopId',
        pipeline: [{ $match: { date: todaydate } }],
        as: 'callhistories',
      },
    },
  ]);
  let userRole = await UserRole.findById(userRoles);
  let User = await Users.findById(userId);
  //////console.log(userRoles, userId);
  return { values: values, total: total.length, Role: userRole.roleName, User: User.name };
};

const lapsed_accept = async (page, userRoles, userId, method) => {
  let yersterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
  let todaydate = moment().format('YYYY-MM-DD');
  if (method == 'lp') {
    matchvalue = [
      { callstatus: { $eq: 'accept' } },
      { status: { $ne: 'UnDelivered' } },
      { date: yersterday },
      { status: { $ne: 'Delivered' } },
      { status: { $ne: 'Rejected' } },
    ];
  }
  if (method == 're') {
    matchvalue = [{ callstatus: { $eq: 'accept' } }, { status: { $eq: 'Rejected' } }];
  }
  if (method == 'un') {
    matchvalue = [{ callstatus: { $eq: 'accept' } }, { status: { $eq: 'UnDelivered' } }];
  }
  let values = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: matchvalue,
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'shoplists',
              localField: 'SType',
              foreignField: '_id',
              as: 'shoplists',
            },
          },
          {
            $unwind: '$shoplists',
          },
          {
            $project: {
              SName: 1,
              _id: 1,
              shopType: '$shoplists.shopList',
            },
          },
        ],
        as: 'shops',
      },
    },
    {
      $unwind: '$shops',
    },

    {
      $lookup: {
        from: 'callhistories',
        localField: 'shopId',
        foreignField: 'shopId',
        pipeline: [{ $match: { date: todaydate } }],
        as: 'callhistories',
      },
    },
    {
      $project: {
        _id: 1,
        shopId: 1,
        status: 1,
        OrderId: 1,
        customerBillId: 1,
        date: 1,
        delivery_type: 1,
        devevery_mode: 1,
        time_of_delivery: 1,
        Payment: 1,
        shops: '$shops.SName',
        shopType: '$shops.shopType',
        calls: { $size: '$callhistories' },
        callhistories: '$callhistories',
        created: 1,
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);

  let total = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: matchvalue,
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shops',
      },
    },
    {
      $unwind: '$shops',
    },
    // {
    //   $lookup: {
    //     from: 'shoporderclones',
    //     localField: 'shops._id',
    //     foreignField: 'shopId',
    //     as: 'shoporderclonesData',
    //   },
    // },
    // {
    //   $unwind: '$shoporderclonesData'
    // },
    {
      $lookup: {
        from: 'callhistories',
        localField: 'shopId',
        foreignField: 'shopId',
        pipeline: [{ $match: { date: todaydate } }],
        as: 'callhistories',
      },
    },
  ]);
  let userRole = await UserRole.findById(userRoles);
  let User = await Users.findById(userId);
  //////console.log(userRoles, userId);
  return { values: values, total: total.length, Role: userRole.roleName, User: User.name };
};

const lapsed_declined = async (page, userRoles, userId, method) => {
  let yersterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
  let todaydate = moment().format('YYYY-MM-DD');
  if (method == 'lp') {
    matchvalue = [
      { callstatus: { $eq: 'declined' } },
      { status: { $ne: 'UnDelivered' } },
      { date: yersterday },
      { status: { $ne: 'Delivered' } },
      { status: { $ne: 'Rejected' } },
    ];
  }
  if (method == 're') {
    matchvalue = [{ callstatus: { $eq: 'declined' } }, { status: { $eq: 'Rejected' } }];
  }
  if (method == 'un') {
    matchvalue = [{ callstatus: { $eq: 'declined' } }, { status: { $eq: 'UnDelivered' } }];
  }
  let values = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: matchvalue,
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'shoplists',
              localField: 'SType',
              foreignField: '_id',
              as: 'shoplists',
            },
          },
          {
            $unwind: '$shoplists',
          },
          {
            $project: {
              SName: 1,
              _id: 1,
              shopType: '$shoplists.shopList',
            },
          },
        ],
        as: 'shops',
      },
    },
    {
      $unwind: '$shops',
    },

    {
      $lookup: {
        from: 'callhistories',
        localField: 'shopId',
        foreignField: 'shopId',
        pipeline: [{ $match: { date: todaydate } }],
        as: 'callhistories',
      },
    },
    {
      $project: {
        _id: 1,
        shopId: 1,
        status: 1,
        OrderId: 1,
        customerBillId: 1,
        date: 1,
        delivery_type: 1,
        devevery_mode: 1,
        time_of_delivery: 1,
        Payment: 1,
        shops: '$shops.SName',
        shopType: '$shops.shopType',
        calls: { $size: '$callhistories' },
        callhistories: '$callhistories',
        created: 1,
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);

  let total = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: matchvalue,
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shops',
      },
    },
    {
      $unwind: '$shops',
    },
    {
      $lookup: {
        from: 'callhistories',
        localField: 'shopId',
        foreignField: 'shopId',
        pipeline: [{ $match: { date: todaydate } }],
        as: 'callhistories',
      },
    },
  ]);
  let userRole = await UserRole.findById(userRoles);
  let User = await Users.findById(userId);
  //////console.log(userRoles, userId);
  return { values: values, total: total.length, Role: userRole.roleName, User: User.name };
};

const lapsed_reschedule = async (page, userRoles, userId, method) => {
  let yersterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
  let todaydate = moment().format('YYYY-MM-DD');
  if (method == 'lp') {
    matchvalue = [
      { callstatus: { $eq: 'reschedule' } },
      { status: { $ne: 'UnDelivered' } },
      { date: yersterday },
      { status: { $ne: 'Delivered' } },
      { status: { $ne: 'Rejected' } },
    ];
  }
  if (method == 're') {
    matchvalue = [{ callstatus: { $eq: 'reschedule' } }, { status: { $eq: 'Rejected' } }];
  }
  if (method == 'un') {
    matchvalue = [{ callstatus: { $eq: 'reschedule' } }, { status: { $eq: 'UnDelivered' } }];
  }
  let values = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: matchvalue,
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'shoplists',
              localField: 'SType',
              foreignField: '_id',
              as: 'shoplists',
            },
          },
          {
            $unwind: '$shoplists',
          },
          {
            $project: {
              SName: 1,
              _id: 1,
              shopType: '$shoplists.shopList',
            },
          },
        ],
        as: 'shops',
      },
    },
    {
      $lookup: {
        from: 'callhistories',
        localField: 'shopId',
        foreignField: 'shopId',
        pipeline: [{ $match: { date: todaydate } }],
        as: 'callhistories',
      },
    },
    {
      $lookup: {
        from: 'callhistories',
        localField: 'callhistoryId',
        foreignField: '_id',
        pipeline: [{ $match: { callStatus: 'reschedule', date: { $gte: moment().format('YYYY-MM-DD') } } }],
        as: 'callhistoriesdata',
      },
    },
    {
      $unwind: '$callhistoriesdata',
    },
    {
      $project: {
        _id: 1,
        shopId: 1,
        status: 1,
        OrderId: 1,
        customerBillId: 1,
        date: 1,
        delivery_type: 1,
        devevery_mode: 1,
        time_of_delivery: 1,
        Payment: 1,
        shops: '$shops.SName',
        shopType: '$shops.shopType',
        calls: { $size: '$callhistories' },
        callhistories: '$callhistories',
        callhistoriesdata: '$callhistoriesdata',
        created: 1,
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);

  let total = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: matchvalue,
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shops',
      },
    },
    {
      $unwind: '$shops',
    },
    {
      $lookup: {
        from: 'callhistories',
        localField: 'shopId',
        foreignField: 'shopId',
        pipeline: [{ $match: { date: todaydate } }],
        as: 'callhistories',
      },
    },
    {
      $lookup: {
        from: 'callhistories',
        localField: 'callhistoryId',
        foreignField: '_id',
        pipeline: [{ $match: { callStatus: 'reschedule', date: { $gte: moment().format('YYYY-MM-DD') } } }],
        as: 'callhistoriesdata',
      },
    },
    {
      $unwind: '$callhistoriesdata',
    },
  ]);
  let userRole = await UserRole.findById(userRoles);
  let User = await Users.findById(userId);
  //////console.log(userRoles, userId);
  return { values: values, total: total.length, Role: userRole.roleName, User: User.name };
};

const lapsedordercount = async (method) => {
  //////console.log('asd');
  let todaydate = moment().format('YYYY-MM-DD');
  let yersterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
  let callBackmatch;
  let reschedulematch;
  let acceptmatch;
  let declinedmatch;
  let pendingmatch;

  if (method == 'lp') {
    pendingmatch = [
      {
        callstatus: { $ne: 'callback' },
      },
      {
        callstatus: { $ne: 'accept' },
      },
      {
        callstatus: { $ne: 'declined' },
      },
      {
        callstatus: { $ne: 'reschedule' },
      },
      { status: { $ne: 'UnDelivered' } },
      { date: yersterday },
      { status: { $ne: 'Delivered' } },
      { status: { $ne: 'Rejected' } },
    ];
    callBackmatch = [
      { callstatus: { $eq: 'callback' } },
      { status: { $ne: 'UnDelivered' } },
      { date: yersterday },
      { status: { $ne: 'Delivered' } },
      { status: { $ne: 'Rejected' } },
    ];
    acceptmatch = [
      { callstatus: { $eq: 'accept' } },
      { status: { $ne: 'UnDelivered' } },
      { date: yersterday },
      { status: { $ne: 'Delivered' } },
      { status: { $ne: 'Rejected' } },
    ];
    declinedmatch = [
      { callstatus: { $eq: 'declined' } },
      { status: { $ne: 'UnDelivered' } },
      { date: yersterday },
      { status: { $ne: 'Delivered' } },
      { status: { $ne: 'Rejected' } },
    ];
    reschedulematch = [
      { callstatus: { $eq: 'reschedule' } },
      { status: { $ne: 'UnDelivered' } },
      { date: yersterday },
      { status: { $ne: 'Delivered' } },
      { status: { $ne: 'Rejected' } },
    ];
  }
  if (method == 're') {
    pendingmatch = [
      {
        callstatus: { $ne: 'callback' },
      },
      {
        callstatus: { $ne: 'accept' },
      },
      {
        callstatus: { $ne: 'declined' },
      },
      {
        callstatus: { $ne: 'reschedule' },
      },
      { status: { $eq: 'Rejected' } },
    ];
    callBackmatch = [{ callstatus: { $eq: 'callback' } }, { status: { $eq: 'Rejected' } }];
    acceptmatch = [{ callstatus: { $eq: 'accept' } }, { status: { $eq: 'Rejected' } }];
    declinedmatch = [{ callstatus: { $eq: 'declined' } }, { status: { $eq: 'Rejected' } }];
    reschedulematch = [{ callstatus: { $eq: 'reschedule' } }, { status: { $eq: 'Rejected' } }];
  }
  if (method == 'un') {
    pendingmatch = [
      {
        callstatus: { $ne: 'callback' },
      },
      {
        callstatus: { $ne: 'accept' },
      },
      {
        callstatus: { $ne: 'declined' },
      },
      {
        callstatus: { $ne: 'reschedule' },
      },
      { status: { $eq: 'UnDelivered' } },
    ];
    callBackmatch = [{ callstatus: { $eq: 'callback' } }, { status: { $eq: 'UnDelivered' } }];
    acceptmatch = [{ callstatus: { $eq: 'accept' } }, { status: { $eq: 'UnDelivered' } }];
    declinedmatch = [{ callstatus: { $eq: 'declined' } }, { status: { $eq: 'UnDelivered' } }];
    reschedulematch = [{ callstatus: { $eq: 'reschedule' } }, { status: { $eq: 'UnDelivered' } }];
  }
  let callBack = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: callBackmatch,
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shops',
      },
    },
    {
      $unwind: '$shops',
    },
    {
      $lookup: {
        from: 'callhistories',
        localField: 'shopId',
        foreignField: 'shopId',
        pipeline: [{ $match: { date: todaydate } }],
        as: 'callhistories',
      },
    },
  ]);
  let reschedule = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: reschedulematch,
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shops',
      },
    },
    {
      $unwind: '$shops',
    },
    {
      $lookup: {
        from: 'callhistories',
        localField: 'shopId',
        foreignField: 'shopId',
        pipeline: [{ $match: { date: todaydate } }],
        as: 'callhistories',
      },
    },
    {
      $lookup: {
        from: 'callhistories',
        localField: 'callhistoryId',
        foreignField: '_id',
        pipeline: [{ $match: { callStatus: 'reschedule', date: { $gte: moment().format('YYYY-MM-DD') } } }],
        as: 'callhistoriesdata',
      },
    },
    {
      $unwind: '$callhistoriesdata',
    },
  ]);

  let accept = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: acceptmatch,
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shops',
      },
    },
    {
      $unwind: '$shops',
    },
    {
      $lookup: {
        from: 'callhistories',
        localField: 'shopId',
        foreignField: 'shopId',
        pipeline: [{ $match: { date: todaydate } }],
        as: 'callhistories',
      },
    },
  ]);
  let declined = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: declinedmatch,
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shops',
      },
    },
    {
      $unwind: '$shops',
    },
    {
      $lookup: {
        from: 'callhistories',
        localField: 'shopId',
        foreignField: 'shopId',
        pipeline: [{ $match: { date: todaydate } }],
        as: 'callhistories',
      },
    },
  ]);
  let pending = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: pendingmatch,
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shops',
      },
    },
    {
      $unwind: '$shops',
    },
    {
      $lookup: {
        from: 'callhistories',
        localField: 'shopId',
        foreignField: 'shopId',
        pipeline: [{ $match: { date: todaydate } }],
        as: 'callhistories',
      },
    },
  ]);
  return {
    callBack: callBack.length,
    reschedule: reschedule.length,
    accept: accept.length,
    declined: declined.length,
    pending: pending.length,
  };
};

const getBills_ByShop = async (shopId) => {
  let values = await OrderPayment.aggregate([
    {
      $lookup: {
        from: 'shoporderclones',
        localField: 'orderId',
        foreignField: '_id',
        pipeline: [{ $match: { shopId: shopId } }],
        as: 'orders',
      },
    },
    {
      $unwind: '$orders',
    },
    {
      $project: {
        _id: 1,
        payment: 1,
        paidAmt: 1,
        date: 1,
      },
    },
  ]);
  return values;
};

const getBills_DetailsByshop = async (shopId, page) => {
  let values = await ShopOrderClone.aggregate([
    {
      $match: { $and: [{ shopId: shopId }] },
    },
    {
      $match: { statusActionArray: { $elemMatch: { status: { $in: ['Delivered', 'Delivery Completed'] } } } },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $project: {
              Amount: { $multiply: ['$finalQuantity', '$finalPricePerKg'] },
              GST_Number: 1,
            },
          },
          {
            $project: {
              sum: '$sum',
              percentage: {
                $divide: [
                  {
                    $multiply: ['$GST_Number', '$Amount'],
                  },
                  100,
                ],
              },
              value: '$Amount',
            },
          },
          {
            $project: {
              price: { $sum: ['$value', '$percentage'] },
              value: '$value',
              GST: '$percentage',
            },
          },
          { $group: { _id: null, price: { $sum: '$price' } } },
        ],
        as: 'productData',
      },
    },
    {
      $unwind: {
        path: '$productData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'orderpayments',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $group: {
              _id: null,
              amount: {
                $sum: '$paidAmt',
              },
            },
          },
        ],
        as: 'orderpayments',
      },
    },
    {
      $unwind: {
        path: '$orderpayments',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'billadjustments',
        localField: 'shopId',
        foreignField: 'shopId',
        as: 'adjBill',
      },
    },
    {
      $unwind: {
        path: '$adjBill',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shops',
      },
    },
    {
      $unwind: {
        path: '$shops',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        paidAmt: { $ifNull: ['$orderpayments.amount', 0] },
        totalPendingAmount: {
          $round: [{ $subtract: ['$productData.price', { $ifNull: ['$orderpayments.amount', 0] }] }],
        },
        totalAmount: { $round: ['$productData.price'] },
        adjBill: '$adjBill.un_Billed_amt',
        shops: '$shops.SName',
        OrderId: { $ifNull: ['$customerBillId', 'OrderId'] },
        date: 1,
      },
    },
    {
      $match: {
        totalPendingAmount: { $gt: 0 },
      },
    },
    {
      $skip: 10 * page,
    },
    {
      $limit: 10,
    },
  ]);
  let total = await ShopOrderClone.aggregate([
    {
      $match: { $and: [{ shopId: shopId }] },
    },
    // {
    //   $match: { statusActionArray: { $elemMatch: { status: { $in: ['Delivered', 'Delivery Completed'] } } } }
    // },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $project: {
              Amount: { $multiply: ['$finalQuantity', '$finalPricePerKg'] },
              GST_Number: 1,
            },
          },
          {
            $project: {
              sum: '$sum',
              percentage: {
                $divide: [
                  {
                    $multiply: ['$GST_Number', '$Amount'],
                  },
                  100,
                ],
              },
              value: '$Amount',
            },
          },
          {
            $project: {
              price: { $sum: ['$value', '$percentage'] },
              value: '$value',
              GST: '$percentage',
            },
          },
          { $group: { _id: null, price: { $sum: '$price' } } },
        ],
        as: 'productData',
      },
    },
    {
      $unwind: {
        path: '$productData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'orderpayments',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $group: {
              _id: null,
              amount: {
                $sum: '$paidAmt',
              },
            },
          },
        ],
        as: 'orderpayments',
      },
    },
    {
      $unwind: {
        path: '$orderpayments',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'billadjustments',
        localField: 'shopId',
        foreignField: 'shopId',
        as: 'adjBill',
      },
    },
    {
      $unwind: {
        path: '$adjBill',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shops',
      },
    },
    {
      $unwind: {
        path: '$shops',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        paidAmt: { $ifNull: ['$orderpayments.amount', 0] },
        totalPendingAmount: {
          $round: [{ $subtract: ['$productData.price', { $ifNull: ['$orderpayments.amount', 0] }] }],
        },
        totalAmount: { $round: ['$productData.price'] },
        adjBill: '$adjBill.un_Billed_amt',
        shops: '$shops.SName',
        OrderId: 1,
        date: 1,
      },
    },
    {
      $match: {
        totalPendingAmount: { $gt: 0 },
      },
    },
  ]);
  let shops = await BillAdj.findOne({ shopId: shopId });
  return { values: values, shops: shops, total: total.length };
};

const vieworderbill_byshop = async (id) => {
  let value = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [{ shopId: { $eq: id } }, { status: { $eq: 'Delivered' } }, { statusOfBill: { $eq: 'Pending' } }],
      },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $project: {
              Amount: { $multiply: ['$finalQuantity', '$finalPricePerKg'] },
              GST_Number: 1,
            },
          },
          {
            $project: {
              sum: '$sum',
              percentage: {
                $divide: [
                  {
                    $multiply: ['$GST_Number', '$Amount'],
                  },
                  100,
                ],
              },
              value: '$Amount',
            },
          },
          {
            $project: {
              price: { $sum: ['$value', '$percentage'] },
              value: '$value',
              GST: '$percentage',
            },
          },
          { $group: { _id: null, price: { $sum: '$price' } } },
        ],
        as: 'productData',
      },
    },
    {
      $unwind: {
        path: '$productData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'orderpayments',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $group: { _id: null, price: { $sum: '$paidAmt' } },
          },
        ],
        as: 'orderpayments',
      },
    },
    {
      $unwind: {
        path: '$orderpayments',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'orderpayments',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $sort: { date: -1, time: -1 },
          },
          {
            $limit: 1,
          },
        ],
        as: 'lastpaid',
      },
    },
    {
      $unwind: {
        path: '$lastpaid',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        orderpayments: '$orderpayments.price',
        productData: { $round: '$productData.price' },
        pendingAmount: { $round: { $subtract: ['$productData.price', '$orderpayments.price'] } },
        OrderId: 1,
        created: 1,
        status: 1,
        delivery_type: 1,
        time_of_delivery: 1,
        paymentMethod: 1,
        customerBillId: 1,
        delivered_date: 1,
        Scheduledate: 1,
        lastpaidamount: '$lastpaid.paidAmt',
        payment: '$lastpaid.payment',
        paymentMethod: '$lastpaid.paymentMethod',
        paymentstutes: '$lastpaid.paymentstutes',
        creditBillAssignedStatus: 1,
        Schedulereason: 1,
        Scheduledate: 1,
      },
    },
  ]);
  let shop = await Shop.findById(id);
  return { value: value, shop: shop };
};

const mismachstockscreate = async (body) => {
  let groupId = body.groupId;
  let stocks = body.stocks;
  let stockstatus = body.stockstatus;
  let cashstatus = body.cashstatus;
  let cash = body.cash;
  if (cashstatus == 'change') {
    let order = await wardAdminGroup.findById(groupId);
    if ((order.pettyCash != 0 && order.pettyCash != '') || order.pettyCash != null) {
      let pettyCash = order.pettyCash - cash;
      if (pettyCash > 0) {
        await wardAdminGroup.findByIdAndUpdate(
          { _id: groupId },
          { mismatchAmount: pettyCash, cashmismatch: cashstatus },
          { new: true }
        );
        await MismatchStock.create({
          groupId: groupId,
          type: 'cash',
          mismatchAmount: pettyCash,
          receivedAmount: cash,
          date: moment().format('YYYY-MM-DD'),
          time: moment().format('HHmm'),
          created: moment(),
          status: 'Pending',
        });
      }
    }
  }
  if (stockstatus == 'change') {
    let products = await ProductorderClone.aggregate([
      {
        $lookup: {
          from: 'shoporderclones',
          localField: 'orderId',
          foreignField: '_id',
          pipeline: [
            {
              $lookup: {
                from: 'orderassigns',
                localField: '_id',
                foreignField: 'orderId',
                pipeline: [{ $match: { $and: [{ wardAdminGroupID: { $eq: groupId } }] } }],
                as: 'orderassigns',
              },
            },
            { $unwind: '$orderassigns' },
          ],
          as: 'shoporderclones',
        },
      },
      {
        $unwind: '$shoporderclones',
      },
      {
        $lookup: {
          from: 'pettystockmodels',
          localField: 'productid',
          foreignField: 'productId',
          pipeline: [{ $match: { $and: [{ wardAdminId: { $eq: groupId } }] } }],
          as: 'pettystockmodels',
        },
      },
      {
        $unwind: {
          path: '$pettystockmodels',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          pettystock: { $ifNull: ['$pettystockmodels.pettyStock', 0] },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productid',
          foreignField: '_id',
          as: 'products',
        },
      },
      {
        $unwind: {
          path: '$products',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          finalQuantity: 1,
          finalPricePerKg: 1,
          totalQuantity: { $sum: [{ $multiply: ['$finalQuantity', '$packKg'] }] },
          pettystockmodels: '$pettystockmodels',
          pettystock: 1,
          products: '$products.productTitle',
          productid: 1,
        },
      },
      {
        $group: {
          _id: { productTitle: '$products', productid: '$productid' },
          pettystock: { $sum: '$pettystock' },
          totalQuantity: { $sum: '$totalQuantity' },
          finalQuantity: { $sum: '$finalQuantity' },
          productCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 1,
          pettystock: { $divide: ['$pettystock', '$productCount'] },
          totalQuantity: { $sum: ['$totalQuantity', { $divide: ['$pettystock', '$productCount'] }] },
          finalQuantity: 1,
          productTitle: '$_id.productTitle',
          productid: '$_id.productid',
        },
      },
    ]);

    if (products.length == 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'ShopOrderClone Not Found');
    }
    stocks.forEach(async (e) => {
      if (products.findIndex((a) => a.productid == e.productId) != -1) {
        let totalQTY = products[products.findIndex((a) => a.productid == e.productId)].totalQuantity;
        let mismatch = totalQTY - e.qunatity;
        if (mismatch > 0) {
          await MismatchStock.create({
            productId: e.productId,
            groupId: groupId,
            type: 'stock',
            mismatchQty: mismatch,
            receivedQty: e.qunatity,
            date: moment().format('YYYY-MM-DD'),
            time: moment().format('HHmm'),
            created: moment(),
            status: 'Pending',
          });
        }
      }
    });
  }
  await wardAdminGroup.findByIdAndUpdate(
    { _id: groupId },
    { stockmismatch: stockstatus, manageDeliveryStatus: 'Order Picked' },
    { new: true }
  );
  let assign = await wardAdminGroupModel_ORDERS.find({ wardAdminGroupID: groupId });
  assign.forEach(async (e) => {
    await ShopOrderClone.findByIdAndUpdate({ _id: e.orderId }, { status: 'Order Picked' }, { new: true });
  });
  return { message: 'success' };
};

// ward Admin Order management flow

const WA_Order_status = async (page) => {
  let values = await ShopOrderClone.aggregate([
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $project: {
              Amount: { $multiply: ['$finalQuantity', '$finalPricePerKg'] },
              GST_Number: 1,
            },
          },
          {
            $project: {
              sum: '$sum',
              percentage: {
                $divide: [
                  {
                    $multiply: ['$GST_Number', '$Amount'],
                  },
                  100,
                ],
              },
              value: '$Amount',
            },
          },
          {
            $project: {
              price: { $sum: ['$value', '$percentage'] },
              value: '$value',
              GST: '$percentage',
            },
          },
          { $group: { _id: null, price: { $sum: '$price' } } },
        ],
        as: 'productData',
      },
    },
    {
      $unwind: {
        path: '$productData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'orderpayments',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $group: { _id: null, price: { $sum: '$paidAmt' } },
          },
        ],
        as: 'orderpayments',
      },
    },
    {
      $unwind: {
        path: '$orderpayments',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'shoplists',
              localField: 'SType',
              foreignField: '_id',
              as: 'shoptype',
            },
          },
          { $unwind: '$shoptype' },
          {
            $project: {
              _id: 1,
              SName: 1,
              SOwner: 1,
              mobile: 1,
              Slat: 1,
              Strid: 1,
              Slong: 1,
              address: 1,
              created: 1,
              shoptype: '$shoptype.shopList',
            },
          },
        ],
        as: 'shops',
      },
    },
    {
      $unwind: {
        path: '$shops',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'orderassigns',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $lookup: {
              from: 'wardadmingroups',
              localField: 'wardAdminGroupID',
              foreignField: '_id',
              as: 'wagroup',
            },
          },
          {
            $unwind: '$wagroup',
          },
          {
            $project: {
              _id: 1,
              vehicleId: '$wagroup.vehicleId',
              pickputype: '$wagroup.pickputype',
              pickuplocation: '$wagroup.pickuplocation',
              route: '$wagroup.route',
              groupId: '$wagroup.groupId',
              assignDate: '$wagroup.assignDate',
            },
          },
        ],
        as: 'orderassign',
      },
    },
    {
      $unwind: {
        path: '$orderassign',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'roles',
              localField: 'userRole',
              foreignField: '_id',
              as: 'roles',
            },
          },
          {
            $unwind: '$roles',
          },
          {
            $project: {
              _id: 1,
              name: 1,
              bookedBy: '$roles.roleName',
            },
          },
        ],
        as: 'users',
      },
    },
    {
      $unwind: '$users',
    },
    {
      $project: {
        _id: 1,
        status: 1,
        paidAmt: { $ifNull: ['$orderpayments.price', 0] },
        totalPendingAmount: {
          $round: [{ $subtract: ['$productData.price', { $ifNull: ['$orderpayments.price', 0] }] }],
        },
        orderedAmt: { $round: ['$productData.price', 0] },
        shopsName: '$shops.SName',
        // orderassign: '$orderassign',
        wagroup: '$wagroup',
        Payment: 1,
        paymentMethod: 1,
        route: { $ifNull: ['$orderassign.route', 'order Not Assigned'] },
        vehicleId: '$orderassign.vehicleId',
        groupId: '$orderassign.groupId',
        pickuplocation: '$orderassign.pickuplocation',
        pickputype: '$orderassign.pickputype',
        assignDate: '$orderassign.assignDate',
        BookedBy: '$users.bookedBy',
        shopDetails: '$shops',
        details_of_TC_SM: '$users',
        date: 1,
        OrderId: 1,
      },
    },
    {
      $skip: 10 * page,
    },
    {
      $limit: 10,
    },
  ]);
  let total = await ShopOrderClone.aggregate([
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $project: {
              Amount: { $multiply: ['$finalQuantity', '$finalPricePerKg'] },
              GST_Number: 1,
            },
          },
          {
            $project: {
              sum: '$sum',
              percentage: {
                $divide: [
                  {
                    $multiply: ['$GST_Number', '$Amount'],
                  },
                  100,
                ],
              },
              value: '$Amount',
            },
          },
          {
            $project: {
              price: { $sum: ['$value', '$percentage'] },
              value: '$value',
              GST: '$percentage',
            },
          },
          { $group: { _id: null, price: { $sum: '$price' } } },
        ],
        as: 'productData',
      },
    },
    {
      $unwind: {
        path: '$productData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'orderpayments',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $group: { _id: null, price: { $sum: '$paidAmt' } },
          },
        ],
        as: 'orderpayments',
      },
    },
    {
      $unwind: {
        path: '$orderpayments',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shops',
      },
    },
    {
      $unwind: {
        path: '$shops',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'orderassigns',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $lookup: {
              from: 'wardadmingroups',
              localField: 'wardAdminGroupID',
              foreignField: '_id',
              as: 'wagroup',
            },
          },
          {
            $unwind: '$wagroup',
          },
          {
            $project: {
              _id: 1,
              vehicleId: '$wagroup.vehicleId',
              pickputype: '$wagroup.pickputype',
              pickuplocation: '$wagroup.pickuplocation',
              route: '$wagroup.route',
              groupId: '$wagroup.groupId',
              assignDate: '$wagroup.assignDate',
            },
          },
        ],
        as: 'orderassign',
      },
    },
    {
      $unwind: {
        path: '$orderassign',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'roles',
              localField: 'userRole',
              foreignField: '_id',
              as: 'roles',
            },
          },
          {
            $unwind: '$roles',
          },
          {
            $project: {
              _id: 1,
              name: 1,
              bookedBy: '$roles.roleName',
            },
          },
        ],
        as: 'users',
      },
    },
    {
      $unwind: '$users',
    },
  ]);
  return { values: values, total: total.length };
};

const OGorders_MDorders = async (id) => {
  let values = await ShopOrderClone.aggregate([
    {
      $match: { _id: id },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $project: {
              Amount: { $multiply: ['$finalQuantity', '$finalPricePerKg'] },
              GST_Number: 1,
            },
          },
          {
            $project: {
              sum: '$sum',
              percentage: {
                $divide: [
                  {
                    $multiply: ['$GST_Number', '$Amount'],
                  },
                  100,
                ],
              },
              value: '$Amount',
            },
          },
          {
            $project: {
              price: { $sum: ['$value', '$percentage'] },
              value: '$value',
              GST: '$percentage',
            },
          },
          { $group: { _id: null, price: { $sum: '$price' } } },
        ],
        as: 'productData',
      },
    },
    {
      $unwind: {
        path: '$productData',
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $lookup: {
              from: 'products',
              localField: 'productid',
              foreignField: '_id',
              as: 'product',
            },
          },
          {
            $unwind: '$product',
          },
          {
            $project: {
              _id: 1,
              finalQuantity: 1,
              finalPricePerKg: 1,
              Modifiedamount: { $multiply: ['$finalQuantity', '$finalPricePerKg'] },
              productName: '$product.productTitle',
            },
          },
        ],
        as: 'modified',
      },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $lookup: {
              from: 'products',
              localField: 'productid',
              foreignField: '_id',
              as: 'product',
            },
          },
          {
            $unwind: '$product',
          },
          {
            $project: {
              _id: 1,
              quantity: 1,
              priceperkg: 1,
              productName: '$product.productTitle',
              amount: { $multiply: ['$quantity', '$priceperkg'] },
            },
          },
        ],
        as: 'productsByorders',
      },
    },
    {
      $lookup: {
        from: 'orderpayments',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $group: { _id: null, price: { $sum: '$paidAmt' } },
          },
        ],
        as: 'orderpayments',
      },
    },
    {
      $unwind: {
        path: '$orderpayments',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'orderassigns',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $lookup: {
              from: 'wardadmingroups',
              localField: 'wardAdminGroupID',
              foreignField: '_id',
              pipeline: [
                {
                  $lookup: {
                    from: 'vehicles',
                    localField: 'vehicleId',
                    foreignField: '_id',
                    as: 'vehicle',
                  },
                },
                {
                  $unwind: {
                    path: '$vehicle',
                    preserveNullAndEmptyArrays: true,
                  },
                },
              ],
              as: 'wagroup',
            },
          },
          {
            $unwind: '$wagroup',
          },
          {
            $project: {
              _id: 1,
              vehicleId: '$wagroup.vehicleId',
              pickputype: '$wagroup.pickputype',
              pickuplocation: '$wagroup.pickuplocation',
              route: '$wagroup.route',
              groupId: '$wagroup.groupId',
              assignDate: '$wagroup.assignDate',
              wardadmingroupId: '$wagroup._id',
              vehicleName: '$wagroup.vehicle.vehicleNo',
            },
          },
        ],
        as: 'orderassign',
      },
    },
    {
      $unwind: {
        path: '$orderassign',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        as: 'users',
      },
    },
    {
      $unwind: '$users',
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'deliveryExecutiveId',
        foreignField: '_id',
        as: 'deliveryExecutive',
      },
    },
    {
      $unwind: {
        path: '$deliveryExecutive',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        shopId: 1,
        status: 1,
        delivery_type: 1,
        Payment: 1,
        devevery_mode: 1,
        time_of_delivery: 1,
        paymentMethod: 1,
        OrderId: 1,
        customerBillId: 1,
        date: 1,
        time: 1,
        lapsedOrder: 1,
        DE_Name: '$users.name',
        orderedAmt: { $round: ['$productData.price', 0] },
        pendingAmt: { $subtract: [{ $round: ['$productData.price', 0] }, '$orderpayments.price'] },
        paidAmt: '$orderpayments.price',
        route: { $ifNull: ['$orderassign.route', 'nill'] },
        vehicleName: { $ifNull: ['$orderassign.vehicleName', 'nill'] },
        productByOrder: '$productByOrder',
        modifiedStatus: 1,
        deliveryExecutive: { $ifNull: ['$deliveryExecutive.name', 'nill'] },
        groupId: { $ifNull: ['$orderassign.groupId', 'nill'] },
        productByOrder: '$productsByorders',
        created: 1,
      },
    },
  ]);
  let modified = await ShopOrderClone.aggregate([
    {
      $match: {
        _id: id,
        modifiedStatus: 'Modified',
      },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $lookup: {
              from: 'products',
              localField: 'productid',
              foreignField: '_id',
              as: 'product',
            },
          },
          {
            $unwind: '$product',
          },
          {
            $project: {
              _id: 1,
              finalQuantity: 1,
              finalPricePerKg: 1,
              Modifiedamount: { $multiply: ['$finalQuantity', '$finalPricePerKg'] },
              productName: '$product.productTitle',
            },
          },
        ],
        as: 'modified',
      },
    },
  ]);
  return { values: values[0], modified: modified.length > 0 ? modified[0] : modified };
};

const details_Of_Payment_by_Id = async (id) => {
  let values = await ShopOrderClone.aggregate([
    {
      $match: {
        _id: id,
      },
    },
    {
      $lookup: {
        from: 'orderpayments',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $group: { _id: null, price: { $sum: '$paidAmt' } },
          },
        ],
        as: 'orderpayments',
      },
    },
    {
      $unwind: {
        path: '$orderpayments',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $project: {
              Amount: { $multiply: ['$finalQuantity', '$finalPricePerKg'] },
              GST_Number: 1,
            },
          },
          {
            $project: {
              sum: '$sum',
              percentage: {
                $divide: [
                  {
                    $multiply: ['$GST_Number', '$Amount'],
                  },
                  100,
                ],
              },
              value: '$Amount',
            },
          },
          {
            $project: {
              price: { $sum: ['$value', '$percentage'] },
              value: '$value',
              GST: '$percentage',
            },
          },
          { $group: { _id: null, price: { $sum: '$price' } } },
        ],
        as: 'productData',
      },
    },
    {
      $unwind: {
        path: '$productData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'orderpayments',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          { $match: { type: 'advanced' } },
          {
            $sort: { created: -1 },
          },
          { $limit: 1 },
        ],
        as: 'orderpayment',
      },
    },
    {
      $unwind: {
        path: '$orderpayment',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'orderpayments',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          { $match: { type: { $ne: 'advanced' } } },
          {
            $sort: { created: -1 },
          },
          { $limit: 1 },
        ],
        as: 'orderpaymentlast',
      },
    },
    {
      $unwind: {
        path: '$orderpaymentlast',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        delivery_type: 1,
        Payment: 1,
        devevery_mode: 1,
        time_of_delivery: 1,
        OrderId: 1,
        paymentMethod: 1,
        initialPaymentMode: '$orderpayment.payment',
        initialPaymenttype: '$orderpayment.paymentMethod',
        type: '$orderpayment.type',
        pendingAmt: { $subtract: [{ $round: ['$productData.price', 0] }, '$orderpayments.price'] },
        orderedAmt: { $round: ['$productData.price', 0] },
        paidAmt: '$orderpayments.price',
        orderpaymentlast: '$orderpaymentlast',
        delivery_paymentMethod: { $ifNull: ['$orderpaymentlast.paymentMethod', 'nill'] },
        delivered_payment: { $ifNull: ['$orderpaymentlast.payment', 'nill'] },
        delivered_PaidAmt: { $ifNull: ['$orderpaymentlast.paidAmt', 'nill'] },
      },
    },
  ]);
  return values;
};

const getPaymenthistory = async (id) => {
  let values = await OrderPayment.aggregate([
    {
      $match: {
        orderId: id,
      },
    },
  ]);
  return values;
};

const getallmanageIssus = async (query) => {
  let page = query.page == null || query.page == '' || query.page == 'null' ? 0 : query.page;
  let issues = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [{ raiseissue: { $eq: true } }],
      },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          { $match: { $and: [{ issueraised: { $eq: true } }] } },
          {
            $lookup: {
              from: 'products',
              localField: 'productid',
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
              status: 1,
              orderId: 1,
              productid: 1,
              quantity: 1,
              priceperkg: 1,
              GST_Number: 1,
              HSN_Code: 1,
              packtypeId: 1,
              packKg: 1,
              unit: 1,
              productTitle: '$products.productTitle',
              created: 1,
              finalQuantity: 1,
              finalPricePerKg: 1,
              GST_Number: 1,
              GSTamount: {
                $divide: [{ $multiply: [{ $multiply: ['$finalQuantity', '$priceperkg'] }, '$GST_Number'] }, 100],
              },
              issue: 1,
              issueDate: 1,
              issuediscription: 1,
              issuequantity: 1,
              issuetype: 1,
            },
          },
        ],
        as: 'productOrderdata',
      },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [{ $group: { _id: null, count: { $sum: 1 } } }],
        as: 'total_order',
      },
    },
    {
      $unwind: {
        path: '$total_order',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shopData',
      },
    },
    {
      $unwind: '$shopData',
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'deliveryExecutiveId',
        foreignField: '_id',
        as: 'b2busersData',
      },
    },
    {
      $unwind: {
        path: '$b2busersData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'shopData.Strid',
        foreignField: '_id',
        as: 'streetsData',
      },
    },
    {
      $unwind: '$streetsData',
    },
    {
      $project: {
        _id: 1,
        OrderId: 1,
        Payment: 1,
        UnDeliveredStatus: 1,
        created: 1,
        street: '$streetsData.street',
        type: '$shopData.type',
        SName: '$shopData.SName',
        name: '$b2busersData.name',
        productOrderdata: '$productOrderdata',
        statusActionArray: 1,
        delivered_date: 1,
        reason: 1,
        status: 1,
        issueStatus: 1,
        order_issues: 1,
        total_order: '$total_order.count',
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);

  let total = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [{ raiseissue: { $eq: true } }],
      },
    },
  ]);
  return { value: issues, total: total.length };
};

const getmanageIssus_byID = async (query) => {
  let issues = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [{ raiseissue: { $eq: true } }, { _id: { $eq: query.id } }],
      },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $lookup: {
              from: 'products',
              localField: 'productid',
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
              status: 1,
              orderId: 1,
              productid: 1,
              quantity: 1,
              priceperkg: 1,
              GST_Number: 1,
              HSN_Code: 1,
              packtypeId: 1,
              packKg: 1,
              unit: 1,
              productTitle: '$products.productTitle',
              created: 1,
              finalQuantity: 1,
              finalPricePerKg: 1,
              GST_Number: 1,
              GSTamount: {
                $divide: [{ $multiply: [{ $multiply: ['$finalQuantity', '$priceperkg'] }, '$GST_Number'] }, 100],
              },
              issue: 1,
              issueDate: 1,
              issuediscription: 1,
              issuequantity: 1,
              issuetype: 1,
            },
          },
        ],
        as: 'allProducts',
      },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          { $match: { $and: [{ issueraised: { $eq: true } }] } },
          {
            $lookup: {
              from: 'products',
              localField: 'productid',
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
              status: 1,
              orderId: 1,
              productid: 1,
              quantity: 1,
              priceperkg: 1,
              GST_Number: 1,
              HSN_Code: 1,
              packtypeId: 1,
              packKg: 1,
              unit: 1,
              productTitle: '$products.productTitle',
              created: 1,
              finalQuantity: 1,
              finalPricePerKg: 1,
              GST_Number: 1,
              GSTamount: {
                $divide: [{ $multiply: [{ $multiply: ['$finalQuantity', '$priceperkg'] }, '$GST_Number'] }, 100],
              },
              issue: 1,
              issueDate: 1,
              issuediscription: 1,
              issuequantity: 1,
              issuetype: 1,
              issueStatus: 1,
            },
          },
        ],
        as: 'issueProducts',
      },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [{ $match: { $and: [{ issueraised: { $eq: true } }, { issueStatus: { $eq: 'Pending' } }] } }],
        as: 'issueProducts_status',
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shopData',
      },
    },
    {
      $unwind: '$shopData',
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'deliveryExecutiveId',
        foreignField: '_id',
        as: 'b2busersData',
      },
    },
    {
      $unwind: {
        path: '$b2busersData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'shopData.Strid',
        foreignField: '_id',
        as: 'streetsData',
      },
    },
    {
      $unwind: '$streetsData',
    },
    {
      $project: {
        _id: 1,
        OrderId: 1,
        Payment: 1,
        UnDeliveredStatus: 1,
        created: 1,
        street: '$streetsData.street',
        type: '$shopData.type',
        SName: '$shopData.SName',
        name: '$b2busersData.name',
        productOrderdata: '$productOrderdata',
        statusActionArray: 1,
        delivered_date: 1,
        reason: 1,
        status: 1,
        allProducts: '$allProducts',
        issueProducts: '$issueProducts',
        issueProducts_status: '$issueProducts_status',
        issueStatus_show: { $anyElementTrue: ['$issueProducts_status'] },
        issueStatus: 1,
      },
    },
  ]);
  if (issues.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shop order Not Found');
  }
  return issues[0];
};

const UnDeliveredOrders = async (query) => {
  let dateMatch = { active: true };
  let deMacth = { active: true };
  let searchMatch = { active: true };
  let date = query.date;
  let de = query.de;
  let search = query.search;
  let page = parseInt(query.page);
  if (date != null && date != '') {
    date = date.split(',');
    startdate = date[0];
    enddata = date[1];
    dateMatch = { $and: [{ createdDate: { $gte: startdate } }, { createdDate: { $lte: enddata } }] };
  }
  if (de != null && de != '') {
    deMacth = { $and: [{ deliveryExecutiveId: { $eq: de } }] };
  }
  if (search != null && search != '') {
    searchMatch = {
      $or: [{ SName: { $regex: search, $options: 'i' } }],
    };
  }
  let values = await ShopOrderClone.aggregate([
    {
      $match: { statusActionArray: { $elemMatch: { status: { $in: ['unDelivered'] } } } },
    },
    {
      $addFields: {
        createdDate: { $dateToString: { date: '$created', format: '%Y-%m-%d' } },
      },
    },
    {
      $match: { $and: [dateMatch, deMacth] },
    },

    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [
          {
            $match: { $and: [searchMatch] },
          },
          {
            $lookup: {
              from: 'wards',
              localField: 'Wardid',
              foreignField: '_id',
              as: 'wardData',
            },
          },
          { $unwind: '$wardData' },
          {
            $lookup: {
              from: 'streets',
              localField: 'Strid',
              foreignField: '_id',
              as: 'streetData',
            },
          },
          { $unwind: '$streetData' },
        ],
        as: 'shopData',
      },
    },
    {
      $unwind: '$shopData',
    },
    {
      $lookup: {
        from: 'orderassigns',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $sort: { created: -1 },
          },
          { $limit: 1 },
          {
            $lookup: {
              from: 'wardadmingroups',
              localField: 'wardAdminGroupID',
              foreignField: '_id',
              as: 'group',
            },
          },
          { $unwind: '$group' },
        ],
        as: 'orderassign',
      },
    },
    {
      $unwind: {
        path: '$orderassign',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $project: {
              Amount: { $multiply: ['$finalQuantity', '$finalPricePerKg'] },
              GST_Number: 1,
            },
          },
          {
            $project: {
              sum: '$sum',
              percentage: {
                $divide: [
                  {
                    $multiply: ['$GST_Number', '$Amount'],
                  },
                  100,
                ],
              },
              value: '$Amount',
            },
          },
          {
            $project: {
              price: { $sum: ['$value', '$percentage'] },
              value: '$value',
              GST: '$percentage',
            },
          },
          { $group: { _id: null, price: { $sum: '$price' } } },
        ],
        as: 'productData',
      },
    },
    {
      $unwind: {
        path: '$productData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'orderpayments',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $match: {
              $and: [{ type: { $eq: 'advanced' } }],
            },
          },
          {
            $group: {
              _id: null,
              amount: {
                $sum: '$paidAmt',
              },
            },
          },
        ],
        as: 'orderpayments',
      },
    },
    {
      $unwind: {
        path: '$orderpayments',
        preserveNullAndEmptyArrays: true,
      },
    },
    //deliveryExecutiveId
    {
      $lookup: {
        from: 'b2busers',
        localField: 'deliveryExecutiveId',
        foreignField: '_id',
        as: 'users',
      },
    },
    {
      $unwind: '$users',
    },
    {
      $project: {
        _id: 1,
        shopId: 1,
        status: 1,
        customerDeliveryStatus: 1,
        OrderId: 1,
        customerBillId: 1,
        shopName: '$shopData.SName',
        wardId: '$shopData.Wardid',
        street: '$shopData.streetData.street',
        ward: '$shopData.wardData.ward',
        // orderassign: '$orderassign',
        paidAmt: { $ifNull: ['$orderpayments.amount', 0] },
        orderedAmt: { $round: ['$productData.price'] },
        pendingAmount: { $subtract: [{ $round: ['$productData.price'] }, { $ifNull: ['$orderpayments.amount', 0] }] },
        createdDate: 1,
        undeliveyreason: 1,
        groupId: { $ifNull: ['$orderassign.group.groupId', 'nill'] },
        // users: '$users',
        DE: '$users.name',
        deliveryExecutiveId: 1,
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await ShopOrderClone.aggregate([
    {
      $match: { statusActionArray: { $elemMatch: { status: { $in: ['unDelivered'] } } } },
    },
    {
      $addFields: {
        createdDate: { $dateToString: { date: '$created', format: '%Y-%m-%d' } },
      },
    },
    {
      $match: { $and: [dateMatch, deMacth] },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [
          {
            $match: { $and: [searchMatch] },
          },
          {
            $lookup: {
              from: 'wards',
              localField: 'Wardid',
              foreignField: '_id',
              as: 'wardData',
            },
          },
          { $unwind: '$wardData' },
          {
            $lookup: {
              from: 'streets',
              localField: 'Strid',
              foreignField: '_id',
              as: 'streetData',
            },
          },
          { $unwind: '$streetData' },
        ],
        as: 'shopData',
      },
    },
    {
      $unwind: '$shopData',
    },
    {
      $lookup: {
        from: 'orderassigns',
        localField: '_id',
        foreignField: 'orderId',
        as: 'orderassign',
      },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $project: {
              Amount: { $multiply: ['$finalQuantity', '$finalPricePerKg'] },
              GST_Number: 1,
            },
          },
          {
            $project: {
              sum: '$sum',
              percentage: {
                $divide: [
                  {
                    $multiply: ['$GST_Number', '$Amount'],
                  },
                  100,
                ],
              },
              value: '$Amount',
            },
          },
          {
            $project: {
              price: { $sum: ['$value', '$percentage'] },
              value: '$value',
              GST: '$percentage',
            },
          },
          { $group: { _id: null, price: { $sum: '$price' } } },
        ],
        as: 'productData',
      },
    },
    {
      $unwind: {
        path: '$productData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'orderpayments',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $group: {
              _id: null,
              amount: {
                $sum: '$paidAmt',
              },
            },
          },
        ],
        as: 'orderpayments',
      },
    },
    {
      $unwind: {
        path: '$orderpayments',
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);
  return { values: values, total: total.length };
};

const getall_ordered_shops = async (query) => {
  //////console.log(query)
  let page = query.page == null || query.page == '' || query.page == 'null' ? 0 : query.page;
  let statusMatch = { status: { $eq: query.status } };
  let deliveryType = { delivery_type: { $eq: query.deliverytype } };
  let timeSlot = { active: true };
  let deliveryMode = { active: true };
  let today = moment().format('YYYY-MM-DD');
  let yesterday = moment().subtract(1, 'days').format('yyyy-MM-DD');
  let dateMacth = { active: true };
  //////console.log(today)
  //////console.log(yesterday)
  if (query.status == 'Approved') {
    statusMatch = {
      status: {
        $in: [
          'Approved',
          'Modified',
          'Packed',
          'Assigned',
          'Order Picked',
          'Delivery start',
          'UnDelivered',
          'Delivery Completed',
        ],
      },
    };
  }
  if (query.deliverytype == 'all') {
    deliveryType = {
      $or: [
        {
          $and: [{ delivery_type: { $eq: 'IMD' } }, { date: { $eq: today } }],
        },
        {
          $and: [{ delivery_type: { $eq: 'NDD' } }, { date: { $eq: yesterday } }],
        },
      ],
    };
    dateMacth = { active: true };
  }
  if (query.deliverytype == 'IMD' || query.deliverytype == 'NDD') {
    dateMacth = { date: { $in: [today] } };
  }
  if (query.deliverytype == 'YOD') {
    dateMacth = { date: { $in: [yesterday] } };
    deliveryType = { delivery_type: { $eq: 'NDD' } };
  }
  if (query.timeslot != 'all') {
    timeSlot = { time_of_delivery: { $eq: query.timeslot } };
  }
  if (query.deliverymode != 'all') {
    deliveryMode = { devevery_mode: { $eq: query.deliverymode } };
  }

  let values = await ShopOrderClone.aggregate([
    { $sort: { created: 1 } },
    { $match: { $and: [statusMatch, deliveryType, timeSlot, deliveryMode, dateMacth] } },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $lookup: {
              from: 'products',
              localField: 'productid',
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
              GST_Number: 1,
              created: 1,
              HSN_Code: 1,
              finalPricePerKg: 1,
              finalQuantity: 1,
              orderId: 1,
              packKg: 1,
              priceperkg: 1,
              quantity: 1,
              status: 1,
              unit: 1,
              productTitle: '$products.productTitle',
            },
          },
        ],
        as: 'productOrderdata',
      },
    },
    {
      $lookup: {
        from: 'orderpayments',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $group: {
              _id: null,
              amount: {
                $sum: '$paidAmt',
              },
            },
          },
        ],
        as: 'orderpayments',
      },
    },
    {
      $unwind: {
        path: '$orderpayments',
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'b2bshopclones',
      },
    },
    {
      $unwind: '$b2bshopclones',
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        as: 'b2busers',
      },
    },
    {
      $unwind: {
        path: '$b2busers',
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $project: {
              Amount: { $multiply: ['$finalQuantity', '$finalPricePerKg'] },
              GST_Number: 1,
            },
          },
          {
            $project: {
              sum: '$sum',
              percentage: {
                $divide: [
                  {
                    $multiply: ['$GST_Number', '$Amount'],
                  },
                  100,
                ],
              },
              value: '$Amount',
            },
          },
          {
            $project: {
              price: { $sum: ['$value', '$percentage'] },
              value: '$value',
              GST: '$percentage',
            },
          },
          { $group: { _id: null, price: { $sum: '$price' } } },
        ],
        as: 'productData',
      },
    },
    {
      $unwind: {
        path: '$productData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        orderType: 1,
        status: 1,
        created: 1,
        OrderId: 1,
        product: '$productOrderdata',
        SName: '$b2bshopclones.SName',
        mobile: '$b2bshopclones.mobile',
        address: '$b2bshopclones.address',
        orderBy: '$b2busers.name',
        delivery_type: 1,
        devevery_mode: 1,
        time_of_delivery: 1,
        paidAmount: '$orderpayments.amount',
        subtotal: '$productData.price',
        productData: '$productData',
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);

  let total = await ShopOrderClone.aggregate([
    { $sort: { created: -1 } },
    { $match: { $and: [statusMatch, deliveryType, timeSlot, deliveryMode, dateMacth] } },
  ]);

  let counts = await get_order_counts_ordered(statusMatch, deliveryType, timeSlot, deliveryMode, dateMacth);

  return { value: values, total: total.length, counts: counts };
};

const get_order_counts_ordered = async (status, deliverytype, timeslot, deliverymode, dateMacth) => {
  ////console.log(pincode, 'sdf');
  let today = moment().format('YYYY-MM-DD');
  let yesterday = moment().subtract(1, 'days').format('yyyy-MM-DD');
  let orderstatus = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [
          { status: { $eq: 'ordered' } },
          {
            $or: [
              {
                $and: [{ delivery_type: { $eq: 'IMD' } }, { date: { $eq: today } }],
              },
              {
                $and: [{ delivery_type: { $eq: 'NDD' } }, { date: { $eq: yesterday } }],
              },
            ],
          },
        ],
      },
    },
  ]);
  let Acknowledgedstatus = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [
          { status: { $eq: 'Acknowledged' } },
          {
            $or: [
              {
                $and: [{ delivery_type: { $eq: 'IMD' } }, { date: { $eq: today } }],
              },
              {
                $and: [{ delivery_type: { $eq: 'NDD' } }, { date: { $eq: yesterday } }],
              },
            ],
          },
        ],
      },
    },
  ]);
  let Approvedstatus = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [
          {
            status: {
              $in: [
                'Approved',
                'Modified',
                'Packed',
                'Assigned',
                'Order Picked',
                'Delivery start',
                'UnDelivered',
                'Delivery Completed',
              ],
            },
          },
          {
            $or: [
              {
                $and: [{ delivery_type: { $eq: 'IMD' } }, { date: { $eq: today } }],
              },
              {
                $and: [{ delivery_type: { $eq: 'NDD' } }, { date: { $eq: yesterday } }],
              },
            ],
          },
        ],
      },
    },
  ]);
  let rejectstatus = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [
          { status: { $eq: 'Rejected' } },
          {
            $or: [
              {
                $and: [{ delivery_type: { $eq: 'IMD' } }, { date: { $eq: today } }],
              },
              {
                $and: [{ delivery_type: { $eq: 'NDD' } }, { date: { $eq: yesterday } }],
              },
            ],
          },
        ],
      },
    },
  ]);
  let orders = {
    ordered: orderstatus.length,
    Acknowledged: Acknowledgedstatus.length,
    Approved: Approvedstatus.length,
    Rejected: rejectstatus.length,
  };

  // Delivery type
  let delevery_all = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [
          status,
          timeslot,
          deliverymode,
          {
            $or: [
              {
                $and: [{ delivery_type: { $eq: 'IMD' } }, { date: { $eq: today } }],
              },
              {
                $and: [{ delivery_type: { $eq: 'NDD' } }, { date: { $eq: yesterday } }],
              },
            ],
          },
        ],
      },
    },
  ]);
  let delevery_imd = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [status, timeslot, deliverymode, { delivery_type: { $eq: 'IMD' } }, { date: { $eq: today } }],
      },
    },
  ]);
  let delevery_yod = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [status, timeslot, deliverymode, { delivery_type: { $eq: 'NDD' } }, { date: { $eq: yesterday } }],
      },
    },
  ]);

  let delevery_ndd = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [status, timeslot, deliverymode, { delivery_type: { $eq: 'NDD' } }, { date: { $eq: today } }],
      },
    },
  ]);
  let deliveryType = {
    all: delevery_all.length,
    IMD: delevery_imd.length,
    YOD: delevery_yod.length,
    NDD: delevery_ndd.length,
  };

  //  Time Slots

  let time_all = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [status, deliverytype, deliverymode, dateMacth],
      },
    },
  ]);
  let time_5_6 = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [status, deliverytype, deliverymode, dateMacth, { time_of_delivery: { $eq: '5-7' } }],
      },
    },
  ]);
  let time_7_10 = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [status, deliverytype, deliverymode, dateMacth, { time_of_delivery: { $eq: '7-10' } }],
      },
    },
  ]);
  let time_2_4 = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [status, deliverytype, deliverymode, dateMacth, { time_of_delivery: { $eq: '14-16' } }],
      },
    },
  ]);

  let timeSlots = {
    all: time_all.length,
    '5-7': time_5_6.length,
    '7-10': time_7_10.length,
    '14-16': time_2_4.length,
  };

  // Delivery Mode

  let delivery_mode_all = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [status, deliverytype, timeslot, dateMacth],
      },
    },
  ]);
  let delivery_mode_sp = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [status, deliverytype, timeslot, { devevery_mode: { $eq: 'SP' } }, dateMacth],
      },
    },
  ]);
  let delivery_mode_de = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [status, deliverytype, timeslot, { devevery_mode: { $eq: 'DE' } }, dateMacth],
      },
    },
  ]);

  let deliveryMode = {
    all: delivery_mode_all.length,
    SP: delivery_mode_sp.length,
    DE: delivery_mode_de.length,
  };

  return { deliveryType: deliveryType, deliveryMode: deliveryMode, timeSlots: timeSlots, orders: orders };
};

const get_approved_orders = async (query) => {
  let pincode = { $and: [{ active: { $eq: true } }] };
  if (query.pincode != null && query.pincode != '' && query.pincode != 'null') {
    //console.log('asdas');
    var result = query.pincode.split(',').map(function (x) {
      return parseInt(x, 10);
    });
    pincode = { $and: [{ Pincode: { $in: result } }] };
  }

  let page = query.page == null || query.page == '' || query.page == 'null' ? 0 : query.page;
  let statusMatch = {
    status: {
      $in: ['Approved', 'Modified'],
    },
  };
  let deliveryType = { delivery_type: { $eq: query.deliverytype } };
  let timeSlot = { active: true };
  let deliveryMode = { active: true };
  let today = moment().format('YYYY-MM-DD');
  let yesterday = moment().subtract(1, 'days').format('yyyy-MM-DD');
  let dateMacth = { active: true };
  //////console.log(today)
  //////console.log(yesterday)
  if (query.deliverytype == 'all') {
    deliveryType = {
      $or: [
        {
          $and: [{ delivery_type: { $eq: 'IMD' } }, { date: { $eq: today } }],
        },
        {
          $and: [{ delivery_type: { $eq: 'NDD' } }, { date: { $eq: yesterday } }],
        },
      ],
    };
    dateMacth = { active: true };
  }
  if (query.deliverytype == 'IMD' || query.deliverytype == 'NDD') {
    dateMacth = { date: { $in: [today] } };
  }
  if (query.deliverytype == 'YOD') {
    dateMacth = { date: { $in: [yesterday] } };
    deliveryType = { delivery_type: { $eq: 'NDD' } };
  }
  if (query.timeslot != 'all') {
    timeSlot = { time_of_delivery: { $eq: query.timeslot } };
  }
  if (query.deliverymode != 'all') {
    deliveryMode = { devevery_mode: { $eq: query.deliverymode } };
  }
  let lossTime = moment().format('H');
  // //console.log( moment().format("H"))
  let values = await ShopOrderClone.aggregate([
    { $sort: { created: 1 } },
    { $match: { $and: [statusMatch, deliveryType, timeSlot, deliveryMode, dateMacth] } },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $lookup: {
              from: 'products',
              localField: 'productid',
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
              totalQuantity: { $sum: [{ $multiply: ['$finalQuantity', '$packKg'] }] },

            },
          },
          { $group: { _id: null, totalQuantity: { $sum: "$totalQuantity" } } }

        ],
        as: 'productOrderdata_qty',
      },
    },
    {
      $unwind: {
        path: '$productOrderdata_qty',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $lookup: {
              from: 'products',
              localField: 'productid',
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
              GST_Number: 1,
              created: 1,
              HSN_Code: 1,
              finalPricePerKg: 1,
              finalQuantity: 1,
              orderId: 1,
              packKg: 1,
              priceperkg: 1,
              quantity: 1,
              status: 1,
              unit: 1,
              productTitle: '$products.productTitle',
              totalQuantity: { $sum: [{ $multiply: ['$finalQuantity', '$packKg'] }] },

            },
          },
        ],
        as: 'productOrderdata',
      },
    },
    {
      $lookup: {
        from: 'orderpayments',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $group: {
              _id: null,
              amount: {
                $sum: '$paidAmt',
              },
            },
          },
        ],
        as: 'orderpayments',
      },
    },
    {
      $unwind: {
        path: '$orderpayments',
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [
          { $match: { $and: [pincode] } },
          {
            $lookup: {
              from: 'streets',
              localField: 'Strid',
              foreignField: '_id',
              as: 'streets',
            },
          },
          {
            $unwind: '$streets',
          },
        ],
        as: 'b2bshopclones',
      },
    },
    {
      $unwind: '$b2bshopclones',
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        as: 'b2busers',
      },
    },
    {
      $unwind: {
        path: '$b2busers',
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $project: {
              Amount: { $multiply: ['$finalQuantity', '$finalPricePerKg'] },
              GST_Number: 1,
            },
          },
          {
            $project: {
              sum: '$sum',
              percentage: {
                $divide: [
                  {
                    $multiply: ['$GST_Number', '$Amount'],
                  },
                  100,
                ],
              },
              value: '$Amount',
            },
          },
          {
            $project: {
              price: { $sum: ['$value', '$percentage'] },
              value: '$value',
              GST: '$percentage',
            },
          },
          { $group: { _id: null, price: { $sum: '$price' } } },
        ],
        as: 'productData',
      },
    },
    { $unwind: '$productData' },
    {
      $project: {
        _id: 1,
        orderType: 1,
        status: 1,
        created: 1,
        OrderId: 1,
        product: '$productOrderdata',
        totalQuantity: "$productOrderdata_qty.totalQuantity",
        SName: '$b2bshopclones.SName',
        mobile: '$b2bshopclones.mobile',
        address: '$b2bshopclones.address',
        Pincode: '$b2bshopclones.Pincode',
        slocality: '$b2bshopclones.streets.locality',
        street: '$b2bshopclones.streets.street',
        area: '$b2bshopclones.streets.area',
        da_landmark: '$b2bshopclones.da_landmark',
        da_long: '$b2bshopclones.da_long',
        da_lot: '$b2bshopclones.da_lot',
        Slat: '$b2bshopclones.Slat',
        Slong: '$b2bshopclones.Slong',
        orderBy: '$b2busers.name',
        delivery_type: 1,
        devevery_mode: 1,
        time_of_delivery: 1,
        paidAmount: '$orderpayments.amount',
        subtotal: '$productData.price',
        timeloss: {
          $or: [
            {
              $and: [
                { $lte: ['$endSlot', parseInt(lossTime)] },
                { $eq: ['$delivery_type', 'IMD'] },
                { $eq: ['$date', today] },
              ],
            },
            {
              $and: [
                { $lte: ['$endSlot', parseInt(lossTime)] },
                { $eq: ['$delivery_type', 'NDD'] },
                { $eq: ['$date', yesterday] },
              ],
            },
          ],
        },
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);

  let total = await ShopOrderClone.aggregate([
    { $sort: { created: -1 } },
    { $match: { $and: [statusMatch, deliveryType, timeSlot, deliveryMode, dateMacth] } },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [{ $match: { $and: [pincode] } }],
        as: 'b2bshopclones',
      },
    },
    {
      $unwind: '$b2bshopclones',
    },
  ]);

  let counts = await get_order_counts(statusMatch, deliveryType, timeSlot, deliveryMode, dateMacth, pincode);

  return { value: values, total: total.length, counts: counts };
};

const get_order_counts = async (status, deliverytype, timeslot, deliverymode, dateMacth, pincode) => {
  ////console.log(pincode, 'sdf');
  let today = moment().format('YYYY-MM-DD');
  let yesterday = moment().subtract(1, 'days').format('yyyy-MM-DD');
  let orderstatus = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [
          { status: { $eq: 'ordered' } },
          {
            $or: [
              {
                $and: [{ delivery_type: { $eq: 'IMD' } }, { date: { $eq: today } }],
              },
              {
                $and: [{ delivery_type: { $eq: 'NDD' } }, { date: { $eq: yesterday } }],
              },
            ],
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [{ $match: { $and: [pincode] } }],
        as: 'b2bshopclones',
      },
    },
    {
      $unwind: '$b2bshopclones',
    },
  ]);
  let Acknowledgedstatus = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [
          { status: { $eq: 'Acknowledged' } },
          {
            $or: [
              {
                $and: [{ delivery_type: { $eq: 'IMD' } }, { date: { $eq: today } }],
              },
              {
                $and: [{ delivery_type: { $eq: 'NDD' } }, { date: { $eq: yesterday } }],
              },
            ],
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [{ $match: { $and: [pincode] } }],
        as: 'b2bshopclones',
      },
    },
    {
      $unwind: '$b2bshopclones',
    },
  ]);
  let Approvedstatus = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [
          {
            status: {
              $in: [
                'Approved',
                'Modified',
                'Packed',
                'Assigned',
                'Order Picked',
                'Delivery start',
                'UnDelivered',
                'Delivery Completed',
              ],
            },
          },
          {
            $or: [
              {
                $and: [{ delivery_type: { $eq: 'IMD' } }, { date: { $eq: today } }],
              },
              {
                $and: [{ delivery_type: { $eq: 'NDD' } }, { date: { $eq: yesterday } }],
              },
            ],
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [{ $match: { $and: [pincode] } }],
        as: 'b2bshopclones',
      },
    },
    {
      $unwind: '$b2bshopclones',
    },
  ]);
  let rejectstatus = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [
          { status: { $eq: 'Rejected' } },
          {
            $or: [
              {
                $and: [{ delivery_type: { $eq: 'IMD' } }, { date: { $eq: today } }],
              },
              {
                $and: [{ delivery_type: { $eq: 'NDD' } }, { date: { $eq: yesterday } }],
              },
            ],
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [{ $match: { $and: [pincode] } }],
        as: 'b2bshopclones',
      },
    },
    {
      $unwind: '$b2bshopclones',
    },
  ]);
  let orders = {
    ordered: orderstatus.length,
    Acknowledged: Acknowledgedstatus.length,
    Approved: Approvedstatus.length,
    Rejected: rejectstatus.length,
  };

  // Delivery type
  let delevery_all = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [
          status,
          timeslot,
          deliverymode,
          {
            $or: [
              {
                $and: [{ delivery_type: { $eq: 'IMD' } }, { date: { $eq: today } }],
              },
              {
                $and: [{ delivery_type: { $eq: 'NDD' } }, { date: { $eq: yesterday } }],
              },
            ],
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [{ $match: { $and: [pincode] } }],
        as: 'b2bshopclones',
      },
    },
    {
      $unwind: '$b2bshopclones',
    },
  ]);
  let delevery_imd = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [status, timeslot, deliverymode, { delivery_type: { $eq: 'IMD' } }, { date: { $eq: today } }],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [{ $match: { $and: [pincode] } }],
        as: 'b2bshopclones',
      },
    },
    {
      $unwind: '$b2bshopclones',
    },
  ]);
  let delevery_yod = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [status, timeslot, deliverymode, { delivery_type: { $eq: 'NDD' } }, { date: { $eq: yesterday } }],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [{ $match: { $and: [pincode] } }],
        as: 'b2bshopclones',
      },
    },
    {
      $unwind: '$b2bshopclones',
    },
  ]);

  let delevery_ndd = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [status, timeslot, deliverymode, { delivery_type: { $eq: 'NDD' } }, { date: { $eq: today } }],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [{ $match: { $and: [pincode] } }],
        as: 'b2bshopclones',
      },
    },
    {
      $unwind: '$b2bshopclones',
    },
  ]);
  let deliveryType = {
    all: delevery_all.length,
    IMD: delevery_imd.length,
    YOD: delevery_yod.length,
    NDD: delevery_ndd.length,
  };

  //  Time Slots

  let time_all = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [status, deliverytype, deliverymode, dateMacth],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [{ $match: { $and: [pincode] } }],
        as: 'b2bshopclones',
      },
    },
    {
      $unwind: '$b2bshopclones',
    },
  ]);
  let time_5_6 = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [status, deliverytype, deliverymode, dateMacth, { time_of_delivery: { $eq: '5-7' } }],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [{ $match: { $and: [pincode] } }],
        as: 'b2bshopclones',
      },
    },
    {
      $unwind: '$b2bshopclones',
    },
  ]);
  let time_7_10 = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [status, deliverytype, deliverymode, dateMacth, { time_of_delivery: { $eq: '7-10' } }],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [{ $match: { $and: [pincode] } }],
        as: 'b2bshopclones',
      },
    },
    {
      $unwind: '$b2bshopclones',
    },
  ]);
  let time_2_4 = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [status, deliverytype, deliverymode, dateMacth, { time_of_delivery: { $eq: '14-16' } }],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [{ $match: { $and: [pincode] } }],
        as: 'b2bshopclones',
      },
    },
    {
      $unwind: '$b2bshopclones',
    },
  ]);

  let timeSlots = {
    all: time_all.length,
    '5-7': time_5_6.length,
    '7-10': time_7_10.length,
    '14-16': time_2_4.length,
  };

  // Delivery Mode

  let delivery_mode_all = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [status, deliverytype, timeslot, dateMacth],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [{ $match: { $and: [pincode] } }],
        as: 'b2bshopclones',
      },
    },
    {
      $unwind: '$b2bshopclones',
    },
  ]);
  let delivery_mode_sp = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [status, deliverytype, timeslot, { devevery_mode: { $eq: 'SP' } }, dateMacth],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [{ $match: { $and: [pincode] } }],
        as: 'b2bshopclones',
      },
    },
    {
      $unwind: '$b2bshopclones',
    },
  ]);
  let delivery_mode_de = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [status, deliverytype, timeslot, { devevery_mode: { $eq: 'DE' } }, dateMacth],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [{ $match: { $and: [pincode] } }],
        as: 'b2bshopclones',
      },
    },
    {
      $unwind: '$b2bshopclones',
    },
  ]);

  let deliveryMode = {
    all: delivery_mode_all.length,
    SP: delivery_mode_sp.length,
    DE: delivery_mode_de.length,
  };

  return { deliveryType: deliveryType, deliveryMode: deliveryMode, timeSlots: timeSlots, orders: orders };
};
const get_ward_by_orders = async (query) => {
  let page = query.page == null || query.page == '' || query.page == 'null' ? 0 : query.page;
  let today = moment().format('YYYY-MM-DD');
  let yesterday = moment().subtract(1, 'days').format('yyyy-MM-DD');
  let deliveryType = {
    $or: [
      {
        $and: [{ delivery_type: { $eq: 'IMD' } }, { date: { $eq: today } }],
      },
      {
        $and: [{ delivery_type: { $eq: 'NDD' } }, { date: { $eq: yesterday } }],
      },
      {
        $and: [{ delivery_type: { $eq: 'NDD' } }, { date: { $eq: today } }],
      },
    ],
  };
  let values = await ShopOrderClone.aggregate([
    { $sort: { created: -1 } },
    {
      $match: {
        $and: [
          {
            status: {
              $in: ['Approved', 'Modified'],
            },
          },
          deliveryType,
        ],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'wards',
              localField: 'Wardid',
              foreignField: '_id',
              pipeline: [
                {
                  $lookup: {
                    from: 'zones',
                    localField: 'zoneId',
                    foreignField: '_id',
                    as: 'zones',
                  },
                },
                {
                  $unwind: '$zones',
                },
              ],
              as: 'Wardid',
            },
          },
          {
            $unwind: '$Wardid',
          },
          {
            $project: {
              _id: 1,
              ward: '$Wardid.ward',
              wardNo: '$Wardid.wardNo',
              wardID: '$Wardid._id',
              SName: 1,
              Pincode: 1,
              zone: '$Wardid.zones.zone',
              zoneCode: '$Wardid.zones.zoneCode',
            },
          },
        ],
        as: 'b2bshopclones',
      },
    },
    {
      $unwind: '$b2bshopclones',
    },
    {
      $project: {
        _id: 1,
        Pincode: '$b2bshopclones.Pincode',
        ward: '$b2bshopclones.ward',
        wardNo: '$b2bshopclones.wardNo',
        zone: '$b2bshopclones.zone',
        zoneCode: '$b2bshopclones.zoneCode',
        wardID: '$b2bshopclones.wardID',
      },
    },
    {
      $group: {
        _id: { Pincode: '$Pincode' },
        OrderCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: '',
        Pincode: '$_id.Pincode',
        OrderCount: 1,
      },
    },
    { $sort: { Pincode: -1 } },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  return values;
};

const get_assignorder_timeloss = async (query) => {
  let id = query.id;
  await ShopOrderClone.findByIdAndUpdate({ _id: id }, { status: 'Rejected_assign' }, { new: true });
  return { message: 'Rejected' };
};

const get_rejected_orders = async (query) => {
  //console.log(query, 'asd');
  let page = query.page == null || query.page == '' || query.page == 'null' ? 0 : query.page;
  let statusMatch = { status: { $eq: query.status } };
  let deliveryType = { delivery_type: { $eq: query.deliverytype } };
  let timeSlot = { active: true };
  let deliveryMode = { active: true };
  let today = moment().format('YYYY-MM-DD');
  let yesterday = moment().subtract(1, 'days').format('yyyy-MM-DD');
  let dateMacth = { active: true };
  if (query.status == 'all') {
    statusMatch = {
      status: {
        $in: ['Rejected_assign', 'Rejected'],
      },
    };
  }
  if (query.deliverytype == 'all') {
    deliveryType = {
      $or: [
        {
          $and: [{ delivery_type: { $eq: 'IMD' } }, { date: { $eq: today } }],
        },
        {
          $and: [{ delivery_type: { $eq: 'NDD' } }, { date: { $eq: yesterday } }],
        },
      ],
    };
    dateMacth = { active: true };
  }
  let values = await ShopOrderClone.aggregate([
    { $sort: { created: -1 } },
    {
      $match: {
        $and: [
          statusMatch,
          {
            finalStatus: { $ne: 'reorder' },
          },
          {
            finalStatus: { $ne: 'remove' },
          },
          {
            RE_order_status: { $ne: 'Re-Ordered' },
          },
          {
            RE_order_status: { $ne: 'declined' },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $lookup: {
              from: 'products',
              localField: 'productid',
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
              GST_Number: 1,
              created: 1,
              HSN_Code: 1,
              finalPricePerKg: 1,
              finalQuantity: 1,
              orderId: 1,
              packKg: 1,
              priceperkg: 1,
              quantity: 1,
              status: 1,
              unit: 1,
              productTitle: '$products.productTitle',
            },
          },
        ],
        as: 'productOrderdata',
      },
    },
    {
      $lookup: {
        from: 'orderpayments',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $group: {
              _id: null,
              amount: {
                $sum: '$paidAmt',
              },
            },
          },
        ],
        as: 'orderpayments',
      },
    },
    {
      $unwind: {
        path: '$orderpayments',
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'b2bshopclones',
      },
    },
    {
      $unwind: '$b2bshopclones',
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        as: 'b2busers',
      },
    },
    {
      $unwind: {
        path: '$b2busers',
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $project: {
              Amount: { $multiply: ['$finalQuantity', '$finalPricePerKg'] },
              GST_Number: 1,
            },
          },
          {
            $project: {
              sum: '$sum',
              percentage: {
                $divide: [
                  {
                    $multiply: ['$GST_Number', '$Amount'],
                  },
                  100,
                ],
              },
              value: '$Amount',
            },
          },
          {
            $project: {
              price: { $sum: ['$value', '$percentage'] },
              value: '$value',
              GST: '$percentage',
            },
          },
          { $group: { _id: null, price: { $sum: '$price' } } },
        ],
        as: 'productData',
      },
    },
    { $unwind: '$productData' },
    {
      $project: {
        _id: 1,
        orderType: 1,
        status: 1,
        created: 1,
        OrderId: 1,
        product: '$productOrderdata',
        SName: '$b2bshopclones.SName',
        mobile: '$b2bshopclones.mobile',
        address: '$b2bshopclones.address',
        orderBy: '$b2busers.name',
        delivery_type: 1,
        devevery_mode: 1,
        time_of_delivery: 1,
        paidAmount: '$orderpayments.amount',
        subtotal: '$productData.price',
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);

  let total = await ShopOrderClone.aggregate([
    { $sort: { created: -1 } },
    {
      $match: {
        $and: [
          statusMatch,
          {
            finalStatus: { $ne: 'reorder' },
          },
          {
            finalStatus: { $ne: 'remove' },
          },
          {
            RE_order_status: { $ne: 'Re-Ordered' },
          },
          {
            RE_order_status: { $ne: 'declined' },
          },
        ],
      },
    },
  ]);

  let counts = await get_order_counts_rejected(statusMatch);

  return { value: values, total: total.length, counts: counts };
};

const get_order_counts_rejected = async (status) => {
  let today = moment().format('YYYY-MM-DD');
  let yesterday = moment().subtract(1, 'days').format('yyyy-MM-DD');

  let Rejected_assignstatus = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [
          { status: { $eq: 'Rejected_assign' } },
          {
            finalStatus: { $ne: 'reorder' },
          },
          {
            finalStatus: { $ne: 'remove' },
          },
          {
            RE_order_status: { $ne: 'Re-Ordered' },
          },
          {
            RE_order_status: { $ne: 'declined' },
          },
          // {
          //   $or: [
          //     {
          //       $and: [{ delivery_type: { $eq: 'IMD' } }, { date: { $eq: today } }],
          //     },
          //     {
          //       $and: [{ delivery_type: { $eq: 'NDD' } }, { date: { $eq: yesterday } }],
          //     },
          //     {
          //       $and: [{ delivery_type: { $eq: 'NDD' } }, { date: { $eq: today } }],
          //     },
          //   ],
          // },
        ],
      },
    },
  ]);
  let rejectstatus = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [
          { status: { $eq: 'Rejected' } },
          {
            finalStatus: { $ne: 'reorder' },
          },
          {
            finalStatus: { $ne: 'remove' },
          },
          {
            RE_order_status: { $ne: 'Re-Ordered' },
          },
          {
            RE_order_status: { $ne: 'declined' },
          },
          // {
          //   $or: [
          //     {
          //       $and: [{ delivery_type: { $eq: 'IMD' } }, { date: { $eq: today } }],
          //     },
          //     {
          //       $and: [{ delivery_type: { $eq: 'NDD' } }, { date: { $eq: yesterday } }],
          //     },
          //     {
          //       $and: [{ delivery_type: { $eq: 'NDD' } }, { date: { $eq: today } }],
          //     },
          //   ],
          // },
        ],
      },
    },
  ]);
  let orders = {
    Rejected: rejectstatus.length,
    Rejected_assign: Rejected_assignstatus.length,
  };

  return { orders: orders };
};

const get_assignorder_reassgin = async (body) => {
  let shoporder = await ShopOrderClone.findByIdAndUpdate({ _id: body.id }, { finalStatus: 'reorder' }, { new: true });
  return { message: 'Success' };
};
const get_assignorder_remove = async (body) => {
  let shoporder = await ShopOrderClone.findByIdAndUpdate({ _id: body.id }, { finalStatus: 'remove' }, { new: true });
  return { message: 'Success' };
};

const sort_by_order_wde = async (body) => {
  let count = 0;
  if (body) {
    body.orders.forEach(async (e) => {
      //console.log(e);
      count = count + 1;
      await ShopOrderClone.findByIdAndUpdate({ _id: e._id }, { sort_wde: count }, { new: true });
    });
  }

  await wardAdminGroup.findByIdAndUpdate(body.id, { sort_wde: true }, { new: true });
  return { mesage: 'success' };
};

const update_issue_status_approved = async (query) => {
  return await ProductorderClone.findByIdAndUpdate(
    { issueraised: true, _id: query.id },
    { issueStatus: 'Approved' },
    { new: true }
  );
};
const update_issue_status_decline = async (query) => {
  return await ProductorderClone.findByIdAndUpdate(
    { issueraised: true, _id: query.id },
    { issueStatus: 'Decline' },
    { new: true }
  );
};
const order_process_to_completed = async (query) => {
  let status = 'Decline';
  let approved = await ProductorderClone.find({ orderId: query.id, issueStatus: 'Approved', issueraised: true }).count();
  let total = await ProductorderClone.find({ orderId: query.id, issueraised: true, issueStatus: 'Pending' }).count();
  if (total != 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order Pending');
  }
  if (approved != 0) {
    status = 'Approved';
  }
  return await ShopOrderClone.findByIdAndUpdate({ _id: query.id }, { issueStatus: status }, { new: true });
};

const order_process_to_return = async (query) => {
  return await ShopOrderClone.findByIdAndUpdate(
    { _id: query.id, issueStatus: { $in: ['Approved', 'Decline'] } },
    { order_issues: 'Process To Return' },
    { new: true }
  );
};

const order_issue_return = async () => {
  let orders = await ShopOrderClone.aggregate([
    { $match: { $and: [{ issueStatus: { $eq: 'Approved' } }, { issueAssign: { $ne: 'Assigned' } }] } },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shopData',
      },
    },
    {
      $unwind: '$shopData',
    },
    {
      $project: {
        _id: 1,
        SName: '$shopData.SName',
        shopId: '$shopData._id',
        Slat: '$shopData.Slat',
        Slong: '$shopData.Slong',
        OrderId: 1,
        customerBillId: 1,
        OrderId: 1,
        date: 1,
        created: 1,
        issueStatus: 1,
        issueStatus: 1,
      },
    },

    { $group: { _id: { shop: '$shopId', Slat: '$Slat', Slong: '$Slong', SName: '$SName' } } },
    { $project: { _id: '$_id.shop', Slat: '$_id.Slat', Slong: '$_id.Slong', SName: '$_id.SName' } },
  ]);
  return orders;
};
const shopDataMap = async (query) => {
  //console.log(query);
  // let mode = query.mod;
  // let type = query.type;
  // let today = moment().format('YYYY-MM-DD');
  let pincode = { $and: [{ active: { $eq: true } }] };
  if (query.pincode != null && query.pincode != '' && query.pincode != 'null') {
    //console.log('asdas');
    var result = query.pincode.split(',').map(function (x) {
      return parseInt(x, 10);
    });
    pincode = { $and: [{ Pincode: { $in: result } }] };
  }
  let deliveryType = { delivery_type: { $eq: query.deliverytype } };
  let timeSlot = { active: true };
  let deliveryMode = { active: true };
  let today = moment().format('YYYY-MM-DD');
  let yesterday = moment().subtract(1, 'days').format('yyyy-MM-DD');
  let dateMacth = { active: true };
  let statusMatch = {
    status: {
      $in: ['Approved', 'Modified'],
    },
  };

  if (query.deliverytype == 'all') {
    deliveryType = {
      $or: [
        {
          $and: [{ delivery_type: { $eq: 'IMD' } }, { date: { $eq: today } }],
        },
        {
          $and: [{ delivery_type: { $eq: 'NDD' } }, { date: { $eq: yesterday } }],
        },
      ],
    };
    dateMacth = { active: true };
  }
  if (query.deliverytype == 'IMD' || query.deliverytype == 'NDD') {
    dateMacth = { date: { $in: [today] } };
  }
  if (query.deliverytype == 'YOD') {
    dateMacth = { date: { $in: [yesterday] } };
    deliveryType = { delivery_type: { $eq: 'NDD' } };
  }
  if (query.deliverytype == 'IMD' || query.deliverytype == 'NDD') {
    dateMacth = { date: { $in: [today] } };
  }
  if (query.timeslot != 'all') {
    timeSlot = { time_of_delivery: { $eq: query.timeslot } };
  }
  if (query.deliverymode != 'all') {
    deliveryMode = { devevery_mode: { $eq: query.deliverymode } };
  }
  let lossTime = moment().format('H');
  let values = await ShopOrderClone.aggregate([
    { $sort: { created: 1 } },
    { $match: { $and: [statusMatch, deliveryType, timeSlot, deliveryMode, dateMacth] } },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $lookup: {
              from: 'products',
              localField: 'productid',
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
              totalQuantity: { $sum: [{ $multiply: ['$finalQuantity', '$packKg'] }] },

            },
          },
          { $group: { _id: null, totalQuantity: { $sum: "$totalQuantity" } } }

        ],
        as: 'productOrderdata_qty',
      },
    },
    {
      $unwind: {
        path: '$productOrderdata_qty',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $lookup: {
              from: 'products',
              localField: 'productid',
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
              GST_Number: 1,
              created: 1,
              HSN_Code: 1,
              finalPricePerKg: 1,
              finalQuantity: 1,
              orderId: 1,
              packKg: 1,
              priceperkg: 1,
              quantity: 1,
              status: 1,
              unit: 1,
              productTitle: '$products.productTitle',
              totalQuantity: { $sum: [{ $multiply: ['$finalQuantity', '$packKg'] }] },

            },
          },
        ],
        as: 'productOrderdata',
      },
    },
    {
      $lookup: {
        from: 'orderpayments',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $group: {
              _id: null,
              amount: {
                $sum: '$paidAmt',
              },
            },
          },
        ],
        as: 'orderpayments',
      },
    },
    {
      $unwind: {
        path: '$orderpayments',
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [
          { $match: { $and: [pincode] } },
          {
            $lookup: {
              from: 'streets',
              localField: 'Strid',
              foreignField: '_id',
              as: 'streets',
            },
          },
          {
            $unwind: '$streets',
          },
        ],
        as: 'b2bshopclones',
      },
    },
    {
      $unwind: '$b2bshopclones',
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        as: 'b2busers',
      },
    },
    {
      $unwind: {
        path: '$b2busers',
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $project: {
              Amount: { $multiply: ['$finalQuantity', '$finalPricePerKg'] },
              GST_Number: 1,
            },
          },
          {
            $project: {
              sum: '$sum',
              percentage: {
                $divide: [
                  {
                    $multiply: ['$GST_Number', '$Amount'],
                  },
                  100,
                ],
              },
              value: '$Amount',
            },
          },
          {
            $project: {
              price: { $sum: ['$value', '$percentage'] },
              value: '$value',
              GST: '$percentage',
            },
          },
          { $group: { _id: null, price: { $sum: '$price' } } },
        ],
        as: 'productData',
      },
    },
    { $unwind: '$productData' },
    {
      $project: {
        _id: 1,
        orderType: 1,
        status: 1,
        created: 1,
        OrderId: 1,
        product: '$productOrderdata',
        totalQuantity: "$productOrderdata_qty.totalQuantity",
        SName: '$b2bshopclones.SName',
        mobile: '$b2bshopclones.mobile',
        address: '$b2bshopclones.address',
        Pincode: '$b2bshopclones.Pincode',
        slocality: '$b2bshopclones.streets.locality',
        street: '$b2bshopclones.streets.street',
        area: '$b2bshopclones.streets.area',
        da_landmark: '$b2bshopclones.da_landmark',
        da_long: '$b2bshopclones.da_long',
        da_lot: '$b2bshopclones.da_lot',
        Slat: '$b2bshopclones.Slat',
        Slong: '$b2bshopclones.Slong',
        orderBy: '$b2busers.name',
        delivery_type: 1,
        devevery_mode: 1,
        time_of_delivery: 1,
        paidAmount: '$orderpayments.amount',
        subtotal: '$productData.price',
        timeloss: {
          $or: [
            {
              $and: [
                { $lte: ['$endSlot', parseInt(lossTime)] },
                { $eq: ['$delivery_type', 'IMD'] },
                { $eq: ['$date', today] },
              ],
            },
            {
              $and: [
                { $lte: ['$endSlot', parseInt(lossTime)] },
                { $eq: ['$delivery_type', 'NDD'] },
                { $eq: ['$date', yesterday] },
              ],
            },
          ],
        },
      },
    },
  ]);
  return values;
};

const issueStatus_Update = async (id, body) => {
  const { status, issue_Res } = body;
  let values = ProductorderClone.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'productOrders Not Found');
  }
  values = await ProductorderClone.findByIdAndUpdate({ _id: id }, { issStatus: status, issue_Res: issue_Res }, { new: true });
  return values;
};

const issueStatus_Update_assign = async (id, body) => {
  const { user } = body;
  let values = ProductorderClone.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'productOrders Not Found');
  }
  values = await ProductorderClone.findByIdAndUpdate({ _id: id }, { issStatus: "Assgined", issue_assgin_by: user, issue_collection_status: "Pending" }, { new: true });
  return values;
};

const get_issue_product_list = async (req) => {
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : req.query.page;

  let values = await ProductorderClone.aggregate([
    {
      $match: { $and: [{ issueraised: { $eq: true } }, { issue_assgin_by: { $eq: req.userId } }] },
    },
    { $sort: { issueDate: -1 } },
    {
      $lookup: {
        from: 'shoporderclones',
        localField: 'orderId',
        foreignField: '_id',
        as: 'shoporderclones',
      },
    },
    {
      $unwind: '$shoporderclones',
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: 'shoporderclones._id',
        foreignField: 'orderId',
        pipeline: [{ $match: { issueraised: true } }],
        as: 'shoporder',
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shoporderclones.shopId',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'streets',
              localField: 'Strid',
              foreignField: '_id',
              as: 'street',
            },
          },
          {
            $unwind: '$street',
          },
        ],
        as: 'shops',
      },
    },
    {
      $unwind: '$shops',
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productid',
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
        preOrderClose: 1,
        active: 1,
        status: 1,
        issueraised: 1,
        issueStatus: 1,
        orderId: 1,
        productid: 1,
        quantity: 1,
        priceperkg: 1,
        GST_Number: 1,
        packKg: 1,
        unit: 1,
        finalQuantity: 1,
        finalPricePerKg: 1,
        issue: 1,
        issueDate: 1,
        issuediscription: 1,
        issuequantity: 1,
        issueId: 1,
        issueDate_Time: 1,
        Order: '$shoporderclones.OrderId',
        Product: '$products.productTitle',
        shopId: '$shoporderclones.shopId',
        shopName: '$shops.SName',
        street: '$shops.street.street',
        TotalOrders: { $size: '$shoporderclones.product' },
        issuedOrder: { $size: '$shoporder' },
        issStatus: 1,
        issue_Res: 1,
        issue_collection_status: 1
      },
    },
    {
      $skip: 10 * page,
    },
    {
      $limit: 10,
    },
  ]);
  let total = await ProductorderClone.aggregate([
    {
      $match: { $and: [{ issueraised: { $eq: true } }, { issue_assgin_by: { $eq: req.userId } }] },
    },
    {
      $lookup: {
        from: 'shoporderclones',
        localField: 'orderId',
        foreignField: '_id',
        as: 'shoporderclones',
      },
    },
    {
      $unwind: '$shoporderclones',
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productid',
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
        preOrderClose: 1,
        active: 1,
        status: 1,
        issueraised: 1,
        issueStatus: 1,
        orderId: 1,
        productid: 1,
        quantity: 1,
        priceperkg: 1,
        GST_Number: 1,
        packKg: 1,
        unit: 1,
        finalQuantity: 1,
        finalPricePerKg: 1,
        issue: 1,
        issueDate: 1,
        issuediscription: 1,
        issuequantity: 1,
        issueId: 1,
        issueDate_Time: 1,
        Order: '$shoporderclones.OrderId',
        Product: '$products.productTitle',
      },
    },
  ]);
  return { values: values, total: total.length };
};

const issue_collection_start = async (req) => {
  const { id } = req.body;
  let values = await ProductorderClone.findById(id);
  //console.log(req.userId, values, id)
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'productOrders Not Found');
  }
  if (values.issue_assgin_by != req.userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'productOrders Not Found');
  }
  values = await ProductorderClone.findByIdAndUpdate({ _id: id }, { issue_collection_status: "On Transits", issStatus: "On Transits" }, { new: true });
  return values;
};
const issue_collection_reached = async (req) => {
  const { id } = req.body;
  let values = await ProductorderClone.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'productOrders Not Found');
  }
  if (values.issue_assgin_by != req.userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'productOrders Not Found');
  }
  values = await ProductorderClone.findByIdAndUpdate({ _id: id }, { issue_collection_status: "Reached", issStatus: "Reached" }, { new: true });
  return values;
};
const issue_collection_checked = async (req) => {
  const { id } = req.body;
  let values = await ProductorderClone.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'productOrders Not Found');
  }
  if (values.issue_assgin_by != req.userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'productOrders Not Found');
  }
  values = await ProductorderClone.findByIdAndUpdate({ _id: id }, { issue_collection_status: "Under Check", issStatus: "Under Check" }, { new: true });
  return values;
};

const issue_collection_checked_video = async (req) => {
  const { id } = req.body;
  let values = await ProductorderClone.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'productOrders Not Found');
  }
  if (values.issue_assgin_by != req.userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'productOrders Not Found');
  }
  const s3 = new AWS.S3({
    accessKeyId: 'AKIA3323XNN7Y2RU77UG',
    secretAccessKey: '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',
    region: 'ap-south-1',
  });
  let params = {
    Bucket: 'realestatevideoupload',
    Key: req.file.originalname,
    Body: req.file.buffer,
  };
  return new Promise((resolve) => {
    s3.upload(params, async (err, data) => {
      if (err) {
        //console.log(err);
      }
      values = await ProductorderClone.findByIdAndUpdate({ _id: id }, { issue_returnVideo: data.Location }, { new: true });
      resolve({ video: 'success', values });
    });
  });
};
const issue_collection_pickedup = async (req) => {
  const { id } = req.body;
  let values = await ProductorderClone.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'productOrders Not Found');
  }
  if (values.issue_assgin_by != req.userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'productOrders Not Found');
  }
  values = await ProductorderClone.findByIdAndUpdate({ _id: id }, { issue_collection_status: "Pick Up", issStatus: "Product Picked" }, { new: true });
  return values;
};
const issue_collection_rejected = async (req) => {
  const { id } = req.body;
  let values = await ProductorderClone.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'productOrders Not Found');
  }
  if (values.issue_assgin_by != req.userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'productOrders Not Found');
  }
  values = await ProductorderClone.findByIdAndUpdate({ _id: id }, { issue_collection_status: "Rejected", issStatus: "Rejected" }, { new: true });
  return values;
};
const issue_collection_returntosm = async (req) => {
  const { id } = req.body;
  let values = await ProductorderClone.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'productOrders Not Found');
  }
  if (values.issue_assgin_by != req.userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'productOrders Not Found');
  }
  values = await ProductorderClone.findByIdAndUpdate({ _id: id }, { issue_collection_status: "Product Surrendered", issStatus: "Product Surrendered" }, { new: true });
  return values;
};

const issue_collection_recieved = async (req) => {
  const { id } = req.body;
  //console.log(id)
  let values = await ProductorderClone.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'productOrders Not Found');
  }
  values = await ProductorderClone.findByIdAndUpdate({ _id: id }, { issue_collection_status: "Product Received", issStatus: "Product Received" }, { new: true });
  return values;
};

const issue_collection_calculated = async (req) => {
  const { id } = req.body;
  let values = await ProductorderClone.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'productOrders Not Found');
  }
  values = await ProductorderClone.findByIdAndUpdate({ _id: id }, { ...{ issStatus: "Calculated" }, ...req.body }, { new: true });
  return values;
};

const issue_collection_reconfirm = async (req) => {
  const { id, issue_Res, issStatus } = req.body;
  let values = await ProductorderClone.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'productOrders Not Found');
  }
  values = await ProductorderClone.findByIdAndUpdate({ _id: id }, req.body, { new: true });
  return values;
};


const get_selfpickupOrders = async (req) => {

  let primary_Pickup = { active: true };
  let secondary_Pickup = { active: true };
  let third_Pickup = { active: true };
  let today = moment().format('YYYY-MM-DD');
  let yesterday = moment().subtract(1, 'days').format('yyyy-MM-DD');
  deliveryType = {
    $or: [
      {
        $and: [{ delivery_type: { $eq: 'IMD' } }, { date: { $eq: today } }],
      },
      {
        $and: [{ delivery_type: { $eq: 'NDD' } }, { date: { $eq: yesterday } }],
      },
    ],
  };
  timeSlatMatch = { active: true }
  let page = req.query.page == null || req.query.page == '' || req.query.page == 'null' ? 0 : req.query.page;

  if (req.query.timeSlat != 'all') {
    timeSlatMatch = { time_of_delivery: { $eq: req.query.timeSlat } }
  }
  if (req.query.delivery_type == 'IMD') {
    deliveryType = {
      $and: [{ delivery_type: { $eq: 'IMD' } }, { date: { $eq: today } }],
    }
  }
  if (req.query.delivery_type == 'NDD') {
    deliveryType = {
      $and: [{ delivery_type: { $eq: 'NDD' } }, { date: { $eq: yesterday } }],
    }

  }
  if (req.query.primary_Pickup != null && req.query.primary_Pickup != '' && req.query.primary_Pickup != 'null') {
    primary_Pickup = { primary_Pickup: { $eq: req.query.primary_Pickup } }
  }
  if (req.query.secondary_Pickup != null && req.query.secondary_Pickup != '' && req.query.secondary_Pickup != 'null') {
    secondary_Pickup = { secondary_Pickup: { $eq: req.query.secondary_Pickup } }
  }
  if (req.query.third_Pickup != null && req.query.third_Pickup != '' && req.query.third_Pickup != 'null') {
    third_Pickup = { third_Pickup: { $eq: req.query.third_Pickup } }
  }

  let value = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [
          deliveryType,
          {
            status: {
              $in: ['Approved', 'Modified']
            }
          },
          { devevery_mode: { $eq: 'SP' } },
          primary_Pickup,
          secondary_Pickup,
          third_Pickup,
          timeSlatMatch
        ]
      }
    },
    {
      $lookup: {
        from: 'managepickuplocations',
        localField: 'primary_Pickup',
        foreignField: '_id',
        as: 'primary_Pickup',
      },
    },
    {
      $unwind: {
        path: '$primary_Pickup',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'managepickuplocations',
        localField: 'secondary_Pickup',
        foreignField: '_id',
        as: 'secondary_Pickup',
      },
    },
    {
      $unwind: {
        path: '$secondary_Pickup',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'managepickuplocations',
        localField: 'third_Pickup',
        foreignField: '_id',
        as: 'third_Pickup',
      },
    },
    {
      $unwind: {
        path: '$third_Pickup',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shopData',
      },
    },
    {
      $unwind: '$shopData',
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          {
            $lookup: {
              from: 'products',
              localField: 'productid',
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
              totalQuantity: { $sum: [{ $multiply: ['$finalQuantity', '$packKg'] }] },

            },
          },
          { $group: { _id: null, totalQuantity: { $sum: "$totalQuantity" } } }

        ],
        as: 'productOrderdata_qty',
      },
    },
    {
      $unwind: {
        path: '$productOrderdata_qty',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        totalQuantity: "$productOrderdata_qty.totalQuantity",
        third_Pickup_name: "$third_Pickup.locationName",
        third_Pickup_pincode: "$third_Pickup.pincode",
        secondary_Pickup_name: "$secondary_Pickup.locationName",
        secondary_Pickup_pincode: "$secondary_Pickup.pincode",
        primary_Pickup_name: "$primary_Pickup.locationName",
        primary_Pickup_pincode: "$primary_Pickup.pincode",
        shopName: "$shopData.SName",
        SOwner: "$shopData.SOwner",
        Pincode: "$shopData.Pincode",
        created: 1,
        OrderId: 1,
        customerBillId: 1
      }
    },
    {
      $skip: 10 * parseInt(page),
    },
    {
      $limit: 10,
    },
  ]);

  let map = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [
          deliveryType,
          {
            status: {
              $in: ['Approved', 'Modified']
            }
          },
          { devevery_mode: { $eq: 'SP' } },
          primary_Pickup,
          secondary_Pickup,
          third_Pickup,
          timeSlatMatch
        ]
      }
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shopData',
      },
    },
    {
      $unwind: '$shopData',
    },
    {
      $lookup: {
        from: 'managepickuplocations',
        localField: 'primary_Pickup',
        foreignField: '_id',
        as: 'primary_Pickups',
      },
    },
    {
      $unwind: {
        path: '$primary_Pickups',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'managepickuplocations',
        localField: 'secondary_Pickup',
        foreignField: '_id',
        as: 'secondary_Pickup',
      },
    },
    {
      $unwind: {
        path: '$secondary_Pickup',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'managepickuplocations',
        localField: 'third_Pickup',
        foreignField: '_id',
        as: 'third_Pickup',
      },
    },
    {
      $unwind: {
        path: '$third_Pickup',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: {
          primary_Pickup: "$primary_Pickups",
        },
        orderDate: {
          "$push": {
            "SName": "$shopData.SName",
            da_long: "$shopData.da_long",
            da_lot: "$shopData.da_lot",
            third_Pickup_name: "$third_Pickup.locationName",
            third_Pickup_pincode: "$third_Pickup.pincode",
            secondary_Pickup_name: "$secondary_Pickup.locationName",
            secondary_Pickup_pincode: "$secondary_Pickup.pincode",
            primary_Pickup_name: "$primary_Pickups.locationName",
            primary_Pickup_pincode: "$primary_Pickups.pincode",
            _id: "$_id",
          },
        },
      }
    },
    {
      $project: {
        _id: '',
        primary_Pickup: "$_id.primary_Pickup",
        orderDate: "$orderDate",
        color: "$_id.primary_Pickup.color"
      }
    }
  ]);

  let total = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [
          deliveryType,
          {
            status: {
              $in: ['Approved', 'Modified']
            }
          },
          { devevery_mode: { $eq: 'SP' } },
          primary_Pickup,
          secondary_Pickup,
          third_Pickup,
          timeSlatMatch
        ]
      }
    },

  ])

  return { map, value, total: total.length };
};

const get_selfpickupOrders_group = async (req) => {

  let today = moment().format('YYYY-MM-DD');
  let yesterday = moment().subtract(1, 'days').format('yyyy-MM-DD');
  deliveryType = {
    $or: [
      {
        $and: [{ delivery_type: { $eq: 'IMD' } }, { date: { $eq: today } }],
      },
      {
        $and: [{ delivery_type: { $eq: 'NDD' } }, { date: { $eq: yesterday } }],
      },
    ],
  };
  const values = await PickupLocation.aggregate([
    {
      $lookup: {
        from: 'shoporderclones',
        localField: '_id',
        foreignField: 'primary_Pickup',
        pipeline: [
          {
            $match: {
              $and: [
                deliveryType,
                {
                  status: {
                    $in: ['Acknowledged', 'Approved', 'Modified', 'Packed', 'Assigned', 'Order Picked', 'Delivery start', 'UnDelivered', 'ordered',]
                  }
                },
                { devevery_mode: { $eq: 'SP' } },
              ]
            }
          },
          {
            $lookup: {
              from: 'productorderclones',
              localField: '_id',
              foreignField: 'orderId',
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    totalQuantity: { $sum: [{ $multiply: ['$finalQuantity', '$packKg'] }] },
                  },
                },
                { $group: { _id: null, totalQuantity: { $sum: "$totalQuantity" } } }

              ],
              as: 'productOrderdata_qty',
            },
          },
          { $unwind: "$productOrderdata_qty" },
          { $group: { _id: null, orderCount: { $sum: 1 }, totalQuantity: { $sum: "$productOrderdata_qty.totalQuantity" } }, }
        ],
        as: 'shoporderclones',
      },
    },
    {
      $unwind: '$shoporderclones',
    },
    {
      $project: {
        _id: 1,
        locationName: 1,
        langitude: 1,
        latitude: 1,
        address: 1,
        landMark: 1,
        created: 1,
        orderCount: "$shoporderclones.orderCount",
        totalQuantity: "$shoporderclones.totalQuantity",
      }
    }
  ])
  return values;
};


module.exports = {
  // product
  createProductOrderClone,
  getAllProductOrderClone,
  getProductOrderCloneById,
  updateProductOrderCloneById,
  deleteProductOrderClone,

  // shopOrderClone

  createshopOrderClone,
  getAllShopOrderClone,
  updateShopOrderCloneById,
  getShopOrderCloneById,
  deleteShopOrderCloneById,
  getShopNameCloneWithPagination,
  createshopOrder,
  getAllShopOrder,
  getShopOrderById,
  getProductDetailsByProductId,
  updateShopOrderById,
  getShopNameWithPagination,
  deleteShopOrderById,

  // Telecaller
  updateshop_order,
  getAll,
  createOrderId,
  getShopDetailsByOrder,
  undelivered,
  B2BManageOrders,
  getManageordersByOrderId,
  // for lapsed
  getproductOrders_By_OrderId,
  productData,
  get_data_for_lapster,
  getLapsed_Data,
  getLapsed_Rejected,
  getLapsed_Undelivered,
  getCallhistories,
  getFindbyId,
  lapsed_callBack,
  lapsed_accept,
  lapsed_declined,
  lapsed_reschedule,
  lapsedordercount,
  getBills_ByShop,
  getBills_DetailsByshop,
  vieworderbill_byshop,
  mismachstockscreate,
  WA_Order_status,
  OGorders_MDorders,
  details_Of_Payment_by_Id,
  getPaymenthistory,
  getallmanageIssus,
  getmanageIssus_byID,
  UnDeliveredOrders,
  getall_ordered_shops,
  get_approved_orders,
  get_ward_by_orders,
  get_assignorder_timeloss,
  get_rejected_orders,
  get_assignorder_reassgin,
  get_assignorder_remove,
  sort_by_order_wde,
  update_issue_status_approved,
  update_issue_status_decline,
  order_process_to_return,
  order_process_to_completed,
  order_issue_return,
  shopDataMap,
  issueStatus_Update,
  issueStatus_Update_assign,
  get_issue_product_list,

  issue_collection_start,
  issue_collection_reached,
  issue_collection_checked,
  issue_collection_checked_video,
  issue_collection_pickedup,
  issue_collection_rejected,
  issue_collection_returntosm,
  issue_collection_recieved,
  issue_collection_calculated,
  issue_collection_reconfirm,


  get_selfpickupOrders,
  get_selfpickupOrders_group
};
