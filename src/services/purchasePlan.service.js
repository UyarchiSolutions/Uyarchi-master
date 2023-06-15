const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const ApiError = require('../utils/ApiError');
const moment = require('moment');
const { purchasePlan } = require('../models/purchasePlan.model');
const paymentgatway = require('./paymentgatway.service');
const Dates = require('./Date.serive')

const { Streamplan, StreamPost, Streamrequest, StreamrequestPost, StreamPreRegister, streamPlanlink } = require('../models/ecomplan.model');

const create_purchase_plan = async (req) => {
    let orders;
    if (req.body.PaymentDatails != null) {
        let payment = await paymentgatway.verifyRazorpay_Amount(req.body.PaymentDatails);
        //console.log(payment)
        let collectedAmount = payment.amount / 100
        let collectedstatus = payment.status;
        let plan = await Streamplan.findById(req.body.plan);
        if (collectedstatus == 'captured' && collectedAmount == plan.salesPrice) {
            var yourDate = new Date();
            var numberOfDaysToAdd = plan.validityofplan;
            var date_now = yourDate.setDate(yourDate.getDate() + numberOfDaysToAdd)
            let datas = {
                planType: 'normal',
                planId: req.body.plan,
                suppierId: req.userId,
                paidAmount: collectedAmount,
                paymentStatus: collectedstatus,
                order_id: payment.order_id,
                noOfParticipants: plan.numberOfParticipants,
                chat: plan.chatNeed,
                max_post_per_stream: plan.max_post_per_stream,
                Duration: plan.Duration,
                planName: plan.planName,
                DurationType: plan.DurationType,
                numberOfParticipants: plan.numberOfParticipants,
                numberofStream: plan.numberofStream,
                validityofplan: plan.validityofplan,
                noOfParticipantsCost: plan.noOfParticipantsCost,
                chatNeed: plan.chatNeed,
                commision: plan.commision,
                commition_value: plan.commition_value,
                stream_expire_hours: plan.stream_expire_hours,
                stream_expire_days: plan.stream_expire_days,
                stream_expire_minutes: plan.stream_expire_minutes,
                regularPrice: plan.regularPrice,
                salesPrice: plan.salesPrice,
                description: plan.description,
                planmode: plan.planmode,
                expireDate: date_now,
                streamvalidity: plan.streamvalidity,
                no_of_host: plan.no_of_host
            }
            let con = await purchasePlan.create({ ...datas, ...req.body.PaymentDatails });
            await Dates.create_date(con)
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
const create_purchase_plan_private = async (req) => {

    let orders;
    if (req.body.PaymentDatails != null) {
        let payment = await paymentgatway.verifyRazorpay_Amount(req.body.PaymentDatails);
        let collectedAmount = payment.amount / 100
        let collectedstatus = payment.status;
        let links = await streamPlanlink.findById(req.body.link)
        let plan = await Streamplan.findById(links.plan);
        if (collectedstatus == 'captured' && collectedAmount == plan.salesPrice) {
            var yourDate = new Date();
            var numberOfDaysToAdd = plan.validityofplan;
            var date_now = yourDate.setDate(yourDate.getDate() + numberOfDaysToAdd)
            let datas = {
                planType: 'normal',
                planId: links.plan,
                suppierId: links.supplier,
                paidAmount: collectedAmount,
                paymentStatus: collectedstatus,
                order_id: payment.order_id,
                noOfParticipants: plan.numberOfParticipants,
                chat: plan.chatNeed,
                max_post_per_stream: plan.max_post_per_stream,
                Duration: plan.Duration,
                planName: plan.planName,
                DurationType: plan.DurationType,
                numberOfParticipants: plan.numberOfParticipants,
                numberofStream: plan.numberofStream,
                validityofplan: plan.validityofplan,
                noOfParticipantsCost: plan.noOfParticipantsCost,
                chatNeed: plan.chatNeed,
                commision: plan.commision,
                commition_value: plan.commition_value,
                stream_expire_hours: plan.stream_expire_hours,
                stream_expire_days: plan.stream_expire_days,
                stream_expire_minutes: plan.stream_expire_minutes,
                regularPrice: plan.regularPrice,
                salesPrice: plan.salesPrice,
                description: plan.description,
                planmode: plan.planmode,
                expireDate: date_now,
                streamvalidity: plan.streamvalidity,
                no_of_host: plan.no_of_host,
            }
            let con = await purchasePlan.create({ ...datas, ...req.body.PaymentDatails });
            await Dates.create_date(con)
            links.purchaseId = con._id;
            links.status = "Purchased";
            links.save();
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
        //console.log(payment)
        let collectedAmount = payment.amount / 100
        let collectedstatus = payment.status;
        let plan = await Streamplan.findById(req.body.plan);
        if (collectedstatus == 'captured' && collectedAmount == plan.salesPrice) {
            var yourDate = new Date();
            var numberOfDaysToAdd = plan.validityofplan;
            let date_now = yourDate.setDate(yourDate.getDate() + numberOfDaysToAdd)
            if (plan.planType == 'addon') {
                date_now = new Date().getTime();
            }
            //console.log(date_now)
            let con = await purchasePlan.create({ ...{ no_of_host: plan.no_of_host, planType: 'addon', streamId: req.body.streamId, planId: req.body.plan, suppierId: req.userId, paidAmount: collectedAmount, paymentStatus: collectedstatus, order_id: payment.order_id, noOfParticipants: plan.numberOfParticipants }, ...req.body.PaymentDatails });
            await Dates.create_date(con)
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
    //console.log(users_limit)
    let count = stream.noOfParticipants;
    users_limit.forEach(async (e) => {
        count++;
        await StreamPreRegister.findByIdAndUpdate({ _id: e._id }, { eligible: true, streamCount: count, viewstatus: "Confirmed" }, { new: true })
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
        { $skip: 10 * page },
        { $limit: 10 },
    ])
    let total = await purchasePlan.aggregate([
        { $sort: { DateIso: -1 } },
        { $match: { $and: [{ suppierId: req.userId }, { planType: { $eq: 'normal' } }] } },
        { $skip: 10 * (page + 1) },
        { $limit: 10 },
    ]);
    return { plan, next: total.length != 0 };
}

const get_all_purchasePlans = async (req) => {
    var date_now = new Date().getTime()
    const myorders = await purchasePlan.aggregate([
        {
            $match: {
                $and: [{ suppierId: { $eq: req.userId } }, { active: { $eq: true } }, { expireDate: { $gt: date_now } }]
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
                numberOfStreamused: 1,
                expireDate: 1,
                no_of_host: 1

            }
        },
    ])

    return myorders;
}


module.exports = {
    create_purchase_plan,
    get_order_details,
    get_all_my_orders,
    create_purchase_plan_addon,
    get_all_my_orders_normal,
    get_all_purchasePlans,
    create_purchase_plan_private
}