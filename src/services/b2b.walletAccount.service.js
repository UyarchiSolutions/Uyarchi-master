const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const walletModel = require('../models/b2b.walletAccount.model');
const { Shop } = require('../models/b2b.ShopClone.model');

const createWallet = async (walletbody) => {
  let wallet = await walletModel.create(walletbody);
  // //console.log(wallet);
  return wallet;
};

const currentAmount = async (amountBody) => {
  let amount = await walletModel.create(amountBody);
  return amount;
};

const getshopName = async () => {
  let shopname = await Shop.aggregate([
    {
      $lookup: {
        from: 'wards',
        localField: 'Wardid',
        foreignField: '_id',
        as: 'wardData',
      },
    },
    {
      $unwind: '$wardData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        as: 'streetData',
      },
    },
    {
      $unwind: '$streetData',
    },
    {
      $lookup: {
        from: 'wallets',
        localField: '_id',
        foreignField: 'shopName',
        as: 'wallets',
      },
    },
    {
      $project: {
        SName: 1,
        mobile: 1,
        address: 1,
        SOwner: 1,
        type: 1,
        wardNo: '$wardData.wardNo',
        streetName: '$streetData.street',
        wallets: {
          $arrayElemAt: ['$wallets', 0],
        },
      },
    },
    {
      $match: { wallets: { $eq: null } },
    },
  ]);
  return shopname;
};

const getAll = async () => {
  return walletModel.find();
};

const getWallet = async (page) => {
  let wallet = await walletModel.aggregate([
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopName',
        foreignField: '_id',
        as: 'shopDatq',
      },
    },

    {
      $unwind: '$shopDatq',
    },
    {
      $lookup: {
        from:'shoplists',
        localField: 'shopDatq.SType',
        foreignField: '_id',
        as: 'shopTypeDetails'
  
      }
    },
    {
      $unwind: '$shopTypeDetails'
    },
    {
      $project: {

        type:1,
        shopName:1,
        date:1,
        idProofNo:1,
        addressProofNo:1,
        idProof:1,
        addressProof:1,
        email:1,
        shopname:"$shopDatq.SName",
        types: '$shopTypeDetails.shopList',
      }
    },



    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await walletModel.aggregate([
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopName',
        foreignField: '_id',
        as: 'shopDatq',
      },
    },
    {
      $unwind: '$shopDatq',
    },
    {
      $lookup: {
        from:'shoplists',
        localField: 'shopDatq.SType',
        foreignField: '_id',
        as: 'shopTypeDetails'
  
      }
    },
    {
      $unwind: '$shopTypeDetails'
    },
  ]);
  return { wallet: wallet, total: total.length };
};

const updateWallet = async (id, walletbody) => {
  let wallet = await walletModel.findById(id);
  if (!wallet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'wallet Not found');
  }
  wallet = await walletModel.findByIdAndUpdate({ _id: id }, walletbody, { new: true });
  return wallet;
};

const deleteWalletById = async (id) => {
  let wallet = await walletModel.findById(id);
  if (!wallet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'wallet Not found');
  }

  wallet.active = false;
  await wallet.save();
};

const getShopDetails = async (id) => {
  let values = await walletModel.aggregate([
    {
      $match: {
        $and: [{ shopName: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopName',
        foreignField: '_id',
        as: 'shopDatq',
      },
    },
    {
      $unwind: '$shopDatq',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'shopDatq.Wardid',
        foreignField: '_id',
        as: 'wardDatq',
      },
    },
    {
      $unwind: '$wardDatq',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'shopDatq.Strid',
        foreignField: '_id',
        as: 'streetData',
      },
    },
    {
      $unwind: '$streetData',
    },
   
    {
      $lookup: {
        from:'shoplists',
        localField: 'shopDatq.SType',
        foreignField: '_id',
        as: 'shopTypeDetails'
  
      }
    },
    {
      $unwind: '$shopTypeDetails'
    },
    {
      $project: {
        wardNo: '$wardDatq.wardNo',
        streetname: '$streetData.street',
        shopType: '$shopDatq.type',
        OwnnerName: '$shopDatq.SOwner',
        mobile: '$shopDatq.mobile',
        address: '$shopDatq.address',
        shopTypeDetails: "$shopTypeDetails.shopList",
        idProofNo: 1,
        addressProofNo: 1,
        email: 1,
        shopname: "$shopDatq.SName"
      },
    },
  ]);
  return values;
};

module.exports = {
  createWallet,
  getAll,
  updateWallet,
  deleteWalletById,
  getWallet,

  currentAmount,
  getshopName,
  getShopDetails,
};
