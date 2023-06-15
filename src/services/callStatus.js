const httpStatus = require('http-status');
const { CallStatus } = require('../models');
const Supplier = require('../models/supplier.model');
const ApiError = require('../utils/ApiError');
const { Product } = require('../models/product.model');
const moment = require('moment');

const createCallStatus = async (callStatusBody) => {
  //console.log(callStatusBody);
  const serverdate = moment().format('YYYY-MM-DD');
  const servertime = moment().format('HHmmss');
  let Buy = await CallStatus.find({ date: serverdate }).count();
  let centerdata = '';
  if (Buy < 9) {
    centerdata = '0000';
  }
  if (Buy < 99 && Buy >= 9) {
    centerdata = '000';
  }
  if (Buy < 999 && Buy >= 99) {
    centerdata = '00';
  }
  if (Buy < 9999 && Buy >= 999) {
    centerdata = '0';
  }
  let BillId = '';
  let totalcounts = Buy + 1;
  BillId = 'OD' + centerdata + totalcounts;
  // let disable = await Supplier.findOne({ _id: callStatusBody.supplierid, active: false });
  // if (disable) {
  //   throw new ApiError(httpStatus.NOT_FOUND, 'User Disable');
  // }
  let values = { ...callStatusBody, ...{ SuddenCreatedBy: "By Admin", date: serverdate, time: servertime, created: moment(), OrderId: BillId } };
  return CallStatus.create(values);
};

const createCallStatus_suppierApp = async (userId, callStatusBody) => {
  //console.log(callStatusBody);
  const serverdate = moment().format('YYYY-MM-DD');
  const servertime = moment().format('HHmmss');
  let Buy = await CallStatus.find({ date: serverdate }).count();
  let centerdata = '';
  if (Buy < 9) {
    centerdata = '0000';
  }
  if (Buy < 99 && Buy >= 9) {
    centerdata = '000';
  }
  if (Buy < 999 && Buy >= 99) {
    centerdata = '00';
  }
  if (Buy < 9999 && Buy >= 999) {
    centerdata = '0';
  }
  let BillId = '';
  let totalcounts = Buy + 1;
  BillId = 'OD' + centerdata + totalcounts;
  let disable = await Supplier.findOne({ _id: userId, active: false });
  if (disable) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User Disable');
  }
  let values = {
    ...callStatusBody,
    ...{ supplierid: userId, date: serverdate, time: servertime, created: moment(), OrderId: BillId },
  };

  return CallStatus.create(values);
};

const getCallStatusById = async (id) => {
  return CallStatus.findById(id);
};

const getProductAndSupplierDetails = async (page) => {
  let details = await Supplier.aggregate([
    {
      $lookup: {
        from: 'callstatuses',
        localField: '_id',
        foreignField: 'supplierid',
        pipeline: [
          { $match: { $and: [{ confirmcallstatus: { $eq: 'Accepted' } }, { StockReceived: { $eq: 'Pending' } }, { showWhs: { $eq: true } }, { $or: [{ SuddenStatus: { $eq: 'Approve' } }, { SuddenStatus: { $eq: 'Approved' } }] }] } },
          { $group: { _id: null, myCount: { $sum: 1 } } },
        ],
        as: 'CallstatusData',
      },
    },
    {
      $unwind: '$CallstatusData',
    },
    {
      $project: {
        primaryContactName: 1,
        primaryContactNumber: 1,
        secondaryContactName: 1,
        secondaryContactNumber: 1,
        RegisteredAddress: 1,
        countries: 1,
        district: 1,
        gstNo: 1,
        email: 1,
        pinCode: 1,
        ConfirmOrders: '$CallstatusData.myCount',
      },
    },
    {
      $limit: 10,
    },
    {
      $skip: 10 * page,
    },
  ]);
  let total = await Supplier.aggregate([
    {
      $lookup: {
        from: 'callstatuses',
        localField: '_id',
        foreignField: 'supplierid',
        pipeline: [
          { $match: { confirmcallstatus: 'Accepted', StockReceived: 'Pending' } },
          { $group: { _id: null, myCount: { $sum: 1 } } },
        ],
        as: 'CallstatusData',
      },
    },
    {
      $unwind: '$CallstatusData',
    },
  ]);
  return {
    value: details,
    total: total.length,
  };
};

const getDataWithSupplierId = async (id, page, search, date) => {
  // //console.log(search);
  // let dateM = { active: true };
  // let searchMatch = { active: true };
  // if (search !== 'null') {
  //   searchMatch = { primaryContactName: { $regex: search, $options: 'i' } };
  // } else {
  //   searchMatch;
  // }
  // if (date !== 'null') {
  //   dateM = { date: { $eq: date } };
  // } else {
  //   dateM;
  // }
  let values = await CallStatus.aggregate([
    {
      $match: {
        $and: [
          { supplierid: { $eq: id } },
          { StockReceived: { $eq: 'Pending' } },
          { confirmcallstatus: { $eq: 'Accepted' } },
          { $or: [{ SuddenStatus: { $eq: 'Approve' } }, { SuddenStatus: { $eq: 'Approved' } }] },
        ],
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productid',
        foreignField: '_id',
        as: 'ProductData',
      },
    },
    {
      $unwind: '$ProductData',
    },
    {
      $lookup: {
        from: 'suppliers',
        localField: 'supplierid',
        foreignField: '_id',
        // pipeline: [
        //   {
        //     $match: {
        //       $and: [searchMatch],
        //     },
        //   },
        // ],
        as: 'supplierData',
      },
    },
    {
      $unwind: '$supplierData',
    },
    {
      $project: {
        _id: 1,
        active: 1,
        StockReceived: 1,
        SuddenStatus: 1,
        qtyOffered: 1,
        strechedUpto: 1,
        price: 1,
        status: 1,
        requestAdvancePayment: 1,
        callstatus: 1,
        callDetail: 1,
        productid: 1,
        supplierid: 1,
        date: 1,
        time: 1,
        phApproved: 1,
        phStatus: 1,
        phreason: 1,
        confirmOrder: 1,
        orderType: 1,
        confirmcallDetail: 1,
        confirmcallstatus: 1,
        confirmprice: 1,
        exp_date: 1,
        ExpectedDate: { $ifNull: ['$Expdate', 'null'] },
        supplierContact: '$supplierData.primaryContactNumber',
        supplierName: '$supplierData.primaryContactName',
        productTitle: '$ProductData.productTitle',
      },
    },
    // {
    //   $match: {
    //     $and: [dateM],
    //   },
    // },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await CallStatus.aggregate([
    {
      $match: {
        $and: [
          { supplierid: { $eq: id } },
          { StockReceived: { $eq: 'Pending' } },
          { confirmcallstatus: { $eq: 'Accepted' } },
          { $or: [{ SuddenStatus: { $eq: 'Approve' } }, { SuddenStatus: { $eq: 'Approved' } }] },
        ],
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productid',
        foreignField: '_id',
        as: 'ProductData',
      },
    },
    {
      $unwind: '$ProductData',
    },
    {
      $lookup: {
        from: 'suppliers',
        localField: 'supplierid',
        foreignField: '_id',
        as: 'supplierData',
      },
    },
    {
      $unwind: '$supplierData',
    },
  ]);
  let totalss = await CallStatus.aggregate([
    {
      $match: {
        $and: [
          { supplierid: { $eq: id } },
          { StockReceived: { $eq: 'Pending' } },
          { confirmcallstatus: { $eq: 'Accepted' } },
          { $or: [{ SuddenStatus: { $eq: 'Approve' } }, { SuddenStatus: { $eq: 'Approved' } }] },
        ],
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$created' } },
        count: { $sum: 1 },
      },
    },
  ]);
  let getSupplier = await Supplier.findById(id);
  return { values: values, total: total.length, supplier: getSupplier, totalss: totalss };
};

const updateCallStatusById = async (id, updateBody) => {
  let callstatus = await CallStatus.findById(id);
  if (!callstatus) {
    throw new ApiError(httpStatus.NOT_FOUND, 'CallStatus Not Found');
  }
  callstatus = await CallStatus.findByIdAndUpdate({ _id: id }, updateBody, { new: true });
  return callstatus;
};

const deleteCallStatusById = async (id) => {
  const callstatus = await getCallStatusById(id);
  if (!callstatus) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Business_Details not found');
  }
  (callstatus.archive = true), (callstatus.active = false), await callstatus.save();
  return callstatus;
};

const finishOrder = async (pId, date) => {
  let values = await CallStatus.find({ productid: pId, date: date, confirmcallstatus: 'Accepted' });
  values.forEach(async (e) => {
    await CallStatus.findByIdAndUpdate({ _id: e._id }, { showWhs: true }, { new: true });
  });
  return 'Order Finished 😃';
};

const getCallstatusForSuddenOrders = async (page) => {
  let values = await CallStatus.aggregate([
    {
      $match: {
        $and: [{ orderType: { $eq: 'sudden' } }, { confirmcallstatus: { $eq: 'Accepted' } }],
      },
    },
    {
      $sort: { date: -1, time: -1 },
    },
    {
      $lookup: {
        from: 'suppliers',
        localField: 'supplierid',
        foreignField: '_id',
        as: 'SupplierData',
      },
    },
    {
      $unwind: '$SupplierData',
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productid',
        foreignField: '_id',
        as: 'productData',
      },
    },
    {
      $unwind: '$productData',
    },
    {
      $project: {
        productName: '$productData.productTitle',
        supplierName: '$SupplierData.primaryContactName',
        supplierContact: '$SupplierData.primaryContactNumber',
        date: 1,
        time: 1,
        confirmOrder: 1,
        confirmcallstatus: 1,
        confirmprice: 1,
        status: 1,
        exp_date: 1,
        productid: 1,
        order_Type: 1,
        supplierid: 1,
        SuddenCreatedBy: 1,
        SuddenStatus: 1,
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);

  let total = await CallStatus.aggregate([
    {
      $match: {
        $and: [{ orderType: { $eq: 'sudden' } }, { confirmcallstatus: { $eq: 'Accepted' } }],
      },
    },
    {
      $sort: { date: -1, time: -1 },
    },
    {
      $lookup: {
        from: 'suppliers',
        localField: 'supplierid',
        foreignField: '_id',
        as: 'SupplierData',
      },
    },
    {
      $unwind: '$SupplierData',
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productid',
        foreignField: '_id',
        as: 'productData',
      },
    },
    {
      $unwind: '$productData',
    },
  ]);
  return { values: values, total: total.length };
};

const suddenOrdersDisplay = async (productId) => {
  let currentDate = moment().format('DD-MM-YYYY');
  let values = await CallStatus.aggregate([
    {
      $match: {
        $and: [
          { date: { $eq: currentDate } },
          { productid: { $eq: productId } },
          { confirmcallstatus: { $eq: 'Accepted' } },
        ],
      },
    },
    {
      $lookup: {
        from: 'suppliers',
        localField: 'supplierid',
        foreignField: '_id',
        as: 'supplierdata',
      },
    },
    {
      $unwind: '$supplierdata',
    },
    {
      $project: {
        StockReceived: 1,
        _id: 1,
        orderType: 1,
        confirmOrder: 1,
        confirmcallstatus: 1,
        confirmprice: 1,
        exp_date: 1,
        date: 1,
        time: 1,
        supplierName: '$supplierdata.primaryContactName',
      },
    },
  ]);
  return values;
};

const getReportWithSupplierId = async (page, search, date) => {
  //console.log(search);
  let dateM = { active: true };
  let searchMatch = { active: true };
  if (search !== 'null') {
    searchMatch = { _id: search };
  } else {
    searchMatch;
  }
  if (date !== 'null') {
    dateM = { date: { $eq: date } };
  } else {
    dateM;
  }
  //console.log('sadf');
  let values = await CallStatus.aggregate([
    {
      $match: { $and: [dateM] },
    },
    {
      $lookup: {
        from: 'suppliers',
        localField: 'supplierid',
        foreignField: '_id',
        pipeline: [{ $match: { $and: [searchMatch] } }],
        as: 'supplierdata',
      },
    },
    {
      $unwind: '$supplierdata',
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productid',
        foreignField: '_id',
        as: 'productData',
      },
    },
    {
      $unwind: '$productData',
    },
    {
      $lookup: {
        from: 'receivedstocks',
        localField: '_id',
        foreignField: 'callstatusId',
        as: 'receivedStock',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$receivedStock',
      },
    },
    {
      $project: {
        _id: 1,
        showWhs: 1,
        active: 1,
        StockReceived: { $ifNull: ['$receivedStock.status', '$StockReceived'] },
        archive: 1,
        productid: 1,
        supplierid: 1,
        confirmOrder: 1,
        confirmcallstatus: 1,
        confirmprice: 1,
        status: 1,
        exp_date: 1,
        Expdate: 1,
        orderType: 1,
        order_Type: 1,
        TotalAmount: 1,
        SuddenCreatedBy: 1,
        SuddenStatus: 1,
        date: 1,
        time: 1,
        OrderId: 1,
        supplierName: '$supplierdata.primaryContactName',
        Net_Amount: { $multiply: ['$confirmOrder', '$confirmprice'] },
        productData: '$productData.productTitle',
      },
    },
    // {
    //   $match: { searchMatch },
    // },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await CallStatus.aggregate([
    {
      $match: { $and: [dateM] },
    },
    {
      $lookup: {
        from: 'suppliers',
        localField: 'supplierid',
        foreignField: '_id',
        pipeline: [{ $match: { $and: [searchMatch] } }],
        as: 'supplierdata',
      },
    },
    {
      $unwind: '$supplierdata',
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productid',
        foreignField: '_id',
        as: 'productData',
      },
    },
    {
      $unwind: '$productData',
    },
    {
      $project: {
        _id: 1,
        showWhs: 1,
        active: 1,
        StockReceived: 1,
        archive: 1,
        productid: 1,
        supplierid: 1,
        confirmOrder: 1,
        confirmcallstatus: 1,
        confirmprice: 1,
        status: 1,
        exp_date: 1,
        orderType: 1,
        order_Type: 1,
        TotalAmount: 1,
        SuddenCreatedBy: 1,
        SuddenStatus: 1,
        date: 1,
        time: 1,
        OrderId: 1,
        supplierName: '$supplierdata.primaryContactName',
        Net_Amount: { $multiply: ['$confirmOrder', '$confirmprice'] },
        productData: '$productData.productTitle',
      },
    },
  ]);
  let totalss = await CallStatus.aggregate([
    {
      $match: {
        $and: [
          { StockReceived: { $eq: 'Pending' } },
          { confirmcallstatus: { $eq: 'Accepted' } },
          { SuddenStatus: { $eq: 'Approve' } },
        ],
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$created' } },
        count: { $sum: 1 },
      },
    },
  ]);
  return { values: values, total: total.length };
};

module.exports = {
  createCallStatus,
  getCallStatusById,
  updateCallStatusById,
  deleteCallStatusById,
  getProductAndSupplierDetails,
  getDataWithSupplierId,
  finishOrder,
  getCallstatusForSuddenOrders,
  suddenOrdersDisplay,
  getReportWithSupplierId,
  createCallStatus_suppierApp,
};
