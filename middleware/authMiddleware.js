const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const Finance = require("../models/financeAdminModel");
const Gate = require("../models/gateAdmin");
const InventoryAdmin = require("../models/inventoryAdminModel");
const SeoAdmin = require("../models/seoAdminModel");


const auth = asyncHandler(async (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.status(403).send("Access denied. Login Required");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    res.status(400).send("Invalid token");
  }
});
const admin = asyncHandler(async (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token)
      return res.status(403).send("Access denied. Admin Login Required");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Admin.findById(decoded.id);
    next();
  } catch (error) {
    res.status(400).send("Invalid token");
  }
});
const finance = asyncHandler(async (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.status(403).send("Access denied. Login Required");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Finance.findById(decoded.id);
    next();
  } catch (error) {
    res.status(400).send("Invalid token");
  }
});
const gateAdmin = asyncHandler(async (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.status(403).send("Access denied. Login Required");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Gate.findById(decoded.id);
    next();
  } catch (error) {
    res.status(400).send("Invalid token");
  }
});
const inventoryAdmin = asyncHandler(async (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.status(403).send("Access denied. Login Required");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await InventoryAdmin.findById(decoded.id);
    next();
  } catch (error) {
    res.status(400).send("Invalid token");
  }
});
const seoAdmin = asyncHandler(async (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.status(403).send("Access denied. Login Required");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await SeoAdmin.findById(decoded.id);
    next();
  } catch (error) {
    res.status(400).send("Invalid token");
  }
});


module.exports = {
  admin,
  auth,
  seoAdmin,
  finance,
  inventoryAdmin,
  gateAdmin,
};
