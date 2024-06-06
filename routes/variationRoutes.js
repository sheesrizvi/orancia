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
} = require("../controller/variationController");
const {
  createCoupon,
  getCoupon,
  getCouponById,
  deleteCoupon,
  couponUsed,
} = require("../controller/couponController");
const router = express.Router();

router.route("/category/create").post(createCategory);
router.route("/category/get").get(getAllCategory);
router.route("/subcategory/create").post(createSubCategory);
router.route("/subcategory/get").get(getAllSubCategory);
router.route("/subcategory/get-by-category").get(getSubCategoryByCategory);
router.route("/specialcategory/create").post(createSpecialCategory);
router.route("/specialcategory/get").get(getAllSpecialCategory);
router.route("/banner/create").post(createBanner);
router.route("/banner/get").get(getBanner);
router.route("/size/create").post(createSize);
router.route("/size/get").get(getAllSize);
router.route("/coupon/create").post(createCoupon);
router.route("/coupon/get").get(getCoupon);
router.route("/coupon/getById").get(getCouponById);
router.route("/coupon/post").post(couponUsed);

// delete
router.route("/category/delete").delete(deleteCategory);
router.route("/subcategory/delete").delete(deleteSubCategory);
router.route("/specialcategory/delete").delete(deleteSpecialCategory);
router.route("/banner/delete").delete(deleteBanner);
router.route("/size/delete").delete(deleteSize);
router.route("/coupon/delete").delete(deleteCoupon);

module.exports = router;
