const asyncHandler = require("express-async-handler");

const Coupon = require("../models/couponModel.js");

const createCoupon = asyncHandler(async (req, res) => {
  const { name, discount, limit, usedBy, max } = req.body;

  const coupon = await Coupon.create({ name, discount, limit, usedBy, max });

  res.json(coupon);
});


const updateCoupon = asyncHandler(async (req, res) => {
  const { couponId, name, discount, limit, usedBy, max } = req.body;
  const coupon = await Coupon.findById(couponId)
  if(!coupon) {
    return res.status(400).send({ message: "Coupon not found" })
  }
  
  coupon.name = name || coupon.name
  coupon.discount = discount || coupon.discount
  coupon.limit = limit || coupon.limit
  coupon.usedBy = usedBy || coupon.usedBy
  coupon.max = max || coupon.max
  await coupon.save()
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

const getCouponPaginationApplied = asyncHandler(async (req, res) => {
  const pageNumber = Number(req.query.pageNumber) || 1
  const pageSize = Number(req.query.pageSize) || 20
  const totalDocuments = await Coupon.countDocuments({})
  
  const pageCount = Math.ceil(totalDocuments/pageSize)
  const coupons = await Coupon.find({}).skip((pageNumber  - 1) * pageSize).limit(pageSize)
  res.status(200).send({coupons, pageCount})
})

const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.deleteOne({ _id: req.query.id });
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
  updateCoupon,
  getCouponPaginationApplied
};
