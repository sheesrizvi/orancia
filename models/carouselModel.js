const mongoose = require("mongoose");

const carouselSchema = mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  specialcategory: {
    type: mongoose.Schema.Types.String,
    ref: "SpecialCategory",
  },

  category: {
    type: mongoose.Schema.Types.String,
    ref: "Category",
  },

  product: {
    type: mongoose.Schema.Types.String,
    ref: "Product",
  },

  subcategory: {
    type: mongoose.Schema.Types.String,
    ref: "SubCategory",
  },
});

const Banner = mongoose.model("Banner", carouselSchema);

module.exports = Banner;
