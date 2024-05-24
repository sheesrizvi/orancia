const express = require("express");

const { admin } = require("../middleware/authmiddleware");
const {
  registerUser,
  authUser,
  saveShippingAddress,
} = require("../controller/userController");
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(authUser);
router.route("/saveShippingAddress").post(saveShippingAddress);

module.exports = router;
