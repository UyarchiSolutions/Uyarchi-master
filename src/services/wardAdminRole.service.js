const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const {
  WardAdminRole,
  WardAdminRoleAsm,
  AsmSalesMan,
  SalesManShop,
  WithoutAsmSalesman,
  WardAdminRoleAsmHistory,
  WardAdminRoleHistory,
  WithoutAsmWithAsm,
  Tartgetvalue,
  TartgetHistory,
} = require('../models/wardAdminRole.model');
const { Roles } = require('../models');
const { Shop } = require('../models/b2b.ShopClone.model');
const { Users } = require('../models/B2Busers.model');
const Ward = require('../models/ward.model');
const moment = require('moment');
const { findByIdAndUpdate } = require('../models/b2b.pettyStock.model');
const { ValidationRequestList } = require('twilio/lib/rest/api/v2010/account/validationRequest');
const {
  ShopOrder,
  ProductorderSchema,
  ShopOrderClone,
  ProductorderClone,
  MismatchStock,
} = require('../models/shopOrder.model');

const { Telecallerteam, TelecallerShop, SalesmanOrder, SalesmanOrderShop } = require('../models/telecallerAssign.model');


const createwardAdminRole = async (body) => {
  let serverdate = moment().format('yyy-MM-DD');
  let time = moment().format('hh:mm a');
  let values = {};
  let values1 = {
    ...body,
    ...{ date: serverdate, time: time },
  };
  await WardAdminRoleHistory.create(values1);
  const value = await WardAdminRole.find({ b2bUserId: body.b2bUserId, date: serverdate });
  if (value.length != 0) {
    value.forEach(async (e) => {
      e.targetValue += parseInt(body.targetValue);
      e.targetTonne += parseInt(body.targetTonne);
      e.startingValue += parseInt(body.targetValue);
      e.startingTonne += parseInt(body.targetTonne);
      await WardAdminRole.updateMany(
        { b2bUserId: e.b2bUserId },
        {
          date: serverdate,
          time: time,
          targetValue: e.targetValue,
          targetTonne: e.targetTonne,
          startingValue: e.startingValue,
          startingTonne: e.startingTonne,
        },
        { new: true }
      );
    });
  } else {
    values = {
      ...body,
      ...{
        date: serverdate,
        time: time,
        startingValue: parseInt(body.targetValue),
        startingTonne: parseInt(body.targetTonne),
      },
    };
    await WardAdminRole.create(values);
  }

  // const value = await WardAdminRole.find({b2bUserId:body.b2bUserId, unit:body.unit});
  // if(value.length == 0)
  // {
  //   values = {
  //     ...body,
  //     ...{ date: serverdate, time: time, startingValue: parseInt(body.targetValue), startingTonne: parseInt(body.targetTonne), targetValue:parseInt(body.targetValue), targetTonne: parseInt(body.targetTonne)  },
  //   };

  //    await WardAdminRole.create(values);
  // }else{
  //   if(body.unit == "KG"){
  //   value.forEach(async (e) => {

  //     if(e.unit == "KG"){
  //   e.targetValue += parseInt(body.targetValue)
  //   e.targetTonne += parseInt(body.targetTonne)
  //   e.startingValue += parseInt(body.targetValue)
  //   e.startingTonne += parseInt(body.targetTonne)
  //   await WardAdminRole.updateMany({b2bUserId:e.b2bUserId, unit:'KG'},{date: serverdate, time: time, targetValue:e.targetValue, targetTonne:e.targetTonne, startingValue:e.startingValue, startingTonne:e.startingTonne }, { new: true })
  // }
  // });
  //     }else{
  //       value.forEach(async (e) => {
  //         if(e.unit == "Tonne"){
  //       e.targetValue += parseInt(body.targetValue)
  //       e.targetTonne += parseInt(body.targetTonne)
  //       e.startingValue += parseInt(body.targetValue)
  //       e.startingTonne += parseInt(body.targetTonne)
  //       await WardAdminRole.updateMany({b2bUserId:e.b2bUserId, unit:'Tonne'},{date: serverdate, time: time, targetValue:e.targetValue, targetTonne:e.targetTonne, startingValue:e.startingValue, startingTonne:e.startingTonne }, { new: true })
  //         }
  //     });
  // }
  // }

  return { message: 'created' };
};

// telecaller Names

const telecallernames = async () => {
  let data = await Users.aggregate([
    {
      $match: {
        $and: [{ userRole: { $eq: 'ae601146-dadd-443b-85b2-6c0fbe9f964c' } }],
      },
    },
    {
      $project: {
        name: 1,
        b2buserId: 1,
        roleName: 1,
        _id: 1,
      },
    },
  ]);
  return data;
};
// telecallerHead

const telecallerHead = async () => {
  let serverdate = moment().format('yyy-MM-DD');
  let data = await Roles.aggregate([
    {
      $match: {
        $and: [{ roleName: { $eq: 'Telecaller Head (TCH)' } }],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: '_id',
        foreignField: 'userRole',
        pipeline: [
          {
            $lookup: {
              from: 'wardadminroles',
              let: {
                localField: '$_id',
              },
              pipeline: [
                { $match: { $expr: { $eq: ['$b2bUserId', '$$localField'] } } },
                {
                  $match: {
                    $and: [{ date: { $eq: serverdate } }],
                  },
                },
              ],
              as: 'wardadminrolesData',
            },
          },
          // {
          //   $unwind:'$wardadminrolesData',
          //     // preserveNullAndEmptyArrays: true,
          // },
        ],
        as: 'b2busersData',
      },
    },
    {
      $unwind: '$b2busersData',
    },
    {
      $project: {
        name: '$b2busersData.name',
        b2buserId: '$b2busersData._id',
        roleName: 1,
        _id: 1,
        // wardadminrolesData:'$b2busersData.wardadminrolesData'
        b2user: '$b2busersData.wardadminrolesData',
      },
    },
    {
      $match: { $and: [{ b2user: { $type: 'array', $ne: [] } }] },
    },
  ]);
  return data;
};

// ward wcce
const wardwcce = async () => {
  //console.log('efe');
  const data = await Users.aggregate([
    {
      $match: {
        $and: [{ userRole: { $eq: '33a2ff87-400c-4c15-b607-7730a79b49a9' } }],
      },
    },
    {
      $project: {
        name: 1,
        phoneNumber: 1,
        userRole: 1,
      },
    },
  ]);
  return data;
};

const createwithAsmwithoutAsm = async (body) => {
  let serverdate = moment().format('yyy-MM-DD');
  let time = moment().format('hh:mm a');
  let values1 = {
    ...body,
    ...{ date: serverdate, time: time },
  };
  const data = await WithoutAsmWithAsm.create(values1);
  return data;
};

// get withwithoutData

const getwithAsmwithoutAsm = async (type, date) => {
  // let type = "withAsm"
  // let type = "withoutAsm"
  let match;
  if (date != 'null') {
    match = [{ date: { $eq: date } }, { status: { $eq: type } }];
  } else {
    match = [{ status: { $eq: type } }];
  }
  const data = await WithoutAsmWithAsm.aggregate([
    {
      $match: {
        $and: match,
      },
    },
    // {
    //   $lookup: {
    //     from: 'b2busers',
    //     localField: '_id',
    //     foreignField: 'wardAdminId',
    //     as: 'b2busersData',
    //   },
    // },
    // {
    //   $unwind: '$b2busersData',
    // },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'salesman',
        foreignField: '_id',
        as: 'b2busersDataSales',
      },
    },
    {
      $unwind: '$b2busersDataSales',
    },
    {
      $project: {
        Salesmanname: '$b2busersDataSales.name',
        // Asmname:"$b2busersData.name",
        targetTonne: 1,
        targetValue: 1,
        salesman: 1,
        wardAdminId: 1,
        status: 1,
        unit: 1,
        date: 1,
        time: 1,
        _id: 1,
      },
    },
  ]);
  return data;
};

const getwithAsmwithoutAsm1 = async (type, date) => {
  // let type = "withAsm"
  // let type = "withoutAsm"
  let match;
  if (date != 'null') {
    match = [{ date: { $eq: date } }, { status: { $eq: type } }];
  } else {
    match = [{ status: { $eq: type } }];
  }
  const data = await WithoutAsmWithAsm.aggregate([
    {
      $match: {
        $and: match,
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'wardAdminId',
        foreignField: '_id',
        as: 'b2busersData',
      },
    },
    {
      $unwind: '$b2busersData',
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'salesman',
        foreignField: '_id',
        as: 'b2busersDataSales',
      },
    },
    {
      $unwind: '$b2busersDataSales',
    },
    {
      $project: {
        Salesmanname: '$b2busersDataSales.name',
        Asmname: '$b2busersData.name',
        targetTonne: 1,
        targetValue: 1,
        salesman: 1,
        wardAdminId: 1,
        status: 1,
        unit: 1,
        date: 1,
        time: 1,
        _id: 1,
      },
    },
  ]);
  return data;
};

const getAllWithAsmwithout = async (sm, asm, date) => {
  let match;
  if (sm != 'null' && asm == 'null' && date == 'null') {
    match = [{ salesman: { $eq: sm } }, { status: { $eq: 'withoutAsm' } }];
  } else if (sm != 'null' && asm == 'null' && date != 'null') {
    match = [{ salesman: { $eq: sm } }, { date: { $eq: date } }, { status: { $eq: 'withoutAsm' } }];
  } else if ((sm = 'null' && asm != 'null' && date == 'null')) {
    match = [{ wardAdminId: { $eq: asm } }, { status: { $eq: 'withAsm' } }];
  } else if ((sm = 'null' && asm != 'null' && date != 'null')) {
    match = [{ wardAdminId: { $eq: asm } }, { date: { $eq: date } }, { status: { $eq: 'withAsm' } }];
  } else if (sm != 'null' && asm != 'null' && date == 'null') {
    match = [{ wardAdminId: { $eq: asm } }, { salesman: { $eq: sm } }, { status: { $eq: 'withAsm' } }];
  } else if (sm != 'null' && asm != 'null' && date != 'null') {
    match = [
      { wardAdminId: { $eq: asm } },
      { salesman: { $eq: sm } },
      { date: { $eq: date } },
      { status: { $eq: 'withAsm' } },
    ];
  } else {
    match = [{ active: { $eq: true } }];
  }
  const data = await WithoutAsmWithAsm.aggregate([
    {
      $match: {
        $and: match,
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'wardAdminId',
        foreignField: '_id',
        as: 'b2busersData',
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'salesman',
        foreignField: '_id',
        as: 'b2busersDataSales',
      },
    },
    {
      $project: {
        Salesmanname: '$b2busersDataSales.name',
        Asmname: '$b2busersData.name',
        targetTonne: 1,
        targetValue: 1,
        salesman: 1,
        wardAdminId: 1,
        status: 1,
        unit: 1,
        date: 1,
        time: 1,
        _id: 1,
      },
    },
  ]);
  return data;
};

const getAll = async (date) => {
  if (date != 'null') {
    match = [{ date: { $eq: date } }];
  } else {
    match = [{ active: { $eq: true } }];
  }
  const data = await WardAdminRole.aggregate([
    { $sort: { date: -1 } },
    {
      $match: {
        $and: match,
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'b2bUserId',
        foreignField: '_id',
        as: 'Asmb2busersData',
      },
    },
    {
      $unwind: '$Asmb2busersData',
    },
    {
      $project: {
        name: '$Asmb2busersData.name',
        targetTonne: 1,
        targetValue: 1,
        b2bUserId: 1,
        startingValue: 1,
        startingTonne: 1,
        unit: 1,
        date: 1,
        time: 1,
        _id: 1,
      },
    },
  ]);
  return data;
};

// const get_All_tones_and_values = async (id) =>{
//    const data = await WardAdminRole.aggregate([
//     {
//       $match: {
//         $and: [{ b2bUserId: { $eq: id } }],
//       },
//     },
//    ])
// }
const getWardAdminRoleById = async (id) => {
  const data = await WardAdminRole.findById(id);
  if (!data || data.active === false) {
    throw new ApiError(httpStatus.NOT_FOUND, 'wardAdminRole Not Found');
  }
  return data;
};

const createwardAdminRoleAsm = async (body) => {
  let serverdate = moment().format('yyy-MM-DD');
  let time = moment().format('hh:mm a');
  let values = {};
  values = { ...body, ...{ date: serverdate, time: time } };
  const data = await WardAdminRoleAsm.create(values);
  return data;
};

const WardAdminRoleAsmHistorydata = async (body) => {
  let serverdate = moment().format('yyy-MM-DD');
  let time = moment().format('hh:mm a');
  let values = {};
  values = {
    ...body,
    ...{ date: serverdate, time: time, targetValue: parseInt(body.targetValue), targetTonne: parseInt(body.targetTonne) },
  };

  await WardAdminRoleAsm.create(values);

  const value = await WardAdminRoleAsmHistory.find({ b2bUserId: body.b2bUserId, unit: body.unit });
  if (value != 0) {
    if (body.unit == 'KG') {
      value.forEach(async (e) => {
        if (e.unit == 'KG') {
          e.targetValue += parseInt(body.targetValue);
          e.targetTonne += parseInt(body.targetTonne);
          await WardAdminRoleAsmHistory.updateMany(
            { b2bUserId: e.b2bUserId, unit: 'KG' },
            { date: serverdate, time: time, targetValue: e.targetValue, targetTonne: e.targetTonne },
            { new: true }
          );
        }
      });
    } else {
      value.forEach(async (e) => {
        if (e.unit == 'Tonne') {
          e.targetValue += parseInt(body.targetValue);
          e.targetTonne += parseInt(body.targetTonne);
          await WardAdminRoleAsmHistory.updateMany(
            { b2bUserId: e.b2bUserId, unit: 'Tonne' },
            { date: serverdate, time: time, targetValue: e.targetValue, targetTonne: e.targetTonne },
            { new: true }
          );
        }
      });
    }
  }
  return { data: 'created or else updated asmtone and value' };
};

const getAllWardAdminRoleData = async (id) => {
  let data = await WardAdminRole.aggregate([
    {
      $match: {
        $and: [{ b2bUserId: { $eq: id } }],
      },
    },
  ]);
  return data;
};

// const getAllWardAdminRoleDataCurrent = async (id) => {

//   let data = await WardAdminRole.aggregate([
//     {
//       $match: {
//         $and: [{ b2bUserId: { $eq: id } }],
//       },
//     },
//   ]);
//   return data;
// };

const smData = async (date) => {
  let match;
  if (date != 'null') {
    match = [{ 'wardadminroleasmsData.date': { $eq: date } }];
  } else {
    match = [{ 'wardadminroleasmsData.active': { $eq: true } }];
  }
  let data = await WardAdminRole.aggregate([
    {
      $lookup: {
        from: 'b2busers',
        localField: 'b2bUserId',
        foreignField: '_id',
        as: 'Asmb2busersData',
      },
    },
    {
      $unwind: '$Asmb2busersData',
    },
    {
      $lookup: {
        from: 'wardadminroleasms',
        localField: 'b2bUserId',
        foreignField: 'wardAdminId',
        as: 'wardadminroleasmsData',
      },
    },
    {
      $unwind: '$wardadminroleasmsData',
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'wardadminroleasmsData.salesman',
        foreignField: '_id',
        as: 'b2busersData',
      },
    },
    {
      $unwind: '$b2busersData',
    },
    {
      $match: {
        $and: match,
      },
    },
    { $sort: { 'wardadminroleasmsData.date': -1 } },
    {
      $project: {
        salesmanName: '$b2busersData.name',
        targetValue: '$wardadminroleasmsData.targetValue',
        targetTonne: '$wardadminroleasmsData.targetTonne',
        // wardAdminId:'$wardadminroleasmsData.wardAdminId',
        b2buserId: '$wardadminroleasmsData.salesman',
        date: '$wardadminroleasmsData.date',
        time: '$wardadminroleasmsData.time',
        Asm: '$Asmb2busersData.name',
        _id: 1,
      },
    },
  ]);
  return data;
};

const total = async (id, updateBody) => {
  const values = await WardAdminRole.find({ b2bUserId: id });
  if (values.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'wardAdminRole not found');
  }
  values.forEach(async (e) => {
    let value = parseInt(updateBody.targetValue);
    let tone = parseInt(updateBody.targetTonne);
    let asmvalue = e.targetValue;
    let asmtone = e.targetTonne;
    let value1 = asmvalue - value;
    let tone1 = asmtone - tone;
    await WardAdminRole.updateMany({ b2bUserId: id }, { targetValue: value1, targetTonne: tone1 }, { new: true });
  });
  //  const values = await WardAdminRole.find({b2bUserId:id})
  // if(values != 0){
  //   if(updateBody.unit == "KG"){
  //   values.forEach(async (e) => {
  //     if(e.unit == "KG"){
  //   let value = parseInt(updateBody.targetValue);
  //   let tone = parseInt(updateBody.targetTonne);
  //   let asmvalue = e.targetValue;
  //   let asmtone = e.targetTonne;
  //   let value1 = asmvalue - value;
  //   let tone1 = asmtone - tone;

  //     await WardAdminRole.updateMany({ b2bUserId: id, unit:"KG"}, { targetValue: value1, targetTonne: tone1 }, { new: true });
  //     }
  //    })
  //   }else{
  //     values.forEach(async (e) => {
  //       if(e.unit == "Tonne"){
  //     let value = parseInt(updateBody.targetValue);
  //     let tone = parseInt(updateBody.targetTonne);
  //     let asmvalue = e.targetValue;
  //     let asmtone = e.targetTonne;
  //     let value1 = asmvalue - value;
  //     let tone1 = asmtone - tone;

  //      await WardAdminRole.updateMany({ b2bUserId: id, unit:"Tonne"}, { targetValue: value1, targetTonne: tone1 }, { new: true });
  //       }
  //      })
  //   }
  // }else{
  //   throw new ApiError(httpStatus.NOT_FOUND, 'wardAdminRole not found');
  // }
  return { message: 'updated' };
};

// getAllSalesMandataCurrentdate
const getAllSalesMandataCurrentdate = async (id) => {
  let serverdate = moment().format('yyy-MM-DD');
  const data = await WardAdminRoleAsm.find({ salesman: id, active: true, date: serverdate });
  return data;
};

const createAsmSalesman = async (body) => {
  let { arr } = body;
  let serverdate = moment().format('yyy-MM-DD');
  let time = moment().format('hh:mm a');
  if (body.status == 'Assign') {
    arr.forEach(async (e) => {
      await Users.findByIdAndUpdate({ _id: e }, { salesManagerStatus: body.status }, { new: true });
      await AsmSalesMan.create({
        asmId: body.asmId,
        salesManId: e,
        status: body.status,
        date: serverdate,
        time: time,
        date: serverdate,
      });
    });
  } else {
    arr.forEach(async (e) => {
      let data = await AsmSalesMan.find({ asmId: body.asmId, salesManId: e, status: 'Assign' });
      data.forEach(async (f) => {
        await Users.findByIdAndUpdate({ _id: f.salesManId }, { salesManagerStatus: body.status }, { new: true });
        await AsmSalesMan.findByIdAndUpdate(
          { _id: f._id },
          { asmId: f.asmId, salesManId: f.salesManId, status: body.status, reAssignDate: serverdate, reAssignTime: time },
          { new: true }
        );
      });
    });
  }
  return 'created';
};

const getAsmSalesman = async (id) => {
  const name = await Users.findById(id);
  let data = await AsmSalesMan.aggregate([
    {
      $match: {
        $and: [{ asmId: { $eq: id } }, { status: { $eq: 'Assign' } }],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'salesManId',
        foreignField: '_id',
        as: 'b2busersData',
      },
    },
    {
      $unwind: '$b2busersData',
    },
    {
      $lookup: {
        from: 'salesmanshops',
        let: {
          localField: '$salesManId',
        },
        pipeline: [
          { $match: { $expr: { $eq: ['$salesManId', '$$localField'] } } },
          {
            $match: {
              $and: [{ status: { $ne: 'Reassign' } }],
            },
          },
        ],
        as: 'b2bshopclonesdata',
      },
    },
    {
      $project: {
        salesmanName: '$b2busersData.name',
        salesManId: 1,
        status: 1,
        asmId: 1,
        date: 1,
        time: 1,
        _id: 1,
        Count: { $size: '$b2bshopclonesdata' },
      },
    },
  ]);
  return { data: data, name: name.name };
};

const allAssignReassignSalesman = async (id) => {
  const data = await AsmSalesMan.aggregate([
    {
      $match: {
        $and: [{ asmId: { $eq: id } }],
      },
    },
  ]);
  return data;
};

const createSalesmanShop = async (body) => {
  var value;
  let { arr } = body;
  let creat = moment().format('yyy-MM-DD');
  let creat1 = moment().format('HHmmss');
  let serverdate = moment().format('yyy-MM-DD');
  let time = moment().format('hh:mm a');
  if (body.status == 'Assign') {
    arr.forEach(async (e) => {
      await Shop.findByIdAndUpdate({ _id: e }, { salesManStatus: body.status }, { new: true });
      value = await SalesManShop.create({
        salesManId: body.salesManId,
        shopId: e,
        status: body.status,
        date: serverdate,
        fromSalesManId: body.fromSalesManId,
        time: time,
        date: serverdate,
        created: creat,
        createdTime: creat1,
      });
    });
  } else {
    arr.forEach(async (e) => {
      let data = await SalesManShop.find({
        salesManId: body.salesManId,
        shopId: e,
        status: { $in: ['Assign', 'tempReassign'] },
      });
      data.forEach(async (f) => {
        await Shop.findByIdAndUpdate({ _id: f.shopId }, { salesManStatus: body.status }, { new: true });
        value = await SalesManShop.findByIdAndUpdate(
          { _id: f._id },
          {
            salesManId: f.salesManId,
            fromSalesManId: f.fromSalesManId,
            shopId: f.shopId,
            status: body.status,
            reAssignDate: serverdate,
            reAssignTime: time,
          },
          { new: true }
        );
      });
    });
  }
  return value;
};

const getSalesman = async (id) => {
  const name = await Users.findById(id);
  let data = await SalesManShop.aggregate([
    {
      $match: {
        $or: [
          { $and: [{ fromSalesManId: { $eq: id } }, { status: { $eq: 'Assign' } }] },
          { $and: [{ salesManId: { $eq: id } }, { status: { $eq: 'tempReassign' } }] },
        ],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'salesManId',
        foreignField: '_id',
        as: 'b2busersData',
      },
    },
    {
      $unwind: '$b2busersData',
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
      $lookup: {
        from: 'b2busers',
        localField: 'b2bshopclonesData.Uid',
        foreignField: '_id',
        as: 'b2busersCreatedData',
      },
    },
    {
      $unwind: '$b2busersCreatedData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'b2bshopclonesData.Wardid',
        foreignField: '_id',
        as: 'wardsData',
      },
    },
    {
      $unwind: '$wardsData',
    },
    {
      $lookup: {
        from: 'zones',
        localField: 'wardsData.zoneId',
        foreignField: '_id',
        as: 'zonesData',
      },
    },
    {
      $unwind: '$zonesData',
    },
    {
      $project: {
        shopname: '$b2bshopclonesData.SName',
        salesmanName: '$b2busersData.name',
        createdname: '$b2busersCreatedData.name',
        createddate: '$b2bshopclonesData.date',
        salesManId: 1,
        fromSalesManId: 1,
        shopId: 1,
        ward: '$wardsData.ward',
        zone: '$zonesData.zone',
        dataApproved: "$b2bshopclonesData.status",
        status: 1,
        reAssignDate: 1,
        reAssignTime: 1,
        date: 1,
        time: 1,
        _id: 1,
      },
    },
  ]);
  let lastdata = await SalesManShop.aggregate([
    {
      $match: {
        $or: [
          { $and: [{ fromSalesManId: { $eq: id } }, { status: { $eq: 'Assign' } }] },
          // { $and: [{ salesManId: { $eq: id } }, { status: { $eq: 'tempReassign' } }] },
        ],
      },
    },
    {
      $group: {
        _id: { createdTime: '$createdTime', created: '$created' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        date: '$_id.created',
        createdTime: '$_id.createdTime',
        count: 1,
      },
    },
    {
      $sort: { date: -1, createdTime: -1 },
    },
    {
      $limit: 1,
    },
  ]);
  return { data: data, salesmanname: name.name, lastdata };
};

// withoutoutAsmSalesman
const createwithoutoutAsmSalesman = async (body) => {
  let serverdate = moment().format('yyy-MM-DD');
  let time = moment().format('hh:mm a');
  let values = {};
  values = { ...body, ...{ date: serverdate, time: time } };
  const data = await WithoutAsmSalesman.create(values);
  return data;
};

//withoutoutAsmSalesmanCurrentDate
const withoutoutAsmSalesmanCurrentDate = async (id) => {
  let serverdate = moment().format('yyy-MM-DD');
  const data = await WithoutAsmWithAsm.find({ salesman: id, date: serverdate, status: 'withoutAsm' });
  return data;
};

const withoutoutAsmSalesman = async (date) => {
  let match;
  if (date != 'null') {
    match = [{ date: { $eq: date } }];
  } else {
    match = [{ active: { $eq: true } }];
  }
  const data = await WithoutAsmSalesman.aggregate([
    {
      $match: {
        $and: match,
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'salesman',
        foreignField: '_id',
        as: 'b2busersData',
      },
    },
    {
      $unwind: '$b2busersData',
    },

    {
      $project: {
        salesmanName: '$b2busersData.name',
        targetTonne: 1,
        targetValue: 1,
        salesman: 1,
        unit: 1,
        date: 1,
        time: 1,
        _id: 1,
      },
    },
  ]);
  return data;
};

const dataAllSalesManhistry = async (id) => {
  let data = await SalesManShop.aggregate([
    {
      $match: {
        $and: [{ salesManId: { $eq: id } }],
      },
    },
  ]);

  return data;
};

const allocateDealocateCount = async (id) => {
  let data = await Users.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'salesmanshops',
        localField: '_id',
        foreignField: 'salesManId',
        as: 'salesmanshopsData',
      },
    },
    {
      $unwind: '$salesmanshopsData',
    },
    {
      $lookup: {
        from: 'salesmanshops',
        localField: 'salesmanshopsData.date',
        foreignField: 'date',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $eq: 'Assign' } }],
            },
          },
        ],
        as: 'salesmanshopsAssign',
      },
    },
    {
      $lookup: {
        from: 'salesmanshops',
        localField: 'salesmanshopsData.date',
        foreignField: 'reAssignDate',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $eq: 'Reassign' } }],
            },
          },
        ],
        as: 'salesmanshopsReassign',
      },
    },
    { $sort: { 'salesmanshopsData.date': -1 } },
    {
      $project: {
        assignCount: { $size: '$salesmanshopsAssign' },
        reassignCount: { $size: '$salesmanshopsReassign' },
        date: '$salesmanshopsData.date',
        //  sum:{ $subtract:[{$size:"salesmanshopsReassign"},{$size:"salesmanshopsReassign"}]}
      },
    },
  ]);
  return data;
};

const createtemperaryAssigndata = async (body) => {
  let serverdate = moment().format('YYYY-MM-DD');
  let time = moment().format('hh:mm a');
  body.arr.forEach(async (e) => {
    let data = await SalesManShop.find({ shopId: e, status: { $in: ['Assign', 'tempReassign'] } });
    //console.log(data);
    if (data.length != 0) {
      data.forEach(async (f) => {
        await Shop.findByIdAndUpdate({ _id: f.shopId }, { salesManStatus: body.status }, { new: true });
        //console.log(f._id);
        await SalesManShop.findByIdAndUpdate(
          { _id: f._id },
          {
            salesManId: body.salesManId,
            shopId: f.shopId,
            status: body.status,
            reAssignDate: serverdate,
            reAssignTime: time,
          },
          { new: true }
        );
      });
    }
    // else {
    //   body.arr.forEach(async (e) => {
    //     await SalesManShop.create({
    //       shopId: e,
    //       status: body.status,
    //       salesManId: body.salesManId,
    //       date: serverdate,
    //       time: time,
    //     });
    //   });
    // }
  });

  return { data: 'created' };
};

const getAllTempReassigndata = async () => {
  const data = await SalesManShop.aggregate([
    {
      $match: {
        $and: [{ status: { $eq: 'tempReassign' } }],
      },
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
        SName: '$b2bshopclonesData.SName',
        mobile: '$b2bshopclonesData.mobile',
        address: '$b2bshopclonesData.address',
      },
    },
  ]);

  return data;
};

const getAssignData_by_SalesMan = async (page) => {
  let values = await Users.aggregate([
    {
      $match: {
        $and: [{ userRole: { $eq: 'fb0dd028-c608-4caa-a7a9-b700389a098d' } }],
      },
    },
    {
      $lookup: {
        from: 'salesmanshops',
        localField: '_id',
        foreignField: 'salesManId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $ne: 'Reassign' } }],
            },
          },
        ],
        as: 'salesMan',
      },
    },
    {
      $lookup: {
        from: 'salesmanshops',
        localField: '_id',
        foreignField: 'salesManId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $ne: 'Reassign' } }, { status: { $ne: 'Assign' } }, { status: { $eq: 'tempReassign' } }],
            },
          },
        ],
        as: 'salesMandata',
      },
    },
    {
      $lookup: {
        from: 'salesmanshops',
        localField: '_id',
        foreignField: 'fromSalesManId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $ne: 'Reassign' } }, { status: { $ne: 'Assign' } }, { status: { $eq: 'tempReassign' } }],
            },
          },
        ],
        as: 'salesmanshopsdata',
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        phoneNumber: 1,
        userRole: 1,
        fromSalesManId: '$saleMan.fromSalesManId',
        no_of_shop: { $size: '$salesMan' },
        no_of_temperory: { $size: '$salesMandata' },
        temp: { $size: '$salesmanshopsdata' },
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await Users.aggregate([
    {
      $match: {
        $and: [{ userRole: { $eq: 'fb0dd028-c608-4caa-a7a9-b700389a098d' } }],
      },
    },
    {
      $lookup: {
        from: 'salesmanshops',
        localField: '_id',
        foreignField: 'salesManId',
        as: 'salesMan',
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        phoneNumber: 1,
        userRole: 1,
        no_of_shop: { $size: '$salesMan' },
      },
    },
  ]);
  return { values: values, total: total.length };
};

const get_Assign_data_By_SalesManId = async (id) => {
  let values = await SalesManShop.aggregate([
    // {
    //   $match: { salesManId: id },
    // },
    {
      $match: {
        $and: [{ salesManId: { $eq: id } }, { status: { $ne: 'Reassign' } }],
      },
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
      $lookup: {
        from: 'b2busers',
        localField: 'salesManId',
        foreignField: '_id',
        as: 'Users',
      },
    },
    {
      $unwind: '$Users',
    },
    {
      $project: {
        _id: 1,
        archive: 1,
        active: 1,
        salesManId: 1,
        shopId: 1,
        fromSalesManId: 1,
        status: 1,
        date: 1,
        time: 1,
        reAssignDate: 1,
        reAssignTime: 1,
        shops: '$b2bshopclonesData.SName',
        salesMan: '$Users.name',
      },
    },
  ]);
  return values;
};

const getUsersWith_skiped = async (id) => {
  let values = await Users.aggregate([
    {
      $match: {
        $and: [{ _id: { $ne: id } }, { userRole: { $eq: 'fb0dd028-c608-4caa-a7a9-b700389a098d' } }],
      },
    },
    {
      $lookup: {
        from: 'salesmanshops',
        localField: '_id',
        pipeline: [
          {
            $match: {
              $and: [{ salesManId: { $eq: id } }, { status: { $eq: 'tempReassign' } }],
            },
          },
        ],
        foreignField: 'fromSalesManId',
        as: 'salesmanshopsData',
      },
    },
    // {
    //   $unwind: '$salesmanshopsData',
    // },
    {
      $project: {
        data: { $size: '$salesmanshopsData' },
        name: 1,
      },
    },
    {
      $match: {
        $and: [{ data: { $eq: 0 } }],
      },
    },
  ]);

  return values;
};

const getDataAll = async () => {
  let values = await Users.aggregate([
    {
      $match: {
        $and: [{ userRole: { $eq: 'fb0dd028-c608-4caa-a7a9-b700389a098d' } }],
      },
    },
  ]);
  return values;
};

const Return_Assign_To_SalesMan = async (id) => {
  let currentDate = moment().format('YYYY-MM-DD');
  let currentTime = moment().format('hh:mm a');
  await SalesManShop.updateMany(
    { fromSalesManId: id, status: 'tempReassign' },
    { $set: { status: 'Assign', salesManId: id, date: currentDate, time: currentTime } },
    { new: true }
  );
  return { Message: 'Successfully Re-Assigned to SalesMan' };
};

const history_Assign_Reaasign_data = async (id, date, idSearch, tempid) => {
  const name = await Users.findById(id);
  let match;
  if (date != 'null' && idSearch == 'null' && tempid == 'null') {
    match = {
      $or: [
        { $and: [{ fromSalesManId: { $eq: id } }, { status: { $eq: 'Assign' } }, { date: { $eq: date } }] },
        { $and: [{ salesManId: { $eq: id } }, { status: { $eq: 'tempReassign' } }, { reAssignDate: { $eq: date } }] },
      ],
    };
  } else if (tempid != 'null' && date == 'null' && idSearch == 'null') {
    match = {
      $or: [
        // { $and: [{ fromSalesManId: {$eq:id } }, { status: {$eq:"tempReassign"} }, {tempid:{$eq:tempid}}] },
        { $and: [{ salesManId: { $eq: id } }, { status: { $eq: 'tempReassign' } }, { fromSalesManId: { $eq: tempid } }] },
      ],
    };
  } else if (tempid != 'null' && date != 'null' && idSearch == 'null') {
    match = {
      $or: [
        // { $and: [{ fromSalesManId: {$eq:id } }, { status: {$eq:"tempReassign"} }, {tempid:{$eq:tempid}}] },
        {
          $and: [
            { salesManId: { $eq: id } },
            { status: { $eq: 'tempReassign' } },
            { reAssignDate: { $eq: date } },
            { fromSalesManId: { $eq: tempid } },
          ],
        },
      ],
    };
  } else if (date != 'null' && idSearch != 'null' && tempid == 'null') {
    match = {
      $or: [
        {
          $and: [
            { fromSalesManId: { $eq: id } },
            { status: { $eq: 'Assign' } },
            { date: { $eq: date } },
            { salesManId: { $eq: idSearch } },
          ],
        },
        {
          $and: [
            { salesManId: { $eq: id } },
            { status: { $eq: 'tempReassign' } },
            { reAssignDate: { $eq: date } },
            { fromSalesManId: { $eq: idSearch } },
          ],
        },
      ],
    };
  } else if (date == 'null' && idSearch != 'null' && tempid == 'null') {
    match = {
      $or: [
        { $and: [{ fromSalesManId: { $eq: id } }, { status: { $eq: 'Assign' } }, { salesManId: { $eq: idSearch } }] },
        { $and: [{ salesManId: { $eq: id } }, { status: { $eq: 'tempReassign' } }, { fromSalesManId: { $eq: idSearch } }] },
      ],
    };
  } else {
    match = {
      $or: [
        { $and: [{ fromSalesManId: { $eq: id } }, { status: { $eq: 'Assign' } }] },
        { $and: [{ salesManId: { $eq: id } }, { status: { $eq: 'tempReassign' } }] },
      ],
    };
  }
  // //console.log(match)
  const data = await SalesManShop.aggregate([
    {
      $match: match,
    },

    {
      $lookup: {
        from: 'b2busers',
        localField: 'fromSalesManId',
        foreignField: '_id',
        as: 'Users',
      },
    },
    {
      $unwind: '$Users',
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'b2bshopclonesdata',
      },
    },
    {
      $unwind: '$b2bshopclonesdata',
    },
    {
      $project: {
        salesMan: '$Users.name',
        salesManId: 1,
        shopId: 1,
        status: 1,
        date: 1,
        fromSalesManId: 1,
        time: 1,
        reAssignDate: 1,
        reAssignTime: 1,
        shopname: '$b2bshopclonesdata.SName',
      },
    },
  ]);
  return { data, name: name.name };
};

const getAllSalesmanShopsCount = async () => {
  const data = await Users.aggregate([
    // {
    {
      $match: {
        $and: [{ userRole: { $eq: 'fb0dd028-c608-4caa-a7a9-b700389a098d' } }],
      },
    },
    {
      $lookup: {
        from: 'salesmanshops',
        let: {
          localField: '$_id',
        },
        pipeline: [
          { $match: { $expr: { $eq: ['$salesManId', '$$localField'] } } },
          {
            $match: {
              $and: [{ status: { $ne: 'Reassign' } }],
            },
          },
        ],
        as: 'b2bshopclonesdata',
      },
    },
    // {
    //   $unwind: '$b2bshopclonesdata',
    // },
    {
      $project: {
        Count: { $size: '$b2bshopclonesdata' },
      },
    },
  ]);
  return data;
};

const getAllSalesmanShopsData = async (id) => {
  const data = await SalesManShop.aggregate([
    // {
    {
      $match: {
        $or: [
          { $and: [{ fromSalesManId: { $eq: id } }, { status: { $eq: 'Assign' } }] },
          { $and: [{ salesManId: { $eq: id } }, { status: { $eq: 'tempReassign' } }] },
        ],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        as: 'b2bshopclonesdata',
      },
    },
    {
      $unwind: '$b2bshopclonesdata',
    },
    {
      $project: {
        shopName: '$b2bshopclonesdata.SName',
        shopOwner: '$b2bshopclonesdata.SOwner',
        mobileNumber: '$b2bshopclonesdata.mobile',
        status: 1,
        date: 1,
        time: 1,
        reAssignDate: 1,
        reAssignTime: 1,
        shopId: 1,
        salesManId: 1,
        fromSalesManId: 1,
      },
    },
  ]);
  return data;
};

const getAllAsmCurrentdata = async (id) => {
  let serverdate = moment().format('YYYY-MM-DD');
  const data = await WardAdminRoleHistory.aggregate([
    {
      $match: {
        $and: [{ b2bUserId: { $eq: id } }, { date: { $eq: serverdate } }],
      },
    },
  ]);
  return data;
};

const WardAdminRoleHistor = async (id, date, page) => {
  let match;
  if (id != 'null' && date == 'null') {
    match = {
      $and: [{ b2bUserId: { $eq: id } }],
    };
  } else if (id == 'null' && date != 'null') {
    match = {
      $and: [{ date: { $eq: date } }],
    };
  } else if (id != 'null' && date != 'null') {
    match = {
      $and: [{ b2bUserId: { $eq: id } }, { date: { $eq: date } }],
    };
  } else {
    match = {
      $and: [{ active: { $eq: true } }],
    };
  }

  const data = await WardAdminRoleHistory.aggregate([
    { $sort: { date: -1 } },
    {
      $match: match,
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'b2bUserId',
        foreignField: '_id',
        as: 'b2busersdata',
      },
    },
    {
      $unwind: '$b2busersdata',
    },
    {
      $project: {
        Name: '$b2busersdata.name',
        targetTonne: 1,
        date: 1,
        time: 1,
        targetValue: 1,
        b2bUserId: 1,
        type: 1,
      },
    },
    {
      $skip: 10 * parseInt(page),
    },
    {
      $limit: 10,
    },
  ]);
  const total = await WardAdminRoleHistory.aggregate([
    { $sort: { date: -1 } },
    {
      $match: match,
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'b2bUserId',
        foreignField: '_id',
        as: 'b2busersdata',
      },
    },
    {
      $unwind: '$b2busersdata',
    },
    {
      $project: {
        Name: '$b2busersdata.name',
        targetTonne: 1,
        date: 1,
        time: 1,
        targetValue: 1,
        b2bUserId: 1,
      },
    },
  ]);
  return { date: data, total: total.length };
};

const WardAdminRoledatas = async (id, date, page) => {
  let match;
  if (id != 'null' && date == 'null') {
    match = {
      $and: [{ b2bUserId: { $eq: id } }],
    };
  } else if (id == 'null' && date != 'null') {
    match = {
      $and: [{ date: { $eq: date } }],
    };
  } else if (id != 'null' && date != 'null') {
    match = {
      $and: [{ b2bUserId: { $eq: id } }, { date: { $eq: date } }],
    };
  } else {
    match = {
      $and: [{ active: { $eq: true } }],
    };
  }

  const data = await WardAdminRole.aggregate([
    { $sort: { date: -1 } },
    {
      $match: match,
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'b2bUserId',
        foreignField: '_id',
        as: 'b2busersdata',
      },
    },
    {
      $unwind: '$b2busersdata',
    },
    {
      $project: {
        Name: '$b2busersdata.name',
        targetTonne: 1,
        date: 1,
        time: 1,
        targetValue: 1,
        b2bUserId: 1,
        type: 1,
        startingValue: 1,
        startingTonne: 1,
      },
    },
    {
      $skip: 10 * parseInt(page),
    },
    {
      $limit: 10,
    },
  ]);
  const total = await WardAdminRole.aggregate([
    // { $sort: { date: -1} },
    {
      $match: match,
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'b2bUserId',
        foreignField: '_id',
        as: 'b2busersdata',
      },
    },
    {
      $unwind: '$b2busersdata',
    },
    {
      $project: {
        Name: '$b2busersdata.name',
        targetTonne: 1,
        date: 1,
        time: 1,
        targetValue: 1,
        b2bUserId: 1,
        type: 1,
        startingValue: 1,
        startingTonne: 1,
      },
    },
    // {
    //   $skip: 10 * parseInt(page),
    // },
    // {
    //   $limit: 10,
    // },
  ]);
  return { data: data, total: total.length };
};

const asmdata = async () => {
  const data = await Users.aggregate([
    {
      $match: {
        $and: [{ userRole: { $eq: '719d9f71-8388-4534-9bfe-3f47faed62ac' } }],
      },
    },
    {
      $project: {
        name: 1,
        //  targetTonne:1,
        //  date:1,
        //  time:1,
        //  targetValue:1,
        //  b2bUserId:1,
      },
    },
  ]);
  return data;
};

const asmSalesman = async (id) => {
  const data = await AsmSalesMan.aggregate([
    {
      $match: {
        $and: [{ asmId: { $eq: id } }, { status: { $eq: 'Assign' } }],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'salesManId',
        foreignField: '_id',
        as: 'b2busersdata',
      },
    },
    {
      $unwind: '$b2busersdata',
    },
    {
      $project: {
        name: '$b2busersdata.name',
        salesManId: 1,
      },
    },
  ]);
  return data;
};
const getAlldataASm = async (id) => {
  let serverdate = moment().format('YYYY-MM-DD');
  const data = await WardAdminRole.aggregate([
    {
      $match: {
        $and: [{ b2bUserId: { $eq: id } }, { date: { $eq: serverdate } }],
      },
    },
  ]);
  return data;
};

const getAllDatasalesmanDataAndAssign = async (id, date, page) => {
  let match;
  if (id != 'null' && date == 'null') {
    match = {
      $and: [{ salesman: { $eq: id } }],
    };
  } else if (id != 'null' && date != 'null') {
    match = {
      $and: [{ salesman: { $eq: id } }, { date: { $eq: date } }],
    };
  } else {
    match = {
      $and: [{ active: { $eq: true } }],
    };
  }
  const data = await WithoutAsmWithAsm.aggregate([
    { $sort: { date: -1 } },
    {
      $match: match,
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'salesman',
        foreignField: '_id',
        as: 'b2busersdata',
      },
    },
    {
      $unwind: '$b2busersdata',
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'wardAdminId',
        foreignField: '_id',
        as: 'b2busersdata1',
      },
    },
    // {
    //   $unwind: '$b2busersdata1',
    // },
    {
      $project: {
        salesmanName: '$b2busersdata.name',
        asmname: '$b2busersdata1.name',
        targetTonne: 1,
        targetValue: 1,
        salesman: 1,
        status: 1,
        type: 1,
        wardAdminId: 1,
        date: 1,
        time: 1,
      },
    },
    {
      $skip: 10 * parseInt(page),
    },
    {
      $limit: 10,
    },
  ]);
  const total = await WithoutAsmWithAsm.aggregate([
    {
      $match: match,
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'salesman',
        foreignField: '_id',
        as: 'b2busersdata',
      },
    },
    {
      $unwind: '$b2busersdata',
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'wardAdminId',
        foreignField: '_id',
        as: 'b2busersdata1',
      },
    },
    // {
    //   $unwind: '$b2busersdata1',
    // },
    {
      $project: {
        salesmanName: '$b2busersdata.name',
        asmname: '$b2busersdata1.name',
        targetTonne: 1,
        targetValue: 1,
        salesman: 1,
        status: 1,
        wardAdminId: 1,
        date: 1,
        time: 1,
      },
    },
  ]);
  return { data: data, total: total.length };
};
const getAlldataSalesmanandtele_wcce = async (id) => {
  let serverdate = moment().format('YYYY-MM-DD');
  const data = await WithoutAsmWithAsm.aggregate([
    {
      $match: {
        $and: [{ salesman: { $eq: id } }, { date: { $eq: serverdate } }],
      },
    },
  ]);
  return data;
};

const WardAdminRoleHistorydata = async (id, date) => {
  const data = await WardAdminRoleHistory.aggregate([
    {
      $match: {
        $and: [{ b2bUserId: { $eq: id } }, { date: { $eq: date } }],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'b2bUserId',
        foreignField: '_id',
        as: 'b2busersdata',
      },
    },
    {
      $unwind: '$b2busersdata',
    },
    {
      $project: {
        asmname: '$b2busersdata.name',
        targetTonne: 1,
        type: 1,
        targetValue: 1,
        date: 1,
        time: 1,
      },
    },
  ]);
  return data;
};

const assignShopsSalesman = async (id, page) => {
  const data = await Ward.aggregate([
    // {
    //   $match: {
    //     $and: [{ _id: { $eq:id} }],
    //   },
    // },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: '_id',
        foreignField: 'Wardid',
        pipeline: [
          {
            $match: {
              $and: [{ Uid: { $eq: id } }],
            },
          },
        ],
        as: 'b2bshopclonesdata',
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: '_id',
        foreignField: 'Wardid',
        pipeline: [
          {
            $match: {
              $and: [{ Uid: { $eq: id } }],
            },
          },
          {
            $lookup: {
              from: 'salesmanshops',
              localField: '_id',
              foreignField: 'shopId',
              pipeline: [
                {
                  $match: {
                    $and: [{ status: { $in: ['Assign', 'tempReassign'] } }],
                  },
                },
              ],
              as: 'salesmanshopsdata',
            },
          },
          {
            $unwind: {
              path: '$salesmanshopsdata',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              assign: { $ifNull: ['$salesmanshopsdata', false] },
            },
          },
          {
            $match: {
              assign: false,
            },
          },
          {
            $project: {
              Slat: 1,
              Slong: 1,
            },
          },
        ],
        as: 'latsalesmanshopsdata',
      },
    },
    {
      $lookup: {
        from: 'salesmanshops',
        localField: 'b2bshopclonesdata._id',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $in: ['Assign', 'tempReassign'] } }],
            },
          },
        ],
        as: 'salesmanshopsdata',
      },
    },

    // {
    //   $lookup: {
    //     from: 'b2bshopclones',
    //     localField: 'salesmanshopsdata.shopId',
    //     foreignField: '_id',
    //     as: 'b2bshopclonesdatalat',
    //   },
    // },
    // {
    //   $unwind:'$b2bshopclonesdatalat'
    // },
    {
      $project: {
        shopCount: { $size: '$b2bshopclonesdata' },
        userId: id,
        ward: 1,
        // latLong:"$b2bshopclonesdatalat",
        assignCount: { $size: '$salesmanshopsdata' },
        unAssignCount: { $subtract: [{ $size: '$b2bshopclonesdata' }, { $size: '$salesmanshopsdata' }] },
        latun: { $size: '$latsalesmanshopsdata' },
        lat: '$latsalesmanshopsdata',
      },
    },
    {
      $match: {
        $and: [{ shopCount: { $ne: 0 } }],
      },
    },
    {
      $skip: 10 * parseInt(page),
    },
    {
      $limit: 10,
    },
  ]);
  const total = await Ward.aggregate([
    // {
    //   $match: {
    //     $and: [{ _id: { $eq:id} }],
    //   },
    // },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: '_id',
        foreignField: 'Wardid',
        pipeline: [
          {
            $match: {
              $and: [{ Uid: { $eq: id } }],
            },
          },
        ],
        as: 'b2bshopclonesdata',
      },
    },
    {
      $lookup: {
        from: 'salesmanshops',
        localField: 'b2bshopclonesdata._id',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $in: ['Assign', 'tempReassign'] } }],
            },
          },
        ],
        foreignField: 'shopId',
        as: 'salesmanshopsdata',
      },
    },
    {
      $project: {
        shopCount: { $size: '$b2bshopclonesdata' },
        userId: id,
        ward: 1,
        assignCount: { $size: '$salesmanshopsdata' },
        unAssignCount: { $subtract: [{ $size: '$b2bshopclonesdata' }, { $size: '$salesmanshopsdata' }] },
      },
    },
    {
      $match: {
        $and: [{ shopCount: { $ne: 0 } }],
      },
    },
  ]);
  return { data: data, count: total.length };
};

const assignShopsSalesmandatewise = async (id, wardid, page) => {
  const data = await Shop.aggregate([
    {
      $match: {
        $and: [{ Wardid: { $eq: wardid } }, { Uid: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'salesmanshops',
        localField: '_id',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $in: ['Assign', 'tempReassign'] } }],
            },
          },
        ],
        as: 'salesmanshopsdata',
      },
    },
    {
      $addFields: {
        assignCount: { $size: '$salesmanshopsdata' },
      },
    },
    {
      $addFields: {
        data: { $size: '$salesmanshopsdata' },
      },
    },
    {
      $group: {
        _id: '$filterDate',
        shopCount: { $sum: 1 },
        assignCount: { $sum: '$assignCount' },
        // Slong: { $push:['$Slong','$Slat']},
        //  categoryId: { $sum: "$Slong"},
        //  parentId: { $sum: "$Uid"}
      },
    },
    {
      $sort: { _id: -1 },
    },
    {
      $skip: 10 * parseInt(page),
    },
    {
      $limit: 10,
    },
  ]);
  const total = await Shop.aggregate([
    {
      $match: {
        $and: [{ Wardid: { $eq: wardid } }, { Uid: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'salesmanshops',
        localField: '_id',
        foreignField: 'shopId',
        pipeline: [
          {
            $match: {
              $and: [{ status: { $in: ['Assign', 'tempReassign'] } }],
            },
          },
        ],
        as: 'salesmanshopsdata',
      },
    },
    {
      $addFields: {
        assignCount: { $size: '$salesmanshopsdata' },
      },
    },
    {
      $group: {
        _id: '$filterDate',
        shopCount: { $sum: 1 },
        assignCount: { $sum: '$assignCount' },
      },
    },
    {
      $sort: { _id: -1 },
    },
  ]);
  const shopdata = await Shop.aggregate([
    {
      $match: {
        $and: [{ Wardid: { $eq: wardid } }, { Uid: { $eq: id } }],
      },
    },
  ]);
  return { data: data, count: total.length, shopdata: shopdata };
};

const assignShopsOnlydatewise = async (id, wardid, page) => {
  const data = await SalesManShop.aggregate([
    {
      $match: {
        $and: [{ status: { $in: ['Assign', 'tempReassign'] } }],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $and: [{ Uid: { $eq: id } }, { Wardid: { $eq: wardid } }],
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
      $lookup: {
        from: 'b2busers',
        localField: 'fromSalesManId',
        foreignField: '_id',
        as: 'b2busers',
      },
    },
    {
      $unwind: '$b2busers',
    },
    {
      $group: {
        _id: { date: '$date', fromSalesManId: '$fromSalesManId', name: '$b2busers.name' },
        assignedShop: { $sum: 1 },
      },
    },
    {
      $sort: { _id: -1 },
    },
    {
      $skip: 10 * parseInt(page),
    },
    {
      $limit: 10,
    },
  ]);
  const total = await SalesManShop.aggregate([
    {
      $match: {
        $and: [{ status: { $in: ['Assign', 'tempReassign'] } }],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $and: [{ Uid: { $eq: id } }, { Wardid: { $eq: wardid } }],
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
      $lookup: {
        from: 'b2busers',
        localField: 'fromSalesManId',
        foreignField: '_id',
        as: 'b2busers',
      },
    },
    {
      $unwind: '$b2busers',
    },
    {
      $group: {
        _id: { date: '$date', fromSalesManId: '$fromSalesManId', name: '$b2busers.name' },
        assignedShop: { $sum: 1 },
      },
    },
  ]);

  return { data: data, count: total.length };
};

const createtartget = async (userId, body) => {
  // Tartgetvalue, TartgetHistory
  let object = {
    ...body,
    ...{
      date: moment().format('YYYY-MM-DD'),
      time: moment().format('hhmmss'),
      created: moment(),
      Auther: userId,
    },
  };
  let target = await Tartgetvalue.findOne({ b2buser: body.b2buser, date: moment().format('YYYY-MM-DD') });
  if (!target) {
    target = await Tartgetvalue.create(object);
  } else {
    let targetKg = target.targetKg + parseInt(body.targetKg);
    let targetvalue = target.targetvalue + parseInt(body.targetvalue);
    target = await Tartgetvalue.findByIdAndUpdate(
      { _id: target._id },
      {
        targetKg: targetKg,
        targetvalue: targetvalue,
      },
      { new: true }
    );
  }
  let target_hist = await TartgetHistory.create({
    targetid: target._id,
    date: moment().format('YYYY-MM-DD'),
    time: moment().format('HHmm'),
    created: moment(),
    targetKg: body.targetKg,
    targetvalue: body.targetvalue,
    teamtype: body.teamtype,
  });
  return target;
};

const get_user_target = async (userid, id) => {
  let todaydata = await TartgetHistory.aggregate([
    {
      $lookup: {
        from: 'targetvalues',
        localField: 'targetid',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              b2buser: { $eq: id },
              date: { $eq: moment().format('YYYY-MM-DD') },
            },
          },
        ],
        as: 'targetvalues',
      },
    },
    {
      $unwind: '$targetvalues',
    },
    {
      $project: {
        created: 1,
        date: 1,
        targetKg: 1,
        targetvalue: 1,
        _id: 1,
      },
    },
  ]);

  return todaydata;
};

const getall_targets = async (query) => {
  let page = query.page == null || query.page == 'null' || query.page == '' ? 0 : query.page;
  let user = query.user;
  let date = query.date;
  let userMatch = { active: true };
  let dateMatch = { active: true };
  if (date != null && date != '' && date != 'null') {
    dateMatch = { date: { $eq: date } };
  }
  if (user != null && user != '' && user != 'null') {
    userMatch = { b2buser: { $eq: user } };
  }
  let value = await Tartgetvalue.aggregate([
    {
      $match: {
        $and: [dateMatch, userMatch],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'b2buser',
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
        from: 'targethistories',
        localField: '_id',
        foreignField: 'targetid',
        as: 'targethistories',
      },
    },
    {
      $project: {
        _id: 1,
        active: 1,
        archive: 1,
        teamtype: 1,
        targetKg: 1,
        targetvalue: 1,
        b2buser: 1,
        date: 1,
        time: 1,
        created: 1,
        name: '$b2busers.name',
        userRole: '$b2busers.userRole',
        targethistories: '$targethistories',
      },
    },
    { $skip: 10 * page },
    {
      $limit: 10,
    },
  ]);
  let total = await Tartgetvalue.aggregate([
    {
      $match: {
        $and: [dateMatch, userMatch],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'b2buser',
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
        from: 'targethistories',
        localField: '_id',
        foreignField: 'targetid',
        as: 'targethistories',
      },
    },
    {
      $project: {
        _id: 1,
        active: 1,
        archive: 1,
        teamtype: 1,
        targetKg: 1,
        targetvalue: 1,
        b2buser: 1,
        date: 1,
        time: 1,
        created: 1,
        name: '$b2busers.name',
        userRole: '$b2busers.userRole',
        targethistories: '$targethistories',
      },
    },
  ]);

  return { values: value, total: total.length };
};

const getusertarget = async (userID) => {
  let value = await Tartgetvalue.findOne({ b2buser: userID, date: moment().format('YYYY-MM-DD') });
  let date = moment().format('YYYY-MM-DD');
  let achivedTarget = await ShopOrderClone.aggregate([
    {
      $match: {
        $and: [{ Uid: { $eq: userID } }, { date: { $eq: date } }],
      },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          { $match: { $and: [{ unit: { $eq: 'KG' } }] } },
          {
            $group: {
              _id: null,
              quantity: {
                $sum: {
                  $multiply: ['$finalQuantity', '$packKg'],
                },
              },
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
    {
      $addFields: {
        kgs: { $ifNull: ['$productorderclones.quantity', 0] },
      },
    },
    {
      $lookup: {
        from: 'productorderclones',
        localField: '_id',
        foreignField: 'orderId',
        pipeline: [
          { $match: { $and: [{ unit: { $ne: 'KG' } }] } },
          {
            $group: {
              _id: null,
              quantity: {
                $sum: '$finalQuantity',
              },
            },
          },
        ],
        as: 'productorderclones_notkg',
      },
    },
    {
      $unwind: {
        path: '$productorderclones_notkg',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        notkgs: { $ifNull: ['$productorderclones_notkg.quantity', 0] },
      },
    },
    {
      $project: {
        _id: 1,
        totalquantity: { $sum: ['$kgs', '$notkgs'] },
        subtotal: 1,
        date: 1,
      },
    },
    {
      $group: {
        _id: 1,
        totalquantity: { $sum: '$totalquantity' },
        ordervalues: { $sum: '$subtotal' },
      },
    },
  ]);
  // return achivedTarget;
  let achivedTarget_obj = {
    orderedKGS: achivedTarget.length == 0 ? 0 : achivedTarget[0].totalquantity,
    ordervalues: achivedTarget.length == 0 ? 0 : achivedTarget[0].ordervalues,
  };

  return {
    ...achivedTarget_obj,
    ...{ targetKg: value == null ? 0 : value.targetKg, targetvalue: value == null ? 0 : value.targetvalue },
  };
};

const re_getAssign_bySalesman = async (userId) => {
  //console.log("hello")
  let values = await Shop.aggregate([
    {
      $sort: { status: 1, gomap: -1 },
    },
    {
      $match: {
        $or: [
          {
            $and: [
              {
                daStatus: { $in: ['Not Interested', 'Cannot Spot the Shop'] }
              },
              {
                Uid: { $eq: userId }
              }
            ]
          },
          {
            $and: [
              {
                daStatus: { $in: ['Not Interested', 'Cannot Spot the Shop'] }
              },
              {
                re_Uid: { $eq: userId }
              }
            ]
          },

        ],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'Uid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'UsersData',
      },
    },
    {
      $unwind: '$UsersData',
    },
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

              as: 'zonedata',
            },
          },
          {
            $unwind: '$zonedata',
          },
          {
            $project: {
              ward: 1,
              zone: '$zonedata.zone',
              zoneCode: '$zoneData.zoneCode',
            },
          },
        ],
        as: 'WardData',
      },
    },
    {
      $unwind: '$WardData',
    },
    {
      $lookup: {
        from: 'streets',
        localField: 'Strid',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              street: 1,
              area: 1,
              locality: 1,
            },
          },
        ],
        as: 'StreetData',
      },
    },
    {
      $unwind: '$StreetData',
    },
    // shoplists
    {
      $lookup: {
        from: 'shoplists',
        localField: 'SType',
        foreignField: '_id',
        // pipeline:[
        //     {
        //       $project: {
        //         street:1
        //       }
        //     }
        // ],
        as: 'shoptype',
      },
    },
    // {
    //   $unwind: '$shoptype',
    // },

    {
      $project: {
        // _id:1,
        // created:1,
        street: '$StreetData.street',
        ward: '$WardData.ward',
        username: '$UsersData.name',
        shoptype: { $cond: { if: { $isArray: '$shoptype' }, then: '$shoptype.shopList', else: [] } },
        Area: '$StreetData.area',
        Locality: '$StreetData.locality',
        photoCapture: 1,
        SName: 1,
        address: 1,
        Slat: 1,
        Slong: 1,
        type: 1,
        status: 1,
        created: 1,
        SOwner: 1,
        kyc_status: 1,
        Uid: 1,
        zone: '$WardData.zone',
        zoneCode: '$WardData.zoneCode',
        active: 1,
        mobile: 1,
        date: 1,
        gomap: 1,
        Re_daStatus: 1
      },
    },
  ]);

  let dataApproved = await Shop.aggregate([
    {
      $match: {
        $or: [
          {
            $and: [
              {
                daStatus: { $in: ['Not Interested', 'Cannot Spot the Shop'] }
              },
              {
                Re_daStatus: { $ne: null }
              },
              {
                Uid: { $eq: userId }
              }
            ]
          },
          {
            $and: [
              {
                daStatus: { $in: ['Not Interested', 'Cannot Spot the Shop'] }
              },
              {
                Re_daStatus: { $ne: null }
              },
              {
                re_Uid: { $eq: userId }
              }
            ]
          },

        ],
      },
    },

  ]);
  let dataNotApproved = await Shop.aggregate([
    {
      $match: {
        $or: [
          {
            $and: [
              {
                daStatus: { $in: ['Not Interested', 'Cannot Spot the Shop'] }
              },
              {
                Re_daStatus: { $eq: null }
              },
              {
                Uid: { $eq: userId }
              }
            ]
          },
          {
            $and: [
              {
                daStatus: { $in: ['Not Interested', 'Cannot Spot the Shop'] }
              },
              {
                Re_daStatus: { $eq: null }
              },
              {
                re_Uid: { $eq: userId }
              }
            ]
          },

        ],
      },
    },

  ]);

  let todaydate = moment().format('YYYY-MM-DD');

  let TodayApproved = await Shop.aggregate([
    {
      $match: {
        $or: [
          {
            $and: [
              {
                daStatus: { $in: ['Not Interested', 'Cannot Spot the Shop'] }
              },
              {
                Re_daStatus: { $ne: null }
              },
              {
                Uid: { $eq: userId }
              },
              { Re_DA_DATE: { $eq: todaydate } }
            ]
          },
          {
            $and: [
              {
                daStatus: { $in: ['Not Interested', 'Cannot Spot the Shop'] }
              },
              {
                Re_daStatus: { $ne: null }
              },
              {
                re_Uid: { $eq: userId }
              },
              { Re_DA_DATE: { $eq: todaydate } }

            ]
          },

        ],
      },
    },

  ]);
  return {
    values: values,
    dataApproved: dataApproved.length,
    dataNotApproved: dataNotApproved.length,
    TodayApproved: TodayApproved.length,
  };

}






const re_getAssign_bySalesman_final_customer = async (userId) => {
  let values = await SalesmanOrderShop.aggregate([
    {
      $match: {
        $or: [
          { $and: [{ fromsalesmanOrderteamId: { $eq: userId } }, { status: { $eq: 'Assign' } }] },
          // { $and: [{ salesmanOrderteamId: { $eq: id } }, { status: { $eq: 'tempReassign' } }] },
        ],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'salesmanOrderteamId',
        foreignField: '_id',
        as: 'b2busersData',
      },
    },
    {
      $unwind: '$b2busersData',
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
              as: 'streets',
            },
          },
          {
            $unwind: '$streets',
          },
          {
            $lookup: {
              from: 'shoplists',
              localField: 'SType',
              foreignField: '_id',
              as: 'shoptype',
            },
          },
          {
            $unwind: '$shoptype',
          },
        ],
        as: 'b2bshopclonesData',
      },
    },
    {
      $unwind: '$b2bshopclonesData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'b2bshopclonesData.Wardid',
        foreignField: '_id',
        as: 'wardsData',
      },
    },
    {
      $unwind: '$wardsData',
    },
    {
      $lookup: {
        from: 'zones',
        localField: 'wardsData.zoneId',
        foreignField: '_id',
        as: 'zonesData',
      },
    },
    {
      $unwind: '$zonesData',
    },
    {
      $project: {
        SName: '$b2bshopclonesData.SName',
        salesmanname: '$b2busersData.name',
        street: "$b2bshopclonesData.streets.street",
        SOwner: "$b2bshopclonesData.SOwner",
        address: "$b2bshopclonesData.address",
        shoptype: "$b2bshopclonesData.shoptype",
        salesmanOrderteamId: 1,
        fromsalesmanOrderteamId: 1,
        shopId: 1,
        ward: '$wardsData.ward',
        zone: '$zonesData.zone',
        status: 1,
        reAssignDate: 1,
        reAssignTime: 1,
        created: "$b2bshopclonesData.created",
        date: "$b2bshopclonesData.date",
        _id: "$b2bshopclonesData._id",
        Slat: "$b2bshopclonesData.Slat",
        Slong: "$b2bshopclonesData.Slong",
        da_long: "$b2bshopclonesData.da_long",
        da_lot: "$b2bshopclonesData.da_lot",
        photoCapture: "$b2bshopclonesData.photoCapture",
        mobile: "$b2bshopclonesData.mobile",
        new_re_approve: "$b2bshopclonesData.new_re_approve",
      },
    },
  ]);

  let dataApproved = await SalesmanOrderShop.aggregate([
    {
      $match: {
        $or: [
          { $and: [{ fromsalesmanOrderteamId: { $eq: userId } }, { status: { $eq: 'Assign' } }] },
          // { $and: [{ salesmanOrderteamId: { $eq: id } }, { status: { $eq: 'tempReassign' } }] },
        ],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'salesmanOrderteamId',
        foreignField: '_id',
        as: 'b2busersData',
      },
    },
    {
      $unwind: '$b2busersData',
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [
          { $match: { $and: [{ new_re_approve: { $ne: null } }] } },
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
          {
            $lookup: {
              from: 'shoplists',
              localField: 'SType',
              foreignField: '_id',
              as: 'shoptype',
            },
          },
          {
            $unwind: '$shoptype',
          },
        ],
        as: 'b2bshopclonesData',
      },
    },
    {
      $unwind: '$b2bshopclonesData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'b2bshopclonesData.Wardid',
        foreignField: '_id',
        as: 'wardsData',
      },
    },
    {
      $unwind: '$wardsData',
    },
    {
      $lookup: {
        from: 'zones',
        localField: 'wardsData.zoneId',
        foreignField: '_id',
        as: 'zonesData',
      },
    },
    {
      $unwind: '$zonesData',
    },
  ]);

  let dataNotApproved = await SalesmanOrderShop.aggregate([
    {
      $match: {
        $or: [
          { $and: [{ fromsalesmanOrderteamId: { $eq: userId } }, { status: { $eq: 'Assign' } }] },
          // { $and: [{ salesmanOrderteamId: { $eq: id } }, { status: { $eq: 'tempReassign' } }] },
        ],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'salesmanOrderteamId',
        foreignField: '_id',
        as: 'b2busersData',
      },
    },
    {
      $unwind: '$b2busersData',
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [
          { $match: { $and: [{ new_re_approve: { $eq: null } }] } },
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
          {
            $lookup: {
              from: 'shoplists',
              localField: 'SType',
              foreignField: '_id',
              as: 'shoptype',
            },
          },
          {
            $unwind: '$shoptype',
          },
        ],
        as: 'b2bshopclonesData',
      },
    },
    {
      $unwind: '$b2bshopclonesData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'b2bshopclonesData.Wardid',
        foreignField: '_id',
        as: 'wardsData',
      },
    },
    {
      $unwind: '$wardsData',
    },
    {
      $lookup: {
        from: 'zones',
        localField: 'wardsData.zoneId',
        foreignField: '_id',
        as: 'zonesData',
      },
    },
    {
      $unwind: '$zonesData',
    },
  ]);

  let todaydate = moment().format('YYYY-MM-DD');

  let TodayApproved = await SalesmanOrderShop.aggregate([
    {
      $match: {
        $or: [
          { $and: [{ fromsalesmanOrderteamId: { $eq: userId } }, { status: { $eq: 'Assign' } }] },
          // { $and: [{ salesmanOrderteamId: { $eq: id } }, { status: { $eq: 'tempReassign' } }] },
        ],
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'salesmanOrderteamId',
        foreignField: '_id',
        as: 'b2busersData',
      },
    },
    {
      $unwind: '$b2busersData',
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [
          { $match: { $and: [{ new_re_approve: { $ne: null } }, { customer_final_date: { $eq: todaydate } }] } },
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
          {
            $lookup: {
              from: 'shoplists',
              localField: 'SType',
              foreignField: '_id',
              as: 'shoptype',
            },
          },
          {
            $unwind: '$shoptype',
          },
        ],
        as: 'b2bshopclonesData',
      },
    },
    {
      $unwind: '$b2bshopclonesData',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'b2bshopclonesData.Wardid',
        foreignField: '_id',
        as: 'wardsData',
      },
    },
    {
      $unwind: '$wardsData',
    },
    {
      $lookup: {
        from: 'zones',
        localField: 'wardsData.zoneId',
        foreignField: '_id',
        as: 'zonesData',
      },
    },
    {
      $unwind: '$zonesData',
    }
  ]);
  return {
    values: values,
    dataApproved: dataApproved.length,
    dataNotApproved: dataNotApproved.length,
    TodayApproved: TodayApproved.length,
  };

}



const getAssign_bySalesman = async (id) => {
  let values = await SalesManShop.aggregate([
    {
      $match: {
        $or: [
          { $and: [{ fromSalesManId: { $eq: id } }, { status: { $eq: 'Assign' } }] },
          { $and: [{ salesManId: { $eq: id } }, { status: { $eq: 'tempReassign' } }] },
        ],
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
      $unwind: {
        path: '$shopData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'salesManId',
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
        salesManId: 1,
        shopId: 1,
        status: 1,
        date: 1,
        fromSalesManId: 1,
        time: 1,
        shopName: '$shopData.SName',
        shopOwner: '$shopData.SOwner',
        shopLat: '$shopData.Slat',
        shopLong: '$shopData.Slong',
        shopAddress: '$shopData.address',
        salesmanName: '$users.name',
        shopStatus: '$shopData.status',
      },
    },
  ]);
  let dataApproved = await SalesManShop.aggregate([
    {
      $match: {
        $or: [
          { $and: [{ fromSalesManId: { $eq: id } }, { status: { $eq: 'Assign' } }] },
          { $and: [{ salesManId: { $eq: id } }, { status: { $eq: 'tempReassign' } }] },
        ],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [{ $match: { status: 'data_approved' } }],
        as: 'shopData',
      },
    },
    {
      $unwind: '$shopData',
    },
  ]);
  let dataNotApproved = await SalesManShop.aggregate([
    {
      $match: {
        $or: [
          { $and: [{ fromSalesManId: { $eq: id } }, { status: { $eq: 'Assign' } }] },
          { $and: [{ salesManId: { $eq: id } }, { status: { $eq: 'tempReassign' } }] },
        ],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [{ $match: { status: { $ne: 'data_approved' } } }],
        as: 'shopData',
      },
    },
    {
      $unwind: '$shopData',
    },
  ]);

  let todaydate = moment().format('YYYY-MM-DD');

  let TodayApproved = await SalesManShop.aggregate([
    {
      $match: {
        $or: [
          { $and: [{ fromSalesManId: { $eq: id } }, { status: { $eq: 'Assign' } }] },
          { $and: [{ salesManId: { $eq: id } }, { status: { $eq: 'tempReassign' } }] },
        ],
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [{ $match: { $and: [{ status: { $eq: 'data_approved' } }, { DA_DATE: { $eq: todaydate } }] } }],
        as: 'shopData',
      },
    },
    {
      $unwind: '$shopData',
    },
  ]);
  return {
    values: values,
    dataApproved: dataApproved.length,
    dataNotApproved: dataNotApproved.length,
    TodayApproved: TodayApproved.length,
  };
};


const map1 = async (id) => {
  return await Users.aggregate([
    {
      $match: { $and: [{ _id: { $eq: id } }] },
    },
    {
      $lookup: {
        from: 'salesmanshops',
        localField: '_id',
        foreignField: 'salesManId',
        pipeline: [
          { $match: { $and: [{ status: { $eq: 'Assign' } }] } },
          {
            $lookup: {
              from: 'b2bshopclones',
              localField: 'shopId',
              foreignField: '_id',
              pipeline: [
                {
                  $project: {
                    Slat: 1,
                    Slong: 1
                  }
                },
              ],
              as: 'b2bshopclones',
            },
          },
          { $unwind: '$b2bshopclones' },
          // {
          //   $group: {
          //     _id: null,
          //     count: { $sum: 1 },
          //   },
          // },
        ],

        as: 'salesmanshopsdata',
      },
    },
    {
      $project: {
        data: "$salesmanshopsdata.b2bshopclones"
      }
    }
  ])
}

const map2 = async (id) => {
  return await Users.aggregate([
    {
      $match: { $and: [{ _id: { $eq: id } }] },
    },
    {
      $lookup: {
        from: 'salesmanshops',
        localField: '_id',
        foreignField: 'salesManId',
        pipeline: [
          { $match: { $and: [{ status: { $eq: 'Assign' } }] } },
          {
            $lookup: {
              from: 'b2bshopclones',
              localField: 'shopId',
              foreignField: '_id',
              pipeline: [
                { $match: { $and: [{ status: { $eq: 'data_approved' } }] } },
                {
                  $project: {
                    Slat: 1,
                    Slong: 1
                  }
                },
              ],
              as: 'b2bshopclones',
            },
          },
          { $unwind: '$b2bshopclones' },
          // {
          //   $group: {
          //     _id: null,
          //     count: { $sum: 1 },
          //   },
          // },
        ],

        as: 'salesmanshopsdata',
      },
    },
    {
      $project: {
        data: "$salesmanshopsdata.b2bshopclones"
      }
    }
  ])
}

const map3 = async (id) => {
  return await Users.aggregate([
    {
      $match: { $and: [{ _id: { $eq: id } }] },
    },
    {
      $lookup: {
        from: 'salesmanshops',
        localField: '_id',
        foreignField: 'salesManId',
        pipeline: [
          { $match: { $and: [{ status: { $eq: 'Assign' } }] } },
          {
            $lookup: {
              from: 'b2bshopclones',
              localField: 'shopId',
              foreignField: '_id',
              pipeline: [
                { $match: { $and: [{ status: { $eq: 'Pending' } }] } },
                {
                  $project: {
                    Slat: 1,
                    Slong: 1
                  }
                },
              ],
              as: 'b2bshopclones',
            },
          },
          { $unwind: '$b2bshopclones' },
          // {
          //   $group: {
          //     _id: null,
          //     count: { $sum: 1 },
          //   },
          // },
        ],

        as: 'salesmanshopsdata',
      },
    },
    {
      $project: {
        data: "$salesmanshopsdata.b2bshopclones"
      }
    }
  ])
}


const overall_Count_And_Data = async (id) => {
  const data = await Users.aggregate([
    {
      $match: { $and: [{ _id: { $eq: id } }] },
    },
    {
      $lookup: {
        from: 'salesmanshops',
        localField: '_id',
        foreignField: 'salesManId',
        pipeline: [
          { $match: { $and: [{ status: { $eq: 'Assign' } }] } },
          {
            $lookup: {
              from: 'b2bshopclones',
              localField: 'shopId',
              foreignField: '_id',
              // pipeline:[
              //   // {
              //   //   $project: {
              //   //     Slat: 1,
              //   //     Slong: 1
              //   //   }
              //   // },
              // ],
              as: 'b2bshopclones',
            },
          },
          { $unwind: '$b2bshopclones' },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],

        as: 'salesmanshopsdata',
      },
    },
    {
      $unwind: {
        path: '$salesmanshopsdata',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'salesmanshops',
        localField: '_id',
        foreignField: 'salesManId',
        pipeline: [
          { $match: { $and: [{ status: { $eq: 'Assign' } }] } },
          {
            $lookup: {
              from: 'b2bshopclones',
              localField: 'shopId',
              foreignField: '_id',
              pipeline: [
                { $match: { $and: [{ status: { $eq: 'data_approved' } }] } },
                // {
                //   $project: {
                //     Slat: 1,
                //     Slong: 1
                //   }
                // },
              ],
              as: 'b2bshopclonesApproved',
            },
          },
          { $unwind: '$b2bshopclonesApproved' },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
        as: 'salesmanshopsdataApproved',
      },
    },
    {
      $unwind: {
        path: '$salesmanshopsdataApproved',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'salesmanshops',
        localField: '_id',
        foreignField: 'salesManId',
        pipeline: [
          { $match: { $and: [{ status: { $eq: 'Assign' } }] } },
          {
            $lookup: {
              from: 'b2bshopclones',
              localField: 'shopId',
              foreignField: '_id',
              pipeline: [
                { $match: { $and: [{ status: { $eq: 'Pending' } }] } },
                // {
                //   $project: {
                //     Slat: 1,
                //     Slong: 1
                //   }
                // },
              ],
              as: 'b2bshopclonesPending',
            },
          },
          { $unwind: '$b2bshopclonesPending' },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
        as: 'salesmanshopsdataPending',
      },
    },
    {
      $unwind: {
        path: '$salesmanshopsdataPending',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        Assign: '$salesmanshopsdata.count',
        dataApproved: '$salesmanshopsdataApproved.count',
        pending: '$salesmanshopsdataPending.count',
      },
    },
  ]);
  const dateWise = await SalesManShop.aggregate([
    {
      $match: { $and: [{ salesManId: { $eq: id } }, { status: { $eq: 'Assign' } }] },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [
          { $match: { $and: [{ status: { $eq: 'data_approved' } }] } },
          {
            $group: {
              _id: 1,
              count: { $sum: 1 },
            }
          }
        ],
        as: 'salesmanshopsdataApproved',
      },
    },
    {
      $unwind: {
        path: '$salesmanshopsdataApproved',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [
          { $match: { $and: [{ status: { $eq: 'Pending' } }] } },
          {
            $group: {
              _id: 1,
              count: { $sum: 1 },
            }
          }
        ],
        as: 'salesmanshopsdataPending',
      },
    },
    {
      $unwind: {
        path: '$salesmanshopsdataPending',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        pending: { $ifNull: ['$salesmanshopsdataPending.count', 0] },
      },
    },
    {
      $addFields: {
        approve: { $ifNull: ['$salesmanshopsdataApproved.count', 0] },
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [
          { $match: { $and: [{ daStatus: "HighlyInterested" }] } },
          {
            $group: {
              _id: 1,
              count: { $sum: 1 },
            }
          }
        ],
        as: 'HighlyInterested',
      },
    },
    {
      $unwind: {
        path: '$HighlyInterested',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        HighlyInterested: { $ifNull: ['$HighlyInterested.count', 0] },
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [
          { $match: { $and: [{ daStatus: "ModeratelyInterested" }] } },
          {
            $group: {
              _id: 1,
              count: { $sum: 1 },
            }
          }
        ],
        as: 'ModeratelyInterested',
      },
    },
    {
      $unwind: {
        path: '$ModeratelyInterested',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        ModeratelyInterested: { $ifNull: ['$ModeratelyInterested.count', 0] },
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [
          { $match: { $and: [{ daStatus: "Not Interested" }] } },
          {
            $group: {
              _id: 1,
              count: { $sum: 1 },
            }
          }
        ],
        as: 'NotInterested',
      },
    },
    {
      $unwind: {
        path: '$NotInterested',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        NotInterested: { $ifNull: ['$NotInterested.count', 0] },
      },
    },
    {
      $lookup: {
        from: 'b2bshopclones',
        localField: 'shopId',
        foreignField: '_id',
        pipeline: [
          { $match: { $and: [{ daStatus: "Cannot Spot the Shop" }] } },
          {
            $group: {
              _id: 1,
              count: { $sum: 1 },
            }
          }
        ],
        as: 'CannotSpottheShop',
      },
    },
    {
      $unwind: {
        path: '$CannotSpottheShop',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        CannotSpottheShop: { $ifNull: ['$CannotSpottheShop.count', 0] },
      },
    },
    {
      $project: {
        _id: 1,
        date: 1,
        pending: 1,
        approve: 1,
        HighlyInterested: 1,
        ModeratelyInterested: 1,
        NotInterested: 1,
        CannotSpottheShop: 1,
      }
    },
    {
      $group: {
        _id: { date: '$date', },
        quantity: {
          $sum: 1,
        },
        pending: {
          $sum: "$pending"
        },
        approved: {
          $sum: "$approve"
        },
        HighlyInterested: {
          $sum: "$HighlyInterested"
        },
        ModeratelyInterested: {
          $sum: "$ModeratelyInterested"
        },
        NotInterested: {
          $sum: "$NotInterested"
        },
        CannotSpottheShop: {
          $sum: "$CannotSpottheShop"
        },
      },
    },
  ]);
  const totalInterest = await Users.aggregate([
    {
      $match: { $and: [{ _id: { $eq: id } }] },
    },
    {
      $lookup: {
        from: 'salesmanshops',
        localField: '_id',
        foreignField: 'salesManId',
        pipeline: [
          { $match: { $and: [{ status: { $eq: 'Assign' } }] } },
          {
            $lookup: {
              from: 'b2bshopclones',
              localField: 'shopId',
              foreignField: '_id',
              pipeline: [
                { $match: { $and: [{ daStatus: { $eq: 'HighlyInterested' } }] } },
              ],
              as: 'b2bshopclones',
            },
          },
          { $unwind: '$b2bshopclones' },
          // {
          //   $group: {
          //     _id: null,
          //     count: { $sum: 1 },
          //   },
          // },
        ],

        as: 'salesmanshopsdata',
      },
    },
    {
      $lookup: {
        from: 'salesmanshops',
        localField: '_id',
        foreignField: 'salesManId',
        pipeline: [
          { $match: { $and: [{ status: { $eq: 'Assign' } }] } },
          {
            $lookup: {
              from: 'b2bshopclones',
              localField: 'shopId',
              foreignField: '_id',
              pipeline: [
                { $match: { $and: [{ daStatus: { $eq: 'ModeratelyInterested' } }] } },
              ],
              as: 'b2bshopclones',
            },
          },
          { $unwind: '$b2bshopclones' },
          // {
          //   $group: {
          //     _id: null,
          //     count: { $sum: 1 },
          //   },
          // },
        ],

        as: 'salesmanshopsdataMod',
      },
    },
    {
      $lookup: {
        from: 'salesmanshops',
        localField: '_id',
        foreignField: 'salesManId',
        pipeline: [
          { $match: { $and: [{ status: { $eq: 'Assign' } }] } },
          {
            $lookup: {
              from: 'b2bshopclones',
              localField: 'shopId',
              foreignField: '_id',
              pipeline: [
                { $match: { $and: [{ daStatus: { $eq: 'Not Interested' } }] } },
              ],
              as: 'b2bshopclones',
            },
          },
          { $unwind: '$b2bshopclones' },
          // {
          //   $group: {
          //     _id: null,
          //     count: { $sum: 1 },
          //   },
          // },
        ],

        as: 'salesmanshopsdataNot',
      },
    },
    {
      $lookup: {
        from: 'salesmanshops',
        localField: '_id',
        foreignField: 'salesManId',
        pipeline: [
          { $match: { $and: [{ status: { $eq: 'Assign' } }] } },
          {
            $lookup: {
              from: 'b2bshopclones',
              localField: 'shopId',
              foreignField: '_id',
              pipeline: [
                { $match: { $and: [{ daStatus: { $eq: 'Cannot Spot the Shop' } }] } },
              ],
              as: 'b2bshopclones',
            },
          },
          { $unwind: '$b2bshopclones' },
          // {
          //   $group: {
          //     _id: null,
          //     count: { $sum: 1 },
          //   },
          // },
        ],

        as: 'salesmanshopsdataCan',
      },
    },
    {
      $project: {
        high: "$salesmanshopsdata.b2bshopclones",
        mod: "$salesmanshopsdataMod.b2bshopclones",
        not: "$salesmanshopsdataNot.b2bshopclones",
        can: "$salesmanshopsdataCan.b2bshopclones"
      }
    }
  ])
  return { date: data, dateWise: dateWise, totalInterest: totalInterest };
};

module.exports = {
  createwardAdminRole,
  getAll,
  getWardAdminRoleById,
  createwardAdminRoleAsm,
  getAllWardAdminRoleData,
  smData,
  total,
  createAsmSalesman,
  getAsmSalesman,
  allAssignReassignSalesman,
  createSalesmanShop,
  getSalesman,
  getAllSalesMandataCurrentdate,
  createwithoutoutAsmSalesman,
  withoutoutAsmSalesmanCurrentDate,
  withoutoutAsmSalesman,
  dataAllSalesManhistry,
  allocateDealocateCount,
  createtemperaryAssigndata,
  getAllTempReassigndata,
  getAssignData_by_SalesMan,
  get_Assign_data_By_SalesManId,
  getUsersWith_skiped,
  Return_Assign_To_SalesMan,
  history_Assign_Reaasign_data,
  WardAdminRoleAsmHistorydata,
  getAllSalesmanShopsCount,
  getAllSalesmanShopsData,
  getDataAll,
  getAllAsmCurrentdata,
  createwithAsmwithoutAsm,
  createwithAsmwithoutAsm,
  getwithAsmwithoutAsm,
  getwithAsmwithoutAsm1,
  WardAdminRoleHistor,
  getAllWithAsmwithout,
  asmdata,
  asmSalesman,
  telecallerHead,
  wardwcce,
  getAlldataASm,
  getAllDatasalesmanDataAndAssign,
  getAlldataSalesmanandtele_wcce,
  telecallernames,
  WardAdminRoleHistorydata,
  WardAdminRoledatas,
  assignShopsSalesman,
  assignShopsSalesmandatewise,
  assignShopsOnlydatewise,

  // 08-11-2022
  createtartget,
  get_user_target,
  getall_targets,
  getusertarget,
  // map view
  getAssign_bySalesman,
  //26-11-2022
  overall_Count_And_Data,
  map1,
  map2,
  map3,
  re_getAssign_bySalesman,
  re_getAssign_bySalesman_final_customer
};
