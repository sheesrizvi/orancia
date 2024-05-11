const mongoose = require("mongoose");

const inputStockSchema = mongoose.Schema({
  inventory: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Inventory",
  },
  qty: {
    type: Number,
    required: true
  },
  date: {
    type: Date
  },
  notes: {
    type: String
  },

});

const InputStock = mongoose.model("InputStock", inputStockSchema);

module.exports = InputStock;
