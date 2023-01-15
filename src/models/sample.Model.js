const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const sampleData = mongoose.Schema({
  name: {
    type: String,
  },
  age: {
    type: Array,
  },
  dob: {
    type: Date,
  },
  action: {
    type: Boolean,
  },
});
sampleData.plugin(toJSON);
sampleData.plugin(paginate);
const details = mongoose.model('details', sampleData);
module.exports = details;
