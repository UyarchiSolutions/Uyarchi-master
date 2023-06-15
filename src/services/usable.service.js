const httpStatus = require('http-status');
const { usableStock, Stockhistory } = require('../models/usableStock.model');
const ApiError = require('../utils/ApiError');
const moment = require('moment');
const { Product, Stock, ConfirmStock, LoadingExecute, BillRaise, ManageBill, ShopList } = require('../models/product.model');

const createusableStock = async (body) => {
  let usable = await usableStock.create(body);
  return usable;
};

const getAllusableStock = async () => {
  return await usableStock.find();
};

const getusableStockById = async (id) => {
  let usable = await usableStock.findById(id);
  if (!usable || usable.active == false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Usable Stock Not Found');
  }
  return usable;
};

const updateusableStockbyId = async (id, updateBody) => {
  let usable = await usableStock.findById(id);
  if (!usable || usable.active == false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Usable Stock Not Found');
  }
  usable = await usableStock.findByIdAndUpdate({ _id: id }, updateBody, { new: true });
  return usable;
};

const getAssignStockbyId = async (id) => {
  return await usableStock.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'assignstocks',
        localField: '_id',
        foreignField: 'usablestockId',
        pipeline: [{ $match: { type: 'b2b' } }, { $group: { _id: null, Total: { $sum: '$quantity' } } }],
        as: 'b2bAssign',
      },
    },
    {
      $lookup: {
        from: 'assignstocks',
        localField: '_id',
        foreignField: 'usablestockId',
        pipeline: [{ $match: { type: 'b2c' } }, { $group: { _id: null, Total: { $sum: '$quantity' } } }],
        as: 'b2cAssign',
      },
    },
    {
      $lookup: {
        from: 'assignstocks',
        localField: '_id',
        foreignField: 'usablestockId',
        as: 'assignHistory',
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
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
        b2cassignTotal: { $sum: '$b2cAssign.Total' },
        b2bassignTotal: { $sum: '$b2bAssign.Total' },
        b2bStock: 1,
        b2cStock: 1,
        productId: 1,
        date: 1,
        time: 1,
        FQ1: 1,
        FQ2: 1,
        FQ3: 1,
        totalStock: 1,
        wastage: 1,
        ProductName: '$productsdata.productTitle',
        assignHistory: '$assignHistory',
      },
    },
  ]);
};

const getStocks = async () => {
  const today = moment().format('DD-MM-YYYY');
  //console.log(today);
  const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
  const Today = moment().format('YYYY-MM-DD');
  let values = await Product.aggregate([
    {
      $lookup: {
        from: 'usablestocks',
        localField: '_id',
        foreignField: 'productId',
        pipeline: [{ $match: { date: today } }],
        as: 'stocks',
      },
    },
    {
      $unwind: { path: '$stocks', preserveNullAndEmptyArrays: true },
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
                    $and: [{ delivery_type: { $eq: 'NDD' } }, { date: { $eq: yesterday } }],
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
            $group: {
              _id: null,
              NDD: { $sum: { $multiply: ['$finalQuantity', '$packKg'] } },
            },
          },
        ],
        as: 'productorder',
      },
    },
    {
      $unwind: {
        path: '$productorder',
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
                    $and: [{ delivery_type: { $eq: 'IMD' } }, { status: { $ne: 'Rejected' } }, { date: { $eq: Today } }],
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
            $group: {
              _id: null,
              IMD: { $sum: { $multiply: ['$finalQuantity', '$packKg'] } },
            },
          },
        ],
        as: 'Imd',
      },
    },
    {
      $unwind: {
        path: '$Imd',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        productTitle: 1,
        availableStocks: '$stocks.totalStock',
        TodayDeliveryStock: '$productorder.NDD',
        Imd: '$Imd.IMD',
      },
    },
  ]);
  return values;
};

const getstockDetails = async (id) => {
  let today = moment().format('YYYY-MM-DD');
  let value = await usableStock.aggregate([
    {
      $sort: { created: -1 },
    },
    {
      $match: {
        productId: { $eq: id },
      },
    },
    {
      $addFields: {
        todaydate: { $dateToString: { format: '%Y-%m-%d', date: '$created' } },
      },
    },
    {
      $addFields: {
        yesterdate: {
          $dateSubtract: {
            startDate: '$created',
            unit: 'day',
            amount: 1,
          },
        },
      },
    },
    {
      $addFields: {
        yesterday: { $dateToString: { format: '%Y-%m-%d', date: '$yesterdate' } },
      },
    },
    {
      $addFields: {
        yesterdate: {
          $dateSubtract: {
            startDate: '$created',
            unit: 'day',
            amount: 1,
          },
        },
      },
    },
    {
      $addFields: {
        yesterday: { $dateToString: { format: '%Y-%m-%d', date: '$yesterdate' } },
      },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: 'todaydate',
        foreignField: 'date',
        pipeline: [
          {
            $match: {
              productid: id,
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
                    delivery_type: 'IMD',
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
            $group: {
              _id: null,
              Imd: { $sum: { $multiply: ['$finalQuantity', '$packKg'] } },
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
    // {
    //   $unwind: '$productorderclones',
    // },

    {
      $lookup: {
        from: 'productorderclones',
        localField: 'yesterday',
        foreignField: 'date',
        pipeline: [
          {
            $match: {
              productid: id,
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
                    delivery_type: 'NDD',
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
            $group: {
              _id: null,
              NDD: { $sum: { $multiply: ['$finalQuantity', '$packKg'] } },
            },
          },
        ],
        as: 'Ndd',
      },
    },
    {
      $unwind: {
        path: '$Ndd',
        preserveNullAndEmptyArrays: true,
      },
    },
    // {
    //   $unwind: '$Ndd',
    // },
    {
      $lookup: {
        from: 'pettystockmodels',
        localField: 'date',
        foreignField: 'date',
        pipeline: [
          {
            $match: { productId: id },
          },
          {
            $group: { _id: null, pettyStock: { $sum: '$pettyStock' } },
          },
        ],
        as: 'pettyStock',
      },
    },
    {
      $unwind: {
        path: '$pettyStock',
        preserveNullAndEmptyArrays: true,
      },
    },

    // Today Delivered Stock Work Flow with Ndd And Imd

    {
      $lookup: {
        from: 'productorderclones',
        localField: 'yesterday',
        foreignField: 'date',
        pipeline: [
          {
            $match: {
              productid: id,
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
                    $and: [{ delivery_type: 'NDD' }, { status: 'Delivered' }],
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
            $group: {
              _id: null,
              delivered: { $sum: { $multiply: ['$finalQuantity', '$packKg'] } },
            },
          },
        ],
        as: 'Ndd_delivered',
      },
    },
    {
      $unwind: {
        path: '$Ndd_delivered',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: 'todaydate',
        foreignField: 'date',
        pipeline: [
          {
            $match: {
              productid: id,
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
                    $and: [{ delivery_type: 'IMD' }, { status: 'Delivered' }],
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
            $group: {
              _id: null,
              ImdDelivered: { $sum: { $multiply: ['$finalQuantity', '$packKg'] } },
            },
          },
        ],
        as: 'Imd_delivered',
      },
    },
    {
      $unwind: {
        path: '$Imd_delivered',
        preserveNullAndEmptyArrays: true,
      },
    },

    // Rejected Stocks

    {
      $lookup: {
        from: 'productorderclones',
        localField: 'todaydate',
        foreignField: 'date',
        pipeline: [
          {
            $match: {
              productid: id,
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
                    $and: [{ status: 'Rejected' }],
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
            $group: {
              _id: null,
              Rejected: { $sum: { $multiply: ['$finalQuantity', '$packKg'] } },
            },
          },
        ],
        as: 'rejectedStock',
      },
    },
    {
      $unwind: {
        path: '$rejectedStock',
        preserveNullAndEmptyArrays: true,
      },
    },

    // Un Delivered stocks
    {
      $lookup: {
        from: 'productorderclones',
        localField: 'todaydate',
        foreignField: 'date',
        pipeline: [
          {
            $match: {
              productid: id,
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
                    $and: [{ status: 'UnDelivered' }],
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
            $group: {
              _id: null,
              unDelivered: { $sum: { $multiply: ['$finalQuantity', '$packKg'] } },
            },
          },
        ],
        as: 'UnDelivered_Stocks',
      },
    },
    {
      $unwind: {
        path: '$UnDelivered_Stocks',
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: 'returnstocks',
        localField: 'todaydate',
        foreignField: 'date',
        pipeline: [
          { $match: { productId: id } },
          {
            $group: {
              _id: null,
              return: { $sum: '$actualStock' },
            },
          },
        ],
        as: 'returnstocks',
      },
    },
    {
      $unwind: {
        path: '$returnstocks',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        closingStock: 1,
        oldStock: 1,
        openingStock: 1,
        active: 1,
        archive: 1,
        b2bStock: 1,
        b2cStock: 1,
        productId: 1,
        date: 1,
        time: 1,
        totalStock: 1,
        wastage: 1,
        todaydate: 1,
        yesterdate: 1,
        yesterday: 1,
        imd: '$productorderclones.Imd',
        pettyStock: '$pettyStock.pettyStock',
        Imd_delivered: '$Imd_delivered.ImdDelivered',
        UnDelivered_Stocks: '$UnDelivered_Stocks.unDelivered',
        Ndd_delivered: '$Ndd_delivered.delivered',
        rejectedStock: '$rejectedStock.Rejected',
        returnstocks: '$returnstocks.return',
        Ndd: '$Ndd.NDD',
        created: 1,
      },
    },
  ]);
  let productDetails = await Product.findById(id);
  return { value: value, productDetails: productDetails };
};

const updatestcokDetails = async (body) => {
  //console.log(body);
  const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
  const tomorrow = moment().subtract(-1, 'days').format('DD-MM-YYYY');
  const todayfor = moment().format('DD-MM-YYYY');
  body.product.forEach(async (e) => {
    //console.log(e);
    let NSFQ1 = e.NSFQ1 == null || e.NSFQ1 == '' ? 0 : e.NSFQ1;
    let NSFQ2 = e.NSFQ2 == null || e.NSFQ2 == '' ? 0 : e.NSFQ2;
    let NSFQ3 = e.NSFQ3 == null || e.NSFQ3 == '' ? 0 : e.NSFQ3;
    let NSFW_Wastage = e.NSFW_Wastage == null || e.NSFW_Wastage == '' ? 0 : e.NSFW_Wastage;
    //console.log(NSFW_Wastage);
    // let wastedImageFile = e.wastedImageFile == null ? 0 : e.wastedImageFile;
    let Pid = e.Pid;
    let total = NSFQ1 + NSFQ2 + NSFQ3;
    let usablestocks = await usableStock.findOne({ productId: Pid, date: todayfor });
    if (usablestocks) {
      // //console.log(usablestocks, 'asd')
      usablestocks = await usableStock.findByIdAndUpdate(
        { _id: usablestocks._id },
        { closingStock: total, status: 'Closed', closingWastage: NSFW_Wastage, closingTime: moment() },
        { new: true }
      );
      // await usablestocks.create({
      //   b2cStock: 0,
      //   b2bStock: 0,
      //   date: tomorrow,
      //   created: moment().subtract(-1, 'days'),
      //   FQ1: NSFQ1,
      //   FQ2: NSFQ2,
      //   FQ3: NSFQ3,
      //   totalStock: total,
      //   openingStock: totalStock,
      //   openingStock: totalStock,
      // })
    }
    // //console.log(usablestocks)
  });
  // body.product.forEach((res)=>{
  //   // //console.log(res.wastedImageFile)
  //   res.wastedImageFile.forEach((s)=>{
  //       //console.log(s.res)
  //   })
  // })
  return { success: true };
};

const updatestcokDetails_Opening = async (body) => {
  //console.log(body);
  const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
  const tomorrow = moment().subtract(-1, 'days').format('DD-MM-YYYY');
  const todayfor = moment().format('DD-MM-YYYY');
  const time = moment().format('hhmmss');
  body.product.forEach(async (e) => {
    // //console.log(e)
    let NSFQ1 = e.NSFQ1 == null || e.NSFQ1 == '' ? 0 : e.NSFQ1;
    let NSFQ2 = e.NSFQ2 == null || e.NSFQ2 == '' ? 0 : e.NSFQ2;
    let NSFQ3 = e.NSFQ3 == null || e.NSFQ3 == '' ? 0 : e.NSFQ3;
    let NSFW_Wastage = e.NSFW_Wastage == null || e.NSFW_Wastage == '' ? 0 : e.NSFW_Wastage;
    let Pid = e.Pid;
    let total = NSFQ1 + NSFQ2 + NSFQ3;
    let groupstatus = await usableStock.create({
      b2cStock: 0,
      b2bStock: 0,
      date: todayfor,
      created: moment(),
      time: time,
      FQ1: NSFQ1,
      FQ2: NSFQ2,
      FQ3: NSFQ3,
      totalStock: total,
      openingStock: total,
      wastage: NSFW_Wastage,
      status: 'Opening',
      productId: Pid,
    });
    await Stockhistory.create({
      usableStock: groupstatus._id,
      FQ1: NSFQ1,
      FQ2: NSFQ2,
      FQ3: NSFQ3,
      wastage: NSFW_Wastage,
      date: todayfor,
      time: time,
      created: moment(),
    });
  });
  return { success: true };
};

const updatestcokDetails_Random = async (body) => {
  //console.log(body);
  const today = moment().format('DD-MM-YYYY');
  const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
  const tomorrow = moment().subtract(-1, 'days').format('DD-MM-YYYY');
  const todayfor = moment().format('DD-MM-YYYY');
  const time = moment().format('hhmmss');
  body.product.forEach(async (e) => {
    //console.log(e);
    let NSFQ1 = e.NSFQ1 == null || e.NSFQ1 == '' ? 0 : e.NSFQ1;
    let NSFQ2 = e.NSFQ2 == null || e.NSFQ2 == '' ? 0 : e.NSFQ2;
    let NSFQ3 = e.NSFQ3 == null || e.NSFQ3 == '' ? 0 : e.NSFQ3;
    let NSFW_Wastage = e.NSFW_Wastage == null || e.NSFW_Wastage == '' ? 0 : e.NSFW_Wastage;
    let Pid = e.Pid;
    let total = NSFQ1 + NSFQ2 + NSFQ3;
    let usableStockss = await usableStock.findOne({ productId: e.Pid, date: today });
    let randomarray = usableStockss.randomStock_History;
    usableStockss.random_stock = false;
    usableStockss.save();
    // await Stockhistory.create({
    //   usableStock: groupstatus._id,
    //   FQ1: NSFQ1,
    //   FQ2: NSFQ2,
    //   FQ3: NSFQ3,
    //   wastage: NSFW_Wastage,
    //   date: todayfor,
    //   time: time,
    //   created: moment(),
    // })
  });
  return { success: true };
};

const updaterandom_product = async (body, userId) => {
  const today = moment().format('DD-MM-YYYY');
  body.forEach(async (e) => {
    let usableStockss = await usableStock.findOne({ productId: e.Pid, date: today });
    let randomarray = usableStockss.randomStock_History;
    randomarray.push({
      date: moment().format('YYYY-MM-DD'),
      time: moment().format('hh:mm a'),
      user: userId,
    });
    usableStockss.random_stock = true;
    usableStockss.save();
  });
  return { updated: 'successfull' };
};
module.exports = {
  createusableStock,
  getAllusableStock,
  getusableStockById,
  updateusableStockbyId,
  getAssignStockbyId,
  getStocks,
  getstockDetails,
  updatestcokDetails,
  updatestcokDetails_Opening,
  updaterandom_product,
  updatestcokDetails_Random,
};
