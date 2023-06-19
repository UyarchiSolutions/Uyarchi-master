const express = require('express');
const SellerController = require('../../controllers/seller.controller');
const router = express.Router();
const { SetPass, SellerAuth } = require('../../controllers/sellerAuth.controller');

router.route('/register/seller').post(SellerController.createSeller);
router.route('/verifyotp/seller').post(SellerController.verifyOTP);
router.route('/setpassword/seller').post(SetPass, SellerController.setPassword);
router.route('/forgot/seller').post(SellerController.forgotPass);
router.route('/login/seller').post(SellerController.loginseller);
router.route('/alreadyuser/seller').post(SellerController.alreadyUser);

// sub host
router.route('/create/subhost').post(SellerAuth, SellerController.createSubhost);
router.route('/getall/subhost').get(SellerAuth, SellerController.getsubhostAll);
router.route('/get/subhost/free').get(SellerAuth, SellerController.subhost_free_users);
router.route('/disabled/subhost').put(SellerAuth, SellerController.disabled_hosts);
router.route('/get/single/host').get(SellerAuth, SellerController.get_single_host);
router.route('/update/single/host').put(SellerAuth, SellerController.update_single_host);

// sub user
router.route('/create/subuser').post(SellerAuth, SellerController.createSubUser);
router.route('/getall/subuser').get(SellerAuth, SellerController.getsubuserAll);
router.route('/disabled/subuser').put(SellerAuth, SellerController.disabled_subuser);
router.route('/get/single/user').get(SellerAuth, SellerController.get_single_user);
router.route('/update/single/user').put(SellerAuth, SellerController.update_single_user);

// seller user
router.route('/mydetails/profile').get(SellerAuth, SellerController.mydetails);

router.route('/mydetails/profile/changepassword').put(SellerAuth, SellerController.change_password);
router.route('/mydetails/profile').put(SellerAuth, SellerController.update_my_profile);

router.route('/:id').get(SellerController.GetSellerById).put(SellerController.UpdateSellerById);

module.exports = router;
