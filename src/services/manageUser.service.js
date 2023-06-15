const httpStatus = require('http-status');
const { ManageUser } = require('../models');
const ApiError = require('../utils/ApiError');
const { Street } = require('../models');

const createManageUser = async (manageUserBody) => {
  const check = await ManageUser.find({ mobileNumber: manageUserBody.mobileNumber });

  if (check != '') {
    throw new ApiError(httpStatus.NOT_FOUND, 'already register the number');
  }
  return ManageUser.create(manageUserBody);
};

const getManageUserById = async (id) => {
  return ManageUser.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'zones',
        localField: 'preferredZone',
        foreignField: '_id',
        as: 'zonesdata',
      },
    },
    {
      $unwind: '$zonesdata',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'preferredWard',
        foreignField: '_id',
        as: 'wardsdata',
      },
    },
    {
      $unwind: '$wardsdata',
    },
    {
      $lookup: {
        from: 'districts',
        localField: 'preferredDistrict',
        foreignField: '_id',
        as: 'districtsdata',
      },
    },
    {
      $unwind: '$districtsdata',
    },
    {
      $lookup: {
        from: 'districts',
        pipeline: [],
        as: 'districtsdataAll',
      },
    },
    {
      $lookup: {
        from: 'zones',
        localField: 'preferredDistrict',
        foreignField: 'districtId',
        as: 'zonedataAll',
      },
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'preferredZone',
        foreignField: 'zoneId',
        as: 'warddataAll',
      },
    },
    {
      $project: {
        name: 1,
        mobileNumber: 1,
        preferredZone: '$zonesdata.zone',
        preferredWard: '$wardsdata.ward',
        districtsdataAll: '$districtsdataAll',
        zonedataAll: '$zonedataAll',
        warddataAll: '$warddataAll',
        created: 1,
        addressProofUpload: 1,
        idProofUpload: 1,
        twoWheelerUpload: 1,
        _id: 1,
        preferredDistrict: '$districtsdata.district',
        active: 1,
        archive: 1,
        dateOfBirth: 1,
        gender: 1,
        educationQualification: 1,
        mobileNumber1: 1,
        whatsappNumber: 1,
        address: 1,
        pincode: 1,
        phoneModel: 1,
        idProofNo: 1,
        addressProofNo: 1,
        twoWheeler: 1,
        BasetwoWheelerUpload: 1,
        BaseaddressProofUpload: 1,
        BaseidProofUpload: 1,
        preferredWardId: '$wardsdata._id',
        preferredZoneId: '$zonesdata._id',
        preferredDistrictId: '$districtsdata._id',
        // allocated:1,
      },
    },
  ]);
};

const getManageUserdataById = async (id) => {
  return ManageUser.findById(id);
};

const getManageUserdataByIdStatus = async (id, streetId, status, page) => {
  let match;
  if (streetId != 'null' && status == 'Approved') {
    match = {
      $and: [
        { 'streetsdata.AllocatedUser': { $eq: id } },
        { 'streetsdata.AllocationStatus': { $ne: 'DeAllocated' } },
        { 'streetsdata._id': { $eq: streetId } },
        { 'streetsdata.filter': { $eq: 'Approved' } },
        { active: { $eq: true } },
      ],
    };
  } else if (streetId == 'null' && status == 'Approved') {
    match = {
      $and: [
        { 'streetsdata.AllocatedUser': { $eq: id } },
        { 'streetsdata.AllocationStatus': { $ne: 'DeAllocated' } },
        { 'streetsdata.filter': { $eq: 'Approved' } },
        { active: { $eq: true } },
      ],
    };
  } else if (streetId != 'null' && status == 'Rejected') {
    match = {
      $and: [
        { 'streetsdata.AllocatedUser': { $eq: id } },
        { 'streetsdata._id': { $eq: streetId } },
        { 'streetsdata.AllocationStatus': { $ne: 'DeAllocated' } },
        { 'streetsdata.filter': { $eq: 'Rejected' } },
        { active: { $eq: true } },
      ],
    };
  } else if (streetId == 'null' && status == 'Rejected') {
    match = {
      $and: [
        { 'streetsdata.AllocatedUser': { $eq: id } },
        { 'streetsdata.AllocationStatus': { $ne: 'DeAllocated' } },
        { 'streetsdata.filter': { $eq: 'Rejected' } },
        { active: { $eq: true } },
      ],
    };
  } else if (streetId != 'null' && status == 'Pending') {
    match = {
      $or: [
        {
          $and: [
            { 'streetsdata.AllocatedUser': { $eq: id } },
            { 'streetsdata._id': { $eq: streetId } },
            { 'streetsdata.closed': { $eq: 'close' } },
            { 'streetsdata.filter': { $ne: 'Approved' } },
            { 'streetsdata.filter': { $ne: 'Rejected' } },
            { 'streetsdata.filter': { $eq: 'fullypending' } },
            { active: { $eq: true } },
          ],
        },
        {
          $and: [
            { 'streetsdata.AllocatedUser': { $eq: id } },
            { 'streetsdata._id': { $eq: streetId } },
            { 'streetsdata.closed': { $eq: 'close' } },
            { 'streetsdata.filter': { $ne: 'Approved' } },
            { 'streetsdata.filter': { $ne: 'Rejected' } },
            { 'streetsdata.filter': { $eq: 'partialpending' } },
            { active: { $eq: true } },
          ],
        },
        {
          $and: [
            { 'streetsdata.AllocatedUser': { $eq: id } },
            { 'streetsdata._id': { $eq: streetId } },
            { 'streetsdata.closed': { $eq: 'close' } },
            { 'streetsdata.filter': { $ne: 'Approved' } },
            { 'streetsdata.filter': { $ne: 'Rejected' } },
            { 'streetsdata.filter': { $eq: 'completed' } },
            { active: { $eq: true } },
          ],
        },
      ],
    };
  } else if (streetId == 'null' && status == 'Pending') {
    match = {
      $or: [
        {
          $and: [
            { 'streetsdata.AllocatedUser': { $eq: id } },
            { 'streetsdata.closed': { $eq: 'close' } },
            { 'streetsdata.filter': { $ne: 'Approved' } },
            { 'streetsdata.filter': { $ne: 'Rejected' } },
            { 'streetsdata.filter': { $eq: 'fullypending' } },
            { active: { $eq: true } },
          ],
        },
        {
          $and: [
            { 'streetsdata.AllocatedUser': { $eq: id } },
            { 'streetsdata.closed': { $eq: 'close' } },
            { 'streetsdata.filter': { $ne: 'Approved' } },
            { 'streetsdata.filter': { $ne: 'Rejected' } },
            { 'streetsdata.filter': { $eq: 'partialpending' } },
            { active: { $eq: true } },
          ],
        },
        {
          $and: [
            { 'streetsdata.AllocatedUser': { $eq: id } },
            { 'streetsdata.closed': { $eq: 'close' } },
            { 'streetsdata.filter': { $ne: 'Approved' } },
            { 'streetsdata.filter': { $ne: 'Rejected' } },
            { 'streetsdata.filter': { $eq: 'completed' } },
            { active: { $eq: true } },
          ],
        },
      ],
    };
  } else if (streetId != 'null' && status == 'DeAllocated') {
    match = {
      $and: [
        { 'streetsdata.DeAllocatedUser': { $eq: id } },
        { 'streetsdata._id': { $eq: streetId } },
        { 'streetsdata.AllocationStatus': { $eq: 'DeAllocated' } },
        { 'streetsdata.closed': { $eq: null } },
        { active: { $eq: true } },
      ],
    };
  } else if (streetId == 'null' && status == 'DeAllocated') {
    match = {
      $and: [
        { 'streetsdata.DeAllocatedUser': { $eq: id } },
        { 'streetsdata.AllocationStatus': { $eq: 'DeAllocated' } },
        { 'streetsdata.closed': { $eq: null } },
        { active: { $eq: true } },
      ],
    };
  } else if (streetId != 'null' && status == 'Closed') {
    match = {
      $and: [
        { 'streetsdata.AllocatedUser': { $eq: id } },
        { 'streetsdata._id': { $eq: streetId } },
        { 'streetsdata.filter': { $ne: 'Approved' } },
        { 'streetsdata.filter': { $eq: 'userpending' } },
        { 'streetsdata.filter': { $ne: 'Rejected' } },
        { 'streetsdata.AllocationStatus': { $eq: 'Allocated' } },
        { 'streetsdata.closed': { $eq: null } },
        { active: { $eq: true } },
      ],
    };
  } else if (streetId == 'null' && status == 'Closed') {
    match = {
      $and: [
        { 'streetsdata.AllocatedUser': { $eq: id } },
        { 'streetsdata.AllocationStatus': { $eq: 'Allocated' } },
        { 'streetsdata.filter': { $ne: 'Approved' } },
        { 'streetsdata.filter': { $eq: 'userpending' } },
        { 'streetsdata.filter': { $ne: 'Rejected' } },
        { 'streetsdata.closed': { $eq: null } },
        { active: { $eq: true } },
      ],
    };
  } else if (streetId != 'null' && status == 'null') {
    match = {
      $and: [
        { 'streetsdata.AllocatedUser': { $eq: id } },
        { 'streetsdata._id': { $eq: streetId } },
        { active: { $eq: true } },
      ],
    };
  } else {
    match = { $and: [{ _id: { $eq: id } }, { active: { $eq: true } }] };
  }
  // //console.log(match);
  const man = await ManageUser.aggregate([
    // {
    //   $match: {
    //     $and: [{ _id: { $eq: id }}],
    //   },
    // },
    {
      $lookup: {
        from: 'streets',
        localField: '_id',
        foreignField: 'AllocatedUser',
        as: 'streetsdata',
      },
    },
    {
      $unwind: '$streetsdata',
    },
    {
      $lookup: {
        from: 'zones',
        localField: 'streetsdata.zone',
        foreignField: '_id',
        as: 'zonesdata',
      },
    },
    {
      $unwind: '$zonesdata',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'streetsdata.wardId',
        foreignField: '_id',
        as: 'wardsdata',
      },
    },
    {
      $unwind: '$wardsdata',
    },
    {
      $lookup: {
        from: 'districts',
        localField: 'streetsdata.district',
        foreignField: '_id',
        as: 'districtsdata',
      },
    },
    {
      $unwind: '$districtsdata',
    },
    {
      $match: match,
    },
    {
      $project: {
        name: 1,
        mobileNumber: 1,
        preferredZone: '$zonesdata.zone',
        preferredWard: '$wardsdata.ward',
        created: 1,
        addressProofUpload: 1,
        idProofUpload: 1,
        twoWheelerUpload: 1,
        _id: 1,
        preferredDistrict: '$districtsdata.district',
        active: 1,
        archive: 1,
        BasetwoWheelerUpload: 1,
        BaseaddressProofUpload: 1,
        BaseidProofUpload: 1,
        preferredWardId: '$wardsdata._id',
        streetData: '$streetsdata',
      },
    },
    {
      $skip: 10 * page,
    },
    {
      $limit: 10,
    },
  ]);
  const count = await ManageUser.aggregate([
    {
      $lookup: {
        from: 'streets',
        localField: '_id',
        foreignField: 'AllocatedUser',
        as: 'streetsdata',
      },
    },
    {
      $unwind: '$streetsdata',
    },
    {
      $lookup: {
        from: 'zones',
        localField: 'streetsdata.zone',
        foreignField: '_id',
        as: 'zonesdata',
      },
    },
    {
      $unwind: '$zonesdata',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'streetsdata.wardId',
        foreignField: '_id',
        as: 'wardsdata',
      },
    },
    {
      $unwind: '$wardsdata',
    },
    {
      $lookup: {
        from: 'districts',
        localField: 'streetsdata.district',
        foreignField: '_id',
        as: 'districtsdata',
      },
    },
    {
      $unwind: '$districtsdata',
    },
    {
      $match: match,
    },
    {
      $project: {
        name: 1,
        mobileNumber: 1,
        preferredZone: '$zonesdata.zone',
        preferredWard: '$wardsdata.ward',
        created: 1,
        addressProofUpload: 1,
        idProofUpload: 1,
        twoWheelerUpload: 1,
        _id: 1,
        preferredDistrict: '$districtsdata.district',
        active: 1,
        archive: 1,
        BasetwoWheelerUpload: 1,
        BaseaddressProofUpload: 1,
        BaseidProofUpload: 1,
        preferredWardId: '$wardsdata._id',
        streetData: '$streetsdata',
      },
    },
  ]);
  const street = await Street.find({ AllocatedUser: id, AllocationStatus: { $ne: 'DeAllocated' } });
  // const allocatedStatus = await Street.find({AllocatedUser:id, AllocationStatus:"Allocated"});
  const closeCount = await Street.find({ AllocatedUser: id, closed: 'close', AllocationStatus: { $ne: 'DeAllocated' } });
  const rejectsCount = await Street.find({
    AllocatedUser: id,
    filter: 'Rejected',
    AllocationStatus: { $ne: 'DeAllocated' },
  });
  const pendCount = await Street.find({
    $and: [
      { AllocatedUser: { $eq: id } },
      { closed: { $eq: 'close' } },
      { filter: { $ne: 'Approved' } },
      { filter: { $ne: 'Rejected' } },
      { AllocationStatus: { $ne: 'DeAllocated' } },
    ],
  });
  const approveCount = await Street.find({
    AllocatedUser: id,
    filter: 'Approved',
    AllocationStatus: { $ne: 'DeAllocated' },
  });
  const deallocCount = await Street.find({ DeAllocatedUser: id });
  // if (!street) {
  //   throw new ApiError(httpStatus.NOT_FOUND, 'manageUserAllocate not found');
  // }
  return {
    //  data1:street,
    data: man,
    allocateCount: street.length,
    //  allaocatedStatusCount:allocatedStatus.length,
    closedCount: closeCount.length,
    rejectCount: rejectsCount.length,
    aprovedCount: approveCount.length,
    deAllocatedCount: deallocCount.length,
    pendingCount: pendCount.length,
    count: count.length,
  };
};

const loginManageUserEmailAndPassword = async (mobileNumber, dateOfBirth) => {
  const interviewerRegistration = await ManageUser.find({ mobileNumber: mobileNumber });
  //console.log(interviewerRegistration[0].dateOfBirth);
  let dob = interviewerRegistration[0].dateOfBirth.replace(/[^0-9\.]+/g, '');
  if (interviewerRegistration != '') {
    if (dob == dateOfBirth) {
    } else {
      throw new ApiError(httpStatus.NOT_FOUND, 'DOB Not Match');
    }
  } else {
    throw new ApiError(httpStatus.NOT_FOUND, 'Mobile Number Not Registored');
  }

  return interviewerRegistration;
};

const ManageUserAll = async () => {
  const Manage = await ManageUser.find({ active: true });
  if (!Manage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Manage not found');
  }
  return Manage;
};

const ManageUserAllenable = async () => {
  const Manage = await ManageUser.find();
  return Manage;
};

const manageUserAllTable = async (id, districtId, zoneId, wardId, status, page) => {
  let match;
  if (id != 'null' && districtId != 'null' && zoneId != 'null' && wardId != 'null' && status == 'Allocated') {
    match = [
      { _id: { $eq: id } },
      { preferredDistrict: { $eq: districtId } },
      { preferredZone: { $eq: zoneId } },
      { preferredWard: { $eq: wardId } },
      { allocated: { $eq: 'Allocated' } },
    ];
  } else if (id != 'null' && districtId == 'null' && zoneId == 'null' && wardId == 'null' && status == 'Allocated') {
    match = [{ _id: { $eq: id } }, { allocated: { $eq: 'Allocated' } }];
  } else if (id == 'null' && districtId == 'null' && zoneId == 'null' && wardId == 'null' && status == 'Allocated') {
    match = [{ allocated: { $eq: 'Allocated' } }];
  } else if (id == 'null' && districtId != 'null' && zoneId == 'null' && wardId == 'null' && status == 'Allocated') {
    match = [{ preferredDistrict: { $eq: districtId } }, { allocated: { $eq: 'Allocated' } }];
  } else if (id == 'null' && districtId != 'null' && zoneId != 'null' && wardId == 'null' && status == 'Allocated') {
    match = [
      { preferredDistrict: { $eq: districtId } },
      { preferredZone: { $eq: zoneId } },
      { allocated: { $eq: 'Allocated' } },
    ];
  } else if (id == 'null' && districtId != 'null' && zoneId != 'null' && wardId != 'null' && status == 'Allocated') {
    match = [
      { preferredDistrict: { $eq: districtId } },
      { preferredZone: { $eq: zoneId } },
      { preferredWard: { $eq: wardId } },
      { allocated: { $eq: 'Allocated' } },
    ];
  } else if (id != 'null' && districtId != 'null' && zoneId != 'null' && wardId != 'null' && status == 'Disabled') {
    match = [
      { _id: { $eq: id } },
      { preferredDistrict: { $eq: districtId } },
      { preferredZone: { $eq: zoneId } },
      { preferredWard: { $eq: wardId } },
      { active: { $eq: false } },
      { archive: { $eq: true } },
    ];
  } else if (id != 'null' && districtId == 'null' && zoneId == 'null' && wardId == 'null' && status == 'Disabled') {
    match = [{ _id: { $eq: id } }, { active: { $eq: false } }, { archive: { $eq: true } }];
  } else if (id == 'null' && districtId == 'null' && zoneId == 'null' && wardId == 'null' && status == 'Disabled') {
    match = [{ active: { $eq: false } }, { archive: { $eq: true } }];
  } else if (id == 'null' && districtId != 'null' && zoneId == 'null' && wardId == 'null' && status == 'Disabled') {
    match = [{ preferredDistrict: { $eq: districtId } }, { active: { $eq: false } }, { archive: { $eq: true } }];
  } else if (id == 'null' && districtId != 'null' && zoneId != 'null' && wardId == 'null' && status == 'Disabled') {
    match = [
      { preferredDistrict: { $eq: districtId } },
      { preferredZone: { $eq: zoneId } },
      { active: { $eq: false } },
      { archive: { $eq: true } },
    ];
  } else if (id == 'null' && districtId != 'null' && zoneId != 'null' && wardId != 'null' && status == 'Disabled') {
    match = [
      { preferredDistrict: { $eq: districtId } },
      { preferredZone: { $eq: zoneId } },
      { preferredZone: { $eq: wardId } },
      { active: { $eq: false } },
      { archive: { $eq: true } },
    ];
  } else if (id != 'null' && districtId != 'null' && zoneId != 'null' && wardId != 'null' && status == 'UnAllocated') {
    match = [
      { _id: { $eq: id } },
      { preferredDistrict: { $eq: districtId } },
      { preferredZone: { $eq: zoneId } },
      { preferredWard: { $eq: wardId } },
      { allocated: { $eq: '' } },
    ];
  } else if (id != 'null' && districtId == 'null' && zoneId == 'null' && wardId == 'null' && status == 'UnAllocated') {
    match = [{ _id: { $eq: id } }, { allocated: { $eq: '' } }];
  } else if (id == 'null' && districtId == 'null' && zoneId == 'null' && wardId == 'null' && status == 'UnAllocated') {
    match = [{ allocated: { $eq: '' } }];
  } else if (id == 'null' && districtId != 'null' && zoneId == 'null' && wardId == 'null' && status == 'UnAllocated') {
    match = [{ preferredDistrict: { $eq: districtId } }, { allocated: { $eq: '' } }];
  } else if (id == 'null' && districtId != 'null' && zoneId != 'null' && wardId == 'null' && status == 'UnAllocated') {
    match = [{ preferredDistrict: { $eq: districtId } }, { preferredZone: { $eq: zoneId } }, { allocated: { $eq: '' } }];
  } else if (id == 'null' && districtId != 'null' && zoneId != 'null' && wardId != 'null' && status == 'UnAllocated') {
    match = [
      { preferredDistrict: { $eq: districtId } },
      { preferredZone: { $eq: zoneId } },
      { preferredWard: { $eq: wardId } },
      { allocated: { $eq: '' } },
    ];
  } else if (id != 'null' && districtId != 'null' && zoneId != 'null' && wardId != 'null' && status == 'null') {
    match = [
      { _id: { $eq: id } },
      { preferredDistrict: { $eq: districtId } },
      { preferredZone: { $eq: zoneId } },
      { preferredWard: { $eq: wardId } },
    ];
  } else if (id != 'null' && districtId == 'null' && zoneId == 'null' && wardId == 'null' && status == 'null') {
    match = [{ _id: { $eq: id } }];
  } else if (id == 'null' && districtId != 'null' && zoneId == 'null' && wardId == 'null' && status == 'null') {
    match = [{ preferredDistrict: { $eq: districtId } }];
  } else if (id == 'null' && (districtId == 'null') & (zoneId != 'null') && wardId == 'null' && status == 'null') {
    match = [{ preferredZone: { $eq: zoneId } }];
  } else if (id == 'null' && (districtId == 'null') & (zoneId == 'null') && wardId != 'null' && status == 'null') {
    match = [{ preferredWard: { $eq: wardId } }];
  } else if (id == 'null' && districtId != 'null' && zoneId != 'null' && wardId != 'null' && status == 'null') {
    match = [
      { preferredDistrict: { $eq: districtId } },
      { preferredZone: { $eq: zoneId } },
      { preferredWard: { $eq: wardId } },
    ];
  } else if (id != 'null' && districtId == 'null' && zoneId != 'null' && wardId != 'null' && status == 'null') {
    match = [{ _id: { $eq: id } }, { preferredZone: { $eq: zoneId } }, { preferredWard: { $eq: wardId } }];
  } else if (id != 'null' && districtId != 'null' && zoneId == 'null' && wardId == 'null' && status == 'null') {
    match = [{ _id: { $eq: id } }, { preferredDistrict: { $eq: districtId } }];
  } else if (id == 'null' && districtId != 'null' && zoneId != 'null' && wardId == 'null' && status == 'null') {
    match = [{ preferredDistrict: { $eq: districtId } }, { preferredZone: { $eq: zoneId } }];
  } else if (id == 'null' && districtId == 'null' && zoneId != 'null' && wardId != 'null' && status == 'null') {
    match = [{ preferredZone: { $eq: zoneId } }, { preferredWard: { $eq: wardId } }];
  } else if (id != 'null' && districtId == 'null' && zoneId == 'null' && wardId != 'null' && status == 'null') {
    match = [{ _id: { $eq: id } }, { preferredWard: { $eq: wardId } }];
  } else if (id != 'null' && districtId == 'null' && zoneId != 'null' && wardId == 'null' && status == 'null') {
    match = [{ _id: { $eq: id } }, { preferredZone: { $eq: zoneId } }];
  } else if (id != 'null' && districtId != 'null' && zoneId != 'null' && wardId == 'null' && status == 'null') {
    match = [{ _id: { $eq: id } }, { preferredDistrict: { $eq: districtId } }, { preferredZone: { $eq: zoneId } }];
  } else {
    match = [{ _id: { $ne: null } }];
  }
  // //console.log(match);
  const user = await ManageUser.aggregate([
    // {
    //   $match: {
    //     $and: match,
    //   },
    // },
    {
      $lookup: {
        from: 'zones',
        localField: 'preferredZone',
        foreignField: '_id',
        as: 'zonesdata',
      },
    },
    {
      $unwind: '$zonesdata',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'preferredWard',
        foreignField: '_id',
        as: 'wardsdata',
      },
    },
    {
      $unwind: '$wardsdata',
    },
    {
      $lookup: {
        from: 'districts',
        localField: 'preferredDistrict',
        foreignField: '_id',
        as: 'districtsdata',
      },
    },
    {
      $unwind: '$districtsdata',
    },
    // {
    //   $lookup:{
    //     from: 'streets',
    //     pipeline:[],
    //     as: 'streetsdata',
    //   }
    // },
    // {
    //   $unwind:'$streetsdata'
    // },
    {
      $match: {
        $and: match,
      },
    },
    {
      $project: {
        name: 1,
        mobileNumber: 1,
        preferredZone: '$zonesdata.zone',
        preferredWard: '$wardsdata.ward',
        created: 1,
        addressProofUpload: 1,
        idProofUpload: 1,
        twoWheelerUpload: 1,
        _id: 1,
        preferredDistrict: '$districtsdata.district',
        active: 1,
        archive: 1,
        BasetwoWheelerUpload: 1,
        BaseaddressProofUpload: 1,
        BaseidProofUpload: 1,
        preferredWardId: '$wardsdata._id',
        allocated: 1,
        // streetsdata:'$streetsdata'
      },
    },
    {
      $skip: 10 * page,
    },
    {
      $limit: 10,
    },
  ]);
  // //console.log(user.length);
  const count = await ManageUser.aggregate([
    {
      $lookup: {
        from: 'zones',
        localField: 'preferredZone',
        foreignField: '_id',
        as: 'zonesdata',
      },
    },
    {
      $unwind: '$zonesdata',
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'preferredWard',
        foreignField: '_id',
        as: 'wardsdata',
      },
    },
    {
      $unwind: '$wardsdata',
    },
    {
      $lookup: {
        from: 'districts',
        localField: 'preferredDistrict',
        foreignField: '_id',
        as: 'districtsdata',
      },
    },
    {
      $unwind: '$districtsdata',
    },
    // {
    //   $lookup:{
    //     from: 'streets',
    //     pipeline:[],
    //     as: 'streetsdata',
    //   }
    // },
    // {
    //   $unwind:'$streetsdata'
    // },
    {
      $match: {
        $and: match,
      },
    },
    {
      $project: {
        name: 1,
        mobileNumber: 1,
        preferredZone: '$zonesdata.zone',
        preferredWard: '$wardsdata.ward',
        created: 1,
        addressProofUpload: 1,
        idProofUpload: 1,
        twoWheelerUpload: 1,
        _id: 1,
        preferredDistrict: '$districtsdata.district',
        active: 1,
        archive: 1,
        BasetwoWheelerUpload: 1,
        BaseaddressProofUpload: 1,
        BaseidProofUpload: 1,
        preferredWardId: '$wardsdata._id',
        allocated: 1,
        // streetsdata:'$streetsdata'
      },
    },
  ]);

  return {
    data: user,
    count: count.length,
  };
};

const updateManageUserId = async (manageUserId, updateBody) => {
  let match = /^[a-zA-Z0-9]+$/;
  let Manage = await getManageUserById(manageUserId);
  if (!match.test(updateBody.idProofNo) || !match.test(updateBody.addressProofNo)) {
    throw new ApiError(httpStatus.NOT_FOUND, 'invalid ProofNo');
  }
  if (!Manage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ManageUser not found');
  }
  Manage = await ManageUser.findByIdAndUpdate({ _id: manageUserId }, updateBody, { new: true });
  return Manage;
};

const deleteManageUserById = async (manageUserId) => {
  const Manage = await getManageUserdataById(manageUserId);
  if (!Manage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ManageUser not found');
  }
  (Manage.active = false), (Manage.archive = true), await Manage.save();
  return Manage;
};

module.exports = {
  createManageUser,
  getManageUserById,
  ManageUserAll,
  updateManageUserId,
  deleteManageUserById,
  loginManageUserEmailAndPassword,
  manageUserAllTable,
  ManageUserAllenable,
  getManageUserdataByIdStatus,
  getManageUserdataById,
};
