const express = require('express');
const customerIssuesController = require('../../controllers/customerIssues.controller');
const router = express.Router();

router.route('/').post(customerIssuesController.createCustomerIssues);
router.route('/manageIssues/:page').get(customerIssuesController.getAll);
router.route('/:id').put(customerIssuesController.updateCustomerId).put(customerIssuesController.updateRedeliver).put(customerIssuesController.updateRefund).put(customerIssuesController.updateReject)
router.route('/refund/:id').put(customerIssuesController.updateRefund)
router.route('/redeliver/:id').put(customerIssuesController.updateRedeliver)
router.route('/updateReject/:id').put(customerIssuesController.updateReject)
router.route('/getById/:id').get(customerIssuesController.getById)
module.exports = router;
