const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { SupplierUnbilled, SupplierUnbilledHistory } = require('../models/supplier.Unbilled.model');
const moment = require('moment');
const CallStatus = require('../models/callStatus');
const Supplier = require('../models/supplier.model');
const supplierBills = require('../models/supplierBills.model');
const ReceivedProduct = require('../models/receivedProduct.model');
const { RaisedUnBilled, RaisedUnBilledHistory } = require('../models/supplier.raised.unbilled.model');

const createSupplierUnBilled = async (body) => {
  const { supplierId, un_Billed_amt, raisedId } = body;
  const sunbilled = await SupplierUnbilled.findOne({ supplierId: supplierId });
  if (!sunbilled) {
    let values = await SupplierUnbilled.create({ ...body, ...{ date: moment().format('YYYY-MM-DD'), created: moment() } });
    await SupplierUnbilledHistory.create({
      ...body,
      ...{ date: moment().format('YYYY-MM-DD'), created: moment(), un_BilledId: values._id, raisedId: raisedId },
    });
    await RaisedUnBilledHistory.findByIdAndUpdate({ _id: raisedId }, { paidStatus: 'Paid' }, { new: true });
    return values;
  } else {
    let unBamt = parseInt(un_Billed_amt);
    let existamt = parseInt(sunbilled.un_Billed_amt);
    let total = unBamt + existamt;
    let value = await SupplierUnbilled.findByIdAndUpdate(
      { _id: sunbilled._id },
      { un_Billed_amt: total, date: moment().format('YYYY-MM-DD'), created: moment() },
      { new: true }
    );
    await SupplierUnbilledHistory.create({
      ...body,
      ...{ date: moment().format('YYYY-MM-DD'), created: moment(), un_BilledId: value._id, raisedId: raisedId },
    });
    await RaisedUnBilledHistory.findByIdAndUpdate({ _id: raisedId }, { paidStatus: 'Paid' }, { new: true });
    return value;
  }
};

const getUnBilledBySupplier = async (query) => {
  //console.log(query);
  let page = query.page;
  let values = await Supplier.aggregate([
    {
      $lookup: {
        from: 'callstatuses',
        localField: '_id',
        foreignField: 'supplierid',
        pipeline: [{ $match: { status: 'Advance' } }, { $group: { _id: null, TotalAdvance: { $sum: '$TotalAmount' } } }],
        as: 'suppplierOrders',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$suppplierOrders',
      },
    },
    {
      $lookup: {
        from: 'supplierraisedunbilleds',
        localField: '_id',
        foreignField: 'supplierId',
        as: 'suppplierUnbilleds',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$suppplierUnbilleds',
      },
    },
    // {
    //   $lookup: {
    //     from: 'suppliers',
    //     localField: 'supplierId',
    //     foreignField: '_id',
    //     pipeline: [
    //       {
    //         $lookup: {
    //           from: 'callstatuses',
    //           localField: '_id',
    //           foreignField: 'supplierid',
    //           pipeline: [
    //             { $match: { status: 'Advance' } },
    //             { $group: { _id: null, TotalAdvance: { $sum: '$TotalAmount' } } },
    //           ],
    //           as: 'suppplierOrders',
    //         },
    //       },
    //       {
    //         $unwind: {
    //           preserveNullAndEmptyArrays: true,
    //           path: '$suppplierOrders',
    //         },
    //       },
    //       {
    //         $lookup: {
    //           from: 'supplierraisedunbilleds',
    //           localField: '_id',
    //           foreignField: 'supplierId',
    //           as: 'suppplierUnbilled',
    //         },
    //       },
    //       {
    //         $unwind: {
    //           preserveNullAndEmptyArrays: true,
    //           path: '$suppplierUnbilled',
    //         },
    //       },
    //     ],
    //     as: 'suppliers',
    //   },
    // },
    // {
    //   $unwind: '$suppliers',
    // },
    {
      $lookup: {
        from: 'supplierunbilledhistories',
        localField: '_id',
        foreignField: 'supplierId',
        pipeline: [
          {
            $group: { _id: null, TotalUnbilled: { $sum: '$un_Billed_amt' } },
          },
        ],
        as: 'unBilledHistory',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$unBilledHistory',
      },
    },
    {
      $lookup: {
        from: 'supplierunbilleds',
        localField: '_id',
        foreignField: 'supplierId',
        as: 'supplierUnBilled',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$supplierUnBilled',
      },
    },
    {
      $project: {
        supplierId: { $ifNull: ['$_id', 'nill'] },
        supplierUnBilled: '$supplierUnBilled',
        un_Billed_amt: { $ifNull: ['$supplierUnBilled.un_Billed_amt', 0] },
        created: { $ifNull: ['$suppplierUnbilleds.created', 0] },
        raised_Amt: { $ifNull: ['$suppplierUnbilleds.raised_Amt', 0] },
        raisedBy: '$suppplierUnbilleds.raisedBy',
        supplierName: { $ifNull: ['$primaryContactName', 0] },
        total_UnbilledAmt: { $ifNull: ['$unBilledHistory.TotalUnbilled', 0] },
        tradeName: { $ifNull: ['$tradeName', 'nill'] },
        primaryContactNumber: 1,
        suppliersRaisedUnBill: {
          $ifNull: [
            { $subtract: ['$suppplierUnbilleds.raised_Amt', { $ifNull: ['$unBilledHistory.TotalUnbilled', 0] }] },
            0,
          ],
        },
        date: { $ifNull: ['$suppplierUnbilleds.date', '$supplierUnBilled.date'] },
        // suppplierUnbilled: '$supplierUnBilled',
      },
    },
    // {
    //   $project: {
    //     _id: 1,
    //     un_Billed_amt: { $ifNull: ['$supplierUnBilled.un_Billed_amt', 0] },
    //     date: 1,
    //     raised_Amt: '$suppplierUnbilled.raised_Amt',
    //     raisedBy: 1,
    //     supplierName: '$suppliers.primaryContactName',
    //     total_UnbilledAmt: { $ifNull: ['$unBilledHistory.TotalUnbilled', 0] },
    //     supplierId: '$suppliers._id',
    //     tradeName: '$suppliers.tradeName',
    //     primaryContactNumber: '$suppliers.primaryContactNumber',
    //     suppliersRaisedUnBill: {
    //       $ifNull: [{ $subtract: ['$suppplierUnbilled.raised_Amt', { $ifNull: ['$supplierUnBilled.un_Billed_amt', 0] }] }, 0],
    //     },
    //   },
    // },
    {
      $project: {
        // _id: { $ifNull: ['$supplierUnBilled._id', 0] },
        date: 1,
        // supplierUnBilled: 1,
        un_Billed_amt: 1,
        raised_Amt: 1,
        supplierName: 1,
        tradeName: 1,
        total_UnbilledAmt: 1,
        supplierId: 1,
        suppliersRaisedUnBills: 1,
        primaryContactNumber: 1,
        created: 1,
        raisedBy: { $ifNull: ['$raisedBy', 'Unbilled'] },
        suppliersRaisedUnBill: {
          $cond: { if: { $lte: ['$suppliersRaisedUnBill', 0] }, then: 0, else: '$suppliersRaisedUnBill' },
        },
      },
    },
    {
      $match: { date: { $ne: null } },
    },
    {
      $skip: 10 * page,
    },
    { $limit: 10 },
  ]);
  let total = await Supplier.aggregate([
    {
      $lookup: {
        from: 'callstatuses',
        localField: '_id',
        foreignField: 'supplierid',
        pipeline: [{ $match: { status: 'Advance' } }, { $group: { _id: null, TotalAdvance: { $sum: '$TotalAmount' } } }],
        as: 'suppplierOrders',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$suppplierOrders',
      },
    },
    {
      $lookup: {
        from: 'supplierraisedunbilleds',
        localField: '_id',
        foreignField: 'supplierId',
        as: 'suppplierUnbilleds',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$suppplierUnbilleds',
      },
    },
    // {
    //   $lookup: {
    //     from: 'suppliers',
    //     localField: 'supplierId',
    //     foreignField: '_id',
    //     pipeline: [
    //       {
    //         $lookup: {
    //           from: 'callstatuses',
    //           localField: '_id',
    //           foreignField: 'supplierid',
    //           pipeline: [
    //             { $match: { status: 'Advance' } },
    //             { $group: { _id: null, TotalAdvance: { $sum: '$TotalAmount' } } },
    //           ],
    //           as: 'suppplierOrders',
    //         },
    //       },
    //       {
    //         $unwind: {
    //           preserveNullAndEmptyArrays: true,
    //           path: '$suppplierOrders',
    //         },
    //       },
    //       {
    //         $lookup: {
    //           from: 'supplierraisedunbilleds',
    //           localField: '_id',
    //           foreignField: 'supplierId',
    //           as: 'suppplierUnbilled',
    //         },
    //       },
    //       {
    //         $unwind: {
    //           preserveNullAndEmptyArrays: true,
    //           path: '$suppplierUnbilled',
    //         },
    //       },
    //     ],
    //     as: 'suppliers',
    //   },
    // },
    // {
    //   $unwind: '$suppliers',
    // },
    {
      $lookup: {
        from: 'supplierunbilledhistories',
        localField: '_id',
        foreignField: 'supplierId',
        pipeline: [
          {
            $group: { _id: null, TotalUnbilled: { $sum: '$un_Billed_amt' } },
          },
        ],
        as: 'unBilledHistory',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$unBilledHistory',
      },
    },
    {
      $lookup: {
        from: 'supplierunbilleds',
        localField: '_id',
        foreignField: 'supplierId',
        as: 'supplierUnBilled',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$supplierUnBilled',
      },
    },
    {
      $project: {
        supplierId: { $ifNull: ['$_id', 'nill'] },
        supplierUnBilled: '$supplierUnBilled',
        un_Billed_amt: { $ifNull: ['$supplierUnBilled.un_Billed_amt', 0] },
        raised_Amt: { $ifNull: ['$suppplierUnbilleds.raised_Amt', 0] },
        raisedBy: '$suppplierUnbilleds.raisedBy',
        supplierName: { $ifNull: ['$primaryContactName', 0] },
        total_UnbilledAmt: { $ifNull: ['$unBilledHistory.TotalUnbilled', 0] },
        tradeName: { $ifNull: ['$tradeName', 'nill'] },
        primaryContactNumber: 1,
        suppliersRaisedUnBill: {
          $ifNull: [
            { $subtract: ['$suppplierUnbilleds.raised_Amt', { $ifNull: ['$supplierUnBilled.un_Billed_amt', 0] }] },
            0,
          ],
        },
        date: { $ifNull: ['$suppplierUnbilleds.date', '$supplierUnBilled.date'] },
        // suppplierUnbilled: '$supplierUnBilled',
      },
    },
    // {
    //   $project: {
    //     _id: 1,
    //     un_Billed_amt: { $ifNull: ['$supplierUnBilled.un_Billed_amt', 0] },
    //     date: 1,
    //     raised_Amt: '$suppplierUnbilled.raised_Amt',
    //     raisedBy: 1,
    //     supplierName: '$suppliers.primaryContactName',
    //     total_UnbilledAmt: { $ifNull: ['$unBilledHistory.TotalUnbilled', 0] },
    //     supplierId: '$suppliers._id',
    //     tradeName: '$suppliers.tradeName',
    //     primaryContactNumber: '$suppliers.primaryContactNumber',
    //     suppliersRaisedUnBill: {
    //       $ifNull: [{ $subtract: ['$suppplierUnbilled.raised_Amt', { $ifNull: ['$supplierUnBilled.un_Billed_amt', 0] }] }, 0],
    //     },
    //   },
    // },
    {
      $project: {
        // _id: { $ifNull: ['$supplierUnBilled._id', 0] },
        date: 1,
        // supplierUnBilled: 1,
        un_Billed_amt: 1,
        raised_Amt: 1,
        supplierName: 1,
        tradeName: 1,
        total_UnbilledAmt: 1,
        supplierId: 1,
        suppliersRaisedUnBills: 1,
        primaryContactNumber: 1,
        raisedBy: { $ifNull: ['$raisedBy', 'Unbilled'] },
        suppliersRaisedUnBill: {
          $cond: { if: { $lte: ['$suppliersRaisedUnBill', 0] }, then: 0, else: '$suppliersRaisedUnBill' },
        },
      },
    },
    {
      $match: { date: { $ne: null } },
    },
  ]);
  return { values: values, total: total.length };
};

const getSupplierAdvance = async (supplierId) => {
  let values = await CallStatus.aggregate([
    {
      $match: { supplierid: supplierId, status: 'Advance' },
    },
    {
      $group: { _id: null, totalAdvance: { $sum: '$TotalAmount' } },
    },
  ]);
  return values;
};

const getSupplierOrdered_Details = async (id) => {
  let values = await CallStatus.aggregate([
    {
      $match: { supplierid: id },
    },
    {
      $project: {
        _id: 1,
        totalAmounts: { $ifNull: [{ $multiply: ['$confirmOrder', '$confirmprice'] }, 0] },
        date: 1,
        status: 1,
        date: 1,
        AdvanceRaised: { $ifNull: ['$TotalAmount', 0] },
        orderId: { $ifNull: ['$OrderId', 'oldData'] },
      },
    },
  ]);
  return values;
};

const Unbilled_Details_bySupplier = async (id, query) => {
  let page = query.page;
  const supplier = await SupplierUnbilledHistory.aggregate([
    {
      $match: { supplierId: { $eq: id } },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await SupplierUnbilledHistory.aggregate([
    {
      $match: { supplierId: { $eq: id } },
    },
  ]);

  let supplierDetails = await Supplier.findById(id);
  return { values: supplier, supplierDetails: supplierDetails, total: total.length };
};

const getSupplierbill_amt = async (page) => {
  let values = await Supplier.aggregate([
    {
      $lookup: {
        from: 'receivedproducts',
        localField: '_id',
        foreignField: 'supplierId',
        pipeline: [
          {
            $match: {
              status: { $eq: 'Billed' },
            },
          },
          {
            $lookup: {
              from: 'receivedstocks',
              localField: '_id',
              foreignField: 'groupId',
              pipeline: [
                { $match: { status: { $eq: 'Billed' } } },
                {
                  $group: {
                    _id: null,
                    amount: {
                      $sum: {
                        $multiply: ['$billingQuantity', '$billingPrice'],
                      },
                    },
                  },
                },
              ],
              as: 'receivedstocks',
            },
          },
          {
            $lookup: {
              from: 'supplierbills',
              localField: '_id',
              foreignField: 'groupId',
              pipeline: [
                {
                  $group: {
                    _id: null,
                    amount: {
                      $sum: '$Amount',
                    },
                  },
                },
              ],
              as: 'supplierbills',
            },
          },
          {
            $unwind: {
              path: '$supplierbills',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $unwind: {
              path: '$receivedstocks',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              paidAmount: { $ifNull: ['$supplierbills.amount', 0] },
              totalAmount: { $ifNull: ['$receivedstocks.amount', 0] },
            },
          },
          {
            $project: {
              paidAmount: 1,
              totalAmount: 1,
              pendingAmount: { $subtract: ['$totalAmount', '$paidAmount'] },
              match: { $eq: ['$totalAmount', '$paidAmount'] },
            },
          },
          {
            $match: { match: { $ne: true } },
          },
          {
            $group: {
              _id: null,
              pendingBillcount: { $sum: 1 },
              pendingAmount: { $sum: '$pendingAmount' },
            },
          },
        ],
        as: 'receivedproducts',
      },
    },
    {
      $unwind: {
        path: '$receivedproducts',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'supplierunbilleds',
        localField: '_id',
        foreignField: 'supplierId',
        as: 'supplierbills',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$supplierbills',
      },
    },
    {
      $lookup: {
        from: 'supplierbills',
        localField: '_id',
        foreignField: 'supplierId',
        pipeline: [{ $sort: { created: -1 } }, { $limit: 1 }],
        as: 'supplierbill',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$supplierbill',
      },
    },
    {
      $project: {
        _id: 1,
        primaryContactName: 1,
        tradeName: 1,
        primaryContactNumber: 1,
        totalPending_amt: { $ifNull: ['$receivedproducts.pendingAmount', 0] },
        pendingBillcount: '$receivedproducts.pendingBillcount',
        current_UnBilled_amt: { $ifNull: ['$supplierbills.un_Billed_amt', 0] },
        lastPaid: { $ifNull: ['$supplierbill.Amount', 0] },
      },
    },
    {
      $match: { totalPending_amt: { $gt: 0 } },
    },
    {
      $skip: 10 * page,
    },
    { $limit: 10 },
  ]);
  let total = await Supplier.aggregate([
    {
      $lookup: {
        from: 'receivedproducts',
        localField: '_id',
        foreignField: 'supplierId',
        pipeline: [
          {
            $match: {
              status: { $eq: 'Billed' },
            },
          },
          {
            $lookup: {
              from: 'receivedstocks',
              localField: '_id',
              foreignField: 'groupId',
              pipeline: [
                { $match: { status: { $eq: 'Billed' } } },
                {
                  $group: {
                    _id: null,
                    amount: {
                      $sum: {
                        $multiply: ['$billingQuantity', '$billingPrice'],
                      },
                    },
                  },
                },
              ],
              as: 'receivedstocks',
            },
          },
          {
            $lookup: {
              from: 'supplierbills',
              localField: '_id',
              foreignField: 'groupId',
              pipeline: [
                {
                  $group: {
                    _id: null,
                    amount: {
                      $sum: '$Amount',
                    },
                  },
                },
              ],
              as: 'supplierbills',
            },
          },
          {
            $unwind: {
              path: '$supplierbills',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $unwind: {
              path: '$receivedstocks',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              paidAmount: { $ifNull: ['$supplierbills.amount', 0] },
              totalAmount: { $ifNull: ['$receivedstocks.amount', 0] },
            },
          },
          {
            $project: {
              paidAmount: 1,
              totalAmount: 1,
              pendingAmount: { $subtract: ['$totalAmount', '$paidAmount'] },
              match: { $eq: ['$totalAmount', '$paidAmount'] },
            },
          },
          {
            $match: { match: { $ne: true } },
          },
          {
            $group: {
              _id: null,
              pendingBillcount: { $sum: 1 },
              pendingAmount: { $sum: '$pendingAmount' },
            },
          },
        ],
        as: 'receivedproducts',
      },
    },
    {
      $unwind: {
        path: '$receivedproducts',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'supplierunbilleds',
        localField: '_id',
        foreignField: 'supplierId',
        as: 'supplierbills',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$supplierbills',
      },
    },
    {
      $lookup: {
        from: 'supplierbills',
        localField: '_id',
        foreignField: 'supplierId',
        pipeline: [{ $sort: { created: -1 } }, { $limit: 1 }],
        as: 'supplierbill',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$supplierbill',
      },
    },
    {
      $project: {
        _id: 1,
        primaryContactName: 1,
        totalPending_amt: { $ifNull: ['$receivedproducts.pendingAmount', 0] },
        current_UnBilled_amt: { $ifNull: ['$supplierbills.un_Billed_amt', 0] },
        lastPaid: { $ifNull: ['$supplierbill.Amount', 0] },
      },
    },
    {
      $match: { totalPending_amt: { $gt: 0 } },
    },
  ]);
  return { values: values, total: total.length };
};

const getBillDetails_bySupplier = async (id) => {
  let values = await supplierBills.aggregate([
    { $match: { supplierId: id } },
    {
      $lookup: {
        from: 'receivedproducts',
        localField: 'groupId',
        foreignField: '_id',
        as: 'received',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$received',
      },
    },
    {
      $project: {
        _id: 1,
        Amount: 1,
        paymentMethod: 1,
        supplierId: 1,
        Billno: '$received.BillNo',
        date: '$received.date',
        created: 1,
      },
    },
  ]);
  let supplier = await Supplier.findById(id);
  return { values: values, supplier: supplier };
};

const supplierOrders_amt_details = async (id, query) => {
  let page = query.page;
  let values = await ReceivedProduct.aggregate([
    {
      $match: { supplierId: id },
    },
    {
      $lookup: {
        from: 'receivedstocks',
        localField: '_id',
        foreignField: 'groupId',
        pipeline: [{ $group: { _id: null, billingTotal: { $sum: '$billingTotal' } } }],
        as: 'ReceivedData',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$ReceivedData',
      },
    },
    {
      $lookup: {
        from: 'supplierbills',
        localField: '_id',
        foreignField: 'groupId',
        pipeline: [{ $group: { _id: null, billingTotal: { $sum: '$Amount' } } }],
        as: 'supplierBills',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$supplierBills',
      },
    },
    {
      $project: {
        _id: 1,
        supplierId: 1,
        date: 1,
        BillNo: 1,
        TotalAmt: { $ifNull: ['$ReceivedData.billingTotal', 0] },
        paidAmount: { $ifNull: ['$supplierBills.billingTotal', 0] },
        created: 1,
        // PendingAmount: { $ifNull: [{ $subtract: ['$ReceivedData.billingTotal', '$supplierBills.billingTotal'] }, 0] },
        // PendingAmount: { $subtract: ['$ReceivedData.billingTotal', '$supplierBills.billingTotal'] },
      },
    },
    {
      $project: {
        _id: 1,
        supplierId: 1,
        date: 1,
        BillNo: 1,
        TotalAmt: 1,
        paidAmount: 1,
        PendingAmount: { $ifNull: [{ $subtract: ['$TotalAmt', '$paidAmount'] }, 0] },
        created: 1,
      },
    },
    {
      $match: { PendingAmount: { $gt: 0 } },
    },
    {
      $skip: 10 * page,
    },
    {
      $limit: 10,
    },
  ]);
  let total = await ReceivedProduct.aggregate([
    {
      $match: { supplierId: id },
    },
    {
      $lookup: {
        from: 'receivedstocks',
        localField: '_id',
        foreignField: 'groupId',
        pipeline: [{ $group: { _id: null, billingTotal: { $sum: '$billingTotal' } } }],
        as: 'ReceivedData',
      },
    },
    {
      $unwind: '$ReceivedData',
    },
    {
      $lookup: {
        from: 'supplierbills',
        localField: '_id',
        foreignField: 'groupId',
        pipeline: [{ $group: { _id: null, billingTotal: { $sum: '$Amount' } } }],
        as: 'supplierBills',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$supplierBills',
      },
    },
    {
      $project: {
        _id: 1,
        supplierId: 1,
        date: 1,
        BillNo: 1,
        TotalAmt: { $ifNull: ['$ReceivedData.billingTotal', 0] },
        paidAmount: { $ifNull: ['$supplierBills.billingTotal', 0] },
        PendingAmount: { $ifNull: [{ $subtract: ['$ReceivedData.billingTotal', '$supplierBills.billingTotal'] }, 0] },
      },
    },
    {
      $match: { PendingAmount: { $gt: 0 } },
    },
  ]);
  let supplier = await Supplier.findById(id);
  return { values: values, supplier: supplier, total: total.length };
};

const getPaid_history = async (id) => {
  let values = await supplierBills.aggregate([
    {
      $match: { groupId: id },
    },
  ]);
  let supplier = await Supplier.findById(id);
  return values;
};

const billAdjust = async (body) => {
  let { arr, supplierId, amount } = body;
  let values = await SupplierUnbilled.findOne({ supplierId: supplierId });
  if (values.un_Billed_amt < amount) {
    amount = values.un_Billed_amt;
  }
  const pending = await ReceivedProduct.aggregate([
    {
      $match: { $and: [{ _id: { $in: arr } }] },
    },
    {
      $lookup: {
        from: 'receivedstocks',
        localField: '_id',
        foreignField: 'groupId',
        pipeline: [{ $group: { _id: null, billingTotal: { $sum: '$billingTotal' } } }],
        as: 'ReceivedData',
      },
    },
    {
      $unwind: '$ReceivedData',
    },
    {
      $lookup: {
        from: 'supplierbills',
        localField: '_id',
        foreignField: 'groupId',
        pipeline: [{ $group: { _id: null, billingTotal: { $sum: '$Amount' } } }],
        as: 'supplierBills',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$supplierBills',
      },
    },
    {
      $project: {
        _id: 1,
        paidAmount: { $ifNull: ['$supplierBills.billingTotal', 0] },
        PendingAmount: {
          $ifNull: [{ $subtract: ['$ReceivedData.billingTotal', { $ifNull: ['$supplierBills.billingTotal', 0] }] }, 0],
        },
        ReceivedData: '$ReceivedData',
      },
    },
  ]);
  if (pending.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Pending Bill Not Available');
  }
  //console.log(pending);
  pending.forEach(async (e) => {
    if (amount > 0) {
      let pendingamount = e.PendingAmount;
      // pending amount consolidated from billing amount and unbilled amount
      //console.log(pendingamount);
      if (pendingamount > 0) {
        let reduceAmount = pendingamount - amount;
        if (reduceAmount >= 0) {
          //console.log(reduceAmount);
          // amount is getting from client side
          //console.log(pendingamount, 'pending');
          //console.log(amount, '1');
          await supplierBills.create({
            status: 'Paid',
            groupId: e._id,
            Amount: amount,
            paymentMethod: 'Adjusted',
            supplierId: supplierId,
            created: moment(),
            date: moment().format('YYYY-MM-DD'),
          });
        } else {
          reduceAmount = amount;
          // amount = 0;
          //console.log(reduceAmount, '2');
          await supplierBills.create({
            status: 'Paid',
            groupId: e._id,
            Amount: reduceAmount,
            paymentMethod: 'Adjusted',
            supplierId: supplierId,
            created: moment(),
            date: moment().format('YYYY-MM-DD'),
          });
        }
      }
    }
  });
  // body.amount getting from client side
  // values.un_Billed_amt getting from server side
  values = await SupplierUnbilled.findByIdAndUpdate(
    { _id: values._id },
    { un_Billed_amt: values.un_Billed_amt - amount },
    { new: true }
  );
  if (values.un_Billed_amt < 0) {
    await SupplierUnbilled.findByIdAndUpdate({ _id: values._id }, { un_Billed_amt: 0 }, { new: true });
  }
  return values;
};

const PayPendingAmount = async (body) => {
  const { supplierId, amount, arr, pay_method, PaidToBe } = body;
  if (arr.length == 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Bill Not Available');
  }
  arr.forEach(async (e) => {
    let values = await ReceivedProduct.findById(e);
    //console.log(PaidToBe);
    await supplierBills.create({
      status: 'Paid',
      groupId: values._id,
      Amount: parseInt(amount),
      paymentMethod: pay_method,
      supplierId: supplierId,
      PaidToBe: PaidToBe,
      created: moment(),
      date: moment().format('YYYY-MM-DD'),
    });
  });
  return { message: 'successFully paid' };
};

const getUnBilledDetails = async (supplierId) => {
  let values = await Supplier.aggregate([
    {
      $match: {
        _id: supplierId,
      },
    },
    {
      $lookup: {
        from: 'supplierraisedunbilleds',
        localField: '_id',
        foreignField: 'supplierId',
        as: 'suppplierUnbilledRaised',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$suppplierUnbilledRaised',
      },
    },
    {
      $lookup: {
        from: 'supplierunbilleds',
        localField: '_id',
        foreignField: 'supplierId',
        as: 'supplierUnBilled',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$supplierUnBilled',
      },
    },
    {
      $lookup: {
        from: 'supplierunbilledhistories',
        localField: '_id',
        foreignField: 'supplierId',
        pipeline: [
          {
            $group: { _id: null, TotalUnbilled: { $sum: '$un_Billed_amt' } },
          },
        ],
        as: 'unBilledHistory',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$unBilledHistory',
      },
    },
    {
      $project: {
        _id: 1,
        primaryContactName: 1,
        primaryContactNumber: 1,
        RegisteredAddress: 1,
        UnbilledRaised: { $ifNull: ['$suppplierUnbilledRaised.raised_Amt', 0] },
        current_UnBilled: { $ifNull: ['$supplierUnBilled.un_Billed_amt', 0] },
        TotalUnbilled: { $ifNull: ['$unBilledHistory.TotalUnbilled', 0] },
      },
    },
  ]);
  return values;
};

const supplierUnBilledBySupplier = async (supplierId) => {
  let supplier = await Supplier.aggregate([
    {
      $match: { _id: supplierId, approvedStatus: 'Approved' },
    },
    {
      $lookup: {
        from: 'supplierunbilleds',
        localField: '_id',
        foreignField: 'supplierId',
        as: 'supplierUnBilled',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$supplierUnBilled',
      },
    },
    {
      $lookup: {
        from: 'supplierunbilledhistories',
        localField: '_id',
        foreignField: 'supplierId',
        pipeline: [
          {
            $group: { _id: null, TotalUnbilled: { $sum: '$un_Billed_amt' } },
          },
        ],
        as: 'unBilledHistory',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$unBilledHistory',
      },
    },
    {
      $lookup: {
        from: 'supplierunbilledhistories',
        localField: '_id',
        foreignField: 'supplierId',
        pipeline: [
          {
            $sort: { created: -1 },
          },
          { $limit: 1 },
        ],
        as: 'lastunbilled',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$lastunbilled',
      },
    },
    {
      $lookup: {
        from: 'supplierraisedunbilleds',
        localField: '_id',
        foreignField: 'supplierId',
        as: 'suppplierUnbilledRaised',
      },
    },
    {
      $unwind: '$suppplierUnbilledRaised',
    },
    {
      $project: {
        _id: 1,
        TotalUnbilled: '$unBilledHistory.TotalUnbilled',
        CurrentUnBilled: '$supplierUnBilled.un_Billed_amt',
        RaisedUnBilled: '$suppplierUnbilledRaised.raised_Amt',
        date: '$lastunbilled.date',
      },
    },
  ]);
  return supplier;
};

const getRaisedUnBilled_PaidUnbilled_Details = async (page, id) => {
  let values = await RaisedUnBilledHistory.aggregate([
    {
      $match: { supplierId: id },
    },
    {
      $lookup: {
        from: 'supplierunbilledhistories',
        localField: '_id',
        foreignField: 'raisedId',
        pipeline: [
          {
            $group: { _id: null, TotalUnbilled: { $sum: '$un_Billed_amt' } },
          },
        ],
        as: 'supplierUnBilled',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$supplierUnBilled',
      },
    },
    {
      $project: {
        _id: 1,
        active: 1,
        date: 1,
        raised_Amt: 1,
        raisedBy: 1,
        paidAmount: '$supplierUnBilled.TotalUnbilled',
      },
    },
    {
      $skip: 10 * page,
    },
    {
      $limit: 10,
    },
  ]);
  let total = await RaisedUnBilledHistory.aggregate([
    {
      $match: { supplierId: id },
    },
    {
      $lookup: {
        from: 'supplierunbilledhistories',
        localField: '_id',
        foreignField: 'raisedId',
        pipeline: [
          {
            $group: { _id: null, TotalUnbilled: { $sum: '$un_Billed_amt' } },
          },
        ],
        as: 'supplierUnBilled',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$supplierUnBilled',
      },
    },
    {
      $project: {
        _id: 1,
        active: 1,
        date: 1,
        raised_Amt: 1,
        raisedBy: 1,
        paidAmount: '$supplierUnBilled.TotalUnbilled',
      },
    },
  ]);
  let unBilled = await SupplierUnbilled.findOne({ supplierId: id });
  return { values: values, total: total.length, unBilled: unBilled };
};

const getUnBilledhistoryBySupplier = async (id) => {
  let values = await SupplierUnbilledHistory.aggregate([
    {
      $match: { supplierId: id },
    },
  ]);
  return values;
};

const getUnBilledRaisedhistoryBySupplier = async (id) => {
  let values = await RaisedUnBilledHistory.aggregate([
    {
      $match: { supplierId: id },
    },
  ]);
  return values;
};

const getUnBilledRaisedhistory = async () => {
  let values = await RaisedUnBilledHistory.aggregate([
    {
      $lookup: {
        from: 'suppliers',
        localField: 'supplierId',
        foreignField: '_id',
        as: 'suppliers',
      },
    },
    {
      $unwind: '$suppliers',
    },
    {
      $project: {
        _id: 1,
        active: 1,
        supplierId: 1,
        raised_Amt: 1,
        raisedBy: 1,
        created: 1,
        date: 1,
        raisedId: 1,
        supplierName: '$suppliers.primaryContactName',
        paidStatus: 1,
      },
    },
  ]);
  return values;
};

const getPaidUnBilledHistory = async (id) => {
  let values = await SupplierUnbilledHistory.aggregate([
    {
      $match: { raisedId: id },
    },
  ]);
  return values;
};

const getpaidraisedbyindivitual = async (id, supplierId) => {
  let values = await RaisedUnBilledHistory.aggregate([
    {
      $match: {
        _id: id,
      },
    },
    {
      $lookup: {
        from: 'supplierunbilledhistories',
        localField: '_id',
        foreignField: 'raisedId',
        as: 'suppliers',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$suppliers',
      },
    },
    {
      $project: {
        raised_Amt: 1,
        pay_method: 1,
        date: 1,
        un_BilledId: 1,
        created: 1,
        supplierId: 1,
        raisedId: 1,
        suppliers: '$suppliers',
      },
    },
    // {
    //   $unwind: '$suppliers',
    // },
  ]);
  let CurrentUnBilled = await RaisedUnBilled.aggregate([
    {
      $match: {
        supplierId: supplierId,
      },
    },
    {
      $lookup: {
        from: 'supplierunbilleds',
        localField: 'supplierId',
        foreignField: 'supplierId',
        as: 'suppliersunbilled',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$suppliersunbilled',
      },
    },
    {
      $lookup: {
        from: 'suppliers',
        localField: 'supplierId',
        foreignField: '_id',
        as: 'suppliers',
      },
    },
    {
      $unwind: '$suppliers',
    },
    {
      $lookup: {
        from: 'receivedstocks',
        localField: 'supplierId',
        foreignField: 'supplierId',
        pipeline: [{ $group: { _id: null, total: { $sum: '$billingTotal' } } }],
        as: 'stocks',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$stocks',
      },
    },
    {
      $lookup: {
        from: 'supplierbills',
        localField: 'supplierId',
        foreignField: 'supplierId',
        pipeline: [{ $group: { _id: null, billingTotal: { $sum: '$Amount' } } }],
        as: 'supplierBills',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$supplierBills',
      },
    },
    {
      $lookup: {
        from: 'supplierbills',
        localField: 'supplierId',
        foreignField: 'supplierId',
        as: 'supplierBillscount',
      },
    },
    {
      $lookup: {
        from: 'supplierbills',
        localField: 'supplierId',
        foreignField: 'supplierId',
        pipeline: [{ $sort: { created: -1 } }, { $limit: 1 }],
        as: 'supplierBillss',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$supplierBillss',
      },
    },

    {
      $lookup: {
        from: 'receivedproducts',
        localField: 'supplierId',
        foreignField: 'supplierId',
        pipeline: [
          {
            $match: {
              status: { $eq: 'Billed' },
            },
          },
          {
            $lookup: {
              from: 'receivedstocks',
              localField: '_id',
              foreignField: 'groupId',
              pipeline: [
                { $match: { status: { $eq: 'Billed' } } },
                {
                  $group: {
                    _id: null,
                    amount: {
                      $sum: {
                        $multiply: ['$billingQuantity', '$billingPrice'],
                      },
                    },
                  },
                },
              ],
              as: 'receivedstocks',
            },
          },
          {
            $lookup: {
              from: 'supplierbills',
              localField: '_id',
              foreignField: 'groupId',
              pipeline: [
                {
                  $group: {
                    _id: null,
                    amount: {
                      $sum: '$Amount',
                    },
                  },
                },
              ],
              as: 'supplierbills',
            },
          },
          {
            $unwind: {
              path: '$supplierbills',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $unwind: {
              path: '$receivedstocks',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              paidAmount: { $ifNull: ['$supplierbills.amount', 0] },
              totalAmount: { $ifNull: ['$receivedstocks.amount', 0] },
            },
          },
          {
            $project: {
              paidAmount: 1,
              totalAmount: 1,
              pendingAmount: { $subtract: ['$totalAmount', '$paidAmount'] },
              match: { $eq: ['$totalAmount', '$paidAmount'] },
            },
          },
          {
            $match: { match: { $ne: true } },
          },
          {
            $group: {
              _id: null,
              pendingBillcount: { $sum: 1 },
              pendingAmount: { $sum: '$pendingAmount' },
            },
          },
        ],
        as: 'receivedproducts',
      },
    },
    {
      $unwind: {
        path: '$receivedproducts',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        active: 1,
        supplierId: 1,
        current_UnBilled: { $ifNull: ['$suppliersunbilled.un_Billed_amt', 0] },
        raisedBy: 1,
        created: 1,
        date: 1,
        supplierName: '$suppliers.primaryContactName',
        receivedproducts: 1,
        // suppliersunbilled: '$suppliersunbilled',
        billcount: '$receivedproducts.pendingBillcount',
        lastPaidAmt: { $ifNull: ['$supplierBillss.Amount', 0] },
        lasPaidDate: { $ifNull: ['$supplierBillss.date', 'nill'] },
        PendingAmount: { $subtract: [{ $ifNull: ['$stocks.total', 0] }, { $ifNull: ['$supplierBills.billingTotal', 0] }] },
      },
    },
  ]);
  return { values: values, CurrentUnBilled: CurrentUnBilled[0] };
};

module.exports = {
  createSupplierUnBilled,
  getUnBilledBySupplier,
  getSupplierAdvance,
  getSupplierOrdered_Details,
  Unbilled_Details_bySupplier,
  getSupplierbill_amt,
  getBillDetails_bySupplier,
  supplierOrders_amt_details,
  getPaid_history,
  billAdjust,
  PayPendingAmount,
  getUnBilledDetails,
  supplierUnBilledBySupplier,
  getUnBilledhistoryBySupplier,
  getUnBilledRaisedhistoryBySupplier,
  getUnBilledRaisedhistory,
  getpaidraisedbyindivitual,
  getRaisedUnBilled_PaidUnbilled_Details,
  getPaidUnBilledHistory,
};
