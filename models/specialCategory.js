const mongoose = require("mongoose");

const specialCategorySchema = mongoose.Schema({
  _id: String,
  name: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.String,
    required: true,
    ref: "Category",
  },
  subcategory: {
    type: mongoose.Schema.Types.String,
    required: true,
    ref: "SubCategory",
  },
  
  image: {
    type: String,
  },
  active: {
    type: Boolean,
  },
});

const SpecialCategory = mongoose.model(
  "SpecialCategory",
  specialCategorySchema
);

module.exports = SpecialCategory;
