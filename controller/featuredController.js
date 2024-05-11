const asyncHandler = require("express-async-handler");
const FeaturedProduct = require("../model/featuredModel");

const createfeatured = asyncHandler(async (req, res) => {
  const { id } = req.body;

  const orderAgain = FeaturedProduct.create({
    product: id,
  });
  if (orderAgain) {
    res.status(201).json(orderAgain);
  } else {
    res.status(404);
    throw new Error("Error");
  }
});
const updatefeatured = asyncHandler(async (req, res) => {
  const { products } = req.body;
  const orderAgain = FeaturedProduct.findById(id);
  if (orderAgain) {
    orderAgain.products = products;

    const updatedorderAgain = await orderAgain.save();

    res.json(updatedorderAgain);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});
const getfeatured = asyncHandler(async (req, res) => {
  const orderAgain = await FeaturedProduct.find({}).populate({
    path: "product",
    populate: [
      {
        path: "category",
      },
      {
        path: "subcategory",
      },
      {
        path: "specialcategory",
      },
      {
        path: "size",
      },
    ],
  });
  res.json(orderAgain);
});
const getfeaturedById = asyncHandler(async (req, res) => {
  const orderAgain = await FeaturedProduct.findById(req.query.id);
  res.json(orderAgain);
});
const deletefeatured = asyncHandler(async (req, res) => {
  await FeaturedProduct.deleteOne({ _id: req.query.id });
  res.json("deleted");
});

module.exports = {
  updatefeatured,
  createfeatured,
  getfeatured,
  getfeaturedById,
  deletefeatured,
};
