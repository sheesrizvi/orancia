const asyncHandler = require("express-async-handler");
const InputStock = require("../models/inputStockModel");
const Inventory = require("../models/inventoryModel");

const createInput = asyncHandler(async (req, res) => {
  const { inventory, qty, notes } = req.body;
  const date = new Date();
  const inputStock = await InputStock.create({ inventory, qty, date, notes });
  const inventoryF = await Inventory.findOne({ _id: inventory });
  if (inventoryF) {
    inventoryF.qty = inventoryF.qty + qty;
    const updatedInventory = await inventoryF.save();
  }
  if (inputStock) {
    res.status(201).json(inputStock);
  } else {
    res.status(404);
    throw new Error("Error");
  }
});
const getStocksByProduct = asyncHandler(async (req, res) => {
  const { product } = req.query;
  const inventory = await Inventory.findOne({ product: product });
  const inputStock = await InputStock.find({ inventory: inventory._id });

  if (inputStock) {
    res.status(201).json({ inputStock, inventory });
  } else {
    res.status(404);
    throw new Error("Error");
  }
});
const getAllInput = asyncHandler(async (req, res) => {
  const inputStock = await InputStock.find({}).populate({
    path: "inventory",
    populate: [
      {
        path: "product",
      },
    ],
  });

  if (inputStock) {
    res.status(201).json(inputStock);
  } else {
    res.status(404);
    throw new Error("Error");
  }
});

module.exports = { createInput, getStocksByProduct, getAllInput };
