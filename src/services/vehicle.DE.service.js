const httpStatus = require('http-status');
const { Vehicle, AssignDriver, AssignDrivechild } = require('../models/vehicle.DE.model');
const ApiError = require('../utils/ApiError');
const moment = require('moment');
const { Users } = require('../models/B2Busers.model');
const { response } = require('express');

// create New Vehicle for DeliveryExecutive
const createVehicle = async (body) => {
  const values = {
    ...body,
    ...{
      created: moment(),
      date: moment().format('YYYY-MM-DD'),
      time: moment().format('HH:mm'),
      kgsValue: body.tonne_Capacity * 1000,
    },
  };
  let create = await Vehicle.create(values);
  return create;
};

// fetch All Active Vehicles for DeliveryExecutive

const getVehicle = async (page) => {
  let values = await Vehicle.aggregate([{ $skip: 10 * page }, { $limit: 10 }]);
  let total = await Vehicle.find().count();
  return { values: values, total: total };
};

// fetch ward DeliveryExecutives && active Vehicles

const getVehicle_and_DE = async () => {
  // find deliveryExecutives
  const DeliveryExecutives = await Users.find({ userRole: '36151bdd-a8ce-4f80-987e-1f454cd0993f' });
  //  find active vehicles
  const getVehicle = await Vehicle.find({ active: true });
  return { DeliveryExecutives: DeliveryExecutives, activeVehicles: getVehicle };
};

const getAll_Vehicle_Details = async () => {
  const vehicles = await Vehicle.aggregate([
    {
      $lookup: {
        from: 'wardadmingroups',
        localField: '_id',
        foreignField: 'vehicleId',
        pipeline: [{ $match: { manageDeliveryStatus: { $ne: 'cashReturned' } } }],
        as: 'wardadmingroups',
      },
    },
    {
      $project: {
        RC_book_image: 1,
        vehicle_image: 1,
        active: 1,
        archive: 1,
        vehicle_type: 1,
        vehicle_Owner_Name: 1,
        ownerShip_Type: 1,
        vehicleNo: 1,
        tonne_Capacity: 1,
        vehicle_Name: 1,
        created: 1,
        date: 1,
        time: 1,
        kgsValue: 1,
        // wardadmingroups: '$wardadmingroups',
        wardadmingroups: { $size: '$wardadmingroups' },
        extendedKg: 1,
      },
    },
    { $match: { wardadmingroups: { $eq: 0 } } },
  ]);
  return vehicles;
};

const assigndriverVehile = async (body) => {
  let serverdates = moment().format('YYYY-MM-DD');
  const group = await AssignDriver.find({ date: serverdates });
  // //console.log(group);
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
  let userId = '';
  let totalcount = group.length + 1;
  // //console.log(totalcount);
  userId = 'D' + center + totalcount;

  let bodydata = {
    ...body,
    ...{ created: moment(), date: moment().format('YYYY-MM-DD'), time: moment().format('HHmm'), groupID: userId },
  };
  let driver = await AssignDriver.create(bodydata);
  // //console.log(body)
  body.group.forEach(async (res) => {
    await AssignDrivechild.create({
      groupID: res,
      assignGroupId: driver._id,
      created: moment(),
      date: moment().format('YYYY-MM-DD'),
      time: moment().format('HHmm'),
    });
  });

  return driver;
};

const getallassigngroups = async (query) => {
  let page = query.page == null || query.page == '' ? 0 : query.page;
  let date = query.date;
  let user = query.driver;
  let dateMatch = { active: true };
  let userMatch = { active: true };
  if (date != null && date != '' && user != 'null') {
    dateMatch = { date: { $eq: date } };
  }
  if (user != null && user != '' && user != 'null') {
    userMatch = { driverID: { $eq: user } };
  }
  let driver = await AssignDriver.aggregate([
    { $sort: { date: -1 } },
    { $match: { $and: [dateMatch, userMatch] } },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'driverID',
        foreignField: '_id',
        as: 'b2busers',
      },
    },
    {
      $unwind: '$b2busers',
    },
    {
      $project: {
        created: 1,
        _id: 1,
        date: 1,
        time: 1,
        groupID: 1,
        driverName: '$b2busers.name',
        route: 1,
      },
    },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  let total = await AssignDriver.aggregate([
    { $sort: { date: -1 } },
    { $match: { $and: [dateMatch, userMatch] } },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'driverID',
        foreignField: '_id',
        as: 'b2busers',
      },
    },
    {
      $unwind: '$b2busers',
    },
    {
      $project: {
        created: 1,
        _id: 1,
        date: 1,
        time: 1,
        groupID: 1,
        driverName: '$b2busers.name',
        route: 1,
      },
    },
  ]);

  return { value: driver, total: total.length };
};

const drivergroups = async (query) => {
  let groupid = query.id;

  let driver = await AssignDriver.aggregate([
    { $sort: { date: -1 } },
    { $match: { $and: [{ _id: { $eq: groupid } }] } },
    {
      $lookup: {
        from: 'b2busers',
        localField: 'driverID',
        foreignField: '_id',
        as: 'b2busers',
      },
    },
    {
      $unwind: '$b2busers',
    },
    {
      $lookup: {
        from: 'assigndrivehistories',
        localField: '_id',
        foreignField: 'assignGroupId',
        pipeline: [
          {
            $lookup: {
              from: 'wardadmingroups',
              localField: 'groupID',
              foreignField: '_id',
              pipeline: [
                {
                  $lookup: {
                    from: 'b2busers',
                    localField: 'deliveryExecutiveId',
                    foreignField: '_id',
                    as: 'b2busers',
                  },
                },
                {
                  $unwind: '$b2busers',
                },
                {
                  $lookup: {
                    from: 'managepickuplocations',
                    localField: 'pickuplocation',
                    foreignField: '_id',
                    as: 'managepickuplocations',
                  },
                },
                {
                  $unwind: '$managepickuplocations',
                },
                {
                  $lookup: {
                    from: 'orderassigns',
                    localField: '_id',
                    foreignField: 'wardAdminGroupID',
                    pipeline: [{ $group: { _id: null, count: { $sum: 1 } } }],
                    as: 'orderassigns',
                  },
                },
                {
                  $unwind: {
                    path: '$orderassigns',
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $project: {
                    groupId: 1,
                    _id: 1,
                    stationeryExName: '$b2busers.name',
                    assignTime: 1,
                    assignDate: 1,
                    GroupBillId: 1,
                    pickuplocation: 1,
                    pickuplocation: '$managepickuplocations.locationName',
                    orderCount: '$orderassigns.count',
                  },
                },
              ],
              as: 'wardadmingroups',
            },
          },
          {
            $unwind: '$wardadmingroups',
          },
          {
            $project: {
              _id: '$wardadmingroups._id',
              stationeryExName: '$wardadmingroups.stationeryExName',
              groupId: '$wardadmingroups.groupId',
              assignTime: '$wardadmingroups.assignTime',
              assignDate: '$wardadmingroups.assignDate',
              GroupBillId: '$wardadmingroups.GroupBillId',
              pickuplocation: '$wardadmingroups.pickuplocation',
              GroupBillId: '$wardadmingroups.GroupBillId',
              orderCount: '$wardadmingroups.orderCount',
            },
          },
        ],
        as: 'assigndrivehistories',
      },
    },
    {
      $project: {
        created: 1,
        _id: 1,
        date: 1,
        time: 1,
        groupID: 1,
        driverName: '$b2busers.name',
        route: 1,
        assigndrivehistories: '$assigndrivehistories',
      },
    },
  ]);

  if (driver.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Odrer Not Found');
  }
  return driver[0];
};

// update Exist vehicle details

const updateVehicle_Details = async (id, body) => {
  let values = await Vehicle.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.NOT_EXTENDED, 'Vehicle Not found');
  }
  values = await Vehicle.findByIdAndUpdate({ _id: id }, body, { new: true });
  return values;
};

const getVehicleById = async (id) => {
  let values = await Vehicle.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle Not Found');
  }
  return values;
};

module.exports = {
  createVehicle,
  getVehicle,
  getVehicle_and_DE,
  getAll_Vehicle_Details,
  assigndriverVehile,
  getallassigngroups,
  drivergroups,
  updateVehicle_Details,
  getVehicleById,
};
