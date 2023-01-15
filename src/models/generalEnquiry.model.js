const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const generalEnquirySchema = mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  mobileNo: {
    type: Number,
    unique: true,
  },
  Enquiry: {
    type: String,
  },
});
generalEnquirySchema.plugin(toJSON);
generalEnquirySchema.plugin(paginate);
const generalEnquiry = mongoose.model('generalEnquiry', generalEnquirySchema);

module.exports = generalEnquiry;
