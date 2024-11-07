const express = require("express");
const { admin } = require("../middleware/authmiddleware");
const {
  createCategory,
  getAllCategory,
  createSubCategory,
  getAllSubCategory,
  createSpecialCategory,
  getAllSpecialCategory,
  createBanner,
  getBanner,
  createSize,
  getAllSize,
  deleteCategory,
  deleteSubCategory,
  deleteSpecialCategory,
  deleteBanner,
  deleteSize,
  getSubCategoryByCategory,
  updateCategory,
  updateSubCategory,
  updateSpecialCategory,
  getAllCategoryPaginationApplied,
  getAllSubCategoryPaginationApplied,
  getAllSpecialCategoryPaginationApplied,
  searchCategory,
  searchSubCategory,
  searchSpecialCategory,
  getAllSizePaginationApplied,
  getBannerPaginationApplied,
  searchCoupons,
  updateSize,
} = require("../controller/variationController");
const {
  createCoupon,
  getCoupon,
  getCouponById,
  deleteCoupon,
  couponUsed,
  getCouponPaginationApplied,
  updateCoupon,
} = require("../controller/couponController");
const router = express.Router();

router.route("/category/create").post(createCategory);
router.route("/category/get").get(getAllCategory);
router.route("/category/update").post(updateCategory)
router.route("/subcategory/create").post(createSubCategory);
router.route("/subcategory/update").post(updateSubCategory);
router.route("/subcategory/get").get(getAllSubCategory);
router.route("/subcategory/get-by-category").get(getSubCategoryByCategory);
router.route("/specialcategory/create").post(createSpecialCategory);
router.route("/specialcategory/update").post(updateSpecialCategory);
router.route("/specialcategory/get").get(getAllSpecialCategory);
router.route("/banner/create").post(createBanner);
router.route("/banner/get").get(getBanner);
router.route("/size/create").post(createSize);
router.route("/size/update").post(updateSize);
router.route("/size/get").get(getAllSize);
router.route("/coupon/create").post(createCoupon);
router.route("/coupon/update").post(updateCoupon);
router.route("/coupon/get").get(getCoupon);
router.route("/coupon/getById").get(getCouponById);
router.route("/coupon/post").post(couponUsed);
router.route("/category/get/by-page").get(getAllCategoryPaginationApplied)
router.route("/subcategory/get/by-page").get(getAllSubCategoryPaginationApplied)
router.route("/specialcategory/get/by-page").get(getAllSpecialCategoryPaginationApplied)
router.route("/category/search-category").get(searchCategory);
router.route("/subcategory/search-subcategory").get(searchSubCategory);
router.route("/specialcategory/search-specialcategory").get(searchSpecialCategory);
router.route("/coupon/get-paginate").get(getCouponPaginationApplied)
router.route("/size/get-paginate").get(getAllSizePaginationApplied)
router.route("/banner/get-paginate").get(getBannerPaginationApplied)
router.route("/coupons/search-coupons").get(searchCoupons)

// delete
router.route("/category/delete").delete(deleteCategory);
router.route("/subcategory/delete").delete(deleteSubCategory);
router.route("/specialcategory/delete").delete(deleteSpecialCategory);
router.route("/banner/delete").delete(deleteBanner);
router.route("/size/delete").delete(deleteSize);
router.route("/coupon/delete").delete(deleteCoupon);

module.exports = router;
