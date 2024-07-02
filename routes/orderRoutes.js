const express = require("express");
const {
  getOrders,
  updateOrderDeliveryStatus,
  addOrderItems,
  getMyOrders,
  getMonthlySales,
  getSalesDateRange,
  getPendingOrders,
  getOrderFilter,
  updateOrderToPaid,
  getFailedOnlineOrders,
  updateOrderToUnPaid,
  updateOrderToPaidAdmin,
  getOrderById,
  payment,
} = require("../controller/orderController");

const router = express.Router();

//products
router.route("/").get(getOrders);
router.route("/getmonthysales").get(getMonthlySales);
router.route("/getPendingOrders").get(getPendingOrders);
router.route("/getsalesdaterange").get(getSalesDateRange);
router.route("/myorders1").get(getMyOrders);
router.route("/myorders-details").get(getOrderById);
router.route("/orderfilter").get(getOrderFilter);
router.route("/online-failed").get(getFailedOnlineOrders);
router.route("/update").post(updateOrderDeliveryStatus);
router.route("/create-order").post(addOrderItems);
router.route("/update-order-to-paid").post(updateOrderToPaid);
router.route("/update-order-to-paid-admin").post(updateOrderToPaidAdmin);
router.route("/update-order-to-unpaid").post(updateOrderToUnPaid);
router.route("/payment").get(payment);

module.exports = router;
