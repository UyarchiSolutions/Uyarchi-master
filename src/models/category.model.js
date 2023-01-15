const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const categorySchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  categoryName: {
    type: String,
  },
  categoryImage: {
    type: String,
  },
  description: {
    type: String,
    default: '',
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
categorySchema.plugin(toJSON);
categorySchema.plugin(paginate);
const Category = mongoose.model('Category', categorySchema);

const SubcategorySchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  parentCategoryId: {
    type: String,
  },
  subcategoryName: {
    type: String,
  },
  categoryImage: {
    type: String,
  },
  description: {
    type: String,
    default: '',
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
SubcategorySchema.plugin(toJSON);
SubcategorySchema.plugin(paginate);

const Subcategory = mongoose.model('Subcategory', SubcategorySchema);

module.exports = { Category, Subcategory };
