const express = require("express");
const { addWishlistItems, deleteWishlistItems } = require("../controller/wishlistController");
const router = express.Router();


router.route("/create").post(addWishlistItems);
router.route("/delete").post(deleteWishlistItems);

module.exports = router;