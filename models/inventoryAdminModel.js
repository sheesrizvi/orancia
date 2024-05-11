const mongoose = require("mongoose");
const bycrypt = require("bcryptjs");

const inventorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      default: "inventory",
    },
  },
  {
    timestamps: true,
  }
);

inventorySchema.methods.matchPassword = async function (enteredPassword) {
  return await bycrypt.compare(enteredPassword, this.password);
};

inventorySchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bycrypt.genSalt(10);
  this.password = await bycrypt.hash(this.password, salt);
});

const InventoryAdmin = mongoose.model("InventoryAdmin", inventorySchema);

module.exports = InventoryAdmin;
