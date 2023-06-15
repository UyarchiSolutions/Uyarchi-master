const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const moment = require('moment');
let currentDate = moment().format('DD-MM-YYYY');
const { Shop } = require('../models/b2b.ShopClone.model');
const { ShopOrderClone } = require('../models/shopOrder.model');
const { ProductorderClone } = require('../models/shopOrder.model');
const pettyStockModel = require('../models/b2b.pettyStock.model');
const { wardAdminGroup, wardAdminGroupModel_ORDERS, WardAdminGroupfine, wardAdminGroupModel_issue } = require('../models/b2b.wardAdminGroup.model');
const wardAdminGroupDetails = require('../models/b2b.wardAdminGroupDetails.model');
const { Product } = require('../models/product.model');
const orderPayment = require('../models/orderpayment.model');
const creditBillGroup = require('../models/b2b.creditBillGroup.model');
const creditBill = require('../models/b2b.creditBill.model');
const { shopOrderService } = require('.');
const ReturnStock_history = require('../models/returnStock.histories.model');

const createGroup = async (body, userId) => {
  let serverdates = moment().format('YYYY-MM-DD');
  //console.log(typeof serverdates);
  let servertime = moment().format('hh:mm a');
  let num = 1;
  const group = await wardAdminGroup.find({ assignDate: serverdates });
  const Buy = await wardAdminGroup.find({ assignDate: serverdates });
  //console.log(group);

  let center = '';

  if (group.length < 9) {
    center = '0000';
  }
  if (group.length < 99 && group.length >= 9) {
    center = '000';
  }
  if (group.length < 999 && group.length >= 99) {
    center = '00';
  }
  if (group.length < 9999 && group.length >= 999) {
    center = '0';
  }
  let user = '';
  let totalcount = group.length + 1;
  //console.log(totalcount);
  user = 'G' + center + totalcount;
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

  let values = {
    ...body,
    ...{
      groupId: user,
      assignDate: serverdates,
      assignTime: servertime,
      pettyStockAllocateStatusNumber: num,
      created: moment(),
      GroupBillId: BillId,
      GroupBillDate: serverdates,
      GroupBillTime: servertime,
    },
  };
  let wardAdminGroupcreate = await wardAdminGroup.create(values);
  body.Orderdatas.forEach(async (e) => {
    let productId = e;

    await ShopOrderClone.findByIdAndUpdate(
      { _id: productId },
      {
        status: 'Assigned',
        completeStatus: 'Assigned',
        deliveryExecutiveId: body.deliveryExecutiveId,
        WA_assigned_Time: moment(),
        AssignedCreated: moment(),
      },
      { new: true }
    );
    await wardAdminGroupModel_ORDERS.create({
      orderId: productId,
      wardAdminGroupID: wardAdminGroupcreate._id,
      date: serverdates,
      time: servertime,
      created: moment(),
      AssignedstatusPerDay: 1,
    });

    let statusActionArray = await ShopOrderClone.findById(productId);
    statusActionArray.statusActionArray.push({ userid: userId, date: moment().toString(), status: 'Assigned' });
    statusActionArray.save();
  });

  return wardAdminGroupcreate;
};
const creditupdateDeliveryCompleted = async (id, updateBody, userId) => {
  let currentDate = moment().format('YYYY-MM-DD');
  let currenttime = moment().format('HHmmss');
  // let body = {
  //   ...updateBody,
  //   ...{
  //     status: 'Delivered',
  //     customerDeliveryStatus: 'Delivered',
  //     delivered_date: moment(),
  //   },
  // };
  // creditBillGroup = require('../models/b2b.creditBillGroup.model');
  // const creditBill
  let creditBills = await creditBill.findById(id);
  let deliveryStatus = await ShopOrderClone.findById(creditBills.orderId);
  let pending = await ShopOrderClone.aggregate([
    { $match: { _id: { $eq: creditBills.orderId } } },
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
        as: 'paymentData',
      },
    },
    {
      $unwind: {
        path: '$paymentData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        pendingAmount: { $round: { $subtract: ['$productData.price', '$paymentData.price'] } },
        paymentData: '$paymentData.price',
        productData: '$productData.price',
      },
    },
  ]);

  if (!deliveryStatus) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  let paidamount = updateBody.paidamount;
  if (paidamount == null) {
    paidamount = 0;
  }
  if (pending.length != 0) {
    if (pending[0].pendingAmount == paidamount) {
      await ShopOrderClone.findByIdAndUpdate({ _id: creditBills.orderId }, { statusOfBill: 'Paid' }, { new: true });
    }
  }
  await ShopOrderClone.findByIdAndUpdate(
    { _id: creditBills.orderId },
    { Scheduledate: updateBody.reasonScheduleOrDate, Schedulereason: updateBody.Schedulereason },
    { new: true }
  );
  if (updateBody.Schedulereason == null || updateBody.Schedulereason == '') {
    await orderPayment.create({
      paidAmt: paidamount,
      date: currentDate,
      time: currenttime,
      created: moment(),
      orderId: creditBills.orderId,
      payment: updateBody.payment,
      pay_type: updateBody.pay_types,
      paymentMethod: updateBody.paymentMethods,
      paymentstutes: updateBody.paymentstutes,
      uid: userId,
      type: 'creditBill',
      reasonScheduleOrDate: updateBody.reasonScheduleOrDate,
      creditID: updateBody.groupID,
      Schedulereason: updateBody.Schedulereason,
    });
    await creditBill.findByIdAndUpdate({ _id: id }, { status: 'paid' }, { new: true });
  } else {
    await orderPayment.create({
      paidAmt: 0,
      date: currentDate,
      time: currenttime,
      created: moment(),
      orderId: creditBills.orderId,
      payment: 'Scheduled',
      pay_type: updateBody.pay_types,
      paymentMethod: updateBody.paymentMethods,
      paymentstutes: updateBody.paymentstutes,
      uid: userId,
      type: 'creditBill',
      reasonScheduleOrDate: updateBody.reasonScheduleOrDate,
      creditID: updateBody.groupID,
      Schedulereason: updateBody.Schedulereason,
    });
    await creditBill.findByIdAndUpdate(
      { _id: id },
      {
        reasonScheduleOrDate: updateBody.reasonScheduleOrDate,
        Schedulereason: updateBody.Schedulereason,
        status: 'reschedule',
      },
      { new: true }
    );
  }
  return deliveryStatus;
};

const scheduleshopdate = async (id, updateBody, userId) => {
  let currentDate = moment().format('YYYY-MM-DD');
  let currenttime = moment().format('HHmmss');
  let deliveryStatus = await ShopOrderClone.findById(id);
  if (!deliveryStatus) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  let paidamount = 0;
  await ShopOrderClone.findByIdAndUpdate(
    { _id: id },
    { Scheduledate: updateBody.reasonScheduleOrDate, Schedulereason: updateBody.Schedulereason },
    { new: true }
  );
  await orderPayment.create({
    paidAmt: 0,
    date: currentDate,
    time: currenttime,
    created: moment(),
    orderId: id,
    payment: 'Scheduled',
    uid: userId,
    type: 'Scheduled',
    reasonScheduleOrDate: updateBody.reasonScheduleOrDate,
    Schedulereason: updateBody.Schedulereason,
  });
  return deliveryStatus;
};

const updateOrderStatus = async (id, updateBody, userId) => {
  let currentDate = moment().format('YYYY-MM-DD');
  let currenttime = moment().format('HHmmss');
  let body = {
    ...updateBody,
    ...{
      status: 'Delivered',
      customerDeliveryStatus: 'Delivered',
      delivered_date: moment(),
    },
  };
  let deliveryStatus = await ShopOrderClone.findById(id);
  //console.log(deliveryStatus);
  if (!deliveryStatus) {
    throw new ApiError(httpStatus.NOT_FOUND, 'status not found');
  }
  deliveryStatus = await ShopOrderClone.findByIdAndUpdate({ _id: id }, body, { new: true });
  deliveryStatus.statusActionArray.push({ userid: '', date: moment().toString(), status: 'Delivered' });
  deliveryStatus.save();
  let paidamount = updateBody.paidamount;
  if (paidamount == null) {
    paidamount = 0;
  }
  await orderPayment.create({
    paidAmt: paidamount,
    date: currentDate,
    time: currenttime,
    created: moment(),
    orderId: deliveryStatus._id,
    type: updateBody.reason,
    payment: updateBody.payment,
    pay_type: updateBody.pay_types,
    paymentMethod: updateBody.paymentMethods,
    paymentstutes: updateBody.paymentstutes,
    creditBillStatus: updateBody.creditBillStatus,
    reasonScheduleOrDate: updateBody.reasonScheduleOrDate,
    uid: userId,
  });
  return deliveryStatus;
};
const updateOrderStatus_forundelivey = async (id, updateBody, userId) => {
  let body = {
    ...updateBody,
    ...{
      status: 'UnDelivered',
      customerDeliveryStatus: 'UnDelivered',
      un_delivered_date: moment(),
    },
  };
  let deliveryStatus = await ShopOrderClone.findById(id);
  //console.log(deliveryStatus);
  if (!deliveryStatus) {
    throw new ApiError(httpStatus.NOT_FOUND, 'status not found');
  }
  deliveryStatus = await ShopOrderClone.findByIdAndUpdate({ _id: id }, body, { new: true });
  deliveryStatus.statusActionArray.push({ userid: '', date: moment().toString(), status: 'unDelivered', userid: userId });
  deliveryStatus.save();
  return deliveryStatus;
};
const orderPicked = async (deliveryExecutiveId) => {
  let orderPicked = await ShopOrderClone.find({ deliveryExecutiveId: deliveryExecutiveId });
  //console.log(orderPicked);
  if (orderPicked.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, ' id not found');
  }

  orderPicked.forEach(async (e) => {
    let statusUpdate = e.deliveryExecutiveId;
    await ShopOrderClone.findByIdAndUpdate({ deliveryExecutiveId: statusUpdate }, { status: 'Order Picked' }, { new: true });
  });

  return 'success';
};
const getById = async (id) => {
  return wardAdminGroup.findById(id);
};

const updateManageStatus = async (id, updateBody, userId) => {
  let Manage = await getById(id);
  if (!Manage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  Manage = await wardAdminGroup.findByIdAndUpdate(
    { _id: id },
    {
      pettyStockAllocateStatus: 'Un Allocate',
      pettyStockUnAllocateCreated: moment(),
      StockUid: userId,
      status: 'Packed',
    },
    { new: true }
  );
  return Manage;
};
const updateordercomplete = async (id, updateBody, userId) => {
  let Manage = await getById(id);
  if (!Manage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  Manage = await wardAdminGroup.findByIdAndUpdate(
    { _id: id },
    {
      manageDeliveryStatus: 'Order Picked',
      orderPickedCreate: moment(),
      orderPickedUserId: userId,
    },
    { new: true }
  );
  let assign = await wardAdminGroupModel_ORDERS.find({ wardAdminGroupID: id });
  assign.forEach(async (e) => {
    await ShopOrderClone.findByIdAndUpdate({ _id: e.orderId }, { status: 'Order Picked' }, { new: true });
  });
  return Manage;
};

const delevery_start = async (id, updateBody, userId) => {
  let Manage = await getById(id);
  if (!Manage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  Manage = await wardAdminGroup.findByIdAndUpdate(
    { _id: id },
    {
      manageDeliveryStatus: 'Delivery start',
      DeliveryStartCreate: moment(),
      DeliveryStartUserId: userId,
    },
    { new: true }
  );
  let assign = await wardAdminGroupModel_ORDERS.find({ wardAdminGroupID: id });
  assign.forEach(async (e) => {
    await ShopOrderClone.findByIdAndUpdate({ _id: e.orderId }, { status: 'Delivery start' }, { new: true });
  });
  return Manage;
};

const updateManageStatuscashcollect = async (id, updateBody, userId) => {
  let Manage = await getById(id);
  if (!Manage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  Manage = await wardAdminGroup.findByIdAndUpdate(
    { _id: id },
    {
      manageDeliveryStatus: 'petty cash picked',
      pettyCashPickedCreated: moment(),
      CashPickedUserId: userId,
    },
    { new: true }
  );
  return Manage;
};

// mismatchStockStatus

const updatemismatchStockStatus = async (id, updateBody) => {
  let data = await getById(id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  data = await wardAdminGroup.findByIdAndUpdate(
    { _id: id },
    {
      mismatchStockStatus: 'Finish',
    },
    { new: true }
  );
  return data;
};

const updateManageStatuscollected = async (id, updateBody, userId) => {
  let Manage = await getById(id);
  if (!Manage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  Manage = await wardAdminGroup.findByIdAndUpdate(
    { _id: id },
    {
      manageDeliveryStatus: 'petty stock picked',
      StockPickedCreated: moment(),
      StockPickedUserId: userId,
    },
    { new: true }
  );
  return Manage;
};

const updateManageStatuscash = async (id, updateBody, userId) => {
  let Manage = await getById(id);
  if (!Manage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  Manage = await wardAdminGroup.findByIdAndUpdate(
    { _id: id },
    {
      pettyCashAllocateStatus: 'Un Allocate',
      pettyCashNotAllocateCreate: moment(),
      CashUid: userId,
    },
    { new: true }
  );
  return Manage;
};

const updateShopOrderCloneById = async (id, updatebody) => {
  let shoporderClone = await ShopOrderClone.findById(id);
  if (!shoporderClone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ShopOrderClone Not Found');
  }
  shoporderClone = await ShopOrderClone.findByIdAndUpdate({ _id: id }, updatebody, { new: true });
  return shoporderClone;
};

// GET ORDER DETAILS FROM GROUP BY ID

const getOrderFromGroupById = async (id) => {
  let getDetails = await wardAdminGroup.findById(id);
  return getDetails;
};

const getPettyStock = async (id) => {
  //console.log(id);
  let values = await Product.aggregate([
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'productid',
        pipeline: [
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
                    pipeline: [{ $match: { wardAdminGroupID: id } }],
                    as: 'orderassigns',
                  },
                },
                {
                  $unwind: '$orderassigns',
                },
              ],
              as: 'shoporderclones',
            },
          },
          {
            $unwind: '$shoporderclones',
          },
          {
            $group: {
              _id: null,
              Qty: { $sum: '$quantity' },
              finalQuantity: { $sum: '$finalQuantity' },
            },
          },
        ],
        as: 'productorderclones',
      },
    },
    {
      $unwind: '$productorderclones',
    },
    {
      $unwind: {
        path: '$productorderclones',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        productTitle: 1,
        overAllQuantity: '$productorderclones.Qty',
        finalQuantity: '$productorderclones.finalQuantity',
      },
    },
  ]);

  return values;
};

const returnStock = async (id) => {
  //console.log(id);
  let values = await Product.aggregate([
    // {
    //   $lookup: {
    //     from: 'pettystockmodels',
    //     localField: '_id',
    //     foreignField: 'productId',
    //     pipeline: [{
    //       $lookup: {
    //         from: 'wardadmingroups',
    //         localField: 'wardAdminId',
    //         foreignField: '_id',
    //         as: 'group',
    //       }
    //     },
    //     {
    //       $unwind: '$group'
    //     }
    //     ],
    //     as: 'pettyStock'
    //   }
    // },
    // {
    //   $unwind: '$pettyStock'
    // },
    // Delivered count
    {
      $lookup: {
        from: 'pettystockmodels',
        localField: '_id',
        foreignField: 'productId',
        pipeline: [
          {
            $match: {
              groupId: id,
            },
          },
          {
            $lookup: {
              from: 'wardadmingroups',
              localField: 'groupId',
              foreignField: '_id',
              pipeline: [
                {
                  $lookup: {
                    from: 'vehicles',
                    localField: 'vehicleId',
                    foreignField: '_id',
                    as: 'vehicles',
                  },
                },
                {
                  $unwind: {
                    path: '$vehicles',
                    preserveNullAndEmptyArrays: true,
                  },
                },
              ],
              as: 'group',
            },
          },
          {
            $unwind: {
              path: '$group',
              preserveNullAndEmptyArrays: true,
            },
          },
        ],
        as: 'totalpetty',
      },
    },
    // {
    //   $unwind: '$totalpetty',
    // },
    {
      $unwind: {
        path: '$totalpetty',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'productid',
        pipeline: [
          {
            $lookup: {
              from: 'shoporderclones',
              localField: 'orderId',
              foreignField: '_id',
              pipeline: [
                {
                  $match: {
                    $and: [{ customerDeliveryStatus: { $eq: 'Delivered' } }],
                  },
                },
                {
                  $lookup: {
                    from: 'orderassigns',
                    localField: '_id',
                    foreignField: 'orderId',
                    pipeline: [{ $match: { wardAdminGroupID: id } }],
                    as: 'orderassigns',
                  },
                },
                {
                  $unwind: '$orderassigns',
                },
              ],
              as: 'shoporderclones',
            },
          },
          {
            $unwind: '$shoporderclones',
          },
          {
            $group: {
              _id: null,
              Qty: { $sum: '$finalQuantity' },
            },
          },
        ],
        as: 'productorderclones',
      },
    },

    {
      $unwind: {
        path: '$productorderclones',
        preserveNullAndEmptyArrays: true,
      },
    },
    //  Un Delivered count
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'productid',
        pipeline: [
          {
            $lookup: {
              from: 'shoporderclones',
              localField: 'orderId',
              foreignField: '_id',
              pipeline: [
                {
                  $match: {
                    $and: [{ customerDeliveryStatus: { $eq: 'UnDelivered' } }],
                  },
                },
                {
                  $lookup: {
                    from: 'orderassigns',
                    localField: '_id',
                    foreignField: 'orderId',
                    pipeline: [{ $match: { wardAdminGroupID: id } }],
                    as: 'orderassigns',
                  },
                },

                {
                  $unwind: '$orderassigns',
                },
              ],
              as: 'shoporderclonesData',
            },
          },
          {
            $unwind: '$shoporderclonesData',
          },

          {
            $group: {
              _id: null,
              UnQty: { $sum: '$finalQuantity' },
            },
          },
        ],
        as: 'productorderclonesData',
      },
    },

    {
      $unwind: {
        path: '$productorderclonesData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'returnstocks',
        localField: '_id',
        foreignField: 'productId',
        pipeline: [
          {
            $match: {
              $and: [{ groupId: { $eq: id } }],
            },
          },
        ],
        as: 'returnStock',
      },
    },
    {
      $unwind: {
        path: '$returnStock',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        productTitle: 1,
        productid: 1,
        status: '$returnStock.status',
        productorderclones: '$productorderclones',
        productorderclonesData: '$productorderclonesData',
        mismatch: { $subtract: ['$returnStock.actualStock', '$returnStock.actualWastage'] },
        pettyStock: { $round: ['$totalpetty.pettyStock'] },
        DeliveryQuantity: '$productorderclones.Qty',
        actualStock: '$returnStock.actualStock',
        actualWastage: '$returnStock.actualWastage',
        mis: '$returnStock.misMatch',
        productorderclones: { $eq: ['$productorderclones._id', null] },
        UndeliveryQuantity: '$productorderclonesData.UnQty',
        totalSum: { $add: ['$productorderclones.Qty', '$productorderclonesData.UnQty'] },
        productorderclonesData: { $eq: ['$productorderclonesData._id', null] },
        vehicleName: '$totalpetty.group.vehicles.vehicle_type',
        vehicleNumber: '$totalpetty.group.vehicles.vehicleNo',
        route: '$totalpetty.group.route',
        DEStatus: '$totalpetty.group.manageDeliveryStatus',
        groupStatus: '$totalpetty.group.manageDeliveryStatus',
        GroupBillId: '$totalpetty.group.status',
        returnStockstatus: '$totalpetty.group.returnStockstatus',
      },
    },
    {
      $match: {
        $or: [{ productorderclones: true }, { productorderclonesData: true }],
      },
    },
  ]);
  let group = await wardAdminGroup.findById(id);
  return { values: values, group: group };
};

const pettyStockSubmit = async (id, updateBody, userId) => {
  let deliveryStatus = await wardAdminGroup.findById(id);
  if (!deliveryStatus) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Group not found');
  }
  deliveryStatus = await wardAdminGroup.findByIdAndUpdate(
    { _id: id },
    { manageDeliveryStatus: 'Delivery Completed', deliveryCompleteCreate: moment(), deliveryCompleteUserId: userId },
    { new: true }
  );
  // deliveryStatus.Orderdatas.forEach(async (e) => {
  //   let id = e._id;
  //   let shoporder = await ShopOrderClone.findById(id);
  //   shoporder = await ShopOrderClone.findByIdAndUpdate({ _id: id }, { status: 'Delivery Completed' }, { new: true });
  //   shoporder.statusActionArray.push({ userid: userId, date: moment().toString(), status: 'Delivery Completed' });
  //   shoporder.save();
  // });

  // let valueStatus = await wardAdminGroupModel_ORDERS.find({ orderId: id });
  // //console.log(valueStatus);
  // valueStatus.forEach(async (e) => {
  //   await ShopOrderClone.findByIdAndUpdate({ _id: e.orderId }, { status: 'Delivery Completed' }, { new: true });
  // });

  // updateBody.arr.forEach(async (e) => {
  //   await ShopOrderClone.findByIdAndUpdate({ _id: e }, { status: 'Delivery Completed' }, { new: true });

  // })
  return deliveryStatus;
};

const pettyCashSubmit = async (id, updateBody, userId) => {
  let deliveryStatus = await wardAdminGroup.findById(id);
  if (!deliveryStatus) {
    throw new ApiError(httpStatus.NOT_FOUND, 'status not found');
  }
  deliveryStatus = await wardAdminGroup.findByIdAndUpdate(
    { _id: id },
    { pettyCash: updateBody.pettyCash, pettyCashAllocateStatus: 'Allocated', PettyCashCreate: moment(), CashUid: userId },
    { new: true }
  );
  return deliveryStatus;
};

const getGroupdetails = async () => {
  return wardAdminGroup.find();
};

// GET ASSIGN DATA BY DEVIVERY EXECUTIVE NAME

const getstatus = async (id) => {
  let details = await wardAdminGroup.aggregate([
    {},
    // {
    //   $lookup:{
    //     from: '',
    //     localField: '',
    //     foreignField: '',
    //     as: '',
    //   }

    // }
  ]);
  return details;
};

const getBillDetails = async (id) => {
  let values = await wardAdminGroup.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'orderassigns',
        localField: '_id',
        foreignField: 'wardAdminGroupID',
        pipeline: [
          {
            $lookup: {
              from: 'shoporderclones',
              localField: 'orderId',
              foreignField: '_id',
              pipeline: [
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
                    as: 'datass',
                  },
                },
                {
                  $unwind: '$datass',
                },

                {
                  $project: {
                    totalAmount: '$datass.amount',
                  },
                },
              ],
              as: 'shopDatas',
            },
          },
          {
            $unwind: '$shopDatas',
          },

          {
            $lookup: {
              from: 'shoporderclones',
              localField: 'orderId',
              foreignField: '_id',
              pipeline: [
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
                          as: 'productsdata',
                        },
                      },
                      {
                        $unwind: '$productsdata',
                      },
                      {
                        $project: {
                          _id: 1,
                          productTitle: '$productsdata.productTitle',
                          finalQuantity: 1,
                          finalPricePerKg: 1,
                          HSN_Code: 1,
                          GST_Number: 1,
                          unit: 1,
                          packKg: 1,
                          total: {
                            $multiply: ['$finalQuantity', '$finalPricePerKg'],
                          },
                        },
                      },
                    ],
                    as: 'products',
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
                          from: 'streets',
                          localField: 'Strid',
                          foreignField: '_id',
                          as: 'streetDatasss',
                        },
                      },
                      {
                        $unwind: '$streetDatasss',
                      },
                      {
                        $project: {
                          street: '$streetDatasss.street',
                          _id: 1,
                          SName: 1,
                          SOwner: 1,
                          mobile: 1,
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
                    OrderId: 1,
                    Payment: 1,
                    customerBillId: 1,
                    customerBilldate: 1,
                    customerBilltime: 1,
                    products: '$products',
                    b2bshopclones: '$b2bshopclones',
                    SName: '$b2bshopclones.SName',
                    SOwner: '$b2bshopclones.SOwner',
                    street: '$b2bshopclones.street',
                    mobile: '$b2bshopclones.mobile',
                  },
                },
              ],
              as: 'shopDatasDetails',
            },
          },
          {
            $unwind: '$shopDatasDetails',
          },

          {
            $project: {
              _id: 1,
              totalAmount: '$shopDatas.totalAmount',
              OrderId: '$shopDatasDetails.OrderId',
              customerBillId: '$shopDatasDetails.customerBillId',
              customerBilldate: '$shopDatasDetails.customerBilldate',
              customerBilltime: '$shopDatasDetails.customerBilltime',
              Payment: '$shopDatasDetails.Payment',
              product: '$shopDatasDetails.products',
              SName: '$shopDatasDetails.SName',
              SOwner: '$shopDatasDetails.SOwner',
              street: '$shopDatasDetails.street',
            },
          },
        ],
        as: 'orderassigns',
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'deliveryExecutiveId',
        foreignField: '_id',
        as: 'b2bsersData',
      },
    },
    {
      $unwind: '$b2bsersData',
    },
    {
      $lookup: {
        from: 'pettystockmodels',
        localField: '_id',
        foreignField: 'wardAdminId',
        as: 'pettystockmodels',
      },
    },

    {
      $project: {
        groupId: 1,
        assignDate: 1,
        assignTime: 1,
        totalOrders: { $size: '$orderassigns' },
        orderassigns: '$orderassigns',
        deliveryExecutivename: '$b2bsersData.name',
        pettystockmodels: '$pettystockmodels',
        pettyCash: 1,
        pettyCashAllocateStatus: 1,
        pettyStockAllocateStatus: 1,
      },
    },
  ]);
  if (values.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'not found');
  }
  return values[0];
};

const assignOnly = async (query, status) => {
  let page = query.page == null || query.page == '' ? 0 : query.page;
  let type = query.pickputype;
  //console.log(type);
  //console.log(page);
  let macthStatus = { active: true };
  let statusMatch = { status: 'Packed' };
  if (status == 'stock') {
    macthStatus = { pettyStockAllocateStatus: 'Pending' };
  }
  if (status == 'cash') {
    macthStatus = { pettyCashAllocateStatus: 'Pending' };
  }
  if (status == 'delivery') {
    macthStatus = {
      // pettyCashAllocateStatus: { $ne: 'Pending' },
      // pettyStockAllocateStatus: { $ne: 'Pending' },
      manageDeliveryStatus: { $ne: 'Delivery Completed' },
    };
    statusMatch = { status: { $in: ['Assigned', 'Packed'] } };
  }
  //console.log(statusMatch);
  let values = await wardAdminGroup.aggregate([
    { $match: { $and: [statusMatch, macthStatus, { pickputype: { $eq: type } }] } },
    {
      $lookup: {
        from: 'orderassigns',
        localField: '_id',
        foreignField: 'wardAdminGroupID',
        pipeline: [
          {
            $lookup: {
              from: 'shoporderclones',
              localField: 'orderId',
              foreignField: '_id',
              pipeline: [
                {
                  $match: {
                    $and: [{ customerDeliveryStatus: { $eq: 'Pending' } }],
                  },
                },
                {
                  $group: {
                    _id: null,
                  },
                },
              ],
              as: 'shopdata',
            },
          },
          { $unwind: '$shopdata' },
          {
            $project: {
              pending: { $eq: ['$shopdata._id', null] },
              shopdata: '$shopdata.deliveryExecutiveId',
            },
          },
        ],
        as: 'dataDetails',
      },
    },
    { $addFields: { Pending: { $arrayElemAt: ['$dataDetails', 0] } } },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'deliveryExecutiveId',
        foreignField: '_id',
        as: 'UserName',
      },
    },
    {
      $unwind: '$UserName',
    },
    {
      $lookup: {
        from: 'orderassigns',
        localField: '_id',
        foreignField: 'wardAdminGroupID',
        pipeline: [
          {
            $lookup: {
              from: 'shoporderclones',
              localField: 'orderId',
              foreignField: '_id',
              pipeline: [
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
                    SName: '$b2bshopclones.SName',
                    mobile: '$b2bshopclones.mobile',
                    status: 1,
                    productStatus: 1,
                    customerDeliveryStatus: 1,
                    delivery_type: 1,
                    time_of_delivery: 1,
                    paidamount: 1,
                    OrderId: 1,
                    date: 1,
                    created: 1,
                  },
                },
              ],
              as: 'shoporderclones',
            },
          },
          {
            $unwind: '$shoporderclones',
          },
          {
            $project: {
              _id: '$shoporderclones._id',
              SName: '$shoporderclones.SName',
              mobile: '$shoporderclones.mobile',
              status: '$shoporderclones.status',
              productStatus: '$shoporderclones.productStatus',
              customerDeliveryStatus: '$shoporderclones.customerDeliveryStatus',
              delivery_type: '$shoporderclones.delivery_type',
              time_of_delivery: '$shoporderclones.time_of_delivery',
              paidamount: '$shoporderclones.paidamount',
              OrderId: '$shoporderclones.OrderId',
              date: '$shoporderclones.date',
              created: '$shoporderclones.created',
            },
          },
        ],
        as: 'groupOrders',
      },
    },
    {
      $project: {
        shopOrderCloneId: '$wdfsaf._id',
        groupId: 1,
        totalOrders: { $size: '$dataDetails' },
        assignDate: 1,
        assignTime: 1,
        manageDeliveryStatus: 1,
        Pending: '$Pending.pending',
        deliveryExecutiveId: 1,
        deliveryExecutiveName: '$UserName.name',
        pettyCashAllocateStatus: 1,
        pettyStockAllocateStatus: 1,
        status: 1,
        groupOrders: '$groupOrders',
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await wardAdminGroup.aggregate([
    { $match: { $and: [statusMatch, macthStatus, { pickputype: { $eq: type } }] } },
    {
      $lookup: {
        from: 'orderassigns',
        localField: '_id',
        foreignField: 'wardAdminGroupID',
        pipeline: [
          {
            $lookup: {
              from: 'shoporderclones',
              localField: 'orderId',
              foreignField: '_id',
              pipeline: [
                {
                  $match: {
                    $and: [{ customerDeliveryStatus: { $eq: 'Pending' } }],
                  },
                },
                {
                  $group: {
                    _id: null,
                  },
                },
              ],
              as: 'shopdata',
            },
          },
          { $unwind: '$shopdata' },
          {
            $project: {
              pending: { $eq: ['$shopdata._id', null] },
              shopdata: '$shopdata.deliveryExecutiveId',
            },
          },
        ],
        as: 'dataDetails',
      },
    },
    { $addFields: { Pending: { $arrayElemAt: ['$dataDetails', 0] } } },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'deliveryExecutiveId',
        foreignField: '_id',
        as: 'UserName',
      },
    },
    {
      $unwind: '$UserName',
    },
  ]);

  let De_mode = await wardAdminGroup.aggregate([
    {
      $match: {
        $and: [statusMatch, macthStatus, { pickputype: { $eq: 'DE' } }],
      },
    },
  ]);

  let Sp_mode = await wardAdminGroup.aggregate([
    {
      $match: {
        $and: [statusMatch, macthStatus, { pickputype: { $eq: 'SP' } }],
      },
    },
  ]);
  let delivery = { DE: De_mode.length, SP: Sp_mode.length };

  return { values: values, total: total.length, delivery: delivery };
};

const assignOnly_DE = async (query, status, userid) => {
  let page = query.page == null || query.page == '' ? 0 : query.page;
  // //console.log(page)
  let macthStatus = { active: true };
  let statusMatch = { status: 'Packed' };
  if (status == 'stock') {
    macthStatus = { pettyStockAllocateStatus: 'Pending' };
  }
  if (status == 'cash') {
    macthStatus = { pettyCashAllocateStatus: 'Pending' };
  }
  if (status == 'delivery') {
    macthStatus = {
      // pettyCashAllocateStatus: { $ne: 'Pending' },
      // pettyStockAllocateStatus: { $ne: 'Pending' },
      // FinishingStatus: { $ne: 'Finished' },
    };
    statusMatch = { status: { $in: ['Assigned', 'Packed', 'returnedStock'] } };
  }
  let values = await wardAdminGroup.aggregate([
    {
      $match: {
        $and: [
          statusMatch,
          macthStatus,
          { pickputype: { $eq: 'DE' } },
          { deliveryExecutiveId: { $eq: userid } },
          { manageDeliveryStatus: { $ne: 'cashReturned' } },
        ],
      },
    },
    {
      $lookup: {
        from: 'orderassigns',
        localField: '_id',
        foreignField: 'wardAdminGroupID',
        pipeline: [
          {
            $lookup: {
              from: 'shoporderclones',
              localField: 'orderId',
              foreignField: '_id',
              pipeline: [
                {
                  $match: {
                    $and: [{ customerDeliveryStatus: { $eq: 'Pending' } }],
                  },
                },
                {
                  $group: {
                    _id: null,
                  },
                },
              ],
              as: 'shopdata',
            },
          },
          {
            $unwind: {
              path: '$shopdata',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              pending: { $eq: ['$shopdata._id', null] },
              shopdata: '$shopdata.deliveryExecutiveId',
            },
          },
          { $match: { pending: { $eq: true } } },
          { $group: { _id: null } }
        ],
        as: 'dataDetails',
      },
    },
    {
      $unwind: {
        path: '$dataDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'deliveryExecutiveId',
        foreignField: '_id',
        as: 'UserName',
      },
    },
    {
      $unwind: {
        path: '$UserName',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'orderassigns',
        localField: '_id',
        foreignField: 'wardAdminGroupID',
        pipeline: [
          {
            $lookup: {
              from: 'shoporderclones',
              localField: 'orderId',
              foreignField: '_id',
              pipeline: [
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
                    SName: '$b2bshopclones.SName',
                    mobile: '$b2bshopclones.mobile',
                    status: 1,
                    productStatus: 1,
                    customerDeliveryStatus: 1,
                    delivery_type: 1,
                    time_of_delivery: 1,
                    paidamount: 1,
                    OrderId: 1,
                    date: 1,
                    created: 1,
                  },
                },
              ],
              as: 'shoporderclones',
            },
          },
          {
            $unwind: {
              path: '$shoporderclones',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: '$shoporderclones._id',
              SName: '$shoporderclones.SName',
              mobile: '$shoporderclones.mobile',
              status: '$shoporderclones.status',
              productStatus: '$shoporderclones.productStatus',
              customerDeliveryStatus: '$shoporderclones.customerDeliveryStatus',
              delivery_type: '$shoporderclones.delivery_type',
              time_of_delivery: '$shoporderclones.time_of_delivery',
              paidamount: '$shoporderclones.paidamount',
              OrderId: '$shoporderclones.OrderId',
              date: '$shoporderclones.date',
              created: '$shoporderclones.created',
            },
          },
        ],
        as: 'groupOrders',
      },
    },
    {
      $project: {
        shopOrderCloneId: '$wdfsaf._id',
        groupId: 1,
        totalOrders: { $size: '$groupOrders' },
        assignDate: 1,
        assignTime: 1,
        manageDeliveryStatus: 1,
        Pending: { $toBool: { $ifNull: ['$dataDetails', false] } },
        deliveryExecutiveId: 1,
        deliveryExecutiveName: '$UserName.name',
        pettyCashAllocateStatus: 1,
        pettyStockAllocateStatus: 1,
        status: 1,
        groupOrders: '$groupOrders',
        pickputype: 1,
        FinishingStatus: 1,
        // Pending: '$Pending.pending',
        dataDetails: "$dataDetails"
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await wardAdminGroup.aggregate([
    {
      $match: {
        $and: [
          statusMatch,
          macthStatus,
          { pickputype: { $eq: 'DE' } },
          { deliveryExecutiveId: { $eq: userid } },
          { manageDeliveryStatus: { $ne: 'cashReturned' } },
        ],
      },
    },
    {
      $lookup: {
        from: 'orderassigns',
        localField: '_id',
        foreignField: 'wardAdminGroupID',
        pipeline: [
          {
            $lookup: {
              from: 'shoporderclones',
              localField: 'orderId',
              foreignField: '_id',
              pipeline: [
                {
                  $match: {
                    $and: [{ customerDeliveryStatus: { $eq: 'Pending' } }],
                  },
                },
                {
                  $group: {
                    _id: null,
                  },
                },
              ],
              as: 'shopdata',
            },
          },
          { $unwind: '$shopdata' },
          {
            $project: {
              pending: { $eq: ['$shopdata._id', null] },
              shopdata: '$shopdata.deliveryExecutiveId',
            },
          },
        ],
        as: 'dataDetails',
      },
    },
    { $addFields: { Pending: { $arrayElemAt: ['$dataDetails', 0] } } },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'deliveryExecutiveId',
        foreignField: '_id',
        as: 'UserName',
      },
    },
    {
      $unwind: '$UserName',
    },
  ]);
  return { values: values, total: total.length };
};

const getDeliveryOrderSeparate = async (id, page) => {
  let datas = await wardAdminGroup.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'orderassigns',
        localField: '_id',
        foreignField: 'wardAdminGroupID',
        pipeline: [
          {
            $lookup: {
              from: 'shoporderclones',
              localField: 'orderId',
              foreignField: '_id',
              pipeline: [
                {
                  $lookup: {
                    from: 'b2bshopclones',
                    localField: 'shopId',
                    foreignField: '_id',
                    as: 'datass',
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
                    as: 'orderpaymentsData',
                  },
                },
                // { $unwind: '$orderpaymentsData' },
                {
                  $unwind: {
                    path: '$orderpaymentsData',
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
                  $lookup: {
                    from: 'productorderclones',
                    localField: '_id',
                    foreignField: 'orderId',
                    as: 'productorderclonescount',
                  },
                },
                {
                  $unwind: '$datass',
                },
                {
                  $project: {
                    _id: 1,
                    status: 1,
                    productStatus: 1,
                    customerDeliveryStatus: 1,
                    receiveStatus: 1,
                    pettyCashReceiveStatus: 1,
                    AssignedStatus: 1,
                    completeStatus: 1,
                    UnDeliveredStatus: 1,
                    delivery_type: 1,
                    Payment: 1,
                    devevery_mode: 1,
                    time_of_delivery: 1,
                    total: 1,
                    gsttotal: 1,
                    subtotal: 1,
                    SGST: 1,
                    CGST: 1,
                    paidamount: 1,
                    Uid: 1,
                    OrderId: 1,
                    customerBillId: 1,
                    date: 1,
                    time: 1,
                    created: 1,
                    statusUpdate: 1,
                    WA_assigned_Time: 1,
                    deliveryExecutiveId: 1,
                    WL_Packed_Time: 1,
                    totalPrice: '$productorderclones.price',
                    productCount: {
                      $size: '$productorderclonescount',
                    },
                    totalamountOverAll: '$orderpaymentsData.price',
                    shopName: '$datass.SName',
                    Slat: '$datass.Slat',
                    Slong: '$datass.Slong',
                    sort_wde: 1,
                  },
                },
              ],
              as: 'shopDatas',
            },
          },
          { $unwind: '$shopDatas' },

          {
            $project: {
              _id: '$shopDatas._id',
              status: '$shopDatas.status',
              productStatus: '$shopDatas.productStatus',
              customerDeliveryStatus: '$shopDatas.customerDeliveryStatus',
              receiveStatus: '$shopDatas.receiveStatus',
              pettyCashReceiveStatus: '$shopDatas.pettyCashReceiveStatus',
              AssignedStatus: '$shopDatas.AssignedStatus',
              completeStatus: '$shopDatas.completeStatus',
              UnDeliveredStatus: '$shopDatas.UnDeliveredStatus',
              delivery_type: '$shopDatas.delivery_type',
              Payment: '$shopDatas.Payment',
              devevery_mode: '$shopDatas.devevery_mode',
              time_of_delivery: '$shopDatas.time_of_delivery',
              OrderId: '$shopDatas.OrderId',
              customerBillId: '$shopDatas.customerBillId',
              date: '$shopDatas.date',
              time: '$shopDatas.time',
              created: '$shopDatas.created',
              statusUpdate: '$shopDatas.statusUpdate',
              WA_assigned_Time: '$shopDatas.WA_assigned_Time',
              deliveryExecutiveId: '$shopDatas.deliveryExecutiveId',
              totalPrice: '$shopDatas.totalPrice',
              paidamount: '$shopDatas.paidamount',
              productCount: '$shopDatas.productCount',
              shopName: '$shopDatas.shopName',
              overAllTotalAmount: '$shopDatas.totalamountOverAll',
              amountAfterSubtract: {
                $subtract: ['$shopDatas.totalPrice', '$shopDatas.totalamountOverAll'],
              },
              Slat: '$shopDatas.Slat',
              Slong: '$shopDatas.Slong',
              sort_wde: '$shopDatas.sort_wde',
            },
          },
          { $sort: { sort_wde: 1 } },
        ],
        as: 'orderassigns',
      },
    },

    {
      $project: {
        orderassigns: '$orderassigns',
        status: 1,
        manageDeliveryStatus: 1,
        sort_wde: 1,
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await wardAdminGroup.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },
    {
      $unwind: '$Orderdatas',
    },
    {
      $lookup: {
        from: 'shoporderclones',
        localField: 'Orderdatas._id',
        foreignField: '_id',
        as: 'shopDatas',
      },
    },
    { $unwind: '$shopDatas' },
  ]);
  if (datas.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'order not Found');
  }

  let return_order = await wardAdminGroup.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'issueassigns',
        localField: '_id',
        foreignField: 'wardAdminGroupID',
        pipeline: [
          {
            $lookup: {
              from: 'shoporderclones',
              localField: 'orderId',
              foreignField: '_id',
              pipeline: [
                {
                  $lookup: {
                    from: 'b2bshopclones',
                    localField: 'shopId',
                    foreignField: '_id',
                    as: 'datass',
                  },
                },
                { $unwind: "$datass" },
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
                          as: 'productsData',
                        },
                      },
                      {
                        $unwind: '$productsData',
                      },
                      {
                        $project: {
                          quantity: 1,
                          priceperkg: 1,
                          product: '$productsData.productTitle',
                          productId: '$productsData._id',
                          issue: 1,
                          issueDate: 1,
                          issuediscription: 1,
                          issuequantity: 1,
                          issuetype: 1,
                          issueStatus: 1,
                          unit: 1,
                          date: 1,
                          finalQuantity: 1,
                          finalPricePerKg: 1

                        },
                      },
                    ],
                    as: 'productorderclonescount',
                  },
                },
                {
                  $project: {
                    _id: 1,
                    status: 1,
                    productStatus: 1,
                    customerDeliveryStatus: 1,
                    shopName: '$datass.SName',
                    Slat: '$datass.Slat',
                    Slong: '$datass.Slong',
                    productorderclonescount: "$productorderclonescount",
                    OrderId: 1,
                    customerDeliveryStatus: 1,
                    receiveStatus: 1,
                    completeStatus: 1,
                    created: 1

                  },
                },
              ],
              as: 'shopDatas',
            },
          },
          { $unwind: '$shopDatas' },

          {
            $project: {
              _id: '$shopDatas._id',
              status: '$shopDatas.status',
              customerDeliveryStatus: '$shopDatas.customerDeliveryStatus',
              receiveStatus: '$shopDatas.receiveStatus',
              pettyCashReceiveStatus: '$shopDatas.pettyCashReceiveStatus',
              AssignedStatus: '$shopDatas.AssignedStatus',
              completeStatus: '$shopDatas.completeStatus',
              OrderId: '$shopDatas.OrderId',
              shopName: '$shopDatas.shopName',
              Slat: '$shopDatas.Slat',
              Slong: '$shopDatas.Slong',
              sort_wde: '$shopDatas.sort_wde',
              productorderclonescount: '$shopDatas.productorderclonescount',
              created: "$shopDatas.created",
            },
          },
          { $sort: { sort_wde: 1 } },
        ],
        as: 'orderassigns',
      },
    },

    {
      $project: {
        orderassigns: '$orderassigns',
        status: 1,
        manageDeliveryStatus: 1,
        sort_wde: 1,
      },
    },
  ]);

  return {
    datas: datas[0].orderassigns,
    status: datas[0].status,
    sort_wde: datas[0].sort_wde,
    manageDeliveryStatus: datas[0].manageDeliveryStatus,
    total: total.length,
    return_order: return_order
  };
};

const groupIdClick = async (id) => {
  let data = [];
  let getDetails = await wardAdminGroup.findById(id);
  getDetails.Orderdatas.forEach((e) => {
    data.push(e);
  });
  return data;
};

const getpettyStockData = async (id, body) => {
  let data = [];
  let pettyStockData = await wardAdminGroup.findByIdAndUpdate({ _id: id }, body, { new: true });
  pettyStockData.pettyStockData.forEach((e) => {
    data.push(e);
  });
  return data;
};
const orderIdClickGetProduct = async (id) => {
  //console.log(id);

  let getDetails = await ProductorderClone.aggregate([
    {
      $match: {
        $and: [{ orderId: { $eq: id } }],
      },
    },
    // {
    //   $lookup: {
    //     from: 'productorderclones',
    //     localField: '_id',
    //     foreignField: 'orderId',
    //     as: 'productorderclonesData',
    //   }
    // },
    // {
    //   $unwind: '$productorderclonesData'
    // },
    {
      $lookup: {
        from: 'products',
        localField: 'productid',
        foreignField: '_id',
        as: 'productsData',
      },
    },
    {
      $unwind: '$productsData',
    },
    {
      $project: {
        quantity: 1,
        priceperkg: 1,
        product: '$productsData.productTitle',
        productId: '$productsData._id',
      },
    },
  ]);

  return getDetails;
};

const getDetailsAfterDeliveryCompletion = async (id) => {
  let values = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [{ deliveryExecutiveId: { $eq: id } }],
      },
    },
  ]);
  return values;
};

const getBillDetailsPerOrder = async (id) => {
  let datas = await ProductorderClone.aggregate([
    {
      $match: {
        $and: [{ orderId: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'shoporderclones',
        localField: 'orderId',
        foreignField: '_id',
        as: 'shopData',
      },
    },

    { $unwind: '$shopData' },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'shopData.Uid',
        foreignField: '_id',
        as: 'AttenderName',
      },
    },
    { $unwind: '$AttenderName' },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'shopData.deliveryExecutiveId',
        foreignField: '_id',
        as: 'deliveryExecutiveName',
      },
    },
    { $unwind: '$deliveryExecutiveName' },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopData.shopId',
        foreignField: '_id',
        as: 'b2bshopclonedatas',
      },
    },
    { $unwind: '$b2bshopclonedatas' },
    {
      $lookup: {
        from: 'productorderclones',
        localField: 'shopData._id',
        foreignField: 'orderId',
        pipeline: [{ $group: { _id: null, Qty: { $sum: '$finalQuantity' } } }],
        as: 'TotalQuantityData',
      },
    },
    { $unwind: '$TotalQuantityData' },
    {
      $lookup: {
        from: 'products',
        localField: 'productid',
        foreignField: '_id',
        as: 'productName',
      },
    },
    { $unwind: '$productName' },

    {
      $project: {
        productid: 1,
        finalPricePerKg: 1,
        finalQuantity: 1,
        GST_Number: 1,
        HSN_Code: 1,
        productTitle: '$productName.productTitle',
        billNo: '$shopData.billNo',
        date: '$shopData.customerBilldate',
        attenName: '$AttenderName.name',
        time: '$shopData.customerBilltime',
        billDate: '$shopData.customerBilldate',
        billTime: '$shopData.customerBilltime',
        OrderId: '$shopData.OrderId',
        billId: '$shopData.customerBillId',
        shopName: '$b2bshopclonedatas.SName',
        address: '$b2bshopclonedatas.address',
        mobile: '$b2bshopclonedatas.mobile',
        shopType: '$b2bshopclonedatas.type',
        SOwner: '$b2bshopclonedatas.SOwner',
        Amount: { $multiply: ['$finalQuantity', '$finalPricePerKg'] },
        totalQuantity: '$TotalQuantityData.Qty',
        OperatorName: '$deliveryExecutiveName.name',
        GSTamount: { $divide: [{ $multiply: [{ $multiply: ['$finalQuantity', '$finalPricePerKg'] }, '$GST_Number'] }, 100] },
        totalRupees: {
          $add: [
            { $multiply: ['$finalQuantity', '$finalPricePerKg'] },
            { $divide: [{ $multiply: [{ $multiply: ['$finalQuantity', '$finalPricePerKg'] }, '$GST_Number'] }, 100] },
          ],
        },
        CGSTAmount: {
          $divide: [
            { $divide: [{ $multiply: [{ $multiply: ['$finalQuantity', '$finalPricePerKg'] }, '$GST_Number'] }, 100] },
            2,
          ],
        },
        SGSTAmount: {
          $divide: [
            { $divide: [{ $multiply: [{ $multiply: ['$finalQuantity', '$finalPricePerKg'] }, '$GST_Number'] }, 100] },
            2,
          ],
        },
      },
    },
  ]);

  let totalGst = await ProductorderClone.aggregate([
    {
      $match: {
        $and: [{ orderId: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'shoporderclones',
        localField: 'orderId',
        foreignField: '_id',
        as: 'shopData',
      },
    },

    { $unwind: '$shopData' },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'shopData.Uid',
        foreignField: '_id',
        as: 'AttenderName',
      },
    },
    { $unwind: '$AttenderName' },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'shopData.deliveryExecutiveId',
        foreignField: '_id',
        as: 'deliveryExecutiveName',
      },
    },
    { $unwind: '$deliveryExecutiveName' },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopData.shopId',
        foreignField: '_id',
        as: 'b2bshopclonedatas',
      },
    },
    { $unwind: '$b2bshopclonedatas' },
    {
      $lookup: {
        from: 'productorderclones',
        localField: 'shopData._id',
        foreignField: 'orderId',
        pipeline: [{ $group: { _id: null, Qty: { $sum: '$finalQuantity' } } }],
        as: 'TotalQuantityData',
      },
    },
    { $unwind: '$TotalQuantityData' },
    {
      $lookup: {
        from: 'products',
        localField: 'productid',
        foreignField: '_id',
        as: 'productName',
      },
    },
    { $unwind: '$productName' },

    {
      $project: {
        productid: 1,
        finalPricePerKg: 1,
        finalQuantity: 1,
        GST_Number: 1,
        HSN_Code: 1,
        productTitle: '$productName.productTitle',
        billNo: '$shopData.billNo',
        date: '$shopData.customerBilldate',
        attenName: '$AttenderName.name',
        time: '$shopData.customerBilltime',
        billDate: '$shopData.customerBilldate',
        billTime: '$shopData.customerBilltime',
        OrderId: '$shopData.OrderId',
        billId: '$shopData.customerBillId',
        shopName: '$b2bshopclonedatas.SName',
        address: '$b2bshopclonedatas.address',
        mobile: '$b2bshopclonedatas.mobile',
        shopType: '$b2bshopclonedatas.type',
        SOwner: '$b2bshopclonedatas.SOwner',
        Amount: { $multiply: ['$finalQuantity', '$finalPricePerKg'] },
        totalQuantity: '$TotalQuantityData.Qty',
        OperatorName: '$deliveryExecutiveName.name',
        GSTamount: { $divide: [{ $multiply: [{ $multiply: ['$finalQuantity', '$finalPricePerKg'] }, '$GST_Number'] }, 100] },
        totalRupees: {
          $add: [
            { $multiply: ['$finalQuantity', '$finalPricePerKg'] },
            { $divide: [{ $multiply: [{ $multiply: ['$finalQuantity', '$finalPricePerKg'] }, '$GST_Number'] }, 100] },
          ],
        },
        CGSTAmount: {
          $divide: [
            { $divide: [{ $multiply: [{ $multiply: ['$finalQuantity', '$finalPricePerKg'] }, '$GST_Number'] }, 100] },
            2,
          ],
        },
        SGSTAmount: {
          $divide: [
            { $divide: [{ $multiply: [{ $multiply: ['$finalQuantity', '$finalPricePerKg'] }, '$GST_Number'] }, 100] },
            2,
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        totalRupees: { $sum: '$totalRupees' },
        CGSTAmount: { $sum: '$CGSTAmount' },
        SGSTAmount: { $sum: '$SGSTAmount' },
        GSTamount: { $sum: '$GSTamount' },
      },
    },
  ]);

  return { datas: datas, totalGst: totalGst[0] };
};

const getReturnWDEtoWLE = async (id, page) => {
  let datas = await wardAdminGroup.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'shoporderclones',
        localField: 'Orderdatas._id',
        foreignField: '_id',
        as: 'detailsData',
      },
    },

    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await wardAdminGroup.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },
  ]);
  return { datas: datas, total: total.length };
};

const getPettyStockDetails = async (id, page) => {
  let details = await wardAdminGroup.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },
    { $unwind: '$pettyStock' },
    {
      $project: {
        pettyStock: 1,
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await wardAdminGroup.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },
  ]);
  return { details: details, total: total.length };
};

const getdetailsAboutPettyStockByGroupId = async (id, page) => {
  let details = await wardAdminGroup.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },
    {
      $project: {
        pettyStock: 1,
        totalQtyIncludingPettyStock: 1,
      },
    },

    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await wardAdminGroup.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },
  ]);

  return { details: details, total: total.length };
};
const getPettyCashDetails = async (id, page) => {
  let values = await wardAdminGroup.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },

    {
      $lookup: {
        from: 'orderassigns',
        localField: '_id',
        foreignField: 'wardAdminGroupID',
        as: 'orderassignsdatas',
      },
    },
    { $unwind: '$orderassignsdatas' },

    {
      $lookup: {
        from: 'shoporderclones',
        localField: 'orderassignsdatas.orderId',
        foreignField: '_id',
        as: 'shoporderclonesdatas',
      },
    },
    { $unwind: '$shoporderclonesdatas' },
    {
      $lookup: {
        from: 'productorderclones',
        localField: 'shoporderclonesdatas._id',
        foreignField: 'orderId',
        pipeline: [
          {
            $group: {
              _id: null,
              amount: {
                $sum: {
                  $add: ['$finalQuantity', '$finalPricePerKg'],
                },
              },
            },
          },
        ],

        as: 'productorderclonesData',
      },
    },
    {
      $unwind: '$productorderclonesData',
    },

    {
      $project: {
        groupId: 1,
        shopOrderCloneId: '$shoporderclonesdatas._id',
        orderId: '$shoporderclonesdatas.OrderId',
        Amount: '$shoporderclonesdatas.overallTotal',
        // shopType: '$Orderdatas.type',
        // shopName: '$Orderdatas.shopName',
        Deliverystatus: '$shoporderclonesdatas.customerDeliveryStatus',
        FinalPaymentType: '$shoporderclonesdatas.payType',
        initialPaymentType: '$shoporderclonesdatas.Payment',
        pettyCashApporvedStatus: '$shoporderclonesdatas.pettyCashReceiveStatus',
        Amount: '$productorderclonesData.amount',
      },
    },

    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await wardAdminGroup.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },

    {
      $lookup: {
        from: 'orderassigns',
        localField: '_id',
        foreignField: 'wardAdminGroupID',
        as: 'orderassignsdatas',
      },
    },
    { $unwind: '$orderassignsdatas' },

    {
      $lookup: {
        from: 'shoporderclones',
        localField: 'orderassignsdatas.orderId',
        foreignField: '_id',
        as: 'shoporderclonesdatas',
      },
    },
    { $unwind: '$shoporderclonesdatas' },
    {
      $lookup: {
        from: 'productorderclones',
        localField: 'shoporderclonesdatas._id',
        foreignField: 'orderId',
        pipeline: [
          {
            $group: {
              _id: null,
              amount: {
                $sum: {
                  $add: ['$finalQuantity', '$finalPricePerKg'],
                },
              },
            },
          },
        ],

        as: 'productorderclonesData',
      },
    },
    {
      $unwind: '$productorderclonesData',
    },
  ]);
  return { values: values, total: total.length };
};
const getGroupDetailsForDE = async (page) => {
  let values = await wardAdminGroup.aggregate([
    {
      $match: {
        $or: [{ manageDeliveryStatus: { $in: ['Delivery Completed', 'cashReturned', 'returnedStock'] } }],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'deliveryExecutiveId',
        foreignField: '_id',
        as: 'b2buserDta',
      },
    },
    { $unwind: '$b2buserDta' },
    {
      $project: {
        groupId: 1,
        assignDate: 1,
        assignTime: 1,
        deliveryExecutiveId: 1,
        manageDeliveryStatus: 1,
        totalOrders: { $ifNull: [{ $size: '$Orderdatas' }, 0] },
        pettyCash: 1,
        status: 1,
        deliveryexecutiveName: '$b2buserDta.name',
        returnStockstatus: 1,
      },
    },

    { $skip: 10 * page },
    { $limit: 10 },
  ]);

  let total = await wardAdminGroup.aggregate([
    {
      $match: {
        $or: [{ manageDeliveryStatus: { $in: ['Delivery Completed', 'cashReturned', 'returnedStock'] } }],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'deliveryExecutiveId',
        foreignField: '_id',
        as: 'b2buserDta',
      },
    },
    { $unwind: '$b2buserDta' },
  ]);

  return { values: values, total: total.length };
};
const getAllGroup = async (id, date, FinishingStatus, page) => {
  let match;
  if (id != 'null' && date != 'null' && FinishingStatus != 'null') {
    match = [
      { deliveryExecutiveId: { $eq: id } },
      { assignDate: { $eq: date } },
      { FinishingStatus: { $eq: FinishingStatus } },
      { active: { $eq: true } },
    ];
  } else if (id != 'null') {
    match = [{ deliveryExecutiveId: { $eq: id } }, { active: { $eq: true } }];
  } else if (date != 'null') {
    match = [{ assignDate: { $eq: date } }, { active: { $eq: true } }];
  } else if (FinishingStatus != 'null') {
    match = [{ FinishingStatus: { $eq: FinishingStatus } }, { active: { $eq: true } }];
  } else {
    match = [{ deliveryExecutiveId: { $ne: null } }, { active: { $eq: true } }];
  }
  // else  {
  //   match = [{ assignDate: { $ne: null } }, { active: { $eq: true } }];
  // }
  // else {
  //   match = [{ FinishingStatus: { $ne: null } }, { active: { $eq: true } }];
  // }

  let values = await wardAdminGroup.aggregate([
    {
      $match: {
        $and: match,
      },
    },
    {
      $match: {
        $and: [{ manageDeliveryStatus: { $in: ['returnedStock', 'Delivery Completed', 'cashReturned', 'StockReturned'] } }],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'deliveryExecutiveId',
        foreignField: '_id',
        as: 'b2buserDta',
      },
    },
    { $unwind: '$b2buserDta' },
    // {
    //   $unwind: '$Orderdatas',
    // },
    // {
    //   $lookup: {
    //     from: 'shoporderclones',
    //     localField: 'Orderdatas._id',
    //     foreignField: '_id',
    //     as: 'shopIDDatas',
    //   },
    // },
    // {
    //   $unwind: '$shopIDDatas',
    // },
    {
      $project: {
        groupId: 1,
        assignDate: 1,
        assignTime: 1,
        deliveryExecutiveId: 1,
        manageDeliveryStatus: 1,
        totalOrders: { $ifNull: [{ $size: '$Orderdatas' }, 0] },
        pettyCash: 1,
        status: 1,
        deliveryexecutiveName: '$b2buserDta.name',
        FinishingStatus: 1,
        route: 1,
        // shoporderclonesId: '$shopIDDatas._id',
      },
    },

    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await wardAdminGroup.aggregate([
    {
      $match: {
        $and: match,
      },
    },
    {
      $match: {
        $and: [{ manageDeliveryStatus: { $in: ['returnedStock', 'Delivery Completed', 'cashReturned', 'StockReturned'] } }],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'deliveryExecutiveId',
        foreignField: '_id',
        as: 'b2buserDta',
      },
    },
    { $unwind: '$b2buserDta' },
    // {
    //   $unwind: '$Orderdatas',
    // },
    // {
    //   $lookup: {
    //     from: 'shoporderclones',
    //     localField: 'Orderdatas._id',
    //     foreignField: '_id',
    //     as: 'shopIDDatas',
    //   },
    // },
    // {
    //   $unwind: '$shopIDDatas',
    // },
    {
      $project: {
        groupId: 1,
        assignDate: 1,
        assignTime: 1,
        deliveryExecutiveId: 1,
        manageDeliveryStatus: 1,
        totalOrders: 1,
        pettyCash: 1,
        status: 1,
        deliveryexecutiveName: '$b2buserDta.name',
        FinishingStatus: 1,
        route: 1,
        // shoporderclonesId: '$shopIDDatas._id',
      },
    },
  ]);
  return { values: values, total: total.length };
};

const pettyStockCreate = async (id, pettyStockBody, userId) => {
  let { product } = pettyStockBody;
  let wardadmin = await wardAdminGroup.findById(id);
  //console.log(wardadmin);
  let createPetty = await wardAdminGroup.findByIdAndUpdate(
    { _id: id },
    { pettyStockAllocateStatus: 'Allocated', PettyStockCreate: moment(), StockUid: userId, status: 'Packed' },
    { new: true }
  );
  //console.log(pettyStockBody);
  product.forEach(async (e) => {
    pettyStockModel.create({
      wardAdminId: createPetty.id,
      productName: e.productName,
      productId: e.id,
      groupId: id,
      QTY: e.QTY,
      pettyStock: e.pettyStock,
      totalQtyIncludingPettyStock: e.QTY + e.pettyStock,
      date: moment().format('DD-MM-YYYY'),
      time: moment().format('hh:mm a'),
      created: moment(),
    });
  });
  return createPetty;
};

const getcashAmountViewFromDB = async (id) => {
  let values = await wardAdminGroupModel_ORDERS.aggregate([
    {
      $match: {
        $and: [{ wardAdminGroupID: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'orderpayments',
        localField: 'orderId',
        foreignField: 'orderId',
        pipeline: [
          {
            $match: {
              $or: [
                { type: { $eq: 'Customer Asked to deliver to Security' } },
                { type: { $eq: 'Customer Handover' } },
                { type: { $eq: 'Customer Asked to deliver to Neighbour' } },
              ],
            },
          },
        ],
        as: 'orderdatadata',
      },
    },
    {
      $unwind: '$orderdatadata',
    },
    {
      $group: {
        _id: '$orderdatadata.paymentMethod',
        totalCash: { $sum: '$orderdatadata.paidAmt' },
      },
    },
  ]);

  let total = await wardAdminGroup.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },
    {
      $project: {
        pettyCash: 1,
      },
    },
  ]);

  return { values: values, total: total };
};

const createDatasInPettyStockModel = async (id, updateBody) => {
  let datas = await getById(id);

  if (!datas) {
    throw new ApiError(httpStatus.NOT_FOUND, 'not found');
  }
  datas = await pettyStockModel.findByIdAndUpdate({ _id: id }, updateBody, { new: true });
  return datas;
};

const getPEttyCashQuantity = async (id) => {
  let values = await wardAdminGroup.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },
    {
      $unwind: '$Orderdatas',
    },
    {
      $lookup: {
        from: 'shoporderclones',
        localField: 'Orderdatas._id',
        foreignField: '_id',
        as: 'datas',
      },
    },
    {
      $unwind: '$datas',
    },

    {
      $project: {
        product: '$datas.product',
      },
    },
    {
      $unwind: '$product',
    },

    {
      $group: {
        _id: '$product.productTitle',
        Totalquantitysum: { $sum: '$product.quantity' },
      },
    },
  ]);
  return values;
};

const uploadWastageImage = async (body) => {
  let values = await wardAdminGroupDetails.create(body);
  return values;
};

const lastPettyStckAdd = async (id, updateBody) => {
  let product = await wardAdminGroup.findById(id);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Group not found');
  }
  updateBody.product.forEach(async (e) => {
    await pettyStockModel.create({
      productName: e.productName,
      productId: e.id,
      groupId: id,
      QTY: e.QTY,
      pettyStock: e.pettyStock,
      totalQtyIncludingPettyStock: e.QTY + e.pettyStock,
      date: moment.format('DD-MM-YYYY'),
      time: moment.format('hh:mm a'),
      created: moment(),
    });
  });
  return product;
};

const getShopDetailsForProj = async (id) => {
  let values = await ShopOrderClone.aggregate([
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
        as: 'b2bshopData',
      },
    },
    {
      $unwind: '$b2bshopData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'b2bshopData.Strid',
        foreignField: '_id',
        as: 'StridData',
      },
    },
    {
      $unwind: '$StridData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'b2bshopData.Wardid',
        foreignField: '_id',
        as: 'wardData',
      },
    },
    {
      $unwind: '$wardData',
    },
    //   {
    //   $lookup: {
    //     from: 'orderassigns',
    //     localField: '_id',
    //     foreignField: 'orderId',
    //     as: 'orderassigns',
    //   },
    // },
    // {
    //   $unwind: '$orderassigns',
    // },
    // {
    //   $lookup: {
    //     from: 'wardadmingroups',
    //     localField: 'orderassigns.wardAdminGroupID',
    //     foreignField: '_id',
    //     as: 'wardadmingroups',
    //   },
    // },
    // {
    //   $unwind: '$wardadmingroups',
    // },
    // {
    //   $lookup: {
    //     from: 'b2busers',
    //     localField: 'wardadmingroups.deliveryExecutiveId',
    //     foreignField: '_id',
    //     as: 'b2busers',
    //   },
    // },
    // {
    //   $unwind: '$b2busers',
    // },
    {
      $project: {
        Payment: 1,
        OrderId: 1,
        shopType: '$b2bshopData.type',
        shopName: '$b2bshopData.SName',
        SOwner: '$b2bshopData.SOwner',
        mobile: '$b2bshopData.mobile',
        address: '$b2bshopData.address',
        street: '$StridData.street',
        ward: '$wardData.ward',
        // deliveryExecutivename: '$b2busers.name',
        // name:"$orderassigns",
        // wjfj:"$wardadmingroups",
      },
    },
  ]);
  return values;
};

const submitCashGivenByWDE = async (id, updateBody) => {
  let deliveryStatus = await wardAdminGroup.findById(id);
  //console.log(deliveryStatus);
  if (!deliveryStatus) {
    throw new ApiError(httpStatus.NOT_FOUND, 'status not found');
  }
  deliveryStatus = await wardAdminGroup.findByIdAndUpdate({ _id: id }, updateBody, { new: true });
  //console.log(deliveryStatus);

  return deliveryStatus;
};

const createAddOrdINGrp = async (id, body, userId) => {
  let datas = await wardAdminGroup.findById(id);
  if (!datas) {
    throw new ApiError(httpStatus.NOT_FOUND, 'status not found');
  }
  await wardAdminGroup.update({ _id: id }, { $push: { Orderdatas: body.arr }, route: body.route }, { new: true });
  let serverdates = moment().format('YYYY-MM-DD');
  let servertime = moment().format('hh:mm a');
  body.arr.forEach(async (e) => {
    const group = await wardAdminGroupModel_ORDERS.findOne({
      wardAdminGroupID: id,
      orderId: e,
      date: serverdates,
    });
    if (!group) {
      let productId = e;

      await ShopOrderClone.findByIdAndUpdate(
        { _id: productId },
        {
          status: 'Assigned',
          completeStatus: 'Assigned',
          deliveryExecutiveId: datas.deliveryExecutiveId,
          WA_assigned_Time: moment(),
          AssignedCreated: moment(),
        },
        { new: true }
      );
      await wardAdminGroupModel_ORDERS.create({
        wardAdminGroupID: id,
        orderId: e,
        date: serverdates,
        time: servertime,
        created: moment(),
        AssignedstatusPerDay: 2,
      });
    }
    let statusActionArray = await ShopOrderClone.findById(e);
    statusActionArray.statusActionArray.push({ userid: userId, date: moment().toString(), status: 'Assigned' });
    statusActionArray.save();
  });

  return { success: 'works' };
};

const finishingAccount = async (id, page) => {
  let data = await wardAdminGroupModel_ORDERS.aggregate([
    {
      $match: {
        $and: [{ wardAdminGroupID: { $eq: id } }],
      },
    },

    {
      $lookup: {
        from: 'shoporderclones',
        localField: 'orderId',
        foreignField: '_id',
        pipeline: [
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
        ],
        as: 'shopData',
      },
    },
    { $unwind: '$shopData' },

    {
      $lookup: {
        from: 'orderpayments',
        localField: 'orderId',
        foreignField: 'orderId',
        pipeline: [
          {
            $match: {
              $and: [{ type: { $eq: 'advanced' } }],
            },
          },
          { $group: { _id: null, price: { $sum: '$paidAmt' } } },
        ],
        as: 'orderData',
      },
    },
    {
      $unwind: {
        path: '$orderData',
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: 'orderpayments',
        localField: 'orderId',
        foreignField: 'orderId',
        pipeline: [
          {
            $match: {
              $and: [{ type: { $ne: 'advanced' } }],
            },
          },
          { $group: { _id: null, price: { $sum: '$paidAmt' } } },
        ],
        as: 'orderDataNotEqual',
      },
    },

    {
      $unwind: {
        path: '$orderDataNotEqual',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'orderpayments',
        localField: 'orderDataNotEqual._id',
        foreignField: 'orderId',
        pipeline: [
          {
            $match: {
              $and: [{ type: { $ne: 'advanced' } }],
            },
          },
        ],
        as: 'orderDataNotEqual1',
      },
    },
    {
      $unwind: {
        path: '$orderDataNotEqual1',
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $project: {
        deliveryExecutiveName: '$shopData.b2buserDta.name',
        initialpaid: '$orderData.price',
        finalpaid: '$orderDataNotEqual.price',
        orderId: '$shopData.OrderId',
        BillId: '$shopData.customerBillId',
        DeliveryStatus: '$shopData.customerDeliveryStatus',
        initialPaymentMode: '$shopData.Payment',
        payType: '$shopData.paymentMethod',
        InitialPaidAmount: '$orderData.paidAmt',
        TotalOrderAmountWithGST: { $round: ['$shopData.productData.price'] },
        InitialPendingAmount: {
          $subtract: ['$shopData.productData.price', '$orderData.price'],
        },
        FinalPaymentMode: '$orderDataNotEqual.payment',
        // FinalPaymentMode: '$orderDataNotEqual1.payment',
        paymentType: '$orderDataNotEqual1.paymentMethod',
        // FinalPaidAmount: "$orderDataNotEqual.paidAmt",
        AddIniAndFinal: {
          $add: ['$orderData.price', '$orderDataNotEqual.price'],
        },
        orderDataNotEqual: '$orderDataNotEqual',
        // FinalPendingAmount: {
        //   $subtract: ["$shopData.productData.price","$AddIniAndFinal"]
        // },
      },
    },
    {
      $project: {
        deliveryExecutiveName: 1,
        orderId: 1,
        BillId: 1,
        DeliveryStatus: 1,
        initialPaymentMode: 1,
        payType: 1,
        initialpaid: 1,
        finalpaid: 1,
        InitialPaidAmount: 1,
        TotalOrderAmountWithGST: 1,
        InitialPendingAmount: { $round: ['$InitialPendingAmount'] },
        FinalPaymentMode: 1,
        paymentType: 1,
        FinalPaidAmount: 1,
        AddIniAndFinal: 1,
        FinalPendingAmount: {
          $subtract: ['$TotalOrderAmountWithGST', '$AddIniAndFinal'],
        },
      },
    },

    { $skip: 10 * page },
    { $limit: 10 },
  ]);

  let total = await wardAdminGroupModel_ORDERS.aggregate([
    {
      $match: {
        $and: [{ wardAdminGroupID: { $eq: id } }],
      },
    },

    {
      $lookup: {
        from: 'shoporderclones',
        localField: 'orderId',
        foreignField: '_id',
        pipeline: [
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
        ],
        as: 'shopData',
      },
    },
    { $unwind: '$shopData' },

    {
      $lookup: {
        from: 'orderpayments',
        localField: 'orderId',
        foreignField: 'orderId',
        pipeline: [
          {
            $match: {
              $and: [{ type: { $eq: 'advanced' } }],
            },
          },
          { $group: { _id: null, price: { $sum: '$paidAmt' } } },
        ],
        as: 'orderData',
      },
    },
    {
      $unwind: {
        path: '$orderData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'orderpayments',
        localField: 'orderId',
        foreignField: 'orderId',
        pipeline: [
          {
            $match: {
              $and: [{ type: { $ne: 'advanced' } }],
            },
          },
          { $group: { _id: null, price: { $sum: '$paidAmt' } } },
        ],
        as: 'orderDataNotEqual',
      },
    },
    {
      $unwind: {
        path: '$orderDataNotEqual',
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);

  let DeliveryExecutiveName = await wardAdminGroupModel_ORDERS.aggregate([
    {
      $match: {
        $and: [{ wardAdminGroupID: { $eq: id } }],
      },
    },

    {
      $lookup: {
        from: 'wardadmingroups',
        localField: 'wardAdminGroupID',
        foreignField: '_id',
        as: 'wardadmingroupsData',
      },
    },
    { $unwind: '$wardadmingroupsData' },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'wardadmingroupsData.deliveryExecutiveId',
        foreignField: '_id',
        as: 'b2buserDta',
      },
    },
    { $unwind: '$b2buserDta' },

    {
      $project: {
        // partialCount: '$partialCount.shopdatadata.pay_type',
        deleieveryName: '$b2buserDta.name',
        route: '$wardadmingroupsData.route',
      },
    },
  ]);

  let partialTotalCount = await wardAdminGroupModel_ORDERS.aggregate([
    {
      $match: {
        $and: [{ wardAdminGroupID: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'shoporderclones',
        localField: 'orderId',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $or: [{ pay_type: { $eq: 'Partial' } }, { paymentMethod: { $eq: 'By Credit' } }],
            },
          },
        ],
        as: 'shopdatadata',
      },
    },
    {
      $unwind: '$shopdatadata',
    },
  ]);

  let UnDeliveredTotal = await wardAdminGroupModel_ORDERS.aggregate([
    {
      $match: {
        $and: [{ wardAdminGroupID: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'shoporderclones',
        localField: 'orderId',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              statusActionArray: { $elemMatch: { status: { $in: ['Delivered'] } } },
            },
          },
        ],
        as: 'shopdatadata',
      },
    },
    {
      $unwind: '$shopdatadata',
    },
    {
      $project: {
        status: '$UnDeliveredTotal.shopdatadata.status',
      },
    },
  ]);

  let UnDeliveredTotalCount = await wardAdminGroupModel_ORDERS.aggregate([
    {
      $match: {
        $and: [{ wardAdminGroupID: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'shoporderclones',
        localField: 'orderId',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              statusActionArray: { $elemMatch: { status: { $in: ['unDelivered'] } } },
            },
          },
        ],
        as: 'shopdatadata',
      },
    },
    {
      $unwind: '$shopdatadata',
    },
  ]);

  return {
    data: data,
    total: total.length,
    DeliveryExecutiveName: DeliveryExecutiveName,
    partialTotalCount: partialTotalCount.length,
    UnDeliveredTotal: UnDeliveredTotal,
    UnDeliveredTotalCount: UnDeliveredTotalCount.length,
  };
};

const submitDispute = async (id, updatebody) => {
  let product = await wardAdminGroup.findById(id);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, ' Not Found');
  }
  product = await wardAdminGroup.findByIdAndUpdate({ _id: id }, updatebody, { new: true });
  //console.log(product);
  return product;
};

const returnStockData = async (id) => {
  let values = await ReturnStock_history.aggregate([
    {
      $match: { groupId: id },
    },
    {
      $addFields: { dates: { $dateToString: { format: '%Y-%m-%d', date: '$created' } } },
    },
    {
      $lookup: {
        from: 'historypacktypes',
        let: { productid: '$productId', date: '$dates' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$productId', '$$productid'] }, { $eq: ['$date', '$$date'] }],
              },
            },
          },
        ],
        as: 'packtype',
      },
    },
    {
      $unwind: '$packtype',
    },
    {
      $project: {
        _id: 1,
        productId: 1,
        product: 1,
        actualStock: 1,
        wastageStock: 1,
        mismatch: 1,
        groupId: 1,
        fineStatus: { $ifNull: ['$fineStatus', 'Pending'] },
        dates: 1,
        salesprice: '$packtype.salesendPrice',
        packtypeId: '$packtype.packtypeId',
        totalPrice: { $multiply: ['$mismatch', '$packtype.salesendPrice'] },
      },
    },
    {
      $match: {
        totalPrice: { $gt: 0 },
      },
    },
  ]);
  return values;
};

const fineData = async (body) => {
  let serverdate = moment().format('YYYY-MM-DD');
  let servertime = moment().format('hh:mm a');
  let data = await wardAdminGroup.findById(body.groupId);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'group not found');
  }
  let values = {
    ...body,
    ...{ date: serverdate, time: servertime, deliveryExecutiveId: data.deliveryExecutiveId },
  };
  return WardAdminGroupfine.create(values);
};

const getOrderDataByPassing = async (id) => {
  let values = await wardAdminGroupModel_ORDERS.aggregate([
    {
      $match: {
        $and: [{ wardAdminGroupID: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'shoporderclones',
        localField: 'orderId',
        foreignField: '_id',
        as: 'shopData',
      },
    },
    { $unwind: '$shopData' },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopData.shopId',
        foreignField: '_id',
        as: 'b2bshopclonesdata',
      },
    },
    { $unwind: '$b2bshopclonesdata' },
    {
      $project: {
        orderId: '$shopData.OrderId',
        delivery_type: '$shopData.delivery_type',
        shopName: '$b2bshopclonesdata.SName',
        mobile: '$b2bshopclonesdata.mobile',
      },
    },
  ]);
  return values;
};

const deliveryExecutiveSorting = async () => {
  let values = await wardAdminGroup.aggregate([
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
    { $group: { _id: '$deliveryExecutiveId', name: { $addToSet: '$b2busersData.name' } } },
  ]);
  return values;
};

const getGroupOrders_driver = async (query, status) => {
  let page = query.page == null || query.page == '' ? 0 : query.page;
  //console.log(page);
  let macthStatus = { active: true };
  let statusMatch = { status: 'Packed' };
  if (status == 'stock') {
    macthStatus = { pettyStockAllocateStatus: 'Pending' };
  }
  if (status == 'cash') {
    macthStatus = { pettyCashAllocateStatus: 'Pending' };
  }
  if (status == 'delivery') {
    macthStatus = {
      // pettyCashAllocateStatus: { $ne: 'Pending' },
      // pettyStockAllocateStatus: { $ne: 'Pending' },
      manageDeliveryStatus: { $ne: 'Delivery Completed' },
    };
    statusMatch = { status: { $in: ['Assigned', 'Packed'] } };
  }
  //console.log(statusMatch);
  let values = await wardAdminGroup.aggregate([
    { $match: { $and: [statusMatch, macthStatus, { pickputype: { $eq: 'SP' } }] } },
    {
      $lookup: {
        from: 'orderassigns',
        localField: '_id',
        foreignField: 'wardAdminGroupID',
        pipeline: [
          {
            $lookup: {
              from: 'shoporderclones',
              localField: 'orderId',
              foreignField: '_id',
              pipeline: [
                {
                  $match: {
                    $and: [{ customerDeliveryStatus: { $eq: 'Pending' } }],
                  },
                },
                {
                  $group: {
                    _id: null,
                  },
                },
              ],
              as: 'shopdata',
            },
          },
          { $unwind: '$shopdata' },
          {
            $project: {
              pending: { $eq: ['$shopdata._id', null] },
              shopdata: '$shopdata.deliveryExecutiveId',
            },
          },
        ],
        as: 'dataDetails',
      },
    },
    { $addFields: { Pending: { $arrayElemAt: ['$dataDetails', 0] } } },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'deliveryExecutiveId',
        foreignField: '_id',
        as: 'UserName',
      },
    },
    {
      $unwind: '$UserName',
    },
    {
      $lookup: {
        from: 'orderassigns',
        localField: '_id',
        foreignField: 'wardAdminGroupID',
        pipeline: [
          {
            $lookup: {
              from: 'shoporderclones',
              localField: 'orderId',
              foreignField: '_id',
              pipeline: [
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
                    SName: '$b2bshopclones.SName',
                    mobile: '$b2bshopclones.mobile',
                    status: 1,
                    productStatus: 1,
                    customerDeliveryStatus: 1,
                    delivery_type: 1,
                    time_of_delivery: 1,
                    paidamount: 1,
                    OrderId: 1,
                    date: 1,
                    created: 1,
                  },
                },
              ],
              as: 'shoporderclones',
            },
          },
          {
            $unwind: '$shoporderclones',
          },
          {
            $project: {
              _id: '$shoporderclones._id',
              SName: '$shoporderclones.SName',
              mobile: '$shoporderclones.mobile',
              status: '$shoporderclones.status',
              productStatus: '$shoporderclones.productStatus',
              customerDeliveryStatus: '$shoporderclones.customerDeliveryStatus',
              delivery_type: '$shoporderclones.delivery_type',
              time_of_delivery: '$shoporderclones.time_of_delivery',
              paidamount: '$shoporderclones.paidamount',
              OrderId: '$shoporderclones.OrderId',
              date: '$shoporderclones.date',
              created: '$shoporderclones.created',
            },
          },
        ],
        as: 'groupOrders',
      },
    },
    {
      $lookup: {
        from: 'assigndrivehistories',
        localField: '_id',
        foreignField: 'groupID',
        pipeline: [
          {
            $lookup: {
              from: 'assigndrives',
              localField: 'assignGroupId',
              foreignField: '_id',
              pipeline: [{ $match: { status: { $ne: 'received' } } }],
              as: 'assigndrives',
            },
          },
          {
            $unwind: '$assigndrives',
          },
        ],
        as: 'assigndrivehistories',
      },
    },

    {
      $project: {
        shopOrderCloneId: '$wdfsaf._id',
        groupId: 1,
        totalOrders: { $size: '$dataDetails' },
        assignDate: 1,
        assignTime: 1,
        manageDeliveryStatus: 1,
        Pending: '$Pending.pending',
        deliveryExecutiveId: 1,
        deliveryExecutiveName: '$UserName.name',
        pettyCashAllocateStatus: 1,
        pettyStockAllocateStatus: 1,
        status: 1,
        groupOrders: '$groupOrders',
        pickputype: 1,
        assigndrivehistories: { $size: '$assigndrivehistories' },
      },
    },
    {
      $match: { assigndrivehistories: { $eq: 0 } },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await wardAdminGroup.aggregate([
    { $match: { $and: [statusMatch, macthStatus, { pickputype: { $eq: 'SP' } }] } },
    {
      $lookup: {
        from: 'orderassigns',
        localField: '_id',
        foreignField: 'wardAdminGroupID',
        pipeline: [
          {
            $lookup: {
              from: 'shoporderclones',
              localField: 'orderId',
              foreignField: '_id',
              pipeline: [
                {
                  $match: {
                    $and: [{ customerDeliveryStatus: { $eq: 'Pending' } }],
                  },
                },
                {
                  $group: {
                    _id: null,
                  },
                },
              ],
              as: 'shopdata',
            },
          },
          { $unwind: '$shopdata' },
          {
            $project: {
              pending: { $eq: ['$shopdata._id', null] },
              shopdata: '$shopdata.deliveryExecutiveId',
            },
          },
        ],
        as: 'dataDetails',
      },
    },
    { $addFields: { Pending: { $arrayElemAt: ['$dataDetails', 0] } } },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'deliveryExecutiveId',
        foreignField: '_id',
        as: 'UserName',
      },
    },
    {
      $unwind: '$UserName',
    },
    {
      $lookup: {
        from: 'assigndrivehistories',
        localField: '_id',
        foreignField: 'groupID',
        pipeline: [
          {
            $lookup: {
              from: 'assigndrives',
              localField: 'assignGroupId',
              foreignField: '_id',
              pipeline: [{ $match: { status: { $ne: 'received' } } }],
              as: 'assigndrives',
            },
          },
          {
            $unwind: '$assigndrives',
          },
        ],
        as: 'assigndrivehistories',
      },
    },
    {
      $project: {
        shopOrderCloneId: '$wdfsaf._id',
        groupId: 1,
        totalOrders: { $size: '$dataDetails' },
        assignDate: 1,
        assignTime: 1,
        manageDeliveryStatus: 1,
        Pending: '$Pending.pending',
        deliveryExecutiveId: 1,
        deliveryExecutiveName: '$UserName.name',
        pettyCashAllocateStatus: 1,
        pettyStockAllocateStatus: 1,
        status: 1,
        groupOrders: '$groupOrders',
        pickputype: 1,
        assigndrivehistories: { $size: '$assigndrivehistories' },
      },
    },
    {
      $match: { assigndrivehistories: { $eq: 0 } },
    },
  ]);
  return { values: values, total: total.length };
};

const assignOnly_SP = async (query, status) => {
  let page = query.page == null || query.page == '' ? 0 : query.page;
  //console.log(page);
  let macthStatus = { active: true };
  let statusMatch = { status: 'Packed' };
  if (status == 'stock') {
    macthStatus = { pettyStockAllocateStatus: 'Pending' };
  }
  if (status == 'cash') {
    macthStatus = { pettyCashAllocateStatus: 'Pending' };
  }
  if (status == 'delivery') {
    macthStatus = {
      // pettyCashAllocateStatus: { $ne: 'Pending' },
      // pettyStockAllocateStatus: { $ne: 'Pending' },
      manageDeliveryStatus: { $ne: 'Delivery Completed' },
    };
    statusMatch = { status: { $in: ['Assigned', 'Packed'] } };
  }
  //console.log(statusMatch);
  let values = await wardAdminGroup.aggregate([
    { $match: { $and: [statusMatch, macthStatus, { pickputype: { $eq: 'SP' } }] } },
    {
      $lookup: {
        from: 'orderassigns',
        localField: '_id',
        foreignField: 'wardAdminGroupID',
        pipeline: [
          {
            $lookup: {
              from: 'shoporderclones',
              localField: 'orderId',
              foreignField: '_id',
              pipeline: [
                {
                  $match: {
                    $and: [{ customerDeliveryStatus: { $eq: 'Pending' } }],
                  },
                },
                {
                  $group: {
                    _id: null,
                  },
                },
              ],
              as: 'shopdata',
            },
          },
          { $unwind: '$shopdata' },
          {
            $project: {
              pending: { $eq: ['$shopdata._id', null] },
              shopdata: '$shopdata.deliveryExecutiveId',
            },
          },
        ],
        as: 'dataDetails',
      },
    },
    { $addFields: { Pending: { $arrayElemAt: ['$dataDetails', 0] } } },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'deliveryExecutiveId',
        foreignField: '_id',
        as: 'UserName',
      },
    },
    {
      $unwind: '$UserName',
    },
    {
      $lookup: {
        from: 'orderassigns',
        localField: '_id',
        foreignField: 'wardAdminGroupID',
        pipeline: [
          {
            $lookup: {
              from: 'shoporderclones',
              localField: 'orderId',
              foreignField: '_id',
              pipeline: [
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
                    SName: '$b2bshopclones.SName',
                    mobile: '$b2bshopclones.mobile',
                    status: 1,
                    productStatus: 1,
                    customerDeliveryStatus: 1,
                    delivery_type: 1,
                    time_of_delivery: 1,
                    paidamount: 1,
                    OrderId: 1,
                    date: 1,
                    created: 1,
                  },
                },
              ],
              as: 'shoporderclones',
            },
          },
          {
            $unwind: '$shoporderclones',
          },
          {
            $project: {
              _id: '$shoporderclones._id',
              SName: '$shoporderclones.SName',
              mobile: '$shoporderclones.mobile',
              status: '$shoporderclones.status',
              productStatus: '$shoporderclones.productStatus',
              customerDeliveryStatus: '$shoporderclones.customerDeliveryStatus',
              delivery_type: '$shoporderclones.delivery_type',
              time_of_delivery: '$shoporderclones.time_of_delivery',
              paidamount: '$shoporderclones.paidamount',
              OrderId: '$shoporderclones.OrderId',
              date: '$shoporderclones.date',
              created: '$shoporderclones.created',
            },
          },
        ],
        as: 'groupOrders',
      },
    },
    {
      $project: {
        shopOrderCloneId: '$wdfsaf._id',
        groupId: 1,
        totalOrders: { $size: '$dataDetails' },
        assignDate: 1,
        assignTime: 1,
        manageDeliveryStatus: 1,
        Pending: '$Pending.pending',
        deliveryExecutiveId: 1,
        deliveryExecutiveName: '$UserName.name',
        pettyCashAllocateStatus: 1,
        pettyStockAllocateStatus: 1,
        status: 1,
        groupOrders: '$groupOrders',
        pickputype: 1,
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await wardAdminGroup.aggregate([
    { $match: { $and: [statusMatch, macthStatus, { pickputype: { $eq: 'SP' } }] } },
    {
      $lookup: {
        from: 'orderassigns',
        localField: '_id',
        foreignField: 'wardAdminGroupID',
        pipeline: [
          {
            $lookup: {
              from: 'shoporderclones',
              localField: 'orderId',
              foreignField: '_id',
              pipeline: [
                {
                  $match: {
                    $and: [{ customerDeliveryStatus: { $eq: 'Pending' } }],
                  },
                },
                {
                  $group: {
                    _id: null,
                  },
                },
              ],
              as: 'shopdata',
            },
          },
          { $unwind: '$shopdata' },
          {
            $project: {
              pending: { $eq: ['$shopdata._id', null] },
              shopdata: '$shopdata.deliveryExecutiveId',
            },
          },
        ],
        as: 'dataDetails',
      },
    },
    { $addFields: { Pending: { $arrayElemAt: ['$dataDetails', 0] } } },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'deliveryExecutiveId',
        foreignField: '_id',
        as: 'UserName',
      },
    },
    {
      $unwind: '$UserName',
    },
  ]);
  return { values: values, total: total.length };
};

const get_stock_roport_selfpickup = async (query) => {
  let id = query.id;
  //console.log(id);

  let values = await wardAdminGroup.aggregate([
    { $match: { $and: [{ _id: { $eq: id } }, { pickputype: { $eq: 'SP' } }] } },
    {
      $project: {
        _id: 1,
        pettyCashAllocateStatus: 1,
        pettyStockAllocateStatus: 1,
        AllocateStatus: 1,
        FinishingStatus: 1,
        deliveryExecutiveId: 1,
        pickputype: 1,
        groupId: 1,
        assignTime: 1,
        assignDate: 1,
        GroupBillId: 1,
        GroupBillDate: 1,
        GroupBillTime: 1,
        route: 1,
        pettyCash: 1,
      },
    },
  ]);
  if (values.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
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
              pipeline: [{ $match: { $and: [{ wardAdminGroupID: { $eq: id } }] } }],
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
        pipeline: [
          { $match: { $and: [{ wardAdminId: { $eq: id } }] } },
          // {
          //   $group: { _id: null, qty: { $sum: "$pettyStock" } }
          // }
        ],
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

  return {
    groupDetails: values[0],
    stock: products,
  };
};

const createArrayPettyCash = async (id, body) => {
  let values = wardAdminGroup.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, ' srfegfNot Found');
  }
  await wardAdminGroup.findByIdAndUpdate({ _id: id }, body, { new: true });
  // body.pettyCashDetails.forEach(async (e) => {
  //   await wardAdminGroup.findByIdAndUpdate({_id: e.pettyCashDetails}, { new: true });
  // })
  return values;
};

const storeReturn_images_toGroup = async (id, body) => {
  let groupe = await wardAdminGroup.findById(id);
  if (!groupe) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Group Not Found');
  }
  groupe = await wardAdminGroup.findByIdAndUpdate({ _id: id }, body, { new: true });
  return groupe;
};

const returnedCash = async (id, userid) => {
  let value = await wardAdminGroup.findById(id);
  value = await wardAdminGroup.findByIdAndUpdate(
    { _id: id },
    { manageDeliveryStatus: 'cashReturned', cashReturned: moment(), cashReturnedDE: userid },
    { new: true }
  );
  // value.Orderdatas.forEach(async (e) => {
  //   let shoporder = await ShopOrderClone.findOne({ _id: e._id });
  //   await ShopOrderClone.findByIdAndUpdate({ _id: e._id }, { status: 'cashReturned', returnedCash: moment() }, { new: true });
  //   shoporder.statusActionArray.push({ userid: userid, date: moment().toString(), status: 'cashReturned' });
  //   shoporder.save();
  // });
  return value;
};

const returnedStock = async (id, userid) => {
  let value = await wardAdminGroup.findById(id);
  value = await wardAdminGroup.findByIdAndUpdate(
    { _id: id },
    { manageDeliveryStatus: 'StockReturned', cashReturned: moment(), StockReturnedDE: userid },
    { new: true }
  );
  // value.Orderdatas.forEach(async (e) => {
  //   let shoporder = await ShopOrderClone.findOne({ _id: e._id });
  //   await ShopOrderClone.findByIdAndUpdate({ _id: e._id }, { status: 'cashReturned', returnedCash: moment() }, { new: true });
  //   shoporder.statusActionArray.push({ userid: userid, date: moment().toString(), status: 'cashReturned' });
  //   shoporder.save();
  // });
  return value;
};

const updateFine_Credit_status = async (id, body) => {
  let { status } = body;
  let values = await wardAdminGroup.findByIdAndUpdate({ _id: id }, { misMatchAmountStatus: status }, { new: true });
  return values;
};

const updateFine_Stock_status = async (id, body) => {
  let { status } = body;
  let values = await wardAdminGroup.findByIdAndUpdate({ _id: id }, { mismatchStockStatus: status }, { new: true });
  return values;
};

const misMatchProducts_by_group = async (id) => {
  let values = await ReturnStock_history.aggregate([
    {
      $match: {
        groupId: id,
      },
    },
    {
      $addFields: { dates: { $dateToString: { format: '%Y-%m-%d', date: '$created' } } },
    },
    {
      $lookup: {
        from: 'historypacktypes',
        let: { productid: '$productId', date: '$dates' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$productId', '$$productid'] }, { $eq: ['$date', '$$date'] }],
              },
            },
          },
        ],
        as: 'packtype',
      },
    },
    {
      $unwind: '$packtype',
    },
    {
      $project: {
        _id: 1,
        productId: 1,
        product: 1,
        actualStock: 1,
        wastageStock: 1,
        mismatch: 1,
        groupId: 1,
        fineStatus: { $ifNull: ['$fineStatus', 'Pending'] },
        dates: 1,
        salesprice: '$packtype.salesendPrice',
        packtypeId: '$packtype.packtypeId',
        totalPrice: { $multiply: ['$mismatch', '$packtype.salesendPrice'] },
      },
    },
    {
      $match: {
        totalPrice: { $gt: 0 },
      },
    },
  ]);
  return values;
};

const product_fine = async (body) => {
  const { productId, groupId, status } = body;
  let values = await ReturnStock_history.updateMany(
    { groupId: groupId, productId: productId },
    { $set: { fineStatus: status } }
  );
  if (values) {
    return { status: `${status} updated SucessFully` };
  }
};


const get_existing_group = async (body) => {
  let today = moment().format('YYYY-MM-DD');

  let values = await wardAdminGroup.aggregate([
    {
      $match: {
        $and: [
          { manageDeliveryStatus: { $ne: "returnedStock" } },
          { manageDeliveryStatus: { $ne: "cashReturned" } },
          { manageDeliveryStatus: { $ne: "Delivery Completed" } },
          { status: { $ne: "returnedStock" } },
          { assignDate: { $eq: today } }
        ]
      }
    },
    {
      $lookup: {
        from: 'orderassigns',
        localField: '_id',
        foreignField: 'wardAdminGroupID',
        pipeline: [
          {
            $lookup: {
              from: 'shoporderclones',
              localField: 'orderId',
              foreignField: '_id',
              pipeline: [
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
                    SName: '$b2bshopclones.SName',
                    Slat: '$b2bshopclones.Slat',
                    Slong: '$b2bshopclones.Slong',
                    status: 1,
                    productStatus: 1,
                    customerDeliveryStatus: 1,
                    delivery_type: 1,
                    time_of_delivery: 1,
                    paidamount: 1,
                    OrderId: 1,
                    date: 1,
                    created: 1,
                  },
                },
              ],
              as: 'shoporderclones',
            },
          },
          {
            $unwind: '$shoporderclones',
          },
          {
            $project: {
              _id: '$shoporderclones._id',
              SName: '$shoporderclones.SName',
              Slat: '$shoporderclones.Slat',
              Slong: '$shoporderclones.Slong',
              mobile: '$shoporderclones.mobile',
              status: '$shoporderclones.status',
              productStatus: '$shoporderclones.productStatus',
              customerDeliveryStatus: '$shoporderclones.customerDeliveryStatus',
              delivery_type: '$shoporderclones.delivery_type',
              time_of_delivery: '$shoporderclones.time_of_delivery',
              paidamount: '$shoporderclones.paidamount',
              OrderId: '$shoporderclones.OrderId',
              date: '$shoporderclones.date',
              created: '$shoporderclones.created',
            },
          },
        ],
        as: 'groupOrders',
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'deliveryExecutiveId',
        foreignField: '_id',
        as: 'b2bsersData',
      },
    },
    {
      $unwind: '$b2bsersData',
    },
    {
      $lookup: {
        from: 'vehicles',
        localField: 'vehicleId',
        foreignField: '_id',
        as: 'vehicles',
      },
    },
    {
      $unwind: {
        path: '$vehicles',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        groupId: 1,
        assignDate: 1,
        assignTime: 1,
        totalOrders: { $size: '$groupOrders' },
        orderassigns: '$groupOrders',
        deliveryExecutivename: '$b2bsersData.name',
        pettystockmodels: '$pettystockmodels',
        pettyCash: 1,
        pettyCashAllocateStatus: 1,
        pettyStockAllocateStatus: 1,
        status: 1,
        manageDeliveryStatus: 1,
        route: 1,
        vehicle_type: "$vehicles.vehicle_type",
        vehicle_Owner_Name: "$vehicles.vehicle_Owner_Name",
        ownerShip_Type: "$vehicles.ownerShip_Type",
        vehicleNo: "$vehicles.vehicleNo"
      },
    },
  ])

  return values;
}

const assign_to_return_orders = async (body) => {
  // let wardAdminGroupModel_issue
  let ward = await wardAdminGroup.findById(body.groupId)
  body.shops.forEach(async (e) => {
    let orders = await ShopOrderClone.aggregate([
      { $match: { $and: [{ issueStatus: { $eq: "Approved" } }, { shopId: { $eq: e._id } }] } },
    ]);
    orders.forEach(async (a) => {
      await ShopOrderClone.findByIdAndUpdate({ _id: a._id }, { issueAssign: "Assigned" }, { new: true });
      await wardAdminGroupModel_issue.create({ deliveryExecutiveId: ward.deliveryExecutiveId, orderId: a._id, wardAdminGroupID: body.groupId, created: moment(), date: moment().format('YYYY-MM-DD'), time: moment().format('HHmm') })
    })

  })
  return { message: "true" }

}



module.exports = {
  getPEttyCashQuantity,
  createGroup,
  // updateOrderStatus,
  getOrderFromGroupById,
  getPettyStock,
  // group Details
  getGroupdetails,
  // DELEIVERY DETAILS
  // getDeliveryDetails,
  getstatus,
  getBillDetails,
  assignOnly,
  orderPicked,
  getDeliveryOrderSeparate,
  updateManageStatus,
  groupIdClick,
  orderIdClickGetProduct,
  updateOrderStatus,
  getDetailsAfterDeliveryCompletion,
  getBillDetailsPerOrder,
  getReturnWDEtoWLE,
  // pettyStockSubmit,
  pettyStockSubmit,
  pettyCashSubmit,
  getPettyStockDetails,
  getdetailsAboutPettyStockByGroupId,
  uploadWastageImage,
  getpettyStockData,
  getPettyCashDetails,
  getAllGroup,
  updateShopOrderCloneById,
  pettyStockCreate,
  getcashAmountViewFromDB,

  createDatasInPettyStockModel,
  returnStock,
  // createProduct,

  lastPettyStckAdd,
  updateManageStatuscash,
  updateManageStatuscollected,
  updateManageStatuscashcollect,
  updateordercomplete,
  delevery_start,

  getShopDetailsForProj,
  submitCashGivenByWDE,
  createAddOrdINGrp,
  updateOrderStatus_forundelivey,

  finishingAccount,
  submitDispute,
  returnStockData,
  updatemismatchStockStatus,
  fineData,

  getOrderDataByPassing,

  deliveryExecutiveSorting,
  getGroupDetailsForDE,
  creditupdateDeliveryCompleted,
  scheduleshopdate,
  getGroupOrders_driver,
  assignOnly_DE,
  assignOnly_SP,
  get_stock_roport_selfpickup,
  createArrayPettyCash,
  storeReturn_images_toGroup,
  returnedCash,
  returnedStock,
  updateFine_Credit_status,
  misMatchProducts_by_group,
  updateFine_Stock_status,
  product_fine,

  get_existing_group,
  assign_to_return_orders
};
