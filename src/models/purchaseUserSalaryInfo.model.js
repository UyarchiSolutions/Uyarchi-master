const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const purchaseUserSalarySchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  userId: {
    type: String,
  },
  salary: {
    type: Number,
  },
  status: {
    type: String,
    default: 'Active',
  },
  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
});

purchaseUserSalarySchema.plugin(toJSON);
purchaseUserSalarySchema.plugin(paginate);
const PuSalary = mongoose.model('PuSalaryInfo', purchaseUserSalarySchema);

module.exports = PuSalary;
