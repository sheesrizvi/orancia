const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true, default: 1 },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.String,
          ref: "Product",
        },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      landmark: { type: String, required: true },
      area: { type: String, required: true },
      mobileNumber: { type: Number, required: true },
      email: { type: String, required: true },
      pinCode: { type: String },
      area: { type: String },
      state: { type: String },
    },
    emailDelivery: {
      type: String,
    },
    itemsPrice: {
      type: String,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    invoiceId: {
      type: String,
    },
    isPaid: {
      type: Boolean,
    },
    taxPrice: {
      type: Number,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    paidAt: {
      type: Date,
    },
    deliveryStatus: {
      type: String,
      enum: ["Processing", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Processing",
    },
    deliveredAt: {
      type: Date,
    },
    notes: {
      type: String,
      required: false,
    },
     wayBill: {
      type: String
    }
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
