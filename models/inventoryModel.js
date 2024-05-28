const mongoose = require("mongoose");

const inventorySchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.String,
    required: true,
    ref: "Product",
  },
  qty: {
    type: Number,
    required: true,
  },
});

const Inventory = mongoose.model("Inventory", inventorySchema);

module.exports = Inventory;
