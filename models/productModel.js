const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = mongoose.Schema(
  {
    _id: String,
    groupId: {
      type: String,
      required: true,
    },
    hsnCode: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    image: [
      {
        type: String,
        required: true,
      },
    ],
    category: {
      type: mongoose.Schema.Types.String,
      required: true,
      ref: "Category",
    },
    subcategory: {
      type: mongoose.Schema.Types.String,
      ref: "SubCategory",
    },
    specialcategory: {
      type: mongoose.Schema.Types.String,
      ref: "SpecialCategory",
    },
    size: {
      type: mongoose.Schema.Types.String,
      ref: "Size",
    },
    description: {
      type: String,
    },
    ingredients: {
      type: String,
    },
    details: {
      type: String,
    },

    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },

    cost_price: {
      type: Number,
      required: true,
      default: 0,
    },
    tax: {
      type: Number,
      required: true,
    },
    sell_price: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: [
      {
        quantity: { type: String },
        discount: { type: Number },
        expiry: { type: Number },
      },
    ],
    countInStock: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Inventory",
    },
    shelflife: {
      type: String,
    },
    expiry: {
      type: String,
    },
    notes: {
      type: String,
    },
    metaTitle: {
      type: String
    },
    metaDescription: {
      type: String
    },
    bestSeller: {
      type: Boolean,
      default: false
    },
    newArrival: {
     type: Boolean,
     default: false
    }
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
