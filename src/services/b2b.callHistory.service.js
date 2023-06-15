const httpStatus = require('http-status');
const callHistoryModel = require('../models/b2b.callHistory.model');
const ApiError = require('../utils/ApiError');
const { Shop } = require('../models/b2b.ShopClone.model');
const { Users } = require('../models/B2Busers.model');
const Role = require('../models/roles.model');
const moment = require('moment');
const { ShopOrder, ProductorderSchema, ShopOrderClone, ProductorderClone } = require('../models/shopOrder.model');

const createCallHistory = async (body) => {
  await Shop.findByIdAndUpdate({ _id: body.shopId }, { CallStatus: body.callStatus }, { new: true });
  let time = moment().format('HHmmss');
  let serverdate = moment().format('DD-MM-yyyy');
  let values = { ...body, ...{ sortTime: time, historydate: serverdate } };
  let callHistory = await callHistoryModel.create(values);
  return callHistory;
};

const createcallHistoryWithType = async (body, userId) => {
  let time = moment().format('HHmmss');
  let date = moment().format('yyyy-MM-DD');
  let servertime = moment().format('hh:mm a');
  let serverdate = moment().format('yyyy-MM-DD');

  const { callStatus, shopId, reason, type, lat, lang, lapsed } = body;
  let sort;
  if (callStatus == 'reschedule') {
    sort = 2;
  }
  if (callStatus == 'callback') {
    sort = 3;
  }
  if (callStatus == 'declined') {
    sort = 5;
  }
  if (callStatus == 'accept') {
    sort = 6;
  }

  let values = {
    ...body,
    ...{ userId: userId, date: serverdate, time: servertime, historytime: time },
  };
  let shopdata = await Shop.findOne({ _id: shopId });
  let currentdate = moment().format('DD-MM-yyyy');
  await Shop.findByIdAndUpdate(
    { _id: shopId },
    {
      sorttime: time,
      callingStatusSort: sort,
      // lapsedOrder: null,
    },
    { new: true }
  );
  if (callStatus == 'reschedule') {
    // let dateSlice = reason.slice(0, 10);
    await Shop.findByIdAndUpdate(
      { _id: shopId },
      {
        sortdate: reason,
        callingStatus: callStatus,
      },
      { new: true }
    );
    await ShopOrderClone.findOneAndUpdate({ _id: body.orderId }, { RE_order_status: callStatus }, { new: true });
  } else {
    if (callStatus != 'accept') {
      await Shop.findByIdAndUpdate({ _id: shopId }, { callingStatus: callStatus }, { new: true });
      if (body.orderId != null) {
        await ShopOrderClone.findOneAndUpdate({ _id: body.orderId }, { RE_order_status: callStatus }, { new: true });
      }
    }
  }

  let callHistory = await callHistoryModel.create(values);
  return callHistory;
};
const createcallHistoryWithTypelapsed = async (body, userId) => {
  let time = moment().format('HHmmss');
  let date = moment().format('yyyy-MM-DD');
  let servertime = moment().format('hh:mm a');
  let serverdate = moment().format('yyyy-MM-DD');

  const { callStatus, shopId, reason, type, lat, lang, orderId } = body;
  let sort;
  if (callStatus == 'reschedule') {
    sort = 2;
  }
  if (callStatus == 'callback') {
    sort = 3;
  }
  if (callStatus == 'declined') {
    sort = 5;
  }
  if (callStatus == 'accept') {
    sort = 6;
  }

  let values = {
    ...body,
    ...{
      userId: userId,
      date: serverdate,
      time: servertime,
      historytime: time,
      type: type,
      lat: lat,
      lang: lang,
      orderId: orderId,
    },
  };
  let shopdata = await Shop.findOne({ _id: shopId });
  let currentdate = moment().format('DD-MM-yyyy');
  await Shop.findByIdAndUpdate(
    { _id: shopId },
    {
      sorttime: time,
      callingStatusSort: sort,
    },
    { new: true }
  );
  if (callStatus == 'reschedule') {
    // let dateSlice = reason.slice(0, 10);
    await Shop.findByIdAndUpdate(
      { _id: shopId },
      {
        sortdate: reason,
        callingStatus: callStatus,
      },
      { new: true }
    );
  } else {
    if (callStatus != 'accept') {
      await Shop.findByIdAndUpdate({ _id: shopId }, { callingStatus: callStatus }, { new: true });
    }
  }
  let callHistory = await callHistoryModel.create(values);
  await ShopOrderClone.findByIdAndUpdate({ _id: orderId }, { callhistoryId: callHistory._id, callstatus: callStatus });
  return callHistory;
};

const getAll = async () => {
  return callHistoryModel.find();
};

const callingStatusreport = async (date) => {
  // let yesterday = moment(date, 'DD-MM-YYYY').add(-1, 'days').format('DD-MM-yyyy');
  // //console.log(yesterday);
  // let serverdate = date;
  // let acceptCount = await Shop.find({ callingStatus: 'accept', historydate: serverdate, lapsed: { $ne: true } }).count();
  // let callbackCount = await Shop.find({ callingStatus: 'callback', historydate: serverdate, lapsed: { $ne: true } }).count();
  // let rescheduleCount = await Shop.aggregate([
  //   {
  //     $match: {
  //       $and: [
  //         { sortdate: { $gte: moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD') } },
  //         { historydate: { $eq: date } },
  //         { callingStatus: { $eq: 'reschedule' } },
  //         { lapsed: { $ne: true } },
  //       ],
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: 'callhistories',
  //       localField: '_id',
  //       foreignField: 'shopId',
  //       pipeline: [
  //         {
  //           $sort: { date: -1, historytime: -1 },
  //         },
  //         { $limit: 10 },
  //       ],
  //       as: 'callhistories',
  //     },
  //   },
  //   {
  //     $group: {
  //       _id: null,
  //       count: {
  //         $sum: 1,
  //       },
  //     },
  //   },
  // ]);
  // let pendingCount = await Shop.aggregate([
  //   {
  //     $match: {
  //       $and: [{ historydate: { $ne: date } }],
  //     },
  //   },
  //   { $sort: { historydate: -1, sorttime: -1 } },
  //   {
  //     $lookup: {
  //       from: 'callhistories',
  //       localField: '_id',
  //       foreignField: 'shopId',
  //       pipeline: [
  //         {
  //           $sort: { date: -1, historytime: -1 },
  //         },
  //         { $limit: 10 },
  //       ],
  //       as: 'callhistories',
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: 'shoplists',
  //       localField: 'SType',
  //       foreignField: '_id',
  //       as: 'shoplists',
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: 'b2bshopclones',
  //       localField: '_id',
  //       foreignField: '_id',
  //       pipeline: [
  //         {
  //           $match: {
  //             callingStatus: 'reschedule',
  //             sortdate: { $gte: moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD') },
  //           },
  //         },
  //         { $group: { _id: null } },
  //       ],
  //       as: 'b2bshopclones',
  //     },
  //   },
  //   {
  //     $unwind: {
  //       path: '$b2bshopclones',
  //       preserveNullAndEmptyArrays: true,
  //     },
  //   },
  //   {
  //     $project: {
  //       _id: 1,
  //       photoCapture: 1,
  //       callingStatus: 1,
  //       callingStatusSort: 1,
  //       active: 1,
  //       archive: 1,
  //       Wardid: 1,
  //       type: 1,
  //       SName: 1,
  //       SType: 1,
  //       SOwner: 1,
  //       mobile: 1,
  //       Slat: 1,
  //       Strid: 1,
  //       sortdatetime: 1,
  //       Slong: 1,
  //       address: 1,
  //       date: 1,
  //       time: 1,
  //       created: 1,
  //       status: 1,
  //       Uid: 1,
  //       shopData: 1,
  //       shopData: '$callhistories',
  //       shoptypeName: '$shoplists',
  //       match: { $ne: ['$b2bshopclones._id', null] },
  //     },
  //   },
  //   {
  //     $match: { match: true },
  //   },
  //   {
  //     $group: {
  //       _id: null,
  //       count: {
  //         $sum: 1,
  //       },
  //     },
  //   },
  // ]);
  // let oncall = await Shop.find({ callingStatus: 'On Call' }).count();
  // let oldReschedule = await Shop.find({
  //   callingStatus: 'reschedule',
  //   historydate: { $ne: date },
  //   lapsed: { $ne: true },
  //   sortdate: { $gte: moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD') },
  // }).count();
  // // let Reschedule = await Shop.find({ callingStatus: 'reschedule', historydate: date }).count();
  // let declinedCount = await Shop.find({ callingStatus: 'declined', historydate: serverdate, lapsed: { $ne: true } }).count();
  // return {
  //   acceptCount: acceptCount,
  //   callbackCount: callbackCount,
  //   rescheduleCount: rescheduleCount.length != 0 ? rescheduleCount[0].count : 0,
  //   pendingCount: pendingCount.length != 0 ? pendingCount[0].count : 0,
  //   declinedCount: declinedCount,
  //   Oncall: oncall,
  //   oldReschedule: oldReschedule,
  // };
  return {
    success: true,
  };
};

const getById = async (id) => {
  //console.log('params Id', id);
  let historys = await Shop.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },

    {
      $lookup: {
        from: 'callhistories', //add table
        localField: '_id', //callhistory
        foreignField: 'shopId', //shopclone
        as: 'callhistory',
      },
    },
    {
      $lookup: {
        from: 'b2busers', //add table
        localField: 'callingUserId', //callhistory
        foreignField: '_id', //shopclone
        as: 'usersData',
      },
    },
    {
      $unwind: '$usersData',
    },
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        as: 'shopType',
      },
    },
    {
      $unwind: '$shopType',
    },
    {
      $project: {
        SName: 1,
        SOwner: 1,
        mobile: 1,
        Slat: 1,
        address: 1,
        userName: '$usersData.name',
        Slong: 1,
        date: 1,
        time: 1,
        shopName: '$shopType.shopList',
        callhistory: '$callhistory',
      },
    },
  ]);
  return historys;
};

// const getShop = async (date, status, key, page, userId, userRole) => {
//   let match;
//   ``;
//   if (status == 'null') {
//     match = [{ active: { $eq: true } }];
//   } else {
//     match = [{ callingStatus: { $in: [status] } }];
//   }
//   let keys = { active: { $eq: true } };
//   if (key != 'null') {
//     keys = { SName: { $regex: key, $options: 'i' } };
//   }
//   let values = await Shop.aggregate([
//     {
//       $match: {
//         $and: [keys],
//       },
//     },
//     {
//       $match: {
//         $and: match,
//       },
//     },
//     { $sort: { historydate: -1, sorttime: -1 } },
//     {
//       $match: {
//         callingStatus: { $nin: ['accept', 'declined'] },
//       },
//     },
//     {
//       $lookup: {
//         from: 'callhistories',
//         localField: '_id',
//         foreignField: 'shopId',
//         pipeline: [
//           {
//             $match: {
//               date: { $eq: date },
//             },
//           },
//         ],
//         as: 'shopData',
//       },
//     },
//     {
//       $lookup: {
//         from: 'b2bshopclones',
//         localField: 'shopData.shopId',
//         foreignField: '_id',
//         as: 'shopclones',
//       },
//     },
//     {
//       $lookup: {
//         from: 'shoplists',
//         localField: 'SType',
//         foreignField: '_id',
//         as: 'shoplists',
//       },
//     },
//     {
//       $unwind: '$shoplists',
//     },
//     {
//       $project: {
//         _id: 1,
//         _id: 1,
//         photoCapture: 1,
//         callingStatus: 1,
//         callingStatusSort: 1,
//         active: 1,
//         archive: 1,
//         Wardid: 1,
//         type: 1,
//         SName: 1,
//         SType: 1,
//         SOwner: 1,
//         mobile: 1,
//         Slat: 1,
//         Strid: 1,
//         sortdatetime: 1,
//         Slong: 1,
//         address: 1,
//         date: 1,
//         time: 1,
//         created: 1,
//         status: 1,
//         Uid: 1,
//         shopData: 1,
//         shopData: '$shopData',
//         shoptypeName: '$shoplists.shopList',
//         matching: { $and: [{ $eq: ['$callingUserId', userId] }, { $eq: ['$callingStatus', 'On Call'] }] },
//       },
//     },
//     { $skip: 10 * page },
//     { $limit: 10 },
//   ]);
//   let total = await Shop.aggregate([
//     {
//       $match: {
//         $and: [keys],
//       },
//     },
//     {
//       $match: {
//         $and: match,
//       },
//     },
//     { $sort: { historydate: -1, sorttime: -1 } },
//     {
//       $match: {
//         callingStatus: { $nin: ['accept', 'declined'] },
//       },
//     },
//     {
//       $lookup: {
//         from: 'callhistories',
//         localField: '_id',
//         foreignField: 'shopId',
//         pipeline: [
//           {
//             $match: {
//               date: { $eq: date },
//             },
//           },
//         ],
//         as: 'shopData',
//       },
//     },
//     {
//       $lookup: {
//         from: 'b2bshopclones',
//         localField: 'shopData.shopId',
//         foreignField: '_id',
//         as: 'shopclones',
//       },
//     },
//     {
//       $lookup: {
//         from: 'shoplists',
//         localField: 'SType',
//         foreignField: '_id',
//         as: 'shoplists',
//       },
//     },
//     {
//       $unwind: '$shoplists',
//     },
//   ]);
//   let role = await Role.findOne({ _id: userRole });
//   let user = await Users.findOne({ _id: userId });
//   return { values: values, total: total.length, RoleName: role.roleName, userName: user.name };
// };

const getShop_pending = async (date, status, key, page, userId, userRole) => {
  let keys = { active: { $eq: true } };
  if (key != 'null') {
    keys = {
      $or: [
        { SName: { $regex: key, $options: 'i' } },
        { mobile: { $regex: key, $options: 'i' } },
        { Pincode: { $regex: key, $options: 'i' } },
      ],
    };
  }
  let today = moment().format('yyyy-MM-DD');
  let yesterday = moment().subtract(1, 'days').format('yyyy-MM-DD');
  let threeDay = moment().subtract(2, 'days').format('yyyy-MM-DD');
  let faildstatusMatch = {
    $or: [
      {
        $and: [
          {
            finalStatus: {
              $eq:"reorder",
            },
          },
          {
            RE_order_status: { $ne: 'Re-Ordered' },
          },
          {
            RE_order_status: { $ne: 'declined' },
          },
        ],
      },
    ],
  };
  let values;
  values = await Shop.aggregate([
    {
      $match: {
        $and: [
          { historydate: { $ne: date } },
          { lapsed: { $ne: true } },
          keys,
          { Pincode: { $ne: null } },
          { Pincode: { $ne: '' } },
        ],
      },
    },
    { $sort: { historydate: -1, sorttime: -1 } },
    {
      $lookup: {
        from: 'callhistories',
        localField: '_id',
        foreignField: 'shopId',
        pipeline: [
          {
            $sort: { date: -1, historytime: -1 },
          },
          { $limit: 10 },
        ],
        as: 'callhistories',
      },
    },
    {
      $lookup: {
        from: 'callhistories',
        localField: '_id',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: { date: moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD') },
          },
          {
            $group: {
              _id: null,
              count: {
                $sum: 1,
              },
            },
          },
        ],
        as: 'callhistoriestoday',
      },
    },
    {
      $unwind: {
        path: '$callhistoriestoday',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        as: 'shoplists',
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: '_id',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              callingStatus: 'reschedule',
              sortdate: { $gte: moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD') },
            },
          },
          { $group: { _id: null } },
        ],
        as: 'b2bshopclones',
      },
    },
    {
      $unwind: {
        path: '$b2bshopclones',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'shoporderclones',
        localField: '_id',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: faildstatusMatch,
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
                { $unwind: '$products' },
                {
                  $project: {
                    _id: 1,
                    preOrderClose: 1,
                    // status: 1,
                    quantity: 1,
                    priceperkg: 1,
                    GST_Number: 1,
                    HSN_Code: 1,
                    packKg: 1,
                    unit: 1,
                    date: 1,
                    time: 1,
                    finalQuantity: 1,
                    finalPricePerKg: 1,
                    created: 1,
                    productTitle: '$products.productTitle',
                  },
                },
              ],
              as: 'product',
            },
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
              customerBilldate: 1,
              customerBilltime: 1,
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
              pay_type: 1,
              paymentMethod: 1,
              Uid: 1,
              OrderId: 1,
              customerBillId: 1,
              date: 1,
              time: 1,
              created: 1,
              timeslot: 1,
              statusUpdate: 1,
              WA_assigned_Time: 1,
              product: '$product',
            },
          },
        ],
        as: 'shoporderclones',
      },
    },
    {
      $lookup: {
        from: 'shoporderclones',
        localField: '_id',
        foreignField: 'shopId',
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
                    as: 'products',
                  },
                },
                {
                  $unwind: '$products',
                },
                {
                  $project: {
                    productTitle: '$products.productTitle',
                    finalQuantity: 1,
                    finalPricePerKg: 1,
                    _id: 1,
                  },
                },
              ],
              as: 'productorderclones',
            },
          },
          {
            $sort: { created: -1 },
          },
          { $limit: 5 },
        ],
        as: 'lastfiveorder',
      },
    },
    {
      $lookup: {
        from: 'shoporderclones',
        localField: '_id',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $eq: 'Delivered' } }, { statusOfBill: { $eq: 'Pending' } }],
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
            $project: {
              orderpayments: '$orderpayments.price',
              productData: '$productData.price',
              pendingAmount: { $round: { $subtract: ['$productData.price', '$orderpayments.price'] } },
            },
          },
          {
            $group: {
              _id: null,
              pendingAmount: { $sum: '$pendingAmount' },
            },
          },
        ],
        as: 'pending_amount',
      },
    },
    {
      $unwind: {
        path: '$pending_amount',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        photoCapture: 1,
        callingStatus: 1,
        callingStatusSort: 1,
        active: 1,
        archive: 1,
        Wardid: 1,
        type: 1,
        SName: 1,
        SType: 1,
        SOwner: 1,
        mobile: 1,
        Slat: 1,
        Strid: 1,
        sortdatetime: 1,
        Slong: 1,
        address: 1,
        date: 1,
        time: 1,
        historydate: 1,
        created: 1,
        status: 1,
        Uid: 1,
        shopData: 1,
        lapsed: 1,
        callhistoriestoday: '0',
        shopData: '$callhistories',
        shoptypeName: '$shoplists',
        match: { $ne: ['$b2bshopclones._id', null] },
        matching: { $and: [{ $eq: ['$callingUserId', userId] }, { $eq: ['$callingStatus', 'On Call'] }] },
        shoporderclones: '$shoporderclones',
        lapsedOrder: 1,
        lastfiveorder: '$lastfiveorder',
        pendingamount: '$pending_amount.pendingAmount',
      },
    },
    {
      $match: { match: true },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  // let total = await Shop.aggregate([
  //   {
  //     $match: {
  //       $and: [{ historydate: { $ne: date } }, { lapsed: { $ne: true } }, keys],
  //     },
  //   },
  //   { $sort: { historydate: -1, sorttime: -1 } },
  //   {
  //     $lookup: {
  //       from: 'callhistories',
  //       localField: '_id',
  //       foreignField: 'shopId',
  //       pipeline: [
  //         {
  //           $sort: { date: -1, historytime: -1 },
  //         },
  //         { $limit: 10 },
  //       ],
  //       as: 'callhistories',
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: 'shoplists',
  //       localField: 'SType',
  //       foreignField: '_id',
  //       as: 'shoplists',
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: 'b2bshopclones',
  //       localField: '_id',
  //       foreignField: '_id',
  //       pipeline: [
  //         {
  //           $match: {
  //             callingStatus: 'reschedule',
  //             sortdate: { $gte: moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD') },
  //           },
  //         },
  //         { $group: { _id: null } },
  //       ],
  //       as: 'b2bshopclones',
  //     },
  //   },
  //   {
  //     $unwind: {
  //       path: '$b2bshopclones',
  //       preserveNullAndEmptyArrays: true,
  //     },
  //   },
  //   {
  //     $project: {
  //       _id: 1,
  //       photoCapture: 1,
  //       callingStatus: 1,
  //       callingStatusSort: 1,
  //       active: 1,
  //       archive: 1,
  //       Wardid: 1,
  //       type: 1,
  //       SName: 1,
  //       SType: 1,
  //       SOwner: 1,
  //       mobile: 1,
  //       Slat: 1,
  //       Strid: 1,
  //       sortdatetime: 1,
  //       Slong: 1,
  //       address: 1,
  //       date: 1,
  //       historydate: 1,
  //       time: 1,
  //       created: 1,
  //       status: 1,
  //       Uid: 1,
  //       shopData: 1,
  //       shopData: '$callhistories',
  //       shoptypeName: '$shoplists',
  //       match: { $ne: ['$b2bshopclones._id', null] },
  //     },
  //   },
  //   {
  //     $match: { match: true },
  //   },
  //   // {
  //   //   $group: {
  //   //     _id: null,
  //   //     count: {
  //   //       $sum: 1,
  //   //     },
  //   //   },
  //   // },
  //   {
  //     $count: 'passing_scores',
  //   },
  // ]);
  // //console.log(total);
  let role = await Role.findOne({ _id: userRole });
  let user = await Users.findOne({ _id: userId });
  return {
    values: values,
    // total: total.length != 0 ? total[0].passing_scores : 0,
    RoleName: role.roleName,
    userName: user.name,
  };
};
const getShop_oncall = async (date, status, key, page, userId, userRole) => {
  //console.log(status);
  let keys = { active: { $eq: true } };
  if (key != 'null') {
    keys = {
      $or: [
        { SName: { $regex: key, $options: 'i' } },
        { mobile: { $regex: key, $options: 'i' } },
        { Pincode: { $regex: key, $options: 'i' } },
      ],
    };
  }
  let today = moment().format('yyyy-MM-DD');
  let yesterday = moment().subtract(1, 'days').format('yyyy-MM-DD');
  let threeDay = moment().subtract(2, 'days').format('yyyy-MM-DD');
  let faildstatusMatch = {
    $and: [
      {
        finalStatus: {
          $eq:"reorder",
        },
      },
      {
        RE_order_status: { $ne: 'Re-Ordered' },
      },
      {
        RE_order_status: { $ne: 'declined' },
      },
    ],
  };
  let values;
  values = await Shop.aggregate([
    {
      $match: {
        $and: [keys, { callingStatus: { $eq: status } }, { Pincode: { $ne: null } }, { Pincode: { $ne: '' } }],
      },
    },

    { $sort: { historydate: -1, sorttime: -1 } },
    {
      $lookup: {
        from: 'callhistories',
        localField: '_id',
        foreignField: 'shopId',
        pipeline: [
          {
            $sort: { date: -1, historytime: -1 },
          },
          { $limit: 10 },
        ],
        as: 'callhistories',
      },
    },
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        as: 'shoplists',
      },
    },
    {
      $lookup: {
        from: 'callhistories',
        localField: '_id',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: { date: moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD') },
          },
          {
            $group: {
              _id: null,
              count: {
                $sum: 1,
              },
            },
          },
        ],
        as: 'callhistoriestoday',
      },
    },
    {
      $unwind: {
        path: '$callhistoriestoday',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'shoporderclones',
        localField: 'lapsedOrder',
        foreignField: '_id',
        pipeline: [
          {
            $match: faildstatusMatch,
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
                { $unwind: '$products' },
                {
                  $project: {
                    _id: 1,
                    preOrderClose: 1,
                    // status: 1,
                    quantity: 1,
                    priceperkg: 1,
                    GST_Number: 1,
                    HSN_Code: 1,
                    packKg: 1,
                    unit: 1,
                    date: 1,
                    time: 1,
                    finalQuantity: 1,
                    finalPricePerKg: 1,
                    created: 1,
                    productTitle: '$products.productTitle',
                  },
                },
              ],
              as: 'product',
            },
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
              customerBilldate: 1,
              customerBilltime: 1,
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
              pay_type: 1,
              paymentMethod: 1,
              Uid: 1,
              OrderId: 1,
              customerBillId: 1,
              date: 1,
              time: 1,
              created: 1,
              timeslot: 1,
              statusUpdate: 1,
              WA_assigned_Time: 1,
              product: '$product',
            },
          },
        ],
        as: 'shoporderclones',
      },
    },
    {
      $lookup: {
        from: 'shoporderclones',
        localField: '_id',
        foreignField: 'shopId',
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
                    as: 'products',
                  },
                },
                {
                  $unwind: '$products',
                },
                {
                  $project: {
                    productTitle: '$products.productTitle',
                    finalQuantity: 1,
                    finalPricePerKg: 1,
                    _id: 1,
                  },
                },
              ],
              as: 'productorderclones',
            },
          },
          {
            $sort: { created: -1 },
          },
          { $limit: 5 },
        ],
        as: 'lastfiveorder',
      },
    },
    {
      $lookup: {
        from: 'shoporderclones',
        localField: '_id',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $eq: 'Delivered' } }, { statusOfBill: { $eq: 'Pending' } }],
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
            $project: {
              orderpayments: '$orderpayments.price',
              productData: '$productData.price',
              pendingAmount: { $round: { $subtract: ['$productData.price', '$orderpayments.price'] } },
            },
          },
          {
            $group: {
              _id: null,
              pendingAmount: { $sum: '$pendingAmount' },
            },
          },
        ],
        as: 'pending_amount',
      },
    },
    {
      $unwind: {
        path: '$pending_amount',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        photoCapture: 1,
        callingStatus: 1,
        callingStatusSort: 1,
        active: 1,
        archive: 1,
        Wardid: 1,
        type: 1,
        SName: 1,
        historydate: 1,
        SType: 1,
        SOwner: 1,
        mobile: 1,
        Slat: 1,
        Strid: 1,
        sortdatetime: 1,
        Slong: 1,
        address: 1,
        date: 1,
        time: 1,
        created: 1,
        status: 1,
        lapsed: 1,
        Uid: 1,
        shopData: 1,
        shopData: '$callhistories',
        callhistoriestoday: '$callhistoriestoday.count',
        shoptypeName: '$shoplists',
        matching: { $and: [{ $eq: ['$callingUserId', userId] }, { $eq: ['$callingStatus', 'On Call'] }] },
        shoporderclones: '$shoporderclones',
        lapsedOrder: 1,
        lastfiveorder: '$lastfiveorder',
        pendingamount: '$pending_amount.pendingAmount',
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  // let total = await Shop.aggregate([
  //   {
  //     $match: {
  //       $and: [keys, { callingStatus: { $eq: status } }],
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: 'callhistories',
  //       localField: '_id',
  //       foreignField: 'shopId',
  //       pipeline: [
  //         {
  //           $sort: { date: -1, historytime: -1 },
  //         },
  //         { $limit: 10 },
  //       ],
  //       as: 'callhistories',
  //     },
  //   },
  //   {
  //     $count: 'passing_scores',
  //   },
  // ]);

  let role = await Role.findOne({ _id: userRole });
  let user = await Users.findOne({ _id: userId });
  return {
    values: values,
    // total: total.length != 0 ? total[0].passing_scores : 0,
    RoleName: role.roleName,
    userName: user.name,
  };
};

const getShop_callback = async (date, status, key, page, userId, userRole) => {
  let keys = { active: { $eq: true } };
  if (key != 'null') {
    keys = {
      $or: [
        { SName: { $regex: key, $options: 'i' } },
        { mobile: { $regex: key, $options: 'i' } },
        { Pincode: { $regex: key, $options: 'i' } },
      ],
    };
  }
  let today = moment().format('yyyy-MM-DD');
  let yesterday = moment().subtract(1, 'days').format('yyyy-MM-DD');
  let threeDay = moment().subtract(2, 'days').format('yyyy-MM-DD');
  let faildstatusMatch = {
    $and: [
      {
        finalStatus: {
          $eq:"reorder",
        },
      },
      {
        RE_order_status: { $ne: 'Re-Ordered' },
      },
      {
        RE_order_status: { $ne: 'declined' },
      },
    ],
  };
  let values;
  values = await Shop.aggregate([
    {
      $match: {
        $and: [
          { historydate: { $eq: date } },
          keys,
          { callingStatus: { $eq: status } },
          { lapsed: { $ne: true } },
          { Pincode: { $ne: null } },
          { Pincode: { $ne: '' } },
        ],
      },
    },
    { $sort: { historydate: -1, sorttime: -1 } },
    {
      $lookup: {
        from: 'callhistories',
        localField: '_id',
        foreignField: 'shopId',
        pipeline: [
          {
            $sort: { date: -1, historytime: -1 },
          },
          { $limit: 10 },
        ],
        as: 'callhistories',
      },
    },
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        as: 'shoplists',
      },
    },
    {
      $lookup: {
        from: 'callhistories',
        localField: '_id',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: { date: moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD') },
          },
          {
            $group: {
              _id: null,
              count: {
                $sum: 1,
              },
            },
          },
        ],
        as: 'callhistoriestoday',
      },
    },
    {
      $unwind: {
        path: '$callhistoriestoday',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'shoporderclones',
        localField: '_id',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: faildstatusMatch,
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
                { $unwind: '$products' },
                {
                  $project: {
                    _id: 1,
                    preOrderClose: 1,
                    // status: 1,
                    quantity: 1,
                    priceperkg: 1,
                    GST_Number: 1,
                    HSN_Code: 1,
                    packKg: 1,
                    unit: 1,
                    date: 1,
                    time: 1,
                    finalQuantity: 1,
                    finalPricePerKg: 1,
                    created: 1,
                    productTitle: '$products.productTitle',
                  },
                },
              ],
              as: 'product',
            },
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
              customerBilldate: 1,
              customerBilltime: 1,
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
              pay_type: 1,
              paymentMethod: 1,
              Uid: 1,
              OrderId: 1,
              customerBillId: 1,
              date: 1,
              time: 1,
              created: 1,
              timeslot: 1,
              statusUpdate: 1,
              WA_assigned_Time: 1,
              product: '$product',
            },
          },
        ],
        as: 'shoporderclones',
      },
    },
    {
      $lookup: {
        from: 'shoporderclones',
        localField: '_id',
        foreignField: 'shopId',
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
                    as: 'products',
                  },
                },
                {
                  $unwind: '$products',
                },
                {
                  $project: {
                    productTitle: '$products.productTitle',
                    finalQuantity: 1,
                    finalPricePerKg: 1,
                    _id: 1,
                  },
                },
              ],
              as: 'productorderclones',
            },
          },
          {
            $sort: { created: -1 },
          },
          { $limit: 5 },
        ],
        as: 'lastfiveorder',
      },
    },
    {
      $lookup: {
        from: 'shoporderclones',
        localField: '_id',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $eq: 'Delivered' } }, { statusOfBill: { $eq: 'Pending' } }],
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
            $project: {
              orderpayments: '$orderpayments.price',
              productData: '$productData.price',
              pendingAmount: { $round: { $subtract: ['$productData.price', '$orderpayments.price'] } },
            },
          },
          {
            $group: {
              _id: null,
              pendingAmount: { $sum: '$pendingAmount' },
            },
          },
        ],
        as: 'pending_amount',
      },
    },
    {
      $unwind: {
        path: '$pending_amount',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        photoCapture: 1,
        callingStatus: 1,
        callingStatusSort: 1,
        active: 1,
        archive: 1,
        Wardid: 1,
        type: 1,
        SName: 1,
        SType: 1,
        SOwner: 1,
        mobile: 1,
        Slat: 1,
        Strid: 1,
        sortdatetime: 1,
        Slong: 1,
        address: 1,
        historydate: 1,
        date: 1,
        time: 1,
        created: 1,
        status: 1,
        Uid: 1,
        shopData: 1,
        lapsed: 1,
        shopData: '$callhistories',
        callhistoriestoday: '$callhistoriestoday.count',
        shoptypeName: '$shoplists',
        matching: { $and: [{ $eq: ['$callingUserId', userId] }, { $eq: ['$callingStatus', 'On Call'] }] },
        shoporderclones: '$shoporderclones',
        lapsedOrder: 1,
        lastfiveorder: '$lastfiveorder',
        pendingamount: '$pending_amount.pendingAmount',
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  // let total = await Shop.aggregate([
  //   {
  //     $match: {
  //       $and: [{ historydate: { $eq: date } }, { callingStatus: { $eq: status } }, { lapsed: { $ne: true } }],
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: 'callhistories',
  //       localField: '_id',
  //       foreignField: 'shopId',
  //       pipeline: [
  //         {
  //           $sort: { date: -1, historytime: -1 },
  //         },
  //         { $limit: 10 },
  //       ],
  //       as: 'callhistories',
  //     },
  //   },
  //   {
  //     $count: 'passing_scores',
  //   },
  // ]);
  // //console.log(total);
  let role = await Role.findOne({ _id: userRole });
  let user = await Users.findOne({ _id: userId });
  return {
    values: values,
    // total: total.length != 0 ? total[0].passing_scores : 0,
    RoleName: role.roleName,
    userName: user.name,
  };
};

const getShop_reshedule = async (date, status, key, page, userId, userRole) => {
  let keys = { active: { $eq: true } };
  if (key != 'null') {
    keys = {
      $or: [
        { SName: { $regex: key, $options: 'i' } },
        { mobile: { $regex: key, $options: 'i' } },
        { Pincode: { $regex: key, $options: 'i' } },
      ],
    };
  }
  let today = moment().format('yyyy-MM-DD');
  let yesterday = moment().subtract(1, 'days').format('yyyy-MM-DD');
  let threeDay = moment().subtract(2, 'days').format('yyyy-MM-DD');
  let faildstatusMatch = {
    $or: [
      {
        $and: [
          {
            finalStatus: {
              $eq:"reorder",
            },
          },
          {
            RE_order_status: { $ne: 'Re-Ordered' },
          },
          {
            RE_order_status: { $ne: 'declined' },
          },
        ],
      },
    ],
  };
  let values;
  values = await Shop.aggregate([
    {
      $match: {
        $and: [
          { sortdate: { $gte: moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD') } },
          keys,
          { callingStatus: { $eq: status } },
          { Pincode: { $ne: null } },
          { Pincode: { $ne: '' } },
        ],
      },
    },
    { $sort: { historydate: -1, sorttime: -1 } },
    {
      $lookup: {
        from: 'callhistories',
        localField: '_id',
        foreignField: 'shopId',
        pipeline: [
          {
            $sort: { date: -1, historytime: -1 },
          },
          { $limit: 10 },
        ],
        as: 'callhistories',
      },
    },
    {
      $lookup: {
        from: 'callhistories',
        localField: '_id',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: { date: moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD') },
          },
          {
            $group: {
              _id: null,
              count: {
                $sum: 1,
              },
            },
          },
        ],
        as: 'callhistoriestoday',
      },
    },
    {
      $unwind: {
        path: '$callhistoriestoday',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        as: 'shoplists',
      },
    },
    {
      $lookup: {
        from: 'shoporderclones',
        localField: 'lapsedOrder',
        foreignField: '_id',
        pipeline: [
          {
            $match: faildstatusMatch,
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
                { $unwind: '$products' },
                {
                  $project: {
                    _id: 1,
                    preOrderClose: 1,
                    // status: 1,
                    quantity: 1,
                    priceperkg: 1,
                    GST_Number: 1,
                    HSN_Code: 1,
                    packKg: 1,
                    unit: 1,
                    date: 1,
                    time: 1,
                    finalQuantity: 1,
                    finalPricePerKg: 1,
                    created: 1,
                    productTitle: '$products.productTitle',
                  },
                },
              ],
              as: 'product',
            },
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
              customerBilldate: 1,
              customerBilltime: 1,
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
              pay_type: 1,
              paymentMethod: 1,
              Uid: 1,
              OrderId: 1,
              customerBillId: 1,
              date: 1,
              time: 1,
              created: 1,
              timeslot: 1,
              statusUpdate: 1,
              WA_assigned_Time: 1,
              product: '$product',
            },
          },
        ],
        as: 'shoporderclones',
      },
    },
    {
      $lookup: {
        from: 'shoporderclones',
        localField: '_id',
        foreignField: 'shopId',
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
                    as: 'products',
                  },
                },
                {
                  $unwind: '$products',
                },
                {
                  $project: {
                    productTitle: '$products.productTitle',
                    finalQuantity: 1,
                    finalPricePerKg: 1,
                    _id: 1,
                  },
                },
              ],
              as: 'productorderclones',
            },
          },
          {
            $sort: { created: -1 },
          },
          { $limit: 5 },
        ],
        as: 'lastfiveorder',
      },
    },
    {
      $lookup: {
        from: 'shoporderclones',
        localField: '_id',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $eq: 'Delivered' } }, { statusOfBill: { $eq: 'Pending' } }],
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
            $project: {
              orderpayments: '$orderpayments.price',
              productData: '$productData.price',
              pendingAmount: { $round: { $subtract: ['$productData.price', '$orderpayments.price'] } },
            },
          },
          {
            $group: {
              _id: null,
              pendingAmount: { $sum: '$pendingAmount' },
            },
          },
        ],
        as: 'pending_amount',
      },
    },
    {
      $unwind: {
        path: '$pending_amount',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        photoCapture: 1,
        callingStatus: 1,
        callingStatusSort: 1,
        active: 1,
        archive: 1,
        Wardid: 1,
        type: 1,
        SName: 1,
        SType: 1,
        SOwner: 1,
        mobile: 1,
        Slat: 1,
        Strid: 1,
        sortdatetime: 1,
        Slong: 1,
        address: 1,
        date: 1,
        historydate: 1,
        time: 1,
        created: 1,
        status: 1,
        Uid: 1,
        shopData: 1,
        lapsed: 1,
        shopData: '$callhistories',
        callhistoriestoday: '$callhistoriestoday.count',
        shoptypeName: '$shoplists',
        matching: { $and: [{ $eq: ['$callingUserId', userId] }, { $eq: ['$callingStatus', 'On Call'] }] },
        shoporderclones: '$shoporderclones',
        lapsedOrder: 1,
        lastfiveorder: '$lastfiveorder',
        pendingamount: '$pending_amount.pendingAmount',
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  // let total = await Shop.aggregate([
  //   {
  //     $match: {
  //       $and: [
  //         { sortdate: { $gte: moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD') } },
  //         keys,
  //         { lapsed: { $ne: true } },
  //         { callingStatus: { $eq: status } },
  //       ],
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: 'callhistories',
  //       localField: '_id',
  //       foreignField: 'shopId',
  //       pipeline: [
  //         {
  //           $sort: { date: -1, historytime: -1 },
  //         },
  //         { $limit: 10 },
  //       ],
  //       as: 'callhistories',
  //     },
  //   },
  //   {
  //     $count: 'passing_scores',
  //   },
  // ]);

  let role = await Role.findOne({ _id: userRole });
  let user = await Users.findOne({ _id: userId });
  return {
    values: values,
    // total: total.length != 0 ? total[0].passing_scores : 0,
    RoleName: role.roleName,
    userName: user.name,
  };
};

const updateCallingStatus = async (id, updatebody) => {
  let shops = await Shop.findById(id);
  if (!shops) {
    throw new ApiError(httpStatus.NOT_FOUND, 'shop not found');
  }
  shops = await Shop.findByIdAndUpdate({ _id: id }, updatebody, { new: true });
  return shops;
};

const updateStatuscall = async (id, body, userId, date) => {
  let status = await Shop.findById(id);
  if (!status) {
    throw new ApiError(httpStatus.NOT_FOUND, 'status not found');
  }
  if (status.callingStatus == 'On Call') {
    throw new ApiError(httpStatus.NOT_FOUND, 'OnCall');
  }
  let { orderId } = body;
  if (orderId == null) {
    status = await Shop.findByIdAndUpdate(
      { _id: id },
      { callingStatus: 'On Call', callingUserId: userId, historydate: date, sortdate: '' },
      { new: true }
    );
  } else {
    status = await Shop.findByIdAndUpdate(
      { _id: id },
      { callingStatus: 'On Call', lapsedOrder: orderId, callingUserId: userId, historydate: date, sortdate: '' },
      { new: true }
    );
    await ShopOrderClone.findByIdAndUpdate(
      { _id: orderId },
      { RE_order_status: 'On Call', Re_order_userId: userId },
      { new: true }
    );
  }

  return status;
};
const updateStatuscalllapsed = async (id, orderId, body, userId, date) => {
  let status = await Shop.findById(id);
  if (!status) {
    throw new ApiError(httpStatus.NOT_FOUND, 'status not found');
  }
  if (status.callingStatus == 'On Call') {
    throw new ApiError(httpStatus.NOT_FOUND, 'OnCall');
  }
  let { lapsed } = body;
  status = await Shop.findByIdAndUpdate(
    { _id: id },
    { callingStatus: 'On Call', lapsed: lapsed, callingUserId: userId, historydate: date, sortdate: '' },
    { new: true }
  );
  await ShopOrderClone.findByIdAndUpdate({ _id: orderId }, { callstatus: 'On Call' });
  return status;
};

const updateStatusLapsed = async (id, body, userId, date) => {
  let status = await Shop.findById(id);
  if (!status) {
    throw new ApiError(httpStatus.NOT_FOUND, 'status not found');
  }
  if (status.callingStatus == 'On Call') {
    throw new ApiError(httpStatus.NOT_FOUND, 'OnCall');
  }
  let { lapsed } = body;
  status = await Shop.findByIdAndUpdate(
    { _id: id },
    { callingStatus: 'On Lapsed', callingUserId: userId, historydate: date, sortdate: '' },
    { new: true }
  );
  return status;
};

const updateOrderStatus = async (id) => {
  let orderedStatus = await callHistoryModel.findById(id);
  if (!orderedStatus) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OrderStatus not found');
  }
  orderedStatus = await callHistoryModel.findByIdAndUpdate({ _id: id }, { status: 'ordered' }, { new: true });
};

const createShopByOwner = async (body) => {
  let values = await Shop.create(body);
  return values;
};

const getOncallfromshops = async (userId) => {
  let values = await Shop.find({ callingUserId: userId, callingStatus: 'On Call' });
  //console.log(values);
  if (values.length != 0) {
    return { OnCallstatus: false };
  } else {
    return { OnCallstatus: true };
  }
};

const updateStatuscallVisit = async (id, userId, updateBody) => {
  let status = await Shop.findById(id);
  if (!status) {
    throw new ApiError(httpStatus.NOT_FOUND, 'shop not found');
  }
  if (status.callingStatus == 'visit') {
    throw new ApiError(httpStatus.NOT_FOUND, 'Already visit');
  }
  status = await Shop.findByIdAndUpdate(
    { _id: id },
    { callingStatus: 'visit', callingUserId: userId, callingStatusSort: 7 },
    { new: true }
  );
  return status;
};

const checkvisitOncallStatus = async (id) => {
  let values = await Shop.findById(id);
  if (values.callingStatus == 'On Call') {
    return { visit: false };
  }
  if (values.callingStatus == 'visit') {
    return { visit: true };
  }
  return values;
};

const getcallHistorylastFivedays = async (id) => {
  let shops = await Shop.findById(id);
  let values = await callHistoryModel.aggregate([
    {
      $match: {
        $and: [{ shopId: { $eq: id } }],
      },
    },
    {
      $sort: { date: -1, historytime: -1 },
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
        from: 'b2busers',
        localField: 'userId',
        foreignField: '_id',
        as: 'data',
      },
    },
    {
      $unwind: '$data',
    },

    {
      $limit: 10,
    },
    {
      $project: {
        _id: 1,
        active: 1,
        archive: 1,
        status: 1,
        noOfCalls: 1,
        shopId: 1,
        selectStatus: 1,
        date: 1,
        time: 1,
        historytime: 1,
        reason: 1,
        callStatus: 1,
        userName: '$data.name',
        userContact: '$data.phoneNumber',
        shopName: '$shops.SName',
        callingStatus: '$shops.callingStatus',
      },
    },
  ]);
  return { values: values, shops: shops.SName };
};
const getshopsOrderWise = async (status) => {
  let serverdate = moment().format('DD-MM-yyyy');
  let pending = await Shop.find({ callingStatus: 'Pending' });
  let accept = await Shop.find({ callingStatus: 'accept' });
  let reschedule = await Shop.find({ callingStatus: 'reshedule' });
  let callback = await Shop.find({ callingStatus: 'callback' });
  let declined = await Shop.find({ callingStatus: 'declined' });
  let oncall = await Shop.find({ callingStatus: 'On Call' });
  let visit = await Shop.find({ callingStatus: 'visit' });

  if (status == 'Pending') {
    return pending;
  }
  if (status == 'accept') {
    return accept;
  }
  if (status == 'reshedule') {
    return reschedule;
  }
  if (status == 'callback') {
    return callback;
  }
  if (status == 'declined') {
    return declined;
  }
  if (status == 'On Call') {
    return oncall;
  }
  if (status == 'visit') {
    return visit;
  }
};

const getacceptDeclined = async (status, date, key, page, userId, userRole) => {
  let match;
  if (status == 'null') {
    match = [{ active: { $eq: true } }];
  } else {
    match = [{ callingStatus: { $in: [status] } }];
  }
  let keys = { active: { $eq: true } };
  if (key != 'null') {
    keys = { SName: { $regex: key, $options: 'i' } };
  }
  let values = await Shop.aggregate([
    {
      $match: {
        $and: [keys],
      },
    },
    {
      $match: {
        $and: match,
      },
    },
    { $sort: { historydate: -1, sorttime: -1 } },
    {
      $lookup: {
        from: 'callhistories',
        localField: '_id',
        foreignField: 'shopId',
        pipeline: [
          { $sort: { historytime: -1 } },
          {
            $match: {
              date: { $eq: date },
            },
          },
        ],
        as: 'shopData',
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopData.shopId',
        foreignField: '_id',
        as: 'shopclones',
      },
    },
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
        _id: 1,
        photoCapture: 1,
        callingStatus: 1,
        callingStatusSort: 1,
        active: 1,
        archive: 1,
        Wardid: 1,
        type: 1,
        SName: 1,
        SType: 1,
        SOwner: 1,
        mobile: 1,
        Slat: 1,
        Strid: 1,
        sortdatetime: 1,
        historydate: 1,
        Slong: 1,
        address: 1,
        date: 1,
        sorttime: 1,
        time: 1,
        created: 1,
        status: 1,
        Uid: 1,
        shopData: 1,
        filterDate: 1,
        sortdate: 1,
        shopData: '$shopData',
        shoptypeName: '$shoplists.shopList',
        matching: { $and: [{ $eq: ['$callingUserId', userId] }, { $eq: ['$callingStatus', 'On Call'] }] },
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);

  let total = await Shop.aggregate([
    {
      $match: {
        $and: [keys],
      },
    },
    {
      $match: {
        $and: match,
      },
    },
    { $sort: { historydate: -1, sorttime: -1 } },
    {
      $lookup: {
        from: 'callhistories',
        localField: '_id',
        foreignField: 'shopId',
        pipeline: [
          { $sort: { historytime: -1 } },
          {
            $match: {
              date: { $eq: date },
            },
          },
        ],
        as: 'shopData',
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopData.shopId',
        foreignField: '_id',
        as: 'shopclones',
      },
    },
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
  ]);
  let role = await Role.findOne({ _id: userRole });
  let user = await Users.findOne({ _id: userId });
  return { values: values, total: total.length, RoleName: role.roleName, userName: user.name };
};

const resethistory = async () => {
  let currentDate = moment().format('DD-MM-yyyy');
  let yersterday = moment().subtract(1, 'days').format('DD-MM-yyyy');
  //console.log(yersterday);
  let today = '';
  today = currentDate;
  await Shop.updateMany(
    { sortdate: { $eq: yersterday } },
    { $set: { callingStatus: 'Pending', callingStatusSort: 0, sortdate: today } }
  );
  return { dayfresh: 'Reset Successfully' };
};

const previouscallBackAnd_Reshedule = async () => {
  let currentDate = moment().format('DD-MM-yyyy');
  let callback = await Shop.find({ callingStatus: 'callback', date: { $ne: currentDate } });
  let reschedule = await Shop.find({ callingStatus: 'reshedule', date: { $ne: currentDate } });
  return { callback: callback, reschedule: reschedule };
};

const getOncallShops = async () => {
  let oncall = await Shop.find({ callingStatus: 'On Call' });
  return oncall;
};

const oncallstatusByUser = async (userId) => {
  let oncall = await Shop.find({ callingStatus: 'On Call', callingUserId: userId });
  if (oncall.length == 0) {
    return { status: true };
  } else {
    return { status: false };
  }
};

const call_visit_Count = async (userId) => {
  let currentDate = moment().format('YYYY-MM-DD');
  let visit_Count = await callHistoryModel
    .find({ userId: userId, date: currentDate, type: 'call', status: 'ordered' })
    .count();
  let call_Count = await callHistoryModel
    .find({ userId: userId, date: currentDate, type: 'visit', status: 'ordered' })
    .count();
  return { visitCount: call_Count, callCount: visit_Count };
};

const BillHistoryByShopId_date = async (shopId, date) => {
  let values = await callHistoryModel.find({ shopId: shopId }).sort({ date: -1, historytime: -1 }).limit(10);
  return values;
};
const get_order_details = async (orderId) => {
  const toady = moment().format('YYYY-MM-DD');
  let data = await ProductorderClone.aggregate([
    {
      $match: {
        orderId: { $eq: orderId },
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productid',
        foreignField: '_id',
        as: 'productsdata',
      },
    },
    { $unwind: '$productsdata' },
    {
      $lookup: {
        from: 'productpacktypes',
        localField: 'productpacktypeId',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              show: true,
            },
          },
          {
            $lookup: {
              from: 'historypacktypes',
              localField: '_id',
              foreignField: 'productPackId',
              pipeline: [{ $match: { date: toady } }],
              as: 'historypacktypes',
            },
          },
          {
            $unwind: '$historypacktypes',
          },
          {
            $project: {
              _id: 1,
              onlinePrice: 1,
              salesstartPrice: 1,
              salesendPrice: 1,
            },
          },
          {
            $limit: 1,
          },
        ],
        as: 'productpacktypes',
      },
    },
    {
      $unwind: {
        path: '$productpacktypes',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        preOrderClose: 1,
        active: 1,
        archive: 1,
        status: 1,
        orderId: 1,
        productid: 1,
        quantity: 1,
        priceperkg: 1,
        GST_Number: 1,
        HSN_Code: 1,
        packtypeId: 1,
        productpacktypeId: 1,
        packKg: 1,
        unit: 1,
        date: 1,
        time: 1,
        customerId: 1,
        finalQuantity: 1,
        finalPricePerKg: 1,
        created: 1,
        onlinePrice: '$productpacktypes.onlinePrice',
        salesstartPrice: '$productpacktypes.salesstartPrice',
        salesendPrice: '$productpacktypes.salesendPrice',
        price_available: { $ne: ['$productpacktypes', null] },
        productTitle: '$productsdata.productTitle',
      },
    },
  ]);
  return data;
};

module.exports = {
  createCallHistory,
  getAll,
  getShop_pending,
  updateCallingStatus,
  getById,
  updateStatuscall,
  createShopByOwner,
  createcallHistoryWithType,
  callingStatusreport,
  updateOrderStatus,
  getOncallfromshops,
  checkvisitOncallStatus,
  updateStatuscallVisit,
  getshopsOrderWise,
  getcallHistorylastFivedays,
  getacceptDeclined,
  resethistory,
  previouscallBackAnd_Reshedule,
  getOncallShops,
  oncallstatusByUser,
  getShop_callback,
  getShop_reshedule,
  getShop_oncall,
  call_visit_Count,
  BillHistoryByShopId_date,
  updateStatusLapsed,
  updateStatuscalllapsed,
  createcallHistoryWithTypelapsed,
  get_order_details,
};
