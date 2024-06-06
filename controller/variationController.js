const asyncHandler = require("express-async-handler");
const {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  S3Client,
} = require("@aws-sdk/client-s3");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const SubCategory = require("../models/subCategoryModel");
const SpecialCategory = require("../models/specialCategory");
const Size = require("../models/sizeModel");
const Banner = require("../models/carouselModel");

const config = {
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
};
const s3 = new S3Client(config);

// Ecom Category
const createCategory = asyncHandler(async (req, res) => {
  const { name, banner, image } = req.body;
  const id = name
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
  const ecomCategory = Category.create({
    _id: id,
    name,
    banner,
    image,
  });
  if (ecomCategory) {
    res.status(201).json(ecomCategory);
  } else {
    res.status(404);
    throw new Error("Error");
  }
});
const updateCategory = asyncHandler(async (req, res) => {
  const { id, name, banner, image } = req.body;
  const ecomCategory = await Category.findById(id);
  if (ecomCategory) {
    ecomCategory.name = name;
    ecomCategory.banner = banner ? banner : ecomCategory.banner;
    ecomCategory.image = image ? image : ecomCategory.image;
    const updatedCategory = await ecomCategory.save();

    res.json(updatedCategory);
  } else {
    res.status(404);
    throw new Error("Category not found");
  }
});
const deleteCategory = asyncHandler(async (req, res) => {
  const subid = req.query.id;
  const sub = await Category.findById(subid);

  const f1 = sub.image;

  if (f1) {
    const fileName = f1.split("//")[1].split("/")[1];

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: fileName,
    });
    const response = await s3.send(command);
  }
  // await Product.deleteMany({category: req.query.id})
  await Category.deleteOne({ _id: req.query.id });
  res.json("deleted");
});

const getAllCategory = asyncHandler(async (req, res) => {
  const categories = await Category.find({});
  res.json(categories);
});

const getSubCategoryByCategory = asyncHandler(async (req, res) => {
  const catId = req.query.catId;

  const subcategory = await SubCategory.find({ category: catId });

  res.json(subcategory);
});

//Sub category

const createSubCategory = asyncHandler(async (req, res) => {
  const { name, category, image } = req.body;
  const id = name
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
  const ecomCategory = SubCategory.create({
    _id: id,
    name,
    category,
    image,
  });
  if (ecomCategory) {
    res.status(201).json(ecomCategory);
  } else {
    res.status(404);
    throw new Error("Error");
  }
});
const updateSubCategory = asyncHandler(async (req, res) => {
  const { id, name, category, image } = req.body;
  const ecomCategory = await SubCategory.findById(id);
  if (ecomCategory) {
    ecomCategory.name = name;
    ecomCategory.category = category;
    ecomCategory.image = image ? image : ecomCategory.image;
    const updatedCategory = await ecomCategory.save();

    res.json(updatedCategory);
  } else {
    res.status(404);
    throw new Error("Category not found");
  }
});
const deleteSubCategory = asyncHandler(async (req, res) => {
  const subid = req.query.id;
  const sub = await SubCategory.findById(subid);

  const f1 = sub.image;

  if (f1) {
    const fileName = f1.split("//")[1].split("/")[1];

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: fileName,
    });
    const response = await s3.send(command);
  }
  //   await Product.deleteMany({subcategory: req.query.id})
  await SubCategory.deleteOne({ _id: req.query.id });
  res.json("deleted");
});

const getAllSubCategory = asyncHandler(async (req, res) => {
  const categories = await SubCategory.find({});
  res.json(categories);
});

//Special Category

const createSpecialCategory = asyncHandler(async (req, res) => {
  const { name, subcategory, image } = req.body;
  const id = name
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
  const sub = await SubCategory.findById(subcategory);

  const ecomCategory = SpecialCategory.create({
    _id: id,
    name,
    subcategory,
    category: sub.category,
    image,
  });
  if (ecomCategory) {
    res.status(201).json(ecomCategory);
  } else {
    res.status(404);
    throw new Error("Error");
  }
});
const updateSpecialCategory = asyncHandler(async (req, res) => {
  const { id, name, subcategory, image } = req.body;
  const ecomCategory = await SpecialCategory.findById(id);
  const sub = await SubCategory.findById(subcategory);
  if (ecomCategory) {
    ecomCategory.name = name;
    ecomCategory.subcategory = subcategory;
    ecomCategory.category = sub.category;
    ecomCategory.image = image ? image : ecomCategory.image;
    const updatedCategory = await ecomCategory.save();

    res.json(updatedCategory);
  } else {
    res.status(404);
    throw new Error("Category not found");
  }
});
const deleteSpecialCategory = asyncHandler(async (req, res) => {
  const subid = req.query.id;
  const sub = await SpecialCategory.findById(subid);

  const f1 = sub.image;

  if (f1) {
    const fileName = f1.split("//")[1].split("/")[1];

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: fileName,
    });
    const response = await s3.send(command);
  }
  // await Product.deleteMany({category: req.query.id})
  await SpecialCategory.deleteOne({ _id: req.query.id });
  res.json("deleted");
});

const getAllSpecialCategory = asyncHandler(async (req, res) => {
  const categories = await SpecialCategory.find({});
  res.json(categories);
});

//size

const createSize = asyncHandler(async (req, res) => {
  const { id, name } = req.body;

  const ecomCategory = Size.create({
    _id: id,
    name,
  });
  if (ecomCategory) {
    res.status(201).json(ecomCategory);
  } else {
    res.status(404);
    throw new Error("Error");
  }
});

const deleteSize = asyncHandler(async (req, res) => {
  await Product.updateMany({ size: req.query.id }, { size: "" });
  await Size.deleteOne({ _id: req.query.id });
  res.json("deleted");
});

const getAllSize = asyncHandler(async (req, res) => {
  const categories = await Size.find({});
  res.json(categories);
});

//homebanner

const createBanner = asyncHandler(async (req, res) => {
  const { image, product, category, subcategory, SpecialCategory } = req.body;
  const banner = Banner.create({
    image,
    category,
    product,
    subcategory,
    SpecialCategory,
  });

  if (banner) {
    res.status(201).json(banner);
  } else {
    res.status(404);
    throw new Error("Error");
  }
});

const getBanner = asyncHandler(async (req, res) => {
  const s = await Banner.find({});
  if (s) {
    res.json(s);
  } else {
    res.status(404);
    throw new Error("Error");
  }
});
const deleteBanner = asyncHandler(async (req, res) => {
  const subid = req.query.id;
  const sub = await Banner.findById(subid);

  const f1 = sub.image;
  const fileName = f1.split("//")[1].split("/")[1];
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET,
    Key: fileName,
  });
  const response = await s3.send(command);
  await Banner.deleteOne({ _id: req.query.id });
  res.json("deleted");
});

module.exports = {
  createBanner,
  getBanner,
  deleteBanner,
  getAllCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllSubCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  createSpecialCategory,
  getAllSpecialCategory,
  updateSpecialCategory,
  deleteSpecialCategory,
  createSize,
  getAllSize,
  deleteSize,
  getSubCategoryByCategory,
};
