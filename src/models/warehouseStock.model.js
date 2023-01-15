const { boolean } = require('joi');
const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const warehouseStockSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    product: {
      type: String,
    },
    category: {
      type: String,
    },
    supplier: {
      type: String,
    },
    inStock: {
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
  },
  {
    timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' },
  }
);

warehouseStockSchema.plugin(toJSON);
warehouseStockSchema.plugin(paginate);
const warehouseStock = mongoose.model('warehouseStock', warehouseStockSchema);

module.exports = warehouseStock;
