const express = require('express');
const SellerController = require('../../controllers/seller.controller');
const router = express.Router();
const { SetPass, SellerAuth } = require('../../controllers/sellerAuth.controller');

router.route('/register/seller').post(SellerController.createSeller)
router.route('/verifyotp/seller').post(SellerController.verifyOTP)
router.route('/setpassword/seller').post(SetPass, SellerController.setPassword)
router.route('/forgot/seller').post(SellerController.forgotPass)
router.route('/login/seller').post(SellerController.loginseller)
router.route('/alreadyuser/seller').post(SellerController.alreadyUser)

// sub host
router.route('/create/subhost').post(SellerAuth, SellerController.createSubhost)
router.route('/getall/subhost').get(SellerAuth, SellerController.getsubhostAll)
router.route('/get/subhost/free').get(SellerAuth, SellerController.subhost_free_users)

// sub user
router.route('/create/subuser').post(SellerAuth, SellerController.createSubUser)
router.route('/getall/subuser').get(SellerAuth, SellerController.getsubuserAll)


// seller user
router.route('/mydetails/profile').get(SellerAuth, SellerController.mydetails)


router.route('/:id').get(SellerController.GetSellerById).put(SellerController.UpdateSellerById);

module.exports = router;
