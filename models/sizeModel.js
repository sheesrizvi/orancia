const mongoose = require("mongoose");

const sizeSchema = mongoose.Schema({

  name: {
    type: String,
    required: true,
  },
});

const Size = mongoose.model("Size", sizeSchema);

module.exports = Size;
