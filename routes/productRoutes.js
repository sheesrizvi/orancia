const express = require("express");


const {
  deleteProduct,
  createProduct,
  getAllProduct,
  getProductById,
  getProductByGroupId,
  getProductInventory,
  createProductReview,
  updateProduct,
  searchProducts,
  mostOrderedProducts,
  getNewArrivalsProducts,
  downloadAllProduct,
  getAllProductsByStockSorting,
  addItemInRecentlyViewed,
  getRecentlyViewedItems
} = require("../controller/productController.js");
const {
  createInput,
  getAllInput,
  deleteInput,
} = require("../controller/inventoryController");
const router = express.Router();

router.route("/create").post(createProduct);
router.route("/update").post(updateProduct)
router.route("/get").get(getAllProduct);
router.route("/get-by-count-in-stock").get(getAllProductsByStockSorting);
router.route("/download").get(downloadAllProduct);
router.route("/get-by-id").get(getProductById);
router.route("/get-by-groupid").get(getProductByGroupId);
router.route("/inventory").get(getProductInventory);
router.route("/create-input").post(createInput);
router.route("/getall-input").get(getAllInput);
router.route("/create-review").post(createProductReview);
router.route("/search-product").get(searchProducts);
router.route("/delete-inventory").delete(deleteInput)
router.route("/most-ordered-products").get(mostOrderedProducts)
router.route('/get-new-arrival').get(getNewArrivalsProducts)
router.route('/add-item-in-recently-viewed').post(addItemInRecentlyViewed)
router.route('/get-recently-viewed-item').get(getRecentlyViewedItems)

// delete
router.route("/delete").delete(deleteProduct);

module.exports = router;
