const httpStatus = require('http-status');
const Estimated = require('../models/estimatedOrders.mode');
const { ProductorderClone } = require('../models/shopOrder.model');
const { Product, Stock, ConfirmStock, LoadingExecute, BillRaise, ManageBill, ShopList } = require('../models/product.model');
const ApiError = require('../utils/ApiError');
const moment = require('moment');

const createEstimatedOrders = async (body) => {
  let estimate = await Estimated.create(body);
  await ProductorderClone.updateMany({ productid: body.productId, date: body.date }, { $set: { preOrderClose: true } });
  return estimate;
};

const getEstimatedByDate = async (date, page) => {
  let today = moment().format('YYYY-MM-DD');
  let values = await Product.aggregate([
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'productid',
        pipeline: [
          { $match: { date: today } },
          { $group: { _id: null, Qty: { $sum: '$quantity' }, Avg: { $avg: '$priceperkg' } } },
        ],
        as: 'productDetails',
      },
    },
    {
      $unwind: '$productDetails',
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'productid',
        pipeline: [
          { $match: { date: today, preOrderClose: { $eq: false } } },
          {
            $lookup: {
              from: 'b2bshopclones',
              localField: 'customerId',
              foreignField: '_id',
              as: 'shopData',
            },
          },
          {
            $unwind: '$shopData',
          },
          {
            $lookup: {
              from: 'shoporderclones',
              localField: 'orderId',
              foreignField: '_id',
              pipeline: [
                { $match: { delivery_type: 'NDD' } },
                {
                  $lookup: {
                    from: 'b2busers',
                    localField: 'Uid',
                    foreignField: '_id',
                    as: 'UsersData',
                  },
                },
                {
                  $unwind: '$UsersData',
                },
                {
                  $project: {
                    userName: '$UsersData.name',
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
              shopName: '$shopData.SName',
              orderby: '$shoporderclones.userName',
              quantity: 1,
              priceperkg: 1,
            },
          },
        ],
        as: 'liveStock',
      },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'productid',
        pipeline: [
          { $match: { date: today, preOrderClose: { $eq: true } } },
          {
            $lookup: {
              from: 'b2bshopclones',
              localField: 'customerId',
              foreignField: '_id',
              as: 'shopData',
            },
          },
          {
            $unwind: '$shopData',
          },
          {
            $lookup: {
              from: 'shoporderclones',
              localField: 'orderId',
              foreignField: '_id',
              pipeline: [
                { $match: { delivery_type: 'NDD' } },
                {
                  $lookup: {
                    from: 'b2busers',
                    localField: 'Uid',
                    foreignField: '_id',
                    as: 'UsersData',
                  },
                },
                {
                  $unwind: '$UsersData',
                },
                {
                  $project: {
                    userName: '$UsersData.name',
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
              shopName: '$shopData.SName',
              orderby: '$shoporderclones.userName',
              quantity: 1,
              priceperkg: 1,
            },
          },
        ],
        as: 'orderDetails',
      },
    },
    {
      $lookup: {
        from: 'estimatedorders',
        localField: '_id',
        foreignField: 'productId',
        pipeline: [{ $match: { date: today } }],
        as: 'estimatedDetails',
      },
    },
    {
      $unwind: '$estimatedDetails',
    },
    {
      $skip: 10 * page,
    },
    {
      $limit: 10,
    },
    {
      $project: {
        _id: 1,
        productTitle: 1,
        Qty: '$productDetails.Qty',
        Avg: '$productDetails.Avg',
        orderDetails: '$orderDetails',
        estimatedDetails: '$estimatedDetails',
        estimatedId: '$estimatedDetails._id',
        closedQty: '$estimatedDetails.closedQty',
        avgPrice: '$estimatedDetails.avgPrice',
        estimatedQty: '$estimatedDetails.estimatedQty',
        status: '$estimatedDetails.status',
        estimatedStatus: '$estimatedDetails.estimatedStatus',
        liveStock: '$liveStock',
      },
    },
  ]);
  let total = await Product.aggregate([
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'productid',
        pipeline: [
          { $match: { date: today } },
          { $group: { _id: null, Qty: { $sum: '$quantity' }, Avg: { $avg: '$priceperkg' } } },
        ],
        as: 'productDetails',
      },
    },
    {
      $unwind: '$productDetails',
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'productid',
        pipeline: [
          { $match: { date: today, preOrderClose: { $eq: false } } },
          {
            $lookup: {
              from: 'b2bshopclones',
              localField: 'customerId',
              foreignField: '_id',
              as: 'shopData',
            },
          },
          {
            $unwind: '$shopData',
          },
          {
            $lookup: {
              from: 'shoporderclones',
              localField: 'orderId',
              foreignField: '_id',
              pipeline: [
                {
                  $lookup: {
                    from: 'b2busers',
                    localField: 'Uid',
                    foreignField: '_id',
                    as: 'UsersData',
                  },
                },
                {
                  $unwind: '$UsersData',
                },
                {
                  $project: {
                    userName: '$UsersData.name',
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
              shopName: '$shopData.SName',
              orderby: '$shoporderclones.userName',
              quantity: 1,
              priceperkg: 1,
            },
          },
        ],
        as: 'liveStock',
      },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'productid',
        pipeline: [
          { $match: { date: today, preOrderClose: { $eq: true } } },
          {
            $lookup: {
              from: 'b2bshopclones',
              localField: 'customerId',
              foreignField: '_id',
              as: 'shopData',
            },
          },
          {
            $unwind: '$shopData',
          },
          {
            $lookup: {
              from: 'shoporderclones',
              localField: 'orderId',
              foreignField: '_id',
              pipeline: [
                {
                  $lookup: {
                    from: 'b2busers',
                    localField: 'Uid',
                    foreignField: '_id',
                    as: 'UsersData',
                  },
                },
                {
                  $unwind: '$UsersData',
                },
                {
                  $project: {
                    userName: '$UsersData.name',
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
              shopName: '$shopData.SName',
              orderby: '$shoporderclones.userName',
              quantity: 1,
              priceperkg: 1,
            },
          },
        ],
        as: 'orderDetails',
      },
    },
    {
      $lookup: {
        from: 'estimatedorders',
        localField: '_id',
        foreignField: 'productId',
        pipeline: [{ $match: { date: today } }],
        as: 'estimatedDetails',
      },
    },
    {
      $unwind: '$estimatedDetails',
    },
  ]);
  return { values: values, total: total.length };
};

const getEstimatedByDateforPH = async (date, page) => {
  let values = await Product.aggregate([
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'productid',
        pipeline: [
          { $match: { date: date } },
          { $group: { _id: null, Qty: { $sum: '$quantity' }, Avg: { $avg: '$priceperkg' } } },
        ],
        as: 'productDetails',
      },
    },
    {
      $unwind: '$productDetails',
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'productid',
        pipeline: [
          { $match: { date: date, preOrderClose: { $eq: false } } },
          {
            $lookup: {
              from: 'b2bshopclones',
              localField: 'customerId',
              foreignField: '_id',
              as: 'shopData',
            },
          },
          {
            $unwind: '$shopData',
          },
          {
            $lookup: {
              from: 'shoporderclones',
              localField: 'orderId',
              foreignField: '_id',
              pipeline: [
                {
                  $lookup: {
                    from: 'b2busers',
                    localField: 'Uid',
                    foreignField: '_id',
                    as: 'UsersData',
                  },
                },
                {
                  $unwind: '$UsersData',
                },
                {
                  $project: {
                    userName: '$UsersData.name',
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
              shopName: '$shopData.SName',
              orderby: '$shoporderclones.userName',
              quantity: 1,
              priceperkg: 1,
            },
          },
        ],
        as: 'liveStock',
      },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'productid',
        pipeline: [
          { $match: { date: date, preOrderClose: { $eq: true } } },
          {
            $lookup: {
              from: 'b2bshopclones',
              localField: 'customerId',
              foreignField: '_id',
              as: 'shopData',
            },
          },
          {
            $unwind: '$shopData',
          },
          {
            $lookup: {
              from: 'shoporderclones',
              localField: 'orderId',
              foreignField: '_id',
              pipeline: [
                {
                  $lookup: {
                    from: 'b2busers',
                    localField: 'Uid',
                    foreignField: '_id',
                    as: 'UsersData',
                  },
                },
                {
                  $unwind: '$UsersData',
                },
                {
                  $project: {
                    userName: '$UsersData.name',
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
              shopName: '$shopData.SName',
              orderby: '$shoporderclones.userName',
              quantity: 1,
              priceperkg: 1,
            },
          },
        ],
        as: 'orderDetails',
      },
    },
    {
      $lookup: {
        from: 'estimatedorders',
        localField: '_id',
        foreignField: 'productId',
        pipeline: [{ $match: { date: date, estimatedStatus: 'Estimated' } }],
        as: 'estimatedDetails',
      },
    },
    {
      $unwind: '$estimatedDetails',
    },
    {
      $lookup: {
        from: 'status',
        localField: '_id',
        foreignField: 'productid',
        pipeline: [
          {
            $match: {
              date: date,
            },
          },
        ],
        as: 'productstatus',
      },
    },
    {
      $lookup: {
        from: 'callstatuses',
        localField: '_id',
        foreignField: 'productid',
        pipeline: [
          {
            $match: {
              date: date,
              orderType: { $ne: 'sudden' },
            },
          },
        ],
        as: 'callStatusData',
      },
    },
    {
      $limit: 10,
    },
    {
      $skip: 10 * page,
    },
    {
      $project: {
        _id: 1,
        productTitle: 1,
        Qty: '$productDetails.Qty',
        Avg: '$productDetails.Avg',
        orderDetails: '$orderDetails',
        estimatedDetails: '$estimatedDetails',
        estimatedId: '$estimatedDetails._id',
        CallStatus: '$callStatusData',
        closedQty: '$estimatedDetails.closedQty',
        avgPrice: '$estimatedDetails.avgPrice',
        productstatus: '$productstatus',
        estimatedQty: '$estimatedDetails.estimatedQty',
        status: '$estimatedDetails.status',
        estimatedStatus: '$estimatedDetails.estimatedStatus',
        liveStock: '$liveStock',
      },
    },
  ]);
  let total = await Product.aggregate([
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'productid',
        pipeline: [
          { $match: { date: date } },
          { $group: { _id: null, Qty: { $sum: '$quantity' }, Avg: { $avg: '$priceperkg' } } },
        ],
        as: 'productDetails',
      },
    },
    {
      $unwind: '$productDetails',
    },
    {
      $lookup: {
        from: 'estimatedorders',
        localField: '_id',
        foreignField: 'productId',
        pipeline: [{ $match: { date: date, estimatedStatus: 'Estimated' } }],
        as: 'estimatedDetails',
      },
    },
    {
      $unwind: '$estimatedDetails',
    },
  ]);
  return { values: values, total: total.length };
};

const getSingleProductEstimations = async (id) => {
  let values = await Estimated.aggregate([
    {
      $match: { _id: id },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'productDetails',
      },
    },
    {
      $unwind: '$productDetails',
    },
    {
      $lookup: {
        from: 'productorderclones',
        let: { date: '$date', productId: '$productId' },
        // localField: 'productId',
        // foreignField: 'productid',
        pipeline: [
          { $match: { $expr: { $and: [{ $eq: ['$productid', '$$productId'] }, { $eq: ['$date', '$$date'] }] } } },
          {
            $lookup: {
              from: 'shoporderclones',
              localField: 'orderId',
              foreignField: '_id',
              pipeline: [{ $match: { delivery_type: 'NDD' } }],
              as: 'shoporderclones',
            },
          },
          {
            $unwind: '$shoporderclones',
          },
          { $group: { _id: null, Qty: { $sum: '$quantity' }, Avg: { $avg: '$priceperkg' } } },
        ],
        as: 'productorders',
      },
    },
    {
      $unwind: '$productorders',
    },
    {
      $lookup: {
        from: 'estimatedorders',
        localField: 'productId',
        foreignField: 'productId',
        pipeline: [
          { $match: { _id: { $ne: id }, estimatedStatus: 'Estimated' } },
          {
            $lookup: {
              from: 'products',
              localField: 'productId',
              foreignField: '_id',
              as: 'productDetails',
            },
          },
          {
            $unwind: '$productDetails',
          },
          {
            $project: {
              status: 1,
              productId: 1,
              closedQty: 1,
              avgPrice: 21,
              date: 1,
              time: 1,
              estimatedQty: 1,
              estimatedStatus: 1,
              productTitle: '$productDetails.productTitle',
            },
          },
          {
            $limit: 5,
          },
          { $sort: { date: -1 } },
        ],
        as: 'oldestimatedorders',
      },
    },
    {
      $project: {
        status: 1,
        productId: 1,
        closedQty: 1,
        avgPrice: 21,
        date: 1,
        estimatedQty: 1,
        estimatedStatus: 1,
        time: 1,
        productTitle: '$productDetails.productTitle',
        stock: '$productDetails.stock',
        // stock: '$productDetails.stock',
        image: '$productDetails.image',
        liveStock: '$productorders.Qty',
        liveAvg: '$productorders.Avg',
        oldestimatedorders: '$oldestimatedorders',
      },
    },
  ]);

  return values;
};

const updateEstimateById = async (id, updateBody) => {
  let estimate = await Estimated.findById(id);
  if (!estimate) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Estimate Not Found');
  }
  estimate = await Estimated.findByIdAndUpdate({ _id: id }, updateBody, { new: true });
  return estimate;
};

const getEstimated_Orders_By_Id_And_date = async (id) => {
  let currentDate = moment().format('DD-MM-YYYY');
  let estimate = await Estimated.find({ productId: id, date: currentDate, estimatedStatus: { $eq: 'Estimated' } });
  if (!estimate) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Estimated Order Not Found');
  }
  return estimate;
};

const liveStockInfo = async (id) => {
  let currentDate = moment().format('DD-MM-YYYY');

  let values = await Product.aggregate([
    {
      $match: { _id: id },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'productid',
        pipeline: [
          { $match: { date: currentDate } },
          { $group: { _id: null, Qty: { $sum: '$quantity' }, Avg: { $avg: '$priceperkg' } } },
        ],
        as: 'productorders',
      },
    },
    {
      $unwind: '$productorders',
    },
    {
      $project: {
        _id: 1,
        livestock: '$productorders.Qty',
        price: '$productorders.price',
      },
    },
  ]);
  return values.length != 0 ? values[0] : [];
};

module.exports = {
  createEstimatedOrders,
  getEstimatedByDate,
  getSingleProductEstimations,
  updateEstimateById,
  getEstimatedByDateforPH,
  getEstimated_Orders_By_Id_And_date,
  liveStockInfo,
};
