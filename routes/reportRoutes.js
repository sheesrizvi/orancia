const express = require("express");
const { admin } = require("../middleware/authmiddleware");
const { dashboardData, topCustomers, topSellingProducts, searchTopSellingProducts, searchTopCustomers, topCustomersForDownload, topSellingProductsForDownload } = require("../controller/reportController");

const router = express.Router();

router.route("/get-dashboard-data").get(dashboardData);
router.route("/get-top-customers").get(topCustomers);
router.route("/get-top-products").get(topSellingProducts);
router.route("/search-top-products").get(searchTopSellingProducts);
router.route("/search-top-customers").get(searchTopCustomers);
router.route("/get-top-customers-for-download").get(topCustomersForDownload);
router.route("/get-top-products-for-download").get(topSellingProductsForDownload);


module.exports = router;