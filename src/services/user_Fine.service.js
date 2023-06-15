const httpStatus = require('http-status');
const Userfine = require('../models/user_Fine.model');
const ApiError = require('../utils/ApiError');
const {
    ShopOrderClone
} = require('../models/shopOrder.model')
const orderPayment = require('../models/orderpayment.model')
const moment = require('moment');

// create UserFine

const createUserFine = async (body) => {
    let { lastPaidamt, Difference_Amt, customerClaimedAmt } = body
    let diffamt = parseInt(lastPaidamt) - parseInt(customerClaimedAmt)
    let values = {
        ...body, ...{
            created: moment(), date: moment().format('YYYY-MM-DD'), time: moment().format('HH:mm:ss'), lastPaidamt: lastPaidamt, Difference_Amt: diffamt
        }
    }
    let orderId = body.orderId
    let orderpaymentId = body.orderpaymentId
    //console.log(orderId)
    await orderPayment.findByIdAndUpdate({ _id: orderpaymentId }, { creditApprovalStatus: "Approved" }, { new: true })
    const createValues = await Userfine.create(values)
    return createValues
}




module.exports = {
    createUserFine
}