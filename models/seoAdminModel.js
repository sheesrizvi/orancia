const mongoose = require("mongoose");
const bycrypt = require("bcryptjs");

const seoAdminSchema = mongoose.Schema(
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
      default: "seo",
    },
  },
  {
    timestamps: true,
  }
);

seoAdminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bycrypt.compare(enteredPassword, this.password);
};

seoAdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bycrypt.genSalt(10);
  this.password = await bycrypt.hash(this.password, salt);
});

const SeoAdmin = mongoose.model("SeoAdmin", seoAdminSchema);

module.exports = SeoAdmin;
