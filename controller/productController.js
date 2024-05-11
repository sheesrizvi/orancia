const asyncHandler = require("express-async-handler");
const {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  S3Client,
} = require("@aws-sdk/client-s3");
const Product = require("../models/productModel");
const Inventory = require("../models/inventoryModel");

const config = {
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
};
const s3 = new S3Client(config);

// Ecom Category

// Ecom Products
const createProduct = asyncHandler(async (req, res) => {
  
  const {
    groupId,
    sku,
    tax,
    name,
    category,
    subcategory,
    specialcategory,
    image,
    description,
    details,
    cost_price,
    sell_price,
    discount,
    countInStock,
    shelflife,
    expiry,
    hsnCode,
    size,
    notes,
    ingredients,
  } = req.body;

  const inputStock = await Inventory.create({
    product: sku,
    qty: countInStock,
  });
  const ecomProduct = await Product.create({
    _id: sku,
    groupId,
    tax,
    name,
    category,
    subcategory,
    specialcategory,
    image,
    description,
    details,
    cost_price,
    sell_price,
    discount,
    countInStock: inputStock._id,
    shelflife,
    expiry,
    hsnCode,
    size,
    notes,
    ingredients,
  });
  if (ecomProduct) {
    res.status(201).json(ecomProduct);
  } else {
    res.status(404);
    throw new Error("Error");
  }
});
const updateProduct = asyncHandler(async (req, res) => {
  const {
    groupId,
    sku,
    tax,
    name,
    category,
    subcategory,
    specialcategory,
    image,
    description,
    details,
    cost_price,
    sell_price,
    discount,
    countInStock,
    shelflife,
    expiry,
    hsnCode,
    size,
    notes,
    ingredients,
  } = req.body;
  const ecomProduct = await Product.findById(sku);
  if (ecomProduct) {
    ecomProduct.name = name;
    ecomProduct.description = description;
    ecomProduct.image = image ? image : ecomProduct.image;
    ecomProduct.category = category;
    ecomProduct.subcategory = subcategory;
    ecomProduct.specialcategory = specialcategory;
    ecomProduct.manufacturer = manufacturer;
    ecomProduct.details = details;
    ecomProduct.cost_price = cost_price;
    ecomProduct.sell_price = sell_price;
    ecomProduct.discount = discount;
    ecomProduct.countInStock = countInStock;
    ecomProduct.tax = tax;
    ecomProduct.shelflife = shelflife;
    ecomProduct.expiry = expiry;
    ecomProduct.hsnCode = hsnCode;
    ecomProduct.size = size;
    ecomProduct.ingredients = ingredients;
    ecomProduct.notes = notes;
    const updatedProduct = await ecomProduct.save();

    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});
const deleteProduct = asyncHandler(async (req, res) => {
  const subid = req.query.id;
  const sub = await Product.findById(subid);

  const f1 = sub.image;
  f1.map(async (file) => {
    const fileName = file.split("//")[1].split("/")[1];

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: fileName,
    });
    const response = await s3.send(command);
  });
await Inventory.deleteOne({product:req.query.id })
  await Product.deleteOne({ _id: req.query.id });
  res.json("deleted");
});
const getAllProduct = asyncHandler(async (req, res) => {
  const {
    category,
    subcategory,
    size,
    specialcategory,
    price,
    ratings,
    min,
    max,
  } = req.query;
  const minprice = price ? min : 0;
  const maxprice = price ? max : 250000000;
  const filter = {
    category,
    size,
    subcategory,
    specialcategory,
   
    rating: ratings,
  };
  const asArray = Object.entries(filter);
  const filtered = asArray.filter(([key, value]) => value);
  const justStrings = Object.fromEntries(filtered);
  const pageSize = 40;
  const page = Number(req.query.pageNumber) || 1;
  const count = await Product.countDocuments({
    $and: [
      justStrings,
      { sell_price: { $gte: minprice } },
      { sell_price: { $lte: maxprice } },
    ],
  });
  var pageCount = Math.floor(count / 40);
  if (count % 40 !== 0) {
    pageCount = pageCount + 1;
  }

  const products = await Product.find({
    $and: [
      justStrings,
      { sell_price: { $gte: minprice } },
      { sell_price: { $lte: maxprice } },
    ],
  })
    .limit(pageSize)
    .sort({ createdAt: -1 })
    .skip(pageSize * (page - 1))
    .populate("category subcategory specialcategory size countInStock");

  res.json({ products, pageCount });
});
// const getActiveProduct = asyncHandler(async (req, res) => {
//   const { ecomCategory, ecomBrand, price, ratings, min, max } = req.query;
//   const minprice = price ? min : 0;
//   const maxprice = price ? max : 2500000;
//   const filter = {
//     ecomCategory,
//     ecomBrand,
//     minprice,
//     maxprice,
//     rating: ratings,
//   };
//   const asArray = Object.entries(filter);
//   const filtered = asArray.filter(([key, value]) => value);
//   const justStrings = Object.fromEntries(filtered);
//   const pageSize = 20;
//   const page = Number(req.query.pageNumber) || 1;
//   const count = await Product.countDocuments({
//     $and: [
//       justStrings,
//       { sell_price: { $gte: minprice } },
//       { sell_price: { $lte: maxprice } },
//       { active: true },
//     ],
//   });
//   var pageCount = Math.floor(count / 20);
//   if (count % 20 !== 0) {
//     pageCount = pageCount + 1;
//   }
//   const products = await Product.find({
//     $and: [
//       justStrings,
//       { sell_price: { $gte: minprice } },
//       { sell_price: { $lte: maxprice } },
//       { active: true },
//     ],
//   })
//     .limit(pageSize)
//     .sort({ createdAt: -1 })
//     .skip(pageSize * (page - 1))
//     .populate("ecomBrand ecomCategory seller");

//   res.json({ products, pageCount });
// });
// const activateDeactivateProduct = asyncHandler(async (req, res) => {
//   const { catId, active } = req.body;

//   const category = await EcomProduct.findById(catId);
//   if (category) {
//     category.active = active;
//     const updatedProduct = await category.save();
//     res.status(201).json(updatedProduct);
//   }
// });
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.query.productId).populate(
    "category subcategory specialcategory size countInStock"
  );
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});
const getProductInventory = asyncHandler(async (req, res) => {
  const product = await Product.find({}).select('_id name countInStock');
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});
const getProductByGroupId = asyncHandler(async (req, res) => {
  const products = await Product.find({ groupId: req.query.groupId }).populate(
    "category subcategory specialcategory size countInStock"
  );
  if (products) {
    res.json(products);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment, user, productId } = req.body;

  const product = await Product.findById(productId);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === user.id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error("Product already reviewed");
    }

    const review = {
      name: user.name,
      rating: Number(rating),
      comment,
      user: user.id,
    };

    product.reviews.push(review);

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Review added" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});
const searchProducts = asyncHandler(async (req, res) => {
  const products = await Product.aggregate([
    {
      $search: {
        index: "default",
        text: {
          query: req.query.Query,
          path: ["name", "details", "description", "ingredients", "category"],
        },
      },
    },
  ]);

  if (products) {
    res.json(products);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProduct,
  createProductReview,
  getProductById,
  searchProducts,
  getProductByGroupId,
  getProductInventory
};
