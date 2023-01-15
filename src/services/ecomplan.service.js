const httpStatus = require('http-status');
const { Streamplan, StreamPost, Streamrequest, StreamrequestPost } = require('../models/ecomplan.model');
const ApiError = require('../utils/ApiError');
const AWS = require('aws-sdk')
const Date = require('./Date.serive')
const { purchasePlan } = require('../models/purchasePlan.model');
const { tempTokenModel } = require('../models/liveStreaming/generateToken.model');

const create_Plans = async (req) => {
    console.log(req.body)
    const value = await Streamplan.create(req.body)
    await Date.create_date(value)
    console.log(value);
    return value;
};

const get_all_Plans = async (req) => {
    let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : req.query.page;
    const value = await Streamplan.aggregate([
        { $sort: { DateIso: -1 } },
        { $skip: 10 * page },
        { $limit: 10 },
    ])
    return value;
};



const get_one_Plans = async (req) => {
    const value = await Streamplan.findById(req.query.id);
    return value;
};


const update_one_Plans = async (req) => {
    const value = await Streamplan.findByIdAndUpdate({ _id: req.query.id }, req.body, { new: true })
    return value;
};


const delete_one_Plans = async (req) => {
    await Streamplan.findByIdAndDelete({ _id: req.query.id });
    return { message: "deleted" };
};

const create_post = async (req) => {
    console.log(req.userId, "asdas", { ...req.body, ...{ suppierId: req.userId } })
    const value = await StreamPost.create({ ...req.body, ...{ suppierId: req.userId } })
    await Date.create_date(value)
    return value;
};

const get_all_Post = async (req) => {
    let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : req.query.page;
    const value = await StreamPost.aggregate([
        { $match: { $and: [{ suppierId: { $eq: req.userId } }, { isUsed: { $eq: false } }] } },
        {
            $lookup: {
                from: 'products',
                localField: 'productId',
                foreignField: '_id',
                as: 'productName',
            },
        },
        {
            $unwind: '$productName',
        },
        {
            $lookup: {
                from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'categories',
            },
        },
        {
            $unwind: '$categories',
        },
        {
            $project: {
                productId: 1,
                categoryId: 1,
                quantity: 1,
                marketPlace: 1,
                offerPrice: 1,
                postLiveStreamingPirce: 1,
                validity: 1,
                minLots: 1,
                incrementalLots: 1,
                _id: 1,
                catName: "$categories.categoryName",
                productName: "$productName.productTitle",
                created: 1,
                DateIso: 1
            }
        },
        { $sort: { DateIso: -1 } },
        { $skip: 10 * page },
        { $limit: 10 },
    ])
    return value;
};



const get_one_Post = async (req) => {
    const value = await StreamPost.findById(req.query.id);
    if (value.suppierId != req.userId) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
    }
    return value;
};


const update_one_Post = async (req) => {
    console.log(req.userId)
    const value = await StreamPost.findByIdAndUpdate({ _id: req.query.id, suppierId: req.userId }, req.body, { new: true })
    if (!value) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
    }
    return value;
};
const delete_one_Post = async (req) => {
    const value = await StreamPost.findByIdAndDelete({ _id: req.query.id, suppierId: req.userId });
    if (!value) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
    }
    return { message: "deleted" };
};




const create_stream_one = async (req) => {
    console.log(req.body)
    const value = await Streamrequest.create({ ...req.body, ...{ suppierId: req.userId, postCount: req.body.post.length } });
    req.body.post.forEach(async (a) => {
        await StreamPost.findByIdAndUpdate({ _id: a }, { isUsed: true }, { new: true })
        let post = await StreamrequestPost.create({ suppierId: req.userId, streamRequest: value._id, postId: a })
        await Date.create_date(post)
    })
    console.log(value);
    await Date.create_date(value)
    return value;
};


const create_stream_one_image = async (req) => {
    console.log(req.files, "asdasda")
    // const s3 = new AWS.S3({
    //     accessKeyId: 'AKIA3323XNN7Y2RU77UG',
    //     secretAccessKey: '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',
    //     region: 'ap-south-1',
    //   });
    //   let params = {
    //     Bucket: 'realestatevideoupload',
    //     Key: req.file.originalname,
    //     Body: req.file.buffer,
    //   };
    //   s3.upload(params, async (err, data) => {
    //     if (err) {
    //         console.log(err)
    //     }
    //     // values = await SellerPost.findByIdAndUpdate({ _id: req.params.id }, { videos: data.Location }, { new: true });
    //     // res.send(params);
    //     console.log(data)
    //     return { params };

    //   });


    // console.log(req.body)
    return { message: "deleted" };
};
const create_stream_two = async (req) => {
    const value = await StreamPost.findByIdAndDelete({ _id: req.query.id, suppierId: req.userId });
    if (!value) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
    }
    return { message: "deleted" };
};
const get_all_stream = async (req) => {
    let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : req.query.page;
    console.log(req.userId)
    const value = await Streamrequest.aggregate([
        { $match: { $and: [{ suppierId: { $eq: req.userId } }] } },
        { $sort: { DateIso: -1 } },
        { $skip: 10 * page },
        { $limit: 10 },
    ])
    return value;
};
const get_one_stream = async (req) => {

    const value = await Streamrequest.findById(req.query.id);
    if (value.suppierId != req.userId) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
    }
    return value;
};

const get_one_stream_step_two = async (req) => {
    console.log("Asas")
    const value = await Streamrequest.findById(req.query.id);
    const myorders = await purchasePlan.aggregate([
        {
            $match: {
                $and: [{ suppierId: { $eq: req.userId } }, { active: { $eq: true } }]
            }
        },
        {
            $lookup: {
                from: 'streamplans',
                localField: 'planId',
                foreignField: '_id',
                as: 'streamplans',
            },
        },
        {
            $unwind: '$streamplans',
        },
        {
            $project: {
                _id: 1,
                planName: "$streamplans.planName",
                max_post_per_stream: "$streamplans.max_post_per_stream",
                numberOfParticipants: "$streamplans.numberOfParticipants",
                numberofStream: "$streamplans.numberofStream",
                chatNeed: "$streamplans.chatNeed",
                commision: "$streamplans.commision",
                Duration: "$streamplans.Duration",
                commition_value: "$streamplans.commition_value",
                available: { $gte: ["$streamplans.max_post_per_stream", value.postCount] },
                numberOfStreamused: 1,

            }
        },
    ])
    if (value.suppierId != req.userId) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
    }
    return { value, myorders };
};
const update_one_stream = async (req) => {
    const value = await StreamPost.findByIdAndDelete({ _id: req.query.id, suppierId: req.userId });
    if (!value) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
    }
    return { message: "deleted" };
};
const update_one_stream_one = async (req) => {

    // let value = await Streamrequest.findByIdAndUpdate({ _id: req.query.id }, { sepTwo: "Completed", planId: req.body.plan_name }, { new: true })
    return value;
};

const update_one_stream_two = async (req) => {
    let myplan = await purchasePlan.findById(req.body.plan_name);
    let plan = await Streamplan.findById(myplan.planId);
    console.log(myplan.numberOfStreamused)
    if (myplan.numberOfStreamused + 1 == plan.numberofStream) {
        myplan.active = false;
    }
    myplan.numberOfStreamused = myplan.numberOfStreamused + 1
    myplan.save();
    let value = await Streamrequest.findByIdAndUpdate({ _id: req.query.id }, { sepTwo: "Completed", planId: req.body.plan_name }, { new: true })
    return value;
};
const delete_one_stream = async (req) => {
    const value = await StreamPost.findByIdAndDelete({ _id: req.query.id, suppierId: req.userId });
    if (!value) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
    }
    return { message: "deleted" };
};

const get_all_admin = async (req) => {
    let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : req.query.page;
    const value = await Streamrequest.aggregate([
        {
            $lookup: {
                from: 'streamrequestposts',
                localField: '_id',
                foreignField: 'streamRequest',
                pipeline: [
                    {
                        $lookup: {
                            from: 'streamposts',
                            localField: 'postId',
                            foreignField: '_id',
                            pipeline: [
                                {
                                    $lookup: {
                                        from: 'products',
                                        localField: 'productId',
                                        foreignField: '_id',
                                        as: 'products',
                                    },
                                },
                                { $unwind: "$products" },
                                {
                                    $project: {
                                        _id: 1,
                                        productTitle: "$products.productTitle",
                                        productId: 1,
                                        categoryId: 1,
                                        quantity: 1,
                                        marketPlace: 1,
                                        offerPrice: 1,
                                        postLiveStreamingPirce: 1,
                                        validity: 1,
                                        minLots: 1,
                                        incrementalLots: 1,
                                        suppierId: 1,
                                        DateIso: 1,
                                        created: 1,
                                    }
                                }
                            ],
                            as: 'streamposts',
                        },
                    },
                    { $unwind: "$streamposts" },
                    {
                        $project: {
                            _id: 1,
                            productTitle: "$streamposts.productTitle",
                            productId: "$streamposts.productId",
                            quantity: "$streamposts.quantity",
                            marketPlace: "$streamposts.marketPlace",
                            offerPrice: "$streamposts.offerPrice",
                            postLiveStreamingPirce: "$streamposts.postLiveStreamingPirce",
                            validity: "$streamposts.validity",
                            minLots: "$streamposts.minLots",
                            incrementalLots: "$streamposts.incrementalLots",
                        }
                    }
                ],
                as: 'streamrequestposts',
            },
        },
        {
            $lookup: {
                from: 'suppliers',
                localField: 'suppierId',
                foreignField: '_id',
                as: 'suppliers',
            },
        },
        { $unwind: "$suppliers" },
        {
            $project: {
                _id: 1,
                supplierName: "$suppliers.primaryContactName",
                active: 1,
                archive: 1,
                post: 1,
                communicationMode: 1,
                sepTwo: 1,
                bookingAmount: 1,
                streamingDate: 1,
                streamingTime: 1,
                discription: 1,
                streamName: 1,
                suppierId: 1,
                postCount: 1,
                DateIso: 1,
                created: 1,
                planId: 1,
                streamrequestposts: "$streamrequestposts",
                adminApprove: 1
            }
        },

        { $sort: { DateIso: -1 } },
        { $skip: 10 * page },
        { $limit: 10 },
    ])
    return value;

};

const update_approved = async (req) => {
    let value = await Streamrequest.findByIdAndUpdate({ _id: req.query.id }, { adminApprove: "Approved", }, { new: true })
    return value;
};

const update_reject = async (req) => {
    let value = await Streamrequest.findByIdAndUpdate({ _id: req.query.id }, { adminApprove: "Rejected", }, { new: true })
    return value;
};


const get_all_streams = async (req) => {
    let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : req.query.page;
    console.log(req.userId)
    const value = await Streamrequest.aggregate([
        { $match: { $and: [{ suppierId: { $eq: req.userId } }, { adminApprove: { $eq: "Approved" } }] } },
        {
            $lookup: {
                from: 'streamrequestposts',
                localField: '_id',
                foreignField: 'streamRequest',
                pipeline: [
                    {
                        $lookup: {
                            from: 'streamposts',
                            localField: 'postId',
                            foreignField: '_id',
                            pipeline: [
                                {
                                    $lookup: {
                                        from: 'products',
                                        localField: 'productId',
                                        foreignField: '_id',
                                        as: 'products',
                                    },
                                },
                                { $unwind: "$products" },
                                {
                                    $project: {
                                        _id: 1,
                                        productTitle: "$products.productTitle",
                                        productId: 1,
                                        categoryId: 1,
                                        quantity: 1,
                                        marketPlace: 1,
                                        offerPrice: 1,
                                        postLiveStreamingPirce: 1,
                                        validity: 1,
                                        minLots: 1,
                                        incrementalLots: 1,
                                        suppierId: 1,
                                        DateIso: 1,
                                        created: 1,
                                    }
                                }
                            ],
                            as: 'streamposts',
                        },
                    },
                    { $unwind: "$streamposts" },
                    {
                        $project: {
                            _id: 1,
                            productTitle: "$streamposts.productTitle",
                            productId: "$streamposts.productId",
                            quantity: "$streamposts.quantity",
                            marketPlace: "$streamposts.marketPlace",
                            offerPrice: "$streamposts.offerPrice",
                            postLiveStreamingPirce: "$streamposts.postLiveStreamingPirce",
                            validity: "$streamposts.validity",
                            minLots: "$streamposts.minLots",
                            incrementalLots: "$streamposts.incrementalLots",
                        }
                    }
                ],
                as: 'streamrequestposts',
            },
        },
        {
            $lookup: {
                from: 'suppliers',
                localField: 'suppierId',
                foreignField: '_id',
                as: 'suppliers',
            },
        },
        { $unwind: "$suppliers" },
        {
            $project: {
                _id: 1,
                supplierName: "$suppliers.primaryContactName",
                active: 1,
                archive: 1,
                post: 1,
                communicationMode: 1,
                sepTwo: 1,
                bookingAmount: 1,
                streamingDate: 1,
                streamingTime: 1,
                discription: 1,
                streamName: 1,
                suppierId: 1,
                postCount: 1,
                DateIso: 1,
                created: 1,
                planId: 1,
                streamrequestposts: "$streamrequestposts",
                adminApprove: 1,
                tokenGeneration:1,
                tokenDetails:1

            }
        },

        { $sort: { DateIso: -1 } },
        { $skip: 10 * page },
        { $limit: 10 },
    ])
    return value;
};

const go_live_stream_host = async (req) => {
    let value = await Streamrequest.aggregate([
        { $match: { $and: [{ suppierId: { $eq: req.userId } }, { adminApprove: { $eq: "Approved" } },{_id:{$eq:req.query.id}}] } },
        {
            $lookup: {
                from: 'streamrequestposts',
                localField: '_id',
                foreignField: 'streamRequest',
                pipeline: [
                    {
                        $lookup: {
                            from: 'streamposts',
                            localField: 'postId',
                            foreignField: '_id',
                            pipeline: [
                                {
                                    $lookup: {
                                        from: 'products',
                                        localField: 'productId',
                                        foreignField: '_id',
                                        as: 'products',
                                    },
                                },
                                { $unwind: "$products" },
                                {
                                    $project: {
                                        _id: 1,
                                        productTitle: "$products.productTitle",
                                        productId: 1,
                                        categoryId: 1,
                                        quantity: 1,
                                        marketPlace: 1,
                                        offerPrice: 1,
                                        postLiveStreamingPirce: 1,
                                        validity: 1,
                                        minLots: 1,
                                        incrementalLots: 1,
                                        suppierId: 1,
                                        DateIso: 1,
                                        created: 1,
                                    }
                                }
                            ],
                            as: 'streamposts',
                        },
                    },
                    { $unwind: "$streamposts" },
                    {
                        $project: {
                            _id: 1,
                            productTitle: "$streamposts.productTitle",
                            productId: "$streamposts.productId",
                            quantity: "$streamposts.quantity",
                            marketPlace: "$streamposts.marketPlace",
                            offerPrice: "$streamposts.offerPrice",
                            postLiveStreamingPirce: "$streamposts.postLiveStreamingPirce",
                            validity: "$streamposts.validity",
                            minLots: "$streamposts.minLots",
                            incrementalLots: "$streamposts.incrementalLots",
                        }
                    }
                ],
                as: 'streamrequestposts',
            },
        },
        {
            $lookup: {
                from: 'suppliers',
                localField: 'suppierId',
                foreignField: '_id',
                as: 'suppliers',
            },
        },
        { $unwind: "$suppliers" },
        {
            $lookup: {
                from: 'temptokens',
                localField: 'tokenDetails',
                foreignField: '_id',
                as: 'temptokens',
            },
        },
        { $unwind: "$temptokens" },
        {
            $project: {
                _id: 1,
                supplierName: "$suppliers.primaryContactName",
                active: 1,
                archive: 1,
                post: 1,
                communicationMode: 1,
                sepTwo: 1,
                bookingAmount: 1,
                streamingDate: 1,
                streamingTime: 1,
                discription: 1,
                streamName: 1,
                suppierId: 1,
                postCount: 1,
                DateIso: 1,
                created: 1,
                planId: 1,
                streamrequestposts: "$streamrequestposts",
                adminApprove: 1,
                temptokens:"$temptokens"
            }
        },

    ])
    return value;
};

const get_watch_live_steams= async (req) => {
    let value = await Streamrequest.aggregate([
        { $match: { $and: [{ adminApprove: { $eq: "Approved" } }] } },
    ]);
    return value;
};


const get_watch_live_token= async (req) => {
    let value = await Streamrequest.aggregate([
        { $match: { $and: [{ adminApprove: { $eq: "Approved" } }] } },
    ]);
    return value;
};
module.exports = {
    create_Plans,
    get_all_Plans,
    get_one_Plans,
    update_one_Plans,
    delete_one_Plans,
    create_post,
    get_all_Post,
    get_one_Post,
    update_one_Post,
    delete_one_Post,

    create_stream_one,
    create_stream_two,
    get_all_stream,
    get_one_stream,
    update_one_stream,
    delete_one_stream,
    create_stream_one_image,
    get_one_stream_step_two,
    update_one_stream_two,
    update_one_stream_one,
    get_all_admin,
    update_approved,
    update_reject,
    get_all_streams,

    go_live_stream_host,
    get_watch_live_steams,
    get_watch_live_token
};
