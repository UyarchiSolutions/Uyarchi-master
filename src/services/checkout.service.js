const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const productpackType = require('../models/productPacktype.model');
const packType = require('../models/packType.model');
const { AddToCart } = require("../models/checkout.modal")
const moment = require('moment');
const { Product, Stock, ConfirmStock, LoadingExecute, BillRaise, ManageBill, ShopList } = require('../models/product.model');
const paymentgatway = require('./paymentgatway.service');
const { ShopOrder, ProductorderSchema, ShopOrderClone, ProductorderClone, MismatchStock, } = require('../models/shopOrder.model');
const OrderPayment = require('../models/orderpayment.model');

const add_to_cart = async (shopId, body) => {
    let cart = await AddToCart.findOne({ shopId: shopId, date: moment().format("YYYY-MM-DD"), status: "Pending" });
    if (!cart) {
        cart = await AddToCart.create({
            date: moment().format("YYYY-MM-DD"),
            created: moment(),
            shopId: shopId,
            cart: body.cart
        })
        //console.log(cart, 'as')
    }
    else {
        //console.log(cart)
        cart = await AddToCart.findByIdAndUpdate({ _id: cart._id }, { cart: body.cart, delivery_type: body.delivery_type }, { new: true })
    }

    return cart;

};

const verifycheckout = async (shopId) => {
    let cart = await AddToCart.findOne({ shopId: shopId, date: moment().format("YYYY-MM-DD"), status: "Pending" });
    if (!cart) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Cart Product Not Fount');
    }
    let gst_array = [];
    let totalPrice = 0;
    let totalGST = 0;
    let cartPrduct = []
    for (let i = 0; i < cart.cart.length; i++) {
        let cartQty = cart.cart[i].cart_QTY;
        let packtype = await productpackType.findById(cart.cart[i].packId)
        let gst = await Product.findById(cart.cart[i].productId);
        let stock = false;
        let productTotal = 0;
        let productTotal_gst = 0;
        if (packtype) {
            if (packtype.show) {
                totalPrice += packtype.salesendPrice * cartQty;
                productTotal = packtype.salesendPrice * cartQty;;
                stock = true;

                productTotal_gst = productTotal * gst.GST_Number / 100;
                totalGST += productTotal * gst.GST_Number / 100;

                let findgst = gst_array.findIndex((e) => e.gst == gst.GST_Number);
                if (findgst != -1) {
                    gst_array[findgst].price = gst_array[findgst].price + productTotal;
                    gst_array[findgst].totalGST = gst_array[findgst].totalGST + productTotal_gst;
                }
                else {
                    gst_array.push({ gst: gst.GST_Number, price: productTotal, totalGST: productTotal_gst })
                }
                totalGST = Math.round(totalGST)
                totalPrice = Math.round(totalPrice);
            }
        }


        cartPrduct.push({ ...cart.cart[i], ...{ stock: stock } })

    }
    return { totalPrice: totalPrice, cartPrduct: cartPrduct, totalGST: totalGST, subtotal: totalPrice + totalGST, gst_array: gst_array, cart };



};
function createOrder(options) {
    return new Promise((resolve, reject) => {
        //console.log(options)
        let totalAmount = []
        options.cart.forEach(async (element) => {
            totalAmount.push(await productpackType.findById(element.packId))
        });
        return resolve(totalAmount);

        // return resolve(options);

    })
}
const getcartProduct = async (shopId) => {
    let cart = await AddToCart.findOne({ shopId: shopId, date: moment().format("YYYY-MM-DD"), status: "Pending" });
    return cart
};


const confirmOrder_razerpay = async (shopId, body) => {
    // const
    let orders;
    if (body.PaymentDatails != null) {
        let payment = await paymentgatway.verifyRazorpay_Amount(body.PaymentDatails);
        let collectedAmount = payment.amount / 100
        let collectedstatus = payment.status;
        if (collectedstatus == 'captured' && collectedAmount == body.OdrerDetails.Amount) {
            let cart = await AddToCart.findOne({ shopId: shopId, date: moment().format("YYYY-MM-DD"), status: "Pending" });
            let orders = await add_shopOrderclone(shopId, body, cart);
            let paymantss = await add_odrerPayment(shopId, body, orders, payment);
            body.OdrerDetails.Product.forEach(async (e) => {
                await add_productOrderClone(shopId, e, orders)
            });
            cart.status = "ordered";
            cart.save();
            return orders

        }


    }
    // //console.log(cart)
    // //console.log();
    // //console.log(body)
    // return orders
};
const confirmOrder_cod = async (shopId, body) => {
    let orders;

    let cart = await AddToCart.findOne({ shopId: shopId, date: moment().format("YYYY-MM-DD"), status: "Pending" });
    orders = await add_shopOrderclone(shopId, body, cart);
    let paymantss = await add_odrerPayment_cod(shopId, body, orders);
    body.OdrerDetails.Product.forEach(async (e) => {
        await add_productOrderClone(shopId, e, orders)
    });
    cart.status = "ordered";
    cart.save();
    return orders
};
const add_shopOrderclone = async (shopId, body, cart) => {
    let orderDetails = body.OdrerDetails
    let currentDate = moment().format('YYYY-MM-DD');
    let currenttime = moment().format('HHmmss');
    const Buy = await ShopOrderClone.find({ date: currentDate });
    let center = '';
    if (Buy.length < 9) {
        center = '0000';
    }
    if (Buy.length < 99 && Buy.length >= 9) {
        center = '000';
    }
    if (Buy.length < 999 && Buy.length >= 99) {
        center = '00';
    }
    if (Buy.length < 9999 && Buy.length >= 999) {
        center = '0';
    }
    let userId = '';
    let totalcount = Buy.length + 1;
    userId = 'OD' + center + totalcount;
    BillId = 'B' + center + totalcount;
    let timeslot = orderDetails.time_of_delivery.replace('-', '');

    let json_obj = {
        Uid: shopId,
        OrderId: userId,
        customerBillId: BillId,
        date: currentDate,
        time: currenttime,
        created: moment(),
        timeslot: timeslot,
        paidamount: 0,
        reorder_status: false,
        devevery_mode: orderDetails.delivery_mode,
        status: "ordered",
        delivery_type: cart.delivery_type,
        Payment: orderDetails.paymant_method,
        time_of_delivery: orderDetails.time_of_delivery,
        product: orderDetails.Product,
        shopId: shopId,
        orderType: "Customer"
    };
    return await ShopOrderClone.create(json_obj)
}

const add_productOrderClone = async (shopId, e, orders) => {
    let gst = await Product.findById(e.productId);
    let currentDate = moment().format('YYYY-MM-DD');
    let currenttime = moment().format('HHmmss');
    return await ProductorderClone.create({
        orderId: orders._id,
        productid: e.productId,
        quantity: e.cart_QTY,
        priceperkg: e.price,
        GST_Number: gst.GST_Number,
        HSN_Code: gst.HSN_Code,
        // packtypeId: e.packtypeId,
        productpacktypeId: e.packId,
        packKg: e.quantity,
        unit: e.unit,
        date: currentDate,
        time: currenttime,
        customerId: shopId,
        finalQuantity: e.cart_QTY,
        finalPricePerKg: e.price,
        created: moment(),
    });
}

const add_odrerPayment = async (shopId, body, orders, payment) => {
    let orderDetails = body.OdrerDetails
    let currentDate = moment().format('YYYY-MM-DD');
    let currenttime = moment().format('HHmmss');
    // //console.log(payment)
    return await OrderPayment.create({
        uid: shopId,
        paidAmt: orderDetails.Amount,
        date: currentDate,
        time: currenttime,
        created: moment(),
        orderId: orders._id,
        type: 'customer',
        pay_type: body.pay_type,
        payment: body.Payment,
        paymentMethod: "Gateway",
        reorder_status: false,
        onlinepaymentId: payment.id,
        onlineorderId: payment.order_id,
        paymentTypes: "Online",
        paymentGatway: "razorpay"
    });
}

const add_odrerPayment_cod = async (shopId, body, orders, payment) => {
    let currentDate = moment().format('YYYY-MM-DD');
    let currenttime = moment().format('HHmmss');
    return await OrderPayment.create({
        uid: shopId,
        paidAmt: 0,
        date: currentDate,
        time: currenttime,
        created: moment(),
        orderId: orders._id,
        type: 'customer',
        pay_type: "cod",
        payment: 0,
        paymentMethod: "cod",
        reorder_status: false,
        paymentTypes: "Online",
        paymentGatway: "cod"
    });
}

const getshoporder_byID = async (shopId, query) => {
    let odrerId = query.id;
    let shopOrder = await ShopOrderClone.findOne({ shopId: shopId, _id: odrerId });
    //console.log(shopOrder)
    if (!shopOrder) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Odrer Not Found');
    }
    return { orderId: shopOrder.OrderId };
}
module.exports = {
    verifycheckout,
    add_to_cart,
    getcartProduct,
    confirmOrder_razerpay,
    getshoporder_byID,
    confirmOrder_cod
}
