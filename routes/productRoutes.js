const express = require("express");
const { admin } = require("../middleware/authmiddleware");

const { deleteProduct, createProduct, getAllProduct, getProductById, getProductByGroupId } = require("../controller/productController");
const router = express.Router();

router.route("/create").post(createProduct);
router.route("/get").get(getAllProduct);
router.route("/get-by-id").get(getProductById);
router.route("/get-by-groupid").get(getProductByGroupId);


// delete
router.route("/delete").delete(deleteProduct);


module.exports = router;