const express = require('express');
const generalEnquiryController = require('../../controllers/generalEnquiry.controller');

const router = express.Router();
router.route('/').post(generalEnquiryController.creategeneralEnquiry).get(generalEnquiryController.getgeneralEnqiry);

module.exports = router;
