const asyncHandler = require("express-async-handler");

const Coupon = require("../models/couponModel.js");

const createCoupon = asyncHandler(async (req, res) => {
  const { name, discount, limit, usedBy, max } = req.body;

  const coupon = await Coupon.create({ name, discount, limit, usedBy, max });

  res.json(coupon);
});


const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.query.couponId);

  res.json(coupon);
});
const getCoupon = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({});

  res.json(coupons);
});
const deleteCoupon = asyncHandler(async (req, res) => {
  await Banner.deleteOne({ _id: req.query.couponId });
  res.json("deleted");
});
const couponUsed = asyncHandler(async (req, res) => {
  const { couponId, userId } = req.body;

  const coupon = await Coupon.findById(couponId);
  let arr = [];
  if (coupon) {
    arr = coupon.usedBy;
    arr.push(userId);
    coupon.usedBy = arr;
   
    const updatedCoupon = await coupon.save();
    res.json(updatedCoupon);
  } else {
    res.status(404);
    throw new Error("coupon not found");
  }
});

module.exports = {
  createCoupon,
  getCouponById,
  getCoupon,
  deleteCoupon,
  couponUsed,

};
