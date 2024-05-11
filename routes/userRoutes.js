const express = require("express");

const { admin } = require("../middleware/authmiddleware");
const { registerUser, authUser } = require("../controller/userController");
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(authUser);

module.exports = router;