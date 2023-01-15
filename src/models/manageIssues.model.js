const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const manageIssuesSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  issueId: {
    type: String,
  },
  date: {
    type: Date,
  },
  orderId: {
    type: String,
  },
  status: {
    type: String,
  },
  postedBy: {
    type: String,
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
manageIssuesSchema.plugin(toJSON);
manageIssuesSchema.plugin(paginate);
const manageIssues = mongoose.model('manageIssues', manageIssuesSchema);

module.exports = manageIssues;
