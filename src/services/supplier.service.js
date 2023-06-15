const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const Supplier = require('../models/supplier.model');
const Supplierhistory = require('../models/supplier.update.history.mode');
const { Product } = require('../models/product.model');
const { ProductorderSchema } = require('../models/shopOrder.model');
const CallStatus = require('../models/callStatus');
const B2bBillStatus = require('../models/b2bbillStatus.model');
const Verfy = require('../config/supplierOtpVerify');
const Textlocal = require('../config/supplierRegisterOtp');
const { OTPModel } = require('../models/supplierRegisterOtp.model');
const bcrypt = require('bcryptjs');
const moment = require('moment');

const createSupplier = async (supplierBody) => {
  const check = await Supplier.findOne({ primaryContactNumber: supplierBody.primaryContactNumber });
  // //console.log(check)
  if (check) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Already Register this Number');
  }
  if (supplierBody.createdByStatus == 'By Supplier') {
    await Textlocal.Otp(supplierBody.primaryContactNumber);
    await Supplier.create(supplierBody);
    //console.log('OTP send successfully');
  } else {
    return Supplier.create(supplierBody);
  }
};

const already_Customer = async (body) => {
  const { mobileNumber } = body;
  const ewer = await Supplier.findOne({ primaryContactNumber: mobileNumber });
  if (!ewer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Mobile Number NOt Customer');
  }
  await Textlocal.Otp(mobileNumber);
  await Supplier.findOneAndUpdate(
    { primaryContactNumber: mobileNumber, createdByStatus: 'By Admin' },
    { passwordSet: true },
    { new: true }
  );
  return { message: 'Send OTP Successfully......' };
};

const otpVerify_Setpassword = async (body) => {
  // //console.log(body)
  const { OTP } = body;
  const data = await OTPModel.findOne({ OTP: OTP });
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'otp wrong');
  }
  const ewer = await Supplier.findOne({ primaryContactNumber: data.mobileNumber });
  return ewer;
};

const Supplier_setPassword = async (id, body) => {
  const { password, confirmpassword } = body;
  if (password != confirmpassword) {
    throw new ApiError(httpStatus.NOT_FOUND, 'confirmpassword wrong');
  }
  const salt = await bcrypt.genSalt(10);
  let password1 = await bcrypt.hash(password, salt);
  const data = await Supplier.findByIdAndUpdate({ _id: id }, { password: password1 }, { new: true });
  return data;
};

const UsersLogin = async (userBody) => {
  const { primaryContactNumber, password } = userBody;
  let userName = await Supplier.findOne({ primaryContactNumber: primaryContactNumber });
  let already = await Supplier.findOne({
    primaryContactNumber: primaryContactNumber,
    createdByStatus: 'By Admin',
    passwordSet: false,
  });
  if (already) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'set password');
  }
  if (!userName || userName.active == false) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Phone Number Not Registered (or) User Disable');
  } else {
    if (await userName.isPasswordMatch(password)) {
      //console.log('Password Macthed');
    } else {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Passwoed Doesn't Match");
    }
  }
  return userName;
};

const forgotPassword = async (body) => {
  // const { phoneNumber } = body;
  // await Textlocal.Otp(body);
  let users = await Supplier.findOne({ primaryContactNumber: body.primaryContactNumber });
  if (!users) {
    throw new ApiError(httpStatus.NOT_FOUND, 'user not Found');
  }
  let check = await Supplier.findOne({ primaryContactNumber: body.primaryContactNumber, active: false });
  if (check) {
    throw new ApiError(httpStatus.NOT_FOUND, 'user is disable');
  }
  await Textlocal.OtpForget(body.primaryContactNumber);
  return { message: 'Send OTP Successfully......' };
};

const getAllAppSupplier = async (id) => {
  return Supplier.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }, { approvedStatus: { $eq: 'Approved' } }, { active: { $eq: true } }],
      },
    },

    {
      $lookup: {
        from: 'callstatuses',
        localField: '_id',
        foreignField: 'supplierid',
        pipeline: [
          {
            $match: {
              $and: [{ order_Type: { $ne: 'Need' } }, { SuddenCreatedBy: { $eq: 'By Suplier' } }],
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
            $unwind: '$products',
          },
        ],
        as: 'callstatuses',
      },
    },
    {
      $unwind: '$callstatuses',
    },
    {
      $project: {
        primaryContactName: 1,
        product: '$callstatuses.products.productTitle',
        calstatusId: '$callstatuses.calstatusId',
        showWhs: '$callstatuses.showWhs',
        StockReceived: '$callstatuses.StockReceived',
        productid: '$callstatuses.productid',
        supplierid: '$callstatuses.supplierid',
        confirmOrder: '$callstatuses.confirmOrder',
        confirmcallstatus: '$callstatuses.confirmcallstatus',
        confirmprice: '$callstatuses.confirmprice',
        status: '$callstatuses.status',
        exp_date: '$callstatuses.exp_date',
        orderType: '$callstatuses.orderType',
        order_Type: '$callstatuses.order_Type',
        SuddenCreatedBy: '$callstatuses.SuddenCreatedBy',
        SuddenStatus: '$callstatuses.SuddenStatus',
        date: '$callstatuses.date',
        time: '$callstatuses.time',
        created: '$callstatuses.created',
        OrderId: '$callstatuses.OrderId',
      },
    },
    { $sort: { date: -1, time: -1 } },
  ]);
};

// admin approved-voluntry,approve

const getAllAppSupplierApproved = async (id) => {
  return Supplier.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }, { approvedStatus: { $eq: 'Approved' } }],
      },
    },

    {
      $lookup: {
        from: 'callstatuses',
        localField: '_id',
        foreignField: 'supplierid',
        pipeline: [
          {
            $match: {
              $or: [
                {
                  $and: [
                    { SuddenStatus: { $eq: 'Approve' } },
                    { order_Type: { $eq: 'Need' } },
                    { SuddenCreatedBy: { $eq: 'By Suplier' } },
                  ],
                },
                {
                  $and: [{ SuddenStatus: { $eq: 'Approve' } }, { SuddenCreatedBy: { $eq: 'By Admin' } }],
                },
                {
                  $and: [{ SuddenStatus: { $eq: 'Approve' } }, { SuddenCreatedBy: { $eq: 'By Supplier Executive' } }],
                },
              ],
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
            $unwind: '$products',
          },
          {
            $project: {
              _id: 1,
              product: '$products.productTitle',
              calstatusId: 1,
              showWhs: 1,
              StockReceived: 1,
              productid: 1,
              supplierid: 1,
              confirmOrder: 1,
              confirmcallstatus: 1,
              confirmprice: 1,
              status: 1,
              exp_date: 1,
              orderType: 1,
              order_Type: 1,
              SuddenCreatedBy: 1,
              SuddenStatus: 1,
              date: 1,
              time: 1,
              created: 1,
              OrderId: 1,
            },
          },
          { $sort: { date: -1, time: -1 } },
        ],
        as: 'callstatuses',
      },
    },
    {
      $project: {
        primaryContactName: 1,
        approvedStatus: 1,
        callstatuses: '$callstatuses',
      },
    },
  ]);
};

const getAllAppOnly_Supplier = async (id) => {
  let products = [];
  let products1 = [];
  const data = await Supplier.findById(id);
  data.productDealingWith.forEach(async (e) => {
    // const product = await Product.findById(e)
    products1.push(e);
  });
  for (let i = 0; i < products1.length; i++) {
    const product = await Product.findById(products1[i]);
    products.push(product.productTitle);
  }

  return { data: data, products };
  // return Supplier.aggregate([
  //   {
  //     $match: {
  //       $and: [{ _id: { $eq: id } }],
  //     },
  //   },

  // ]);
};

const getAllAppOnly_Supplier_Update = async (id, updateBody) => {
  //console.log(updateBody);
  const data = await Supplier.findByIdAndUpdate({ _id: id }, updateBody, { new: true });
  return data;
};

const getAllSupplier = async () => {
  return Supplier.find({ active: true });
};

const getAllDisableSupplier = async () => {
  return await Supplier.find({ active: { $eq: false } });
};

const getDisableSupplierById = async (id) => {
  const supplier = Supplier.findById(id);
  if (!supplier || supplier.active === false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Supplier Not  Found OR Suplier Not Disabled');
  }
  return supplier;
};

const getproductsWithSupplierId = async (supplierId, date) => {
  let supplier = await Supplier.findById(supplierId);
  let product = [];
  let soproductid = [];
  let soproduct = [];
  let productsId = supplier.productDealingWith;
  let productorders = await CallStatus.find({ date: date, supplierid: { $eq: supplierId } });
  let productid = productorders.forEach((e) => {
    soproductid.push(e.productid);
  });
  for (let i = 0; i <= productsId.length; i++) {
    for (let j = 0; j <= soproductid.length; j++) {
      if (productsId[i] == soproductid[j]) {
        let products = await Product.findById(productsId[i]);
        let soproducts = await CallStatus.findOne({
          supplierid: supplierId,
          date: { $eq: date },
          productid: { $eq: productsId[i] },
        });
        //console.log(soproducts);
        product.push(products);
        soproduct.push(soproducts);
      }
    }
  }
  return { product: product, soproduct: soproduct };
};

const getproductfromCallStatus = async (date) => {
  return Supplier.aggregate([
    {
      $lookup: {
        from: 'callstatuses',
        let: { supplierid: '$_id' },
        pipeline: [
          { $match: { $expr: { $and: [{ $eq: ['$$supplierid', '$supplierid'] }] } } },
          { $match: { date: date } },
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
              qtyOffered: 1,
              strechedUpto: 1,
              price: 1,
              date: 1,
              callstatus: 1,
              status: 1,
            },
          },
        ],
        as: 'Supplierdata',
      },
    },
  ]);
};

const getSupplierAmountDetailsForSupplierBills = async (page) => {
  let values = await Supplier.aggregate([
    {
      $lookup: {
        from: 'callstatuses',
        localField: '_id',
        foreignField: 'supplierid',
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $gt: ['$PendingTotalConfirmedAmt', 0] }, { $eq: ['$stockStatus', 'Billed'] }],
              },
            },
          },
        ],
        as: 'callstatusData',
      },
    },
    {
      $project: {
        TotalPendingAmt: { $sum: '$callstatusData.PendingTotalConfirmedAmt' },
        TotalPendingBills: { $size: '$callstatusData.PendingTotalConfirmedAmt' },
        supplierid: '$callstatusData.supplierid',
        primaryContactName: 1,
        _id: 1,
      },
    },
  ]);
  return values;
};

const getSupplierPaymentDetailsBySupplierId = async (id) => {
  let values = B2bBillStatus.aggregate([
    {
      $match: {
        $and: [{ supplierId: { $eq: id } }],
      },
    },
  ]);
  return values;
};

const updateDisableSupplierById = async (id) => {
  let supplier = await getDisableSupplierById(id);
  if (!supplier) {
    throw new ApiError(httpStatus.NOT_FOUND, 'supplier not found');
  }
  supplier = await Supplier.findByIdAndUpdate({ _id: id }, { active: false, archive: true }, { new: true });
  return supplier;
};

const productDealingWithsupplier = async (id) => {
  let currentDate = moment().format('YYYY-MM-DD');
  let currentDateorder = moment().format('DD-MM-YYYY');
  let Suppliers = await Supplier.aggregate([
    {
      $match: {
        productDealingWith: {
          $eq: id,
        },
      },
    },
    {
      $lookup: {
        from: 'products',
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', id], // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
              },
            },
          },
        ],
        as: 'products',
      },
    },
    {
      $unwind: '$products',
    },
    {
      $lookup: {
        from: 'status',
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$productid', id], // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
              },
            },
          },
          {
            $match: {
              $expr: {
                $eq: ['$date', currentDate], // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
              },
            },
          },
        ],
        as: 'productstatus',
      },
    },
    {
      $unwind: '$productstatus',
    },
    {
      $lookup: {
        from: 'callstatuses',
        localField: '_id',
        foreignField: 'supplierid',
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$date', currentDate], // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
              },
            },
          },
          {
            $match: {
              $expr: {
                $eq: ['$productid', id], // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
              },
            },
          },
          {
            $match: {
              $expr: {
                $ne: ['$orderType', 'sudden'], // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
              },
            },
          },
        ],
        as: 'callStatus',
      },
    },
  ]);
  let today = moment().format('YYYY-MM-DD');
  let product = await Product.aggregate([
    { $match: { _id: { $eq: id } } },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'productid',
        pipeline: [
          { $match: { date: { $eq: today } } },
          { $group: { _id: null, Qty: { $sum: '$quantity' }, Avg: { $avg: '$priceperkg' } } },
        ],
        as: 'productorders',
      },
    },
    {
      $unwind: {
        path: '$productorders',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'estimatedorders',
        localField: '_id',
        foreignField: 'productId',
        pipeline: [{ $match: { date: { $eq: today } } }],
        as: 'estimatedorders',
      },
    },
    {
      $unwind: {
        path: '$estimatedorders',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        productTitle: 1,
        estimatedQTY: '$estimatedorders.closedQty',
        liveStock: '$productorders.Qty',
      },
    },
  ]);

  return { Supplier: Suppliers, product: product[0] };
};

const getSupplierDataByProductId = async (id) => {
  let values = await Supplier.aggregate([
    {
      $match: {
        productDealingWith: {
          $eq: id,
        },
      },
    },
  ]);
  return values;
};

const getSupplierWithApprovedstatus = async (date) => {
  return Supplier.aggregate([
    {
      $lookup: {
        from: 'callstatuses',
        localField: '_id',
        foreignField: 'supplierid',
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$date', date], // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
              },
            },
          },

          {
            $lookup: {
              from: 'status',
              localField: 'productid',
              foreignField: 'productid',
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$date', date], // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
                    },
                  },
                  $match: {
                    $expr: {
                      $eq: ['$status', 'Approved'], // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
                    },
                  },
                },
              ],
              as: 'status',
            },
          },
          {
            $unwind: '$status',
          },
        ],
        as: 'callstatusData',
        // totalAmount: { $sum: '$phApproved' }
      },
    },
  ]);
};

const getSupplierById = async (id) => {
  let values = [];
  let supplier = await Supplier.findById(id);
  for (let i = 0; i < supplier.productDealingWith.length; i++) {
    let ff = await Product.findById(supplier.productDealingWith[i]);
    values.push(ff);
  }
  //console.log(values);
  return {
    supplier: supplier,
    products: values,
  };
};

const updateSupplierById = async (supplierId, updateBody) => {
  let supplier = await Supplier.findById(supplierId);
  //console.log(supplier);
  if (!supplier) {
    throw new ApiError(httpStatus.NOT_FOUND, 'supplier not found');
  }
  supplier = await Supplier.findByIdAndUpdate({ _id: supplierId }, updateBody, { new: true });
  return supplier;
};

const deleteSupplierById = async (supplierId) => {
  let supplier = await Supplier.findById(supplierId);
  if (!supplier) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Supplier not found');
  }
  (supplier.active = false), (supplier.archive = true);
  await supplier.save();
  return supplier;
};

const recoverById = async (supplierId) => {
  const supplier = await Supplier.findById(supplierId);
  if (!supplier) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Supplier not found');
  }
  (supplier.active = true), (supplier.archive = false), await supplier.save();
  return supplier;
};

const getSupplierWith_Advanced = async () => {
  let values = await Supplier.aggregate([
    {
      $match: { approvedStatus: 'Approved' },
    },
    {
      $lookup: {
        from: 'supplierraisedunbilleds',
        localField: '_id',
        foreignField: 'supplierId',
        as: 'raised',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$raised',
      },
    },
    {
      $lookup: {
        from: 'supplierunbilleds',
        localField: '_id',
        foreignField: 'supplierId',
        as: 'supplierunbilled',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$supplierunbilled',
      },
    },
    {
      $lookup: {
        from: 'supplierunbilledhistories',
        localField: '_id',
        foreignField: 'supplierId',
        pipeline: [{ $group: { _id: null, TotalAmount: { $sum: '$un_Billed_amt' } } }],
        as: 'supplierunbilledhistory',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$supplierunbilledhistory',
      },
    },
    {
      $project: {
        _id: 1,
        secondaryContactName: 1,
        primaryContactName: 1,
        primaryContactNumber: 1,
        primaryContactName: 1,
        tradeName: 1,
        raised: { $ifNull: ['$raised.raised_Amt', 0] },
        unbilled: { $ifNull: ['$supplierunbilled.un_Billed_amt', 0] },
        RaisedAmounts: {
          $subtract: [{ $ifNull: ['$raised.raised_Amt', 0] }, { $ifNull: ['$supplierunbilledhistory.TotalAmount', 0] }],
        },
      },
    },
    {
      $project: {
        _id: 1,
        secondaryContactName: 1,
        primaryContactName: 1,
        primaryContactNumber: 1,
        primaryContactName: 1,
        tradeName: 1,
        raised: 1,
        unbilled: 1,
        RaisedAmount: {
          $cond: { if: { $gte: ['$RaisedAmounts', 0] }, then: '$RaisedAmounts', else: 0 },
        },
      },
    },
  ]);
  return values;
};

// supplier third versions

const createSuppliers = async (body, userId) => {
  let values = {
    ...body,
    ...{
      created: moment(),
      createdBy: userId,
      verifiedUser: userId,
      lat: body.lat,
      long: body.long,
      verifyStatus: 'verified',
      verifiedDate: moment().format('YYYY-MM-DD'),
      verifiedTime: moment().format('HHmmss'),
      verifiedCreated: moment(),
      SuddenCreatedBy: 'By Supplier Executive',
    },
  };
  const validate = await Supplier.find({ primaryContactNumber: body.primaryContactNumber });
  //console.log(validate.length);
  let len = validate.length;
  if (len > 0) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Mobile Number Already Registered');
  } else {
    const create = await Supplier.create(values);
    return create;
  }
};

const getSupplierthird = async (key, page) => {
  let keys = { active: { $eq: true } };
  if (key != 'null') {
    keys = {
      $or: [
        { primaryContactName: { $regex: key, $options: 'i' } },
        { secondaryContactNumber: { $regex: key, $options: 'i' } },
        { primaryContactNumber: { $regex: key, $options: 'i' } },
        { secondaryContactName: { $regex: key, $options: 'i' } },
        { tradeName: { $regex: key, $options: 'i' } },
        { DoorNo: { $regex: key, $options: 'i' } },
      ],
    };
  }
  let values = await Supplier.aggregate([
    {
      $match: { $and: [keys] },
    },
    {
      $sort: { verifyStatus: 1 },
    },
    {
      $skip: 10 * page,
    },
    {
      $limit: 10,
    },
  ]);
  let total = await Supplier.aggregate([
    {
      $match: { $and: [keys] },
    },
  ]);
  return { values: values, total: total.length };
};

const updateSupplierthird = async (id, updatebody, userId) => {
  let values = await Supplier.findById(id);
  let values1 = { ...updatebody, ...{ supplierId: id, created: moment() } };
  let body = { ...updatebody, ...{ verifiedUser: userId } };
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'supplier Not found');
  }
  values = await Supplier.findByIdAndUpdate({ _id: id }, body, { new: true });
  await Supplierhistory.create({ ...values, ...{ supplierId: id } });
  return values;
};

const UpdateSupplierByIdThird = async (id, updateBody) => {
  let values = await Supplier.findByIdAndUpdate(id);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Supplier Not Found');
  }
  values = await Supplier.findByIdAndUpdate({ _id: id }, updateBody, { new: true });
  return values;
};

const getSupplierDetails = async (id) => {
  let Id = id.toString();
  let value = [];
  //console.log(Id);
  let values = await Supplier.findById(Id);
  //console.log(values);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'supplier Not Found');
  }
  for (let i = 0; i < values.productDealingWith.length; i++) {
    let ff = await Product.findById(values.productDealingWith[i]);
    value.push(ff);
  }
  return { values: values, products: value };
};

const Store_lat_long = async (id, body, userId) => {
  const { lat, long, verifyStatus } = body;
  let values = await Supplier.findById(id);
  if (!values || values.active === false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Suppier Not_Found');
  }
  values = await Supplier.findByIdAndUpdate(
    { _id: id },
    {
      lat: lat,
      long: long,
      verifyStatus: verifyStatus,
      verifiedUser: userId,
      verifiedDate: moment().format('YYYY-MM-DD'),
      verifiedTime: moment().format('HHmmss'),
      verifiedCreated: moment(),
    },
    { new: true }
  );
  return values;
};

const getSupplierWithverifiedUser = async (key, date, page) => {
  let keys = { active: { $eq: true } };
  let dateMatch = { active: { $eq: true } };
  if (key != 'null') {
    keys = {
      $or: [
        { primaryContactName: { $regex: key, $options: 'i' } },
        { secondaryContactNumber: { $regex: key, $options: 'i' } },
        { primaryContactNumber: { $regex: key, $options: 'i' } },
        { secondaryContactName: { $regex: key, $options: 'i' } },
        { tradeName: { $regex: key, $options: 'i' } },
      ],
    };
  }
  if (date != 'null') {
    dateMatch = { date: date };
  }
  let values = await Supplier.aggregate([
    {
      $addFields: {
        date: { $dateToString: { format: '%Y-%m-%d', date: '$verifiedCreated' } },
      },
    },
    {
      $match: { $and: [keys, dateMatch] },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'verifiedUser',
        foreignField: '_id',
        as: 'users',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$users',
      },
    },
    {
      $project: {
        _id: 1,
        productDealingWith: 1,
        categoryDealingWith: 1,
        businessType: 1,
        DoorNo: 1,
        image: 1,
        tradeName: 1,
        ShopNo: 1,
        ShopSize: 1,
        productSold: 1,
        primaryContactName: 1,
        primaryContactNumber: 1,
        productSold: 1,
        pinCode: 1,
        countries: 1,
        RegisteredAddress: 1,
        gstNo: 1,
        email: 1,
        secondaryContactName: 1,
        secondaryContactNumber: 1,
        GateEntryconvenience: 1,
        lat: 1,
        long: 1,
        verifyStatus: 1,
        verifiedUser: 1,
        verifiedCreated: 1,
        verifiedDate: 1,
        date: 1,
        verifiedUserName: '$users.name',
      },
    },
    {
      $sort: { verifyStatus: 1 },
    },
    {
      $skip: 10 * page,
    },
    {
      $limit: 10,
    },
  ]);
  let total = await Supplier.aggregate([
    {
      $addFields: {
        date: { $dateToString: { format: '%Y-%m-%d', date: '$verifiedCreated' } },
      },
    },
    {
      $match: { $and: [keys, dateMatch] },
    },
    {
      $match: { $and: [keys] },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'verifiedUser',
        foreignField: '_id',
        as: 'users',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$users',
      },
    },
    {
      $project: {
        _id: 1,
        productDealingWith: 1,
        image: 1,
        tradeName: 1,
        ShopNo: 1,
        ShopSize: 1,
        productSold: 1,
        primaryContactName: 1,
        secondaryContactName: 1,
        secondaryContactNumber: 1,
        GateEntryconvenience: 1,
        lat: 1,
        long: 1,
        verifyStatus: 1,
        verifiedUser: 1,
        verifiedCreated: 1,
        verifiedDate: 1,
        verifiedUserName: '$users.name',
      },
    },
  ]);
  return { values: values, total: total.length };
};

const checkMobileExestOrNot = async (number) => {
  let values = await Supplier.find({ primaryContactNumber: number });
  let len = values.length;
  //console.log(len);
  if (len > 0) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Mobile Already Exist');
  }
  return { Message: 'Success' };
};

const ValidateMobileNumber = async (id, phone) => {
  let values = await Supplier.findById(id);
  let values1 = await Supplier.findOne({ primaryContactNumber: phone });
  if (values1 !== null) {
    if (values.primaryContactNumber !== values1.primaryContactNumber) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Already Register');
    }
  }
  return values;
};

const checkApproved = async (id) => {
  const data = await Supplier.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'user not found');
  }
  return data;
};

const filter_supplier = async (id) => {
  const data = await Supplier.aggregate([
    {
      $match: {
        $or: [
          { primaryContactName: { $regex: key, $options: 'i' } },
          { secondaryContactNumber: { $regex: key, $options: 'i' } },
          { primaryContactNumber: { $regex: key, $options: 'i' } },
          { secondaryContactName: { $regex: key, $options: 'i' } },
          { tradeName: { $regex: key, $options: 'i' } },
          { DoorNo: { $regex: key, $options: 'i' } },
        ]
      }
    },
    {
      $limit: 10,
    },
  ])
  return data;
};

const get_registered_supplier = async (id) => {
  const data = await Supplier.aggregate([
    {
      $match: {
        $and: [
          { password: { $ne: null } },
        ]
      }
    },
  ])
  return data;
};
module.exports = {
  createSupplier,
  updateSupplierById,
  getAllSupplier,
  getSupplierWithApprovedstatus,
  productDealingWithsupplier,
  getproductfromCallStatus,
  updateDisableSupplierById,
  getSupplierById,
  getDisableSupplierById,
  deleteSupplierById,
  recoverById,
  getproductsWithSupplierId,
  getAllDisableSupplier,
  getSupplierAmountDetailsForSupplierBills,
  getSupplierPaymentDetailsBySupplierId,
  getSupplierDataByProductId,
  getSupplierWith_Advanced,
  UsersLogin,
  otpVerify_Setpassword,
  Supplier_setPassword,
  forgotPassword,
  getAllAppSupplier,
  createSuppliers,
  getSupplierthird,
  updateSupplierthird,
  getSupplierDetails,
  getAllAppOnly_Supplier,
  getAllAppOnly_Supplier_Update,
  getAllAppSupplierApproved,
  Store_lat_long,
  getSupplierWithverifiedUser,
  checkMobileExestOrNot,
  UpdateSupplierByIdThird,
  ValidateMobileNumber,
  already_Customer,
  checkApproved,
  filter_supplier,
  get_registered_supplier
};
