const express = require("express");
const { registerAdmin, authAdmin } = require("../controller/adminController.js");

const router = express.Router();

router.route("/admin-register").post(registerAdmin);
router.route("/admin-login").post(authAdmin);

module.exports = router;