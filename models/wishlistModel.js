const mongoose = require("mongoose");

const wishlistSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    items: [
      {
        qty: { type: Number, required: true, default: 1 },
        product: {
          type: mongoose.Schema.Types.String,
          ref: "Product",
        },
      },
    ],
    
  },
  {
    timestamps: true,
  }
);

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

module.exports = Wishlist;
