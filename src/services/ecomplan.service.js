const httpStatus = require('http-status');
const { Streamplan, StreamPost, Streamrequest, StreamrequestPost, StreamPreRegister, streamPlanlink } = require('../models/ecomplan.model');
const ApiError = require('../utils/ApiError');
const AWS = require('aws-sdk')
const Dates = require('./Date.serive')
const { purchasePlan } = require('../models/purchasePlan.model');
const { tempTokenModel } = require('../models/liveStreaming/generateToken.model');
const generateLink = require("./liveStreaming/generatelink.service")
const moment = require('moment')
const create_Plans = async (req) => {
    console.log(req.body)
    const value = await Streamplan.create({ ...req.body, ...{ planType: 'normal' } })
    await Dates.create_date(value)
    console.log(value);
    return value;
};
const create_Plans_addon = async (req) => {
    const value = await Streamplan.create({ ...req.body, ...{ planType: 'addon' } })
    await Dates.create_date(value)
    console.log(value);
    return value;
};

const get_all_Plans = async (req) => {
    let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : req.query.page;
    const value = await Streamplan.aggregate([
        { $sort: { DateIso: -1 } },
        { $skip: 10 * page },
        { $limit: 10 },
    ]);

    return value;
};

const get_all_Plans_pagination = async (req) => {
    let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : req.query.page;
    const value = await Streamplan.aggregate([
        {
            $lookup: {
                from: 'purchasedplans',
                localField: '_id',
                foreignField: 'planId',
                pipeline: [{ $group: { _id: null, count: { $sum: 1 } } }],
                as: 'purchasedplans',
            },
        },
        {
            $unwind: {
                preserveNullAndEmptyArrays: true,
                path: '$purchasedplans',
            },
        },
        {
            $addFields: {
                no_of_person_used: { $ifNull: ['$purchasedplans.count', 0] },
            },
        },
        { $sort: { DateIso: -1 } },
        { $skip: 10 * page },
        { $limit: 10 },
    ]);
    const total = await Streamplan.aggregate([
        { $sort: { DateIso: -1 } },
    ]);

    return { value, total: total.length };
};

const get_all_Plans_addon = async (req) => {
    let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : req.query.page;
    const value = await Streamplan.aggregate([
        { $match: { planType: { $eq: "addon" } } },
        { $sort: { DateIso: -1 } },
        { $skip: 10 * page },
        { $limit: 10 },
    ])
    return value;
};


const get_all_Plans_normal = async (req) => {
    let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : req.query.page;
    const value = await Streamplan.aggregate([
        { $match: { planType: { $ne: "addon" }, planmode: { $eq: "Public" } } },
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

const create_post = async (req, images) => {
    // console.log(req.userId, "asdas", { ...req.body, ...{ suppierId: req.userId, images: images } })
    const value = await StreamPost.create({ ...req.body, ...{ suppierId: req.userId, images: images } })
    await Dates.create_date(value)
    return value;
};
const create_teaser_upload = async (req, images) => {
    const s3 = new AWS.S3({
        accessKeyId: 'AKIA3323XNN7Y2RU77UG',
        secretAccessKey: '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',
        region: 'ap-south-1',
    });
    let params = {
        Bucket: 'realestatevideoupload',
        Key: req.file.originalname,
        Body: req.file.buffer,
    };
    let stream;
    return new Promise(resolve => {
        s3.upload(params, async (err, data) => {
            if (err) {
                console.log(err)
            }
            console.log(data)
            stream = await StreamPost.findByIdAndUpdate({ _id: req.query.id }, { video: data.Location })
            resolve({ video: 'success', stream });

        });
    });
}
const get_all_Post = async (req) => {
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
    ])
    return value;
};


const get_all_Post_with_page = async (req) => {
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
                minLots: 1,
                incrementalLots: 1,
                _id: 1,
                catName: "$categories.categoryName",
                productName: "$productName.productTitle",
                created: 1,
                DateIso: 1,
                images: 1,
                video: 1,
                location: 1,
                discription: 1
            }
        },
        { $sort: { DateIso: -1 } },
        { $skip: 10 * page },
        { $limit: 10 },
    ])
    const total = await StreamPost.aggregate([
        { $match: { $and: [{ suppierId: { $eq: req.userId } }, { isUsed: { $eq: false } }] } },
        { $sort: { DateIso: -1 } },
    ])
    return { value, total: total.length };
};



const get_one_Post = async (req) => {
    const value = await StreamPost.findById(req.query.id);
    if (value.suppierId != req.userId) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
    }
    return value;
};


const update_one_Post = async (req, images) => {
    const value = await StreamPost.findByIdAndUpdate({ _id: req.query.id, suppierId: req.userId }, req.body, { new: true })
    if (!value) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
    }
    if (images.length != 0) {
        value.images = images;
        value.save();
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
    let data = req.body.streamingDate;
    let time = req.body.streamingTime;
    let startTime = new Date(new Date(data + ' ' + time)).getTime();

    const value = await Streamrequest.create({ ...req.body, ...{ suppierId: req.userId, postCount: req.body.post.length, startTime: startTime } });
    req.body.post.forEach(async (a) => {
        await StreamPost.findByIdAndUpdate({ _id: a }, { isUsed: true }, { new: true })
        let post = await StreamrequestPost.create({ suppierId: req.userId, streamRequest: value._id, postId: a })
        await Dates.create_date(post)
    })
    await Dates.create_date(value)
    //step two
    let myplan = await purchasePlan.findById(req.body.planId);
    let plan = await Streamplan.findById(myplan.planId);
    if (myplan.numberOfStreamused + 1 == plan.numberofStream) {
        myplan.active = false;
    }
    myplan.numberOfStreamused = myplan.numberOfStreamused + 1
    myplan.save();
    let streamss = await Streamrequest.findById(value._id)
    let datess = new Date().setTime(new Date(streamss.startTime).getTime() + (plan.Duration * 60 * 1000));
    await Streamrequest.findByIdAndUpdate({ _id: value._id }, { Duration: myplan.Duration, noOfParticipants: myplan.noOfParticipants, chat: myplan.chat, max_post_per_stream: myplan.max_post_per_stream, sepTwo: "Completed", planId: req.body.planId, Duration: plan.Duration, endTime: datess }, { new: true })
    return value;
};

const find_and_update_one = async (req) => {
    let value = await Streamrequest.findByIdAndUpdate({ _id: req.query.id }, req.body, { new: true });
    let posts = value.post;
    console.log(posts, req.body.addpost)
    req.body.addpost.forEach(async (a) => {
        posts.push(a)
        await StreamPost.findByIdAndUpdate({ _id: a }, { isUsed: true }, { new: true })
        let post = await StreamrequestPost.create({ suppierId: req.userId, streamRequest: req.query.id, postId: a })
        await Dates.create_date(post)
    })
    value.post = posts;
    value.postCount = posts.length;
    value.save();
    return value;
};


const create_stream_one_image = async (req) => {
    console.log(req.file, "asdasda")
    if (req.file != null) {
        await Streamrequest.findByIdAndUpdate({ _id: req.query.id }, { image: 'images/stream/' + req.file.filename })
        return { image: 'success' };
    }
    return { image: 'faild' };
};
const create_stream_one_video = async (req) => {
    // console.log(req.file, "asdasda")
    if (req.file != null) {
        const s3 = new AWS.S3({
            accessKeyId: 'AKIA3323XNN7Y2RU77UG',
            secretAccessKey: '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',
            region: 'ap-south-1',
        });
        let params = {
            Bucket: 'realestatevideoupload',
            Key: req.file.originalname,
            Body: req.file.buffer,
        };
        let stream;
        return new Promise(resolve => {
            s3.upload(params, async (err, data) => {
                if (err) {
                    console.log(err)
                }
                console.log(data)
                stream = await Streamrequest.findByIdAndUpdate({ _id: req.query.id }, { teaser: data.Location })
                resolve({ teaser: 'success', stream });

            });
        });
    }
    else {
        return { message: 'Invalid' }
    }

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
        {
            $lookup: {
                from: 'purchasedplans',
                localField: 'planId',
                foreignField: '_id',
                as: 'purchasedplans',
            },
        },
        {
            $unwind: {
                preserveNullAndEmptyArrays: true,
                path: '$purchasedplans',
            },
        },
        {
            $addFields: {
                max_post_per_stream: { $ifNull: ['$purchasedplans.max_post_per_stream', 0] },
            },
        },
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
                                { $unwind: "$products" }

                            ],
                            as: 'streamposts',
                        },

                    },
                    { $unwind: "$streamposts" },
                    {
                        $project: {
                            _id: 1,
                            "images": "$streamposts.images",
                            "productId": "$streamposts.productId",
                            "categoryId": "$streamposts.categoryId",
                            "quantity": "$streamposts.quantity",
                            "marketPlace": "$streamposts.marketPlace",
                            "offerPrice": "$streamposts.offerPrice",
                            "postLiveStreamingPirce": "$streamposts.postLiveStreamingPirce",
                            "minLots": "$streamposts.minLots",
                            "incrementalLots": "$streamposts.incrementalLots",
                            "discription": "$streamposts.discription",
                            "location": "$streamposts.location",
                            "suppierId": "$streamposts.suppierId",
                            "DateIso": "$streamposts.DateIso",
                            "created": "$streamposts.created",
                            "video": "$streamposts.video",
                            productTitle: "$streamposts.products.productTitle"
                        }
                    },
                    // {
                    //     $addFields: {
                    //         productTitle: '$streamposts.products.productTitle',
                    //     },
                    // },

                ],
                as: 'streamrequestposts',
            },
        },
        { $skip: 10 * page },
        { $limit: 10 },
    ])
    const total = await Streamrequest.aggregate([
        { $match: { $and: [{ suppierId: { $eq: req.userId } }] } },
    ])
    return { value, total: total.length };
};
const get_one_stream = async (req) => {
    let id = req.query.id;
    const value = await Streamrequest.aggregate([
        { $match: { $and: [{ _id: { $eq: id } }] } },
        {
            $lookup: {
                from: 'purchasedplans',
                localField: 'planId',
                foreignField: '_id',
                as: 'purchasedplans',
            },
        },
        {
            $unwind: '$purchasedplans',
        },
    ])
    if (value.length == 0) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
    }
    if (value[0].suppierId != req.userId) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
    }
    return value[0];
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
                pipeline: [
                    { $match: { planType: { $ne: "addon" } } }
                ],
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
    let streamss = await Streamrequest.findById(req.query.id)
    let datess = new Date().setTime(new Date(streamss.startTime).getTime() + (plan.Duration * 60 * 1000));
    let value = await Streamrequest.findByIdAndUpdate({ _id: req.query.id }, { Duration: myplan.Duration, noOfParticipants: myplan.noOfParticipants, chat: myplan.chat, max_post_per_stream: myplan.max_post_per_stream, sepTwo: "Completed", planId: req.body.plan_name, Duration: plan.Duration, endTime: datess }, { new: true })
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

const allot_stream_subhost = async (req) => {
    let value = await Streamrequest.findByIdAndUpdate({ _id: req.query.id }, req.body, { new: true })
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
            $lookup: {
                from: 'streampreregisters',
                localField: '_id',
                foreignField: 'streamId',
                pipeline: [
                    { $match: { status: { $eq: "Registered" } } },
                    { $group: { _id: null, count: { $sum: 1 } } }
                ],
                as: 'streampreregisters',
            },
        },
        {
            $unwind: {
                preserveNullAndEmptyArrays: true,
                path: '$streampreregisters',
            },
        },
        {
            $addFields: {
                registeredUsers: { $ifNull: ['$streampreregisters.count', 0] },
            },
        },
        {
            $lookup: {
                from: 'purchasedplans',
                localField: 'planId',
                foreignField: '_id',
                as: 'purchasedplans',
            },
        },
        {
            $unwind: {
                preserveNullAndEmptyArrays: true,
                path: '$purchasedplans',
            },
        },
        {
            $addFields: {
                max_post_per_stream: { $ifNull: ['$purchasedplans.max_post_per_stream', 0] },
            },
        },
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
                tokenGeneration: 1,
                tokenDetails: 1,
                Duration: 1,
                startTime: 1,
                endTime: 1,
                registeredUsers: 1,
                noOfParticipants: 1,
                max_post_per_stream: 1
            }
        },

        { $sort: { DateIso: -1 } },
        { $skip: 10 * page },
        { $limit: 10 },
    ])
    const total = await Streamrequest.aggregate([
        { $match: { $and: [{ suppierId: { $eq: req.userId } }, { adminApprove: { $eq: "Approved" } }] } },
    ])
    return { value, total: total.length };
};

const get_subhost_streams = async (req) => {
    let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : req.query.page;
    console.log(req.subhostId)
    const value = await Streamrequest.aggregate([
        { $match: { $and: [{ $or: [{ allot_host_1: { $eq: req.subhostId } }, { allot_host_2: { $eq: req.subhostId } }, { allot_host_3: { $eq: req.subhostId } }] }, { adminApprove: { $eq: "Approved" } }] } },
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
                from: 'streampreregisters',
                localField: '_id',
                foreignField: 'streamId',
                pipeline: [
                    { $match: { status: { $eq: "Registered" } } },
                    { $group: { _id: null, count: { $sum: 1 } } }
                ],
                as: 'streampreregisters',
            },
        },
        {
            $unwind: {
                preserveNullAndEmptyArrays: true,
                path: '$streampreregisters',
            },
        },
        {
            $addFields: {
                registeredUsers: { $ifNull: ['$streampreregisters.count', 0] },
            },
        },
        {
            $lookup: {
                from: 'purchasedplans',
                localField: 'planId',
                foreignField: '_id',
                as: 'purchasedplans',
            },
        },
        {
            $unwind: {
                preserveNullAndEmptyArrays: true,
                path: '$purchasedplans',
            },
        },
        {
            $addFields: {
                max_post_per_stream: { $ifNull: ['$purchasedplans.max_post_per_stream', 0] },
            },
        },
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
                tokenGeneration: 1,
                tokenDetails: 1,
                Duration: 1,
                startTime: 1,
                endTime: 1,
                registeredUsers: 1,
                noOfParticipants: 1,
                max_post_per_stream: 1
            }
        },

        { $sort: { DateIso: -1 } },
        { $skip: 10 * page },
        { $limit: 10 },
    ])
    const total = await Streamrequest.aggregate([
        { $match: { $and: [{ suppierId: { $eq: req.userId } }, { adminApprove: { $eq: "Approved" } }] } },
    ])
    return { value, total: total.length };
};

const go_live_stream_host = async (req, userId) => {
    let value = await Streamrequest.aggregate([
        { $match: { $and: [{ suppierId: { $eq: userId } }, { adminApprove: { $eq: "Approved" } }, { _id: { $eq: req.query.id } }] } },
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
                                        productImage: "$products.image",
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
                                        streamStart: 1,
                                        streamEnd: 1
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
                            productImage: "$streamposts.productImage",
                            streamStart: "$streamposts.streamStart",
                            streamEnd: "$streamposts.streamEnd",
                            streampostsId: "$streamposts._id"
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
                                { $match: { $and: [{ streamStart: { $ne: null } }, { streamEnd: { $eq: null } }] } },
                            ],
                            as: 'streamposts',
                        }
                    },
                    { $unwind: "$streamposts" },
                    { $group: { _id: null, count: { $sum: 1 } } }
                ],
                as: 'streamrequestposts_start',
            },
        },
        {
            $unwind: {
                preserveNullAndEmptyArrays: true,
                path: '$streamrequestposts_start',
            },
        },
        {
            $addFields: {
                streamPending: { $ifNull: ['$streamrequestposts_start.count', false] },
            },
        },
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
                temptokens: "$temptokens",
                Duration: 1,
                startTime: 1,
                endTime: 1,
                streamPending: 1

            }
        },

    ])
    return value;
};

const get_subhost_token = async (req, userId) => {
    let value = await Streamrequest.aggregate([
        { $match: { $and: [{ suppierId: { $eq: userId } }, { adminApprove: { $eq: "Approved" } }, { _id: { $eq: req.query.id } }] } },
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
                                        productImage: "$products.image",
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
                                        streamStart: 1,
                                        streamEnd: 1
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
                            productImage: "$streamposts.productImage",
                            streamStart: "$streamposts.streamStart",
                            streamEnd: "$streamposts.streamEnd",
                            streampostsId: "$streamposts._id"
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
                localField: '_id',
                foreignField: 'streamId',
                pipeline: [
                    { $match: { $and: [{ supplierId: { $eq: userId } }] } }
                ],
                as: 'temptokens',
            },
        },
        { $unwind: "$temptokens" },
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
                                { $match: { $and: [{ streamStart: { $ne: null } }, { streamEnd: { $eq: null } }] } },
                            ],
                            as: 'streamposts',
                        }
                    },
                    { $unwind: "$streamposts" },
                    { $group: { _id: null, count: { $sum: 1 } } }
                ],
                as: 'streamrequestposts_start',
            },
        },
        {
            $unwind: {
                preserveNullAndEmptyArrays: true,
                path: '$streamrequestposts_start',
            },
        },
        {
            $addFields: {
                streamPending: { $ifNull: ['$streamrequestposts_start.count', false] },
            },
        },
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
                temptokens: "$temptokens",
                Duration: 1,
                startTime: 1,
                endTime: 1,
                streamPending: 1

            }
        },

    ])
    return value;
};

const go_live_stream_host_SUBHOST = async (req, userId) => {
    let value = await tempTokenModel.findById(req.query.id)
    return value;
};
const get_watch_live_steams_admin_watch = async (req) => {
    var date_now = new Date().getTime()
    let value = await Streamrequest.aggregate([
        { $match: { $and: [{ adminApprove: { $eq: "Approved" } }, { endTime: { $gt: date_now } }] } },
        {
            $lookup: {
                from: 'temptokens',
                localField: '_id',
                foreignField: 'streamId',
                pipeline: [{ $match: { $and: [{ type: { $eq: "host" } }] } }],
                as: 'temptokens',
            },
        },
        {
            $unwind: '$temptokens',
        },
    ]);
    return value;
};


const get_watch_live_steams = async (req) => {

    var date_now = new Date().getTime()
    let value = await Streamrequest.aggregate([
        { $match: { $and: [{ adminApprove: { $eq: "Approved" } }, { endTime: { $gt: date_now } }] } },
        {
            $lookup: {
                from: 'joinedusers',
                localField: '_id',
                foreignField: 'streamId',
                pipeline: [
                    { $group: { _id: 1, count: { $sum: 1 } } }
                ],
                as: 'joinedusers',
            },
        },
        {
            $unwind: {
                preserveNullAndEmptyArrays: true,
                path: '$joinedusers',
            },
        },
        {
            $lookup: {
                from: 'joinedusers',
                localField: '_id',
                foreignField: 'streamId',
                pipeline: [
                    { $match: { shopId: req.shopId } },
                    {
                        $project: {
                            _id: 1,
                            active: { $eq: ["$shopId", req.shopId] }
                        }
                    }
                ],
                as: 'joinedusers_user',
            },
        },
        {
            $unwind: {
                preserveNullAndEmptyArrays: true,
                path: '$joinedusers_user',
            },
        },
        {
            $addFields: {
                alreadyJoined: { $ifNull: ['$joinedusers_user.active', false] },
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
        {
            $unwind: {
                preserveNullAndEmptyArrays: true,
                path: '$suppliers',
            },
        },
        {
            $lookup: {
                from: 'streampreregisters',
                localField: '_id',
                foreignField: 'streamId',
                pipeline: [
                    { $match: { shopId: req.shopId } },
                ],
                as: 'streampreregister',
            },
        },
        {
            $unwind: {
                preserveNullAndEmptyArrays: true,
                path: '$streampreregister',
            },
        },
        {
            $addFields: {
                registerStatus: { $ifNull: ['$streampreregister.status', 'Not Registered'] },
            },
        },
        {
            $addFields: {
                eligible: { $ifNull: ['$streampreregister.eligible', false] },
            },
        },
        {
            $addFields: {
                viewstatus: { $ifNull: ['$streampreregister.viewstatus', ''] },
            },
        },
        {
            $project: {
                "_id": 1,
                "active": 1,
                "archive": 1,
                "post": 1,
                "communicationMode": 1,
                "sepTwo": 1,
                "adminApprove": 1,
                "activelive": 1,
                "tokenGeneration": 1,
                "bookingAmount": 1,
                "streamingDate": 1,
                "streamingTime": 1,
                "discription": 1,
                "streamName": 1,
                "suppierId": 1,
                "postCount": 1,
                "startTime": 1,
                "DateIso": 1,
                "created": 1,
                "Duration": 1,
                "chat": 1,
                "endTime": 1,
                "max_post_per_stream": 1,
                "noOfParticipants": 1,
                "planId": 1,
                "tokenDetails": 1,
                golive: { $gt: ["$noOfParticipants", "$joinedusers.count"] },
                goLive: 1,
                joinedusers_user: "$joinedusers_user",
                alreadyJoined: 1,
                suppliersName: "$suppliers.primaryContactName",
                registerStatus: 1,
                eligible: 1,
                viewstatus: 1
            }
        }
    ]);
    return value;
};


const get_watch_live_token = async (req) => {
    let value = await Streamrequest.aggregate([
        { $match: { $and: [{ adminApprove: { $eq: "Approved" } }] } },
    ]);
    return value;
};

const regisetr_strean_instrest = async (req) => {
    let findresult = await StreamPreRegister.findOne({ shopId: req.shopId, streamId: req.body.streamId });
    let count = await StreamPreRegister.find({ streamId: req.body.streamId, status: "Registered" }).count();
    let participents = await Streamrequest.findById(req.body.streamId);
    if (!findresult) {
        findresult = await StreamPreRegister.create({ shopId: req.shopId, streamId: req.body.streamId, streamCount: count + 1, eligible: participents.noOfParticipants > count })
        await Dates.create_date(findresult)
    }
    else {
        if (findresult.status != 'Registered') {
            findresult.streamCount = count + 1;
            findresult.viewstatus = participents.noOfParticipants > count ? "Confirmed" : (participents.noOfParticipants + participents.noOfParticipants / 2) > count ? "RAC" : 'Waiting';
            findresult.eligible = participents.noOfParticipants > count;
            findresult.status = 'Registered';
            await Dates.create_date(findresult)
        }
    }

    await single_stream_details(req);

    // let update = await StreamPreRegister.find({ streamId: participents._id, eligible: false }).sort({ DateIso: -1 }).limit(participents.noOfParticipants / 2)
    // console.log(update)
    // update.forEach(async (e) => {
    //     e.viewstatus = "RAC"
    //     e.save()
    // })

    return { findresult };

};
const unregisetr_strean_instrest = async (req) => {
    let findresult = await StreamPreRegister.findOne({ shopId: req.shopId, streamId: req.body.streamId });
    let user_postion = findresult.streamCount;
    let participents = await Streamrequest.findById(req.body.streamId);
    let noOfParticipants = participents.noOfParticipants;
    findresult.streamCount = 0;
    findresult.eligible = false;
    findresult.viewstatus = '';
    findresult.status = 'Unregistered';
    findresult.save();
    let count = await StreamPreRegister.find({ streamId: req.body.streamId, status: "Registered" }).count();
    let streamPosition = 0;
    let go_next = false;
    let remaining = noOfParticipants - count;
    if (remaining > 0) {
        console.log(remaining, 'if')
    }
    else {
        if (noOfParticipants >= user_postion) {
            go_next = true;
            streamPosition = noOfParticipants - 1;

        }
        else {
            go_next = false;
        }
    }
    if (go_next && count != 1) {
        let next = await StreamPreRegister.findOne({ streamId: req.body.streamId, status: "Registered", _id: { $ne: findresult._id } }).sort({ DateIso: 1 }).skip(streamPosition);
        if (next) {
            next.eligible = true;
            next.viewstatus = 'Confirmed';
            next.streamCount = user_postion
            next.save();
        }
    }
    await single_stream_details(req);
    let update = await StreamPreRegister.find({ streamId: participents._id, eligible: false }).sort({ DateIso: -1 }).limit(participents.noOfParticipants / 2)
    console.log(update)
    update.forEach(async (e) => {
        e.viewstatus = "RAC"
        e.save()
    })
    return findresult;
};

const single_stream_details = async (req) => {
    setTimeout(async () => {
        let count = await StreamPreRegister.find({ streamId: req.body.streamId, status: "Registered" }).count();
        console.log(count)
        req.io.emit(req.body.streamId + "_userjoined", { count: count, streamId: req.body.streamId });
    }, 300)

}


const purchase_details = async (req) => {
    let planId = req.query.id;
    let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : req.query.page;
    let date = req.query.date;
    let supplier = req.query.supplier;
    dateMatch = { active: { $in: [true, false] } }
    supplierMatch = { active: { $in: [true, false] } }
    if (supplier != null && supplier != 'null' && supplier != '') {
        supplierMatch = { suppierId: { $eq: supplier } }
    }
    if (date != null && date != 'null' && date != '') {
        dateMatch = { date: { $eq: date } }
    }
    let plan = await Streamplan.findById(req.query.id)
    let value = await purchasePlan.aggregate([
        {
            $addFields: {
                date: { $dateToString: { format: "%Y-%m-%d", date: "$created" } },
            },
        },
        {
            $match: {
                $and: [
                    { planId: { $eq: planId } },
                    dateMatch,
                    supplierMatch
                ]
            }
        },
        {
            $lookup: {
                from: 'suppliers',
                localField: 'suppierId',
                foreignField: '_id',
                as: 'suppliers',
            },
        },
        {
            $unwind: {
                preserveNullAndEmptyArrays: true,
                path: '$suppliers',
            },
        },
        {
            $addFields: {
                primaryContactName: "$suppliers.primaryContactName"
            },
        },
        {
            $addFields: {
                primaryContactNumber: "$suppliers.primaryContactNumber"
            },
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
            $unwind: {
                preserveNullAndEmptyArrays: true,
                path: '$streamplans',
            },
        },
        {
            $addFields: {
                planValidity: "$streamplans.validityofplan"
            },
        },
        {
            $addFields: {
                numberofStream: "$streamplans.numberofStream"
            },
        },
        { $skip: 10 * page },
        { $limit: 10 },
    ]);
    let total = await purchasePlan.aggregate([
        {
            $addFields: {
                date: { $dateToString: { format: "%Y-%m-%d", date: "$created" } },
            },
        },
        {
            $match: {
                $and: [
                    { planId: { $eq: planId } },
                    dateMatch,
                    supplierMatch
                ]
            }
        },
    ]);

    return { plan, value, total: total.length }
}

const purchase_details_supplier = async (req) => {
    let planId = req.query.id;
    let suplier = await purchasePlan.aggregate([
        {
            $match: {
                $and: [
                    { planId: { $eq: planId } }
                ]
            }
        },
        {
            $lookup: {
                from: 'suppliers',
                localField: 'suppierId',
                foreignField: '_id',
                as: 'suppliers',
            },
        },
        {
            $unwind: {
                preserveNullAndEmptyArrays: true,
                path: '$suppliers',
            },
        },
        {
            $addFields: {
                primaryContactName: "$suppliers.primaryContactName"
            },
        },
        {
            $addFields: {
                primaryContactNumber: "$suppliers.primaryContactNumber"
            },
        },
        {
            $addFields: {
                supllierId: "$suppliers._id"
            },
        },
        {
            $group: {
                _id: { supllierId: "$supllierId", primaryContactName: "$primaryContactName", primaryContactNumber: "$primaryContactNumber" }
            }
        },
        {
            $project: {
                _id: "$_id.supllierId",
                primaryContactName: "$_id.primaryContactName",
                primaryContactNumber: "$_id.primaryContactNumber"
            }
        }

    ]);

    return suplier
}


const purchase_link_plan = async (req) => {
    let expireMinutes = moment().add(req.body.expireMinutes, 'minutes');
    let value = await streamPlanlink.create({ ...req.body, ...{ expireTime: expireMinutes } })
    let data = {
        exp: expireMinutes,
        supplier: req.body.supplier,
        plan: req.body.plan,
        _id: value._id
    }
    const link = await generateLink.generateLink(data)
    value.token = link;
    await Dates.create_date(value);
    return value;
}
const purchase_link_plan_get = async (req) => {
    const verify = await generateLink.verifyLink(req.query.link)
    let value = await streamPlanlink.aggregate([
        { $match: { $and: [{ _id: { $eq: verify._id } }, { status: { $eq: "created" } }] } },
        {
            $lookup: {
                from: 'suppliers',
                localField: 'supplier',
                foreignField: '_id',
                as: 'suppliers',
            },
        },
        { $unwind: "$suppliers" },
        {
            $lookup: {
                from: 'streamplans',
                localField: 'plan',
                foreignField: '_id',
                as: 'plan_details',
            },
        },
        { $unwind: "$plan_details" }
    ])
    if (value.length == 0) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Plan Already Purchased');
    }
    return value[0];
}


const get_stream_post = async (req) => {
    let value = await StreamPost.aggregate([
        {
            $lookup: {
                from: 'streamrequestposts',
                localField: '_id',
                foreignField: 'postId',
                pipeline: [{ $match: { $and: [{ streamRequest: { $eq: req.query.id } }] } }],
                as: 'streamrequestposts',
            },
        },
        { $unwind: "$streamrequestposts" }
    ])
    return value[0];
}

const get_stream_alert = async (req) => {
    var date_now = new Date().getTime()
    let value = await Streamrequest.aggregate([
        {
            $match: {
                $and: [{ endTime: { $gt: date_now } }, { adminApprove: { $eq: "Approved" } }, { suppierId: { $eq: req.userId } }]
            }
        },
        {
            $lookup: {
                from: 'subhosts',
                localField: 'allot_chat',
                foreignField: '_id',
                as: 'allot_chat_lookup',
            },
        },
        {
            $unwind: {
                preserveNullAndEmptyArrays: true,
                path: '$allot_chat_lookup',
            },
        },
        {
            $addFields: {
                allot_chat_name: { $ifNull: ['$allot_chat_lookup.Name', null] },
            },
        },
        {
            $lookup: {
                from: 'subhosts',
                localField: 'allot_host_1',
                foreignField: '_id',
                as: 'allot_host_1_lookup',
            },
        },
        {
            $unwind: {
                preserveNullAndEmptyArrays: true,
                path: '$allot_host_1_lookup',
            },
        },
        {
            $addFields: {
                allot_host_1_name: { $ifNull: ['$allot_host_1_lookup.Name', null] },
            },
        },
        {
            $lookup: {
                from: 'subhosts',
                localField: 'allot_host_2',
                foreignField: '_id',
                as: 'allot_host_2_lookup',
            },
        },
        {
            $unwind: {
                preserveNullAndEmptyArrays: true,
                path: '$allot_host_2_lookup',
            },
        },
        {
            $addFields: {
                allot_host_2_name: { $ifNull: ['$allot_host_2_lookup.Name', null] },
            },
        },
        {
            $lookup: {
                from: 'subhosts',
                localField: 'allot_host_3',
                foreignField: '_id',
                as: 'allot_host_3_lookup',
            },
        },
        {
            $unwind: {
                preserveNullAndEmptyArrays: true,
                path: '$allot_host_3_lookup',
            },
        },
        {
            $addFields: {
                allot_host_3_name: { $ifNull: ['$allot_host_3_lookup.Name', null] },
            },
        },
    ])
    return value;
}

module.exports = {
    create_Plans,
    create_Plans_addon,
    get_all_Plans_addon,
    get_all_Plans_normal,
    get_all_Plans_pagination,
    get_all_Plans,
    get_one_Plans,
    update_one_Plans,
    delete_one_Plans,
    create_post,
    get_all_Post,
    get_one_Post,
    update_one_Post,
    delete_one_Post,
    create_teaser_upload,

    create_stream_one,
    find_and_update_one,
    create_stream_two,
    get_all_stream,
    get_one_stream,
    update_one_stream,
    delete_one_stream,
    create_stream_one_image,
    create_stream_one_video,
    get_one_stream_step_two,
    update_one_stream_two,
    update_one_stream_one,
    get_all_admin,
    update_approved,
    update_reject,
    get_all_streams,
    get_subhost_token,
    get_subhost_streams,


    go_live_stream_host,
    get_watch_live_steams,
    get_watch_live_steams_admin_watch,
    get_watch_live_token,


    regisetr_strean_instrest,
    unregisetr_strean_instrest,
    go_live_stream_host_SUBHOST,
    get_all_Post_with_page,


    purchase_details,
    purchase_details_supplier,


    purchase_link_plan,
    purchase_link_plan_get,

    get_stream_post,
    get_stream_alert,
    allot_stream_subhost

};
