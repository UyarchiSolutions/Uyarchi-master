const express = require('express');
const PartnerSetPriceController = require('../../controllers/partner.setPrice.controller');
const PartnerAuth = require('../../controllers/PartnerAuth.controller');
const router = express.Router();
router.route('/').post(PartnerSetPriceController.SetPartnerPrice);
router.route('/AddProductByPartner').post(PartnerAuth, PartnerSetPriceController.AddProductByPartner);
router.route('/Fetch/Productby/Partner/:id').get(PartnerAuth, PartnerSetPriceController.FetchProductbyPartner);
router.route('/create/Active/Cart').post(PartnerAuth, PartnerSetPriceController.create_Active_cart);
router.route('/get/Active/CartBy_partner').get(PartnerAuth, PartnerSetPriceController.getActiveCartBy_partner);
router.route('/create/Partner/ShopOrder').post(PartnerAuth, PartnerSetPriceController.create_PartnerShopOrder);
router.route('/getOrdersbycart/:id').get(PartnerSetPriceController.getOrdersbycart);
router.route('/getOrdered/Products/:id').get(PartnerSetPriceController.getOrderedProducts);
router.route('/updateAddOnStock').post(PartnerSetPriceController.updateAddOnStock);
router.route('/Return_Wastage_inCloseStock').post(PartnerSetPriceController.Return_Wastage_inCloseStock);
router.route('/getCart/Ordered/Products/').get(PartnerSetPriceController.getCart_Ordered_Products);
router.route('/distributions/getOrder/For/CurrentDateByCart').get(PartnerSetPriceController.getOrder_For_CurrentDateByCart);
// partner request order to Admin
router.route('/createPartnerOrder/FromAdmin').post(PartnerAuth, PartnerSetPriceController.createPartnerOrder_FromAdmin);
router.route('/getOrders/ByPartner').get(PartnerAuth, PartnerSetPriceController.getOrdersByPartner);

module.exports = router;
