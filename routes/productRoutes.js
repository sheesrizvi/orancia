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
  getRecentlyViewedItems,
  toggleBestSellerProducts,
  toggleNewArrivalProducts,
  shareBestSellerProducts,
  shareNewArrivalProducts,
  searchBestSellerProducts,
  searchNewArrivalProducts,
  bestSellerDownload,
  newArrivalDownload,
  deleteProductImage
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
router.route('/toggle-best-seller-products').post(toggleBestSellerProducts)
router.route('/toggle-new-arrival-products').post(toggleNewArrivalProducts)
router.route('/share-best-seller-products').get(shareBestSellerProducts)
router.route('/share-new-arrival-products').get(shareNewArrivalProducts)
router.route('/search-best-seller-products').get(searchBestSellerProducts)
router.route('/search-new-arrival-products').get(searchNewArrivalProducts)
router.route('/best-seller-download').get(bestSellerDownload)
router.route('/new-arrival-download').get(newArrivalDownload)
router.route('/delete-product-image').delete(deleteProductImage)

// delete
router.route("/delete").delete(deleteProduct);

module.exports = router;
