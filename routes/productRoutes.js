const express = require("express");
const { admin } = require("../middleware/authmiddleware");

const { deleteProduct, createProduct, getAllProduct, getProductById, getProductByGroupId, getProductInventory } = require("../controller/productController");
const { createInput, getAllInput } = require("../controller/inventoryController");
const router = express.Router();

router.route("/create").post(createProduct);
router.route("/get").get(getAllProduct);
router.route("/get-by-id").get(getProductById);
router.route("/get-by-groupid").get(getProductByGroupId);
router.route("/inventory").get(getProductInventory);
router.route("/create-input").post(createInput);
router.route("/getall-input").get(getAllInput);


// delete
router.route("/delete").delete(deleteProduct);


module.exports = router;