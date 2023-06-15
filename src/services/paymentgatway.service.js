
const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const ApiError = require('../utils/ApiError');
const { Razorpaypaymet } = require('../models/paymentgatway.model');
const Razorpay = require('razorpay');
var crypto = require('crypto');
var instance = new Razorpay({ key_id: 'rzp_test_D0FyQwd0lixiEd', key_secret: '2dH1g68aK5K8fuTLi8BZZHBq' })

const razorpayOrderId = async (body) => {

    var options = {
        amount: body.amount * 100,
        currency: "INR",
        receipt: "order_rcptid_11"
    };
    return createOrder(options).then((orderId) => {
        //console.log(orderId)
        return { orderId }
    }).catch(e => {
        //console.log(e)
        return { error: e }
    })
}

function createOrder(options) {
    return new Promise((resolve, reject) => {
        instance.orders.create(options, (err, order) => {
            if (err !== null) {
                //console.log("failed to create order", err);
                return reject(err);
            } else {
                //console.log("ORDERID " + order.id);
                return resolve(order.id);
            }
        });
    })
}


const paynoworder = async (body) => {


}
const getallrazorpaypayment = async (body) => {
    return new Promise((resolve, reject) => {
        instance.payments.all({
            // from: '2016-08-01',
            // to: '2016-08-20'
            count: 20,
        }, (error, response) => {
            if (error) {
                return reject(error);
            } else {
                return resolve(response);
            }
        })
    })

}


const verifyRazorpay_Amount = async (body) => {
    // return new Promise((resolve, reject) => {
    //     instance.payments.all({
    //         // from: '2016-08-01',
    //         // to: '2016-08-20'
    //         count: 20,
    //     }, (error, response) => {
    //         if (error) {
    //             return reject(error);
    //         } else {
    //             return resolve(response);
    //         }
    //     })
    // });
    let hmac = crypto.createHmac('sha256', '2dH1g68aK5K8fuTLi8BZZHBq');
    hmac.update(body.razorpay_order_id + "|" + body.razorpay_payment_id);
    const generated_signature = hmac.digest('hex');
    if (body.razorpay_signature === generated_signature) {
        //console.log({ success: true, message: "Payment has been verified" })
    }
    else {
        //console.log({ success: false, message: "Payment verification failed" })
    }

    let payment = instance.payments.fetch(body.razorpay_payment_id)

    // let collectedAmount = payment.amount / 100
    // let collectedstatus = payment.amount / 100
    return payment;

    // return { aa: true }

}

module.exports = {
    razorpayOrderId,
    paynoworder,
    getallrazorpaypayment,
    verifyRazorpay_Amount,
};
