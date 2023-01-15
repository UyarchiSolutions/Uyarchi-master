const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const otherExpensesSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  expensesType: {
    type: Array,
    default: [
      'Petrol/Diesel',
      'Water',
      'Stationar',
      'ElectricityBill',
      'Reacharge',
      'Boardband',
      'Telephone',
      'House Keeping',
      'vehicle Repair',
    ],
  },
  description: {
    type: String,
  },
  billUpload: {
    type: String,
  },
  amount: {
    type: Number,
  },
});

otherExpensesSchema.plugin(toJSON);
otherExpensesSchema.plugin(paginate);

const OtherExpenses = mongoose.model('OtherExpenses', otherExpensesSchema);

module.exports = {
  OtherExpenses,
};
