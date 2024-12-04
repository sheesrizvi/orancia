const express = require("express");
const {
  registerUser,
  authUser,
  saveShippingAddress,
} = require("../controller/userController.js");
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(authUser);
router.route("/saveShippingAddress").post(saveShippingAddress);

module.exports = router;
