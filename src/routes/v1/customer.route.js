const express = require('express');
// const customerController = require('../../controllers/customer.controller');
const customerController = require('../../controllers/customer.controller');

const router = express.Router();

router.route('/register').post(customerController.create);
router.post('/login', customerController.login);

module.exports = router;
