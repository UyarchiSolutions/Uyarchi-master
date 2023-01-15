const express = require('express');
const userFineController = require('../../controllers/user_Fine.controller');
const router = express.Router();


router.route('/').post(userFineController.createUserFine)




module.exports = router