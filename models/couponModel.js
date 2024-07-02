const mongoose = require("mongoose");

const coupenSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  max: {
    type: Number,
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  },
  usedBy: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
  limit: {
    type: Number,
    required: true,
  },
});

const Coupon = mongoose.model("Coupon", coupenSchema);

module.exports = Coupon;
