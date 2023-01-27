const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const ApiError = require('../utils/ApiError');
const moment = require('moment');
const { purchasePlan } = require('../models/purchasePlan.model');
const paymentgatway = require('./paymentgatway.service');
const Date = require('./Date.serive')

const { Streamplan, StreamPost, Streamrequest, StreamrequestPost, StreamPreRegister } = require('../models/ecomplan.model');

const create_purchase_plan = async (req) => {
    let orders;
    if (req.body.PaymentDatails != null) {
        let payment = await paymentgatway.verifyRazorpay_Amount(req.body.PaymentDatails);
        console.log(payment)
        let collectedAmount = payment.amount / 100
        let collectedstatus = payment.status;
        let plan = await Streamplan.findById(req.body.plan);
        if (collectedstatus == 'captured' && collectedAmount == plan.salesPrice) {
            let con = await purchasePlan.create({ ...{ planType: 'normal', planId: req.body.plan, suppierId: req.userId, paidAmount: collectedAmount, paymentStatus: collectedstatus, order_id: payment.order_id, noOfParticipants: plan.numberOfParticipants, chat: plan.chatNeed, max_post_per_stream: plan.max_post_per_stream, Duration: plan.Duration }, ...req.body.PaymentDatails });
            await Date.create_date(con)
            return con;
        }
        else {
            return { error: "Amount Not Match" }
        }
    }
    else {
        return { error: "order not found" }
    }


}

const create_purchase_plan_addon = async (req) => {
    let orders;
    if (req.body.PaymentDatails != null) {
        let payment = await paymentgatway.verifyRazorpay_Amount(req.body.PaymentDatails);
        console.log(payment)
        let collectedAmount = payment.amount / 100
        let collectedstatus = payment.status;
        let plan = await Streamplan.findById(req.body.plan);
        if (collectedstatus == 'captured' && collectedAmount == plan.salesPrice) {
            let con = await purchasePlan.create({ ...{ planType: 'addon', streamId: req.body.streamId, planId: req.body.plan, suppierId: req.userId, paidAmount: collectedAmount, paymentStatus: collectedstatus, order_id: payment.order_id, noOfParticipants: plan.numberOfParticipants }, ...req.body.PaymentDatails });
            await Date.create_date(con)
            await addstream_user_limits(req, plan, con)
            return con;
        }
        else {
            return { error: "Amount Not Match" }
        }
    }
    else {
        return { error: "order not found" }
    }


}

const addstream_user_limits = async (req, plan, con) => {
    let stream = await Streamrequest.findById(req.body.streamId);
    let users_limit = await StreamPreRegister.find({ streamId: req.body.streamId, status: "Registered" }).skip(stream.noOfParticipants).limit(plan.numberOfParticipants);
    console.log(users_limit)
    let count = stream.noOfParticipants;
    users_limit.forEach(async (e) => {
        count++;
        await StreamPreRegister.findByIdAndUpdate({ _id: e._id }, { eligible: true, streamCount: count }, { new: true })
    })
    stream.noOfParticipants = plan.numberOfParticipants + stream.noOfParticipants;
    stream.save();
}
const get_order_details = async (req) => {
    let order = await purchasePlan.findById(req.query.id);
    if (!order || order.suppierId != req.userId) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User Not Found');
    }
    let plan = await Streamplan.findById(order.planId);
    let payment = await paymentgatway.verifyRazorpay_Amount({ razorpay_order_id: order.razorpay_order_id, razorpay_payment_id: order.razorpay_payment_id, razorpay_signature: order.razorpay_signature });

    return { payment, plan, order }
}

const get_all_my_orders = async (req) => {
    let plan = await purchasePlan.aggregate([
        { $sort: { DateIso: -1 } },
        { $match: { suppierId: req.userId } },
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
                path: '$streamplans',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                _id: 1,
                DateIso: 1,
                active: 1,
                archived: 1,
                created: 1,
                order_id: 1,
                paidAmount: 1,
                paymentStatus: 1,
                planId: 1,
                razorpay_order_id: 1,
                razorpay_payment_id: 1,
                razorpay_signature: 1,
                Duration: "$streamplans.Duration",
                commision: "$streamplans.commision",
                planName: "$streamplans.planName",
                commition_value: "$streamplans.commition_value",
                chatNeed: "$streamplans.chatNeed",
                numberOfParticipants: "$streamplans.numberOfParticipants",
                numberofStream: "$streamplans.numberofStream",
                post_expire_days: "$streamplans.post_expire_days",
                post_expire_hours: "$streamplans.post_expire_hours",
                post_expire_minutes: "$streamplans.post_expire_minutes",
                regularPrice: "$streamplans.regularPrice",
                validityofStream: "$streamplans.validityofStream",

            }
        }


    ])
    return plan;
}

const get_all_my_orders_normal = async (req) => {
    let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : req.query.page;
    let plan = await purchasePlan.aggregate([
        { $sort: { DateIso: -1 } },
        { $match: { $and: [{ suppierId: req.userId }, { planType: { $eq: 'normal' } }] } },
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
                path: '$streamplans',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                _id: 1,
                DateIso: 1,
                active: 1,
                archived: 1,
                created: 1,
                order_id: 1,
                paidAmount: 1,
                paymentStatus: 1,
                planId: 1,
                razorpay_order_id: 1,
                razorpay_payment_id: 1,
                razorpay_signature: 1,
                Duration: "$streamplans.Duration",
                commision: "$streamplans.commision",
                planName: "$streamplans.planName",
                commition_value: "$streamplans.commition_value",
                chatNeed: "$streamplans.chatNeed",
                numberOfParticipants: "$streamplans.numberOfParticipants",
                numberofStream: "$streamplans.numberofStream",
                post_expire_days: "$streamplans.post_expire_days",
                post_expire_hours: "$streamplans.post_expire_hours",
                post_expire_minutes: "$streamplans.post_expire_minutes",
                regularPrice: "$streamplans.regularPrice",
                validityofStream: "$streamplans.validityofStream",

            }
        },
        { $skip: 10 * page },
        { $limit: 10 },


    ])
    let total = await purchasePlan.aggregate([
        { $sort: { DateIso: -1 } },
        { $match: { $and: [{ suppierId: req.userId }, { planType: { $eq: 'normal' } }] } },
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
                path: '$streamplans',
                preserveNullAndEmptyArrays: true,
            },
        },
    ]);
    return { plan, total: total.length };
}


module.exports = {
    create_purchase_plan,
    get_order_details,
    get_all_my_orders,
    create_purchase_plan_addon,
    get_all_my_orders_normal
}