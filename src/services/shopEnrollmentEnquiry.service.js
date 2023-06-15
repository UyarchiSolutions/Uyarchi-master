const httpStatus = require('http-status');
const { ShopEnrollmentEnquiry, ShopEnrollmentEnquiryAssign, SupplierEnrollment} = require('../models/shopEnrollmentEnquiry.model');
const {Shop} = require('../models/b2b.ShopClone.model');
const {Product} = require('../models/product.model');
const ApiError = require('../utils/ApiError');
const moment = require('moment');

const createEnquiry = async (userId, body) => {
    let value = {...body, ...{uid:userId}}
  return ShopEnrollmentEnquiry.create(value);
};

const getAllEnquiryDatas = async (pincode,page) => {

  let pincodematch = [{ active: { $eq: true } }];
    if(pincode != "null"){
        pincodematch = [{ pincode: { $eq: parseInt(pincode) } }];
    }
    const data = await ShopEnrollmentEnquiry.aggregate([
        {
            $match: {
              $and: pincodematch,
            },
        },
        {
            $lookup: {
              from: 'b2busers',
              localField: 'uid',
              foreignField: '_id',
              pipeline:[
                {
                    $lookup: {
                      from: 'roles',
                      localField: 'userRole',
                      foreignField: '_id',
                      as: 'rolesData',
                    },
                  },
                  {
                    $unwind: '$rolesData',
                  }, 
              ],
              as: 'b2busersData',
            },
          },
          {
            $unwind: '$b2busersData',
          },  

          {
            $project:{
                date:1,
                time:1,
                shopType:1,
                shopName:1,
                mobileNumber:1,
                area:1,
                contactName:1,
                enquiryType:1,
                pincode:1,
                status:1,
                uid:1,
                name:"$b2busersData.name",
                createdBy:"$b2busersData.rolesData.roleName"
            }
          },  
          {
            $skip: 10 * parseInt(page),
          },
          {
            $limit: 10,
          },
    ]);
    const total = await ShopEnrollmentEnquiry.aggregate([
      {
          $match: {
            $and: pincodematch,
          },
      },
      {
          $lookup: {
            from: 'b2busers',
            localField: 'uid',
            foreignField: '_id',
            pipeline:[
              {
                  $lookup: {
                    from: 'roles',
                    localField: 'userRole',
                    foreignField: '_id',
                    as: 'rolesData',
                  },
                },
                {
                  $unwind: '$rolesData',
                }, 
            ],
            as: 'b2busersData',
          },
        },
        {
          $unwind: '$b2busersData',
        },  

        {
          $project:{
              date:1,
              time:1,
              shopType:1,
              shopName:1,
              mobileNumber:1,
              area:1,
              contactName:1,
              enquiryType:1,
              pincode:1,
              status:1,
              uid:1,
              name:"$b2busersData.name",
              createdBy:"$b2busersData.rolesData.roleName"
          }
        }    
  ]);
    return {data:data, count:total.length};
  };

  const getEnquiryById = async (id) => {
    let values = await ShopEnrollmentEnquiry.findById(id);
    if (!values) {
      throw new ApiError(httpStatus.NOT_FOUND, 'ShopEnrollmentEnquiry Not Found');
    }
    return values;
  };

  const updateEnquiryById = async (id,updateBody) => {
    const {arr} = updateBody
    let data = await getEnquiryById(id);
    if (!data) {
      throw new ApiError(httpStatus.NOT_FOUND, 'ShopEnrollmentEnquiry Not Found');
    }
    data = await ShopEnrollmentEnquiry.findByIdAndUpdate({ _id: id }, updateBody, { new: true });
    return data;
  };


  const AssignShops = async (body) => {
    const {arr, assignTo, status} = body
    arr.forEach(async (e) => {
        data = await ShopEnrollmentEnquiry.findByIdAndUpdate({ _id: e }, {status:status}, { new: true });
        await ShopEnrollmentEnquiryAssign.create({
          assignTo:assignTo,
          shopId: e,
          status:status,
        });
    })
    return {message:"Assignshops Completed"};
  };

  const pincode = async () => {
      const data = await ShopEnrollmentEnquiry.aggregate([
          {
            $group: {
              _id: {pincode:'$pincode'},
            },
          },
          {
            $project:{
                pincode:"$_id.pincode",
            }
          }
         ])
      return data
}


const viewdatagetById = async (id) =>{
    const data = await ShopEnrollmentEnquiryAssign.aggregate([
        {
            $match: {
              $and: [{ assignTo: { $eq:id} }],
            },
        },

        {
            $lookup: {
              from: 'enrollmentenquiryshops',
              localField: 'shopId',
              foreignField: '_id',
              as: 'enrollmentenquiryshops',
            },
          },
          {
            $unwind: '$enrollmentenquiryshops',
          },
          {
            $project:{
                assignTo:1,
                shopName:"$enrollmentenquiryshops.shopName",
                status:"$enrollmentenquiryshops.status",
                area:"$enrollmentenquiryshops.area",
                pincode:"$enrollmentenquiryshops.pincode",
                mobileNumber:"$enrollmentenquiryshops.mobileNumber",
                shopType:"$enrollmentenquiryshops.shopType",
                shopId:"$enrollmentenquiryshops._id",
                contactName:"$enrollmentenquiryshops.contactName",
            }
          }

       ])
    return data
}

const createShops = async (body) =>{
    let servertime = moment().format('HHmm');
    let createdtime = moment().format('hh:mm a');
    let serverdate = moment().format('DD-MM-yyy');
    let filterDate = moment().format('yyy-MM-DD');
    let values = {
      ...body,
      ...{ date: serverdate, time: servertime, filterDate: filterDate, status: 'Pending', created: createdtime },
    };
    const shop = await Shop.create(values);
    // //console.log(shop)
    // await ShopEnrollmentEnquiry.findOneAndUpdate({mobileNumber:shop.mobile, shopName:shop.SName, contactName:shop.SOwner}, {b2bshopcloneId:shop._id}, {new:true})
    return shop;
}

const getAllSupplierDatas = async () =>{
    const data = await SupplierEnrollment.aggregate([
      
      {
        $lookup: {
          from: 'b2busers',
          localField: 'createdBy',
          pipeline:[
            {
              $lookup: {
                from: 'roles',
                localField: 'userRole',
                foreignField: '_id',
                as: 'roles',
              },
            },
            {
              $unwind: '$roles',
            },
          ],
          foreignField: '_id',
          as: 'b2busers',
        },
      },
      {
        $unwind: '$b2busers',
      },
      {
        $project:{
          createdBy:"$b2busers.roles.roleName",
          createrName:"$b2busers.name",
          productDealingwith:1,
          status:1,
          tradeName:1,
          suplierName:1,
          mobileNumber:1,
          Area:1,
          date:1,
          time:1,
          // createdBy:1,
        }
      }

    ]);
    return data
}


// product 

const product = async (id) =>{
  let product = []
  let push = []
  const data = await SupplierEnrollment.findById(id)
  if(!data){
    throw new ApiError(httpStatus.NOT_FOUND, 'ShopEnrollmentEnquiry Not Found');
  }
  // data.productDealingwith.forEach(async (e) => {
  //   product = await Product.findById(e)
  //   push.push(product)
  //   //console.log(push)
  // })
  // return push;
  data.productDealingwith.forEach(async (e) => {
    // const product = await Product.findById(e)
    product.push(e);
    // //console.log(e)
  });
  for (let i = 0; i < product.length; i++) {
    const pro = await Product.findById(product[i]);
    push.push(pro.productTitle);
  }


  return { data: data, products:push };
}


const getIdEnquiryShops = async (id) =>{
    const data = await ShopEnrollmentEnquiry.aggregate([
        {
            $match: {
              $and: [{ _id: { $eq:id} }],
            },
        },
        {
            $lookup: {
              from: 'shoplists',
              localField: 'shopType',
              foreignField: '_id',
              as: 'shoplists',
            },
          },
          {
            $unwind: '$shoplists',
          },
          {
            $project:{
                date:1,
                time:1,
                status:1,
                shopName:1,
                shopType:1,
                mobileNumber:1,
                area:1,
                contactName:1,
                pincode:1,
                uid:1,
                shopTypeName:"$shoplists.shopList",
            }
          }
    ])
    return data
}

const createSupplierEnquiry = async (userId, body) => {
  //console.log(userId)
  let value = {...body, ...{createdBy:userId}}
return SupplierEnrollment.create(value);
};

module.exports = {
    createEnquiry,
    getAllEnquiryDatas,
    updateEnquiryById,
    AssignShops,
    pincode,
    viewdatagetById,
    createShops,
    getAllSupplierDatas,
    getIdEnquiryShops,
    createSupplierEnquiry,
    product,
};