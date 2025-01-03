const asyncHandler = require("express-async-handler");
const {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  S3Client,
} = require("@aws-sdk/client-s3");
const Product = require("../models/productModel");
const Inventory = require("../models/inventoryModel");
const Order = require("../models/orderModel");
const RecentlyViewedProduct = require("../models/recentlyViewedProductModel");


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
    metaTitle,
    metaDescription
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
    metaTitle,
    metaDescription,
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
    metaTitle,
    metaDescription,
  } = req.body;
  const ecomProduct = await Product.findById(sku);

  if (ecomProduct) {
    ecomProduct.name = name || ecomProduct.name;
    ecomProduct.description = description || ecomProduct.description;
    ecomProduct.image = Array.isArray(image) && image.length > 0 ? [...ecomProduct.image, ...image]
      : ecomProduct.image
    ecomProduct.category = category || ecomProduct.category;
    ecomProduct.subcategory = subcategory || ecomProduct.subcategory;
    ecomProduct.specialcategory = specialcategory || ecomProduct.specialcategory;
    // ecomProduct.manufacturer = manufacturer || ecomProduct.manufacturer;
    ecomProduct.details = details || ecomProduct.details;
    ecomProduct.cost_price = cost_price || ecomProduct.cost_price;
    ecomProduct.sell_price = sell_price || ecomProduct.sell_price;
    ecomProduct.discount = discount || ecomProduct.discount;
    ecomProduct.groupId = groupId || ecomProduct.groupId

    if (countInStock) {

      const res = await Inventory.findOneAndUpdate({ product: ecomProduct._id }, {
        qty: countInStock
      })

    }

    ecomProduct.tax = tax || ecomProduct.tax;
    ecomProduct.shelflife = shelflife || ecomProduct.shelflife;
    ecomProduct.expiry = expiry || ecomProduct.expiry;
    ecomProduct.hsnCode = hsnCode || ecomProduct.hsnCode;
    ecomProduct.size = size || ecomProduct.size;
    ecomProduct.ingredients = ingredients || ecomProduct.ingredients;
    ecomProduct.notes = notes || ecomProduct.notes;
    ecomProduct.metaTitle = metaTitle || ecomProduct.metaTitle
    ecomProduct.metaDescription = metaDescription || ecomProduct.metaDescription

    const updatedProduct = await ecomProduct.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
})

const deleteProduct = asyncHandler(async (req, res) => {
  try {
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
    await Inventory.deleteOne({ product: req.query.id });
    await Product.deleteOne({ _id: req.query.id });
    res.json("deleted");
  } catch (e) {
    throw new Error(e.message)
  }

});

const getAllProduct = asyncHandler(async (req, res) => {
  const {
    category,
    subcategory,
    size,
    specialcategory,
    ratings,
    min,
    max,
  } = req.query;

  const minprice = min && !isNaN(Number(min)) ? Number(min) : 0;
  const maxprice = max && !isNaN(Number(max)) ? Number(max) : 250000000;

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

  const pageSize = 20;
  const page = Number(req.query.pageNumber) || 1;

  const count = await Product.countDocuments({
    $and: [
      justStrings,
      { sell_price: { $gte: minprice } },
      { sell_price: { $lte: maxprice } },
    ],
  });


  var pageCount = Math.ceil(count / pageSize);


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

const getAllProductsByStockSorting = asyncHandler(async (req, res) => {
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
  const pageSize = 20;
  const page = Number(req.query.pageNumber) || 1;
  const count = await Product.countDocuments({
    $and: [
      justStrings,
      { sell_price: { $gte: minprice } },
      { sell_price: { $lte: maxprice } },
    ],
  });
  var pageCount = Math.floor(count / pageSize);
  if (count % pageSize !== 0) {
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
    .sort({ 'countInStock.qty': 1 })
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

const downloadAllProduct = asyncHandler(async (req, res) => {
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



  const products = await Product.find({
    $and: [
      justStrings,
      { sell_price: { $gte: minprice } },
      { sell_price: { $lte: maxprice } },
    ],
  })
    .select('-discount -createdAt')
    .sort({ createdAt: -1 })
    .populate("category subcategory size countInStock");

  res.json({ products });
});

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
  const product = await Product.find({}).select("_id name countInStock");
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

  const products = await Product.find({
    $or: [
      { name: { $regex: req.query.Query, $options: "i" } },
      { details: { $regex: req.query.Query, $options: "i" } },
      { description: { $regex: req.query.Query, $options: "i" } },
      { ingredients: { $regex: req.query.Query, $options: "i" } },
      { category: { $regex: req.query.Query, $options: "i" } },
    ],
  }).populate("category subcategory specialcategory size countInStock");;

  if (!products || products.length === 0) {
    return res.status(404).json({ message: "No products found" });
  }

  res.status(200).json(products);

});

const mostOrderedProducts = asyncHandler(async (req, res) => {
  const pageNumber = req.query.pageNumber || 1
  const pageSize = req.query.pageSize || 20

  const totalOrderedProducts = await Order.aggregate([
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.product",
      },
    },
    { $count: "total" }
  ]);

  const totalCount = totalOrderedProducts.length > 0 ? totalOrderedProducts[0].total : 0;
  const pageCount = Math.ceil(totalCount / pageSize);

  const mostOrderedProducts = await Order.aggregate([
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.product",
        totalOrdered: { $sum: "$orderItems.qty" },
      },
    },
    { $sort: { totalOrdered: -1 } },
    { $skip: pageSize * (pageNumber - 1) },
    { $limit: pageSize },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },
    {
      $project: {
        _id: "$_id",
        productDetails: 1,
        totalOrdered: 1
      },
    },
  ]);

  res.status(200).send({ message: 'Most Ordered Products', mostOrderedProducts, pageCount })


})

const getNewArrivalsProducts = asyncHandler(async (req, res) => {
  const pageNumber = req.query.pageNumber || 1
  const pageSize = req.query.pageSize || 20

  const products = await Product.find({}).sort({
    createdAt: -1
  }).populate(
    "category subcategory specialcategory size countInStock"
  ).skip((pageSize) * (pageNumber - 1)).limit(pageSize)
  const totalDocuments = await Product.countDocuments({})
  const pageCount = Math.ceil(totalDocuments / pageSize)

  res.status(200).send({ message: 'New Arrival Products First', products, pageCount })
})

const addItemInRecentlyViewed = asyncHandler(async (req, res) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return res.status(400).send({ message: 'User and Product are required' });
  }

  const existingItem = await RecentlyViewedProduct.findOne({ user: userId, product: productId });

  if (existingItem) {
    await RecentlyViewedProduct.findOneAndUpdate(
      { _id: existingItem._id },
      { $set: { viewAt: Date.now() } }
    );
  } else {
    await RecentlyViewedProduct.create({
      user: userId,
      product: productId
    });

    const recentlyViewedItems = await RecentlyViewedProduct.find({ user: userId }).sort({ viewAt: -1 });
    if (recentlyViewedItems.length > 20) {
      const itemsToRemove = recentlyViewedItems.slice(20);
      const idsToRemove = itemsToRemove.map((item) => item._id);

      await RecentlyViewedProduct.deleteMany({ _id: { $in: idsToRemove } });
    }
  }

  res.status(200).send({
    message: 'Product successfully added to recently viewed items'
  });
});


const getRecentlyViewedItems = asyncHandler(async (req, res) => {
  const { userId } = req.query

  const recentlyViewedItems = await RecentlyViewedProduct.find({
    user: userId
  }).populate(
    {
      path: 'product',
      populate: [
        {
          path: 'category'
        },
        {
          path: 'subcategory'
        },
        {
          path: 'size'
        },
        {
          path: 'countInStock'
        }
      ]
    }
  ).sort({
    viewAt: -1
  })

  res.status(200).send({ recentlyViewedItems })
})


const toggleBestSellerProducts = asyncHandler(async (req, res) => {
  const { productId } = req.body

  const product = await Product.findOne({ _id: productId })

  if (!product) {
    return res.status(400).send({ message: 'Product not found' })
  }

  product.bestSeller = !product.bestSeller

  await product.save()

  res.status(200).send({ message: 'BestSeller Updated Successfully' })
})

const toggleNewArrivalProducts = asyncHandler(async (req, res) => {
  const { productId } = req.body
  const product = await Product.findOne({ _id: productId })

  if (!product) {
    return res.status(400).send({ message: 'Product not found' })
  }
  product.newArrival = !product.newArrival

  await product.save()

  res.status(200).send({ message: 'BestSeller Updated Successfully' })
})

const shareNewArrivalProducts = asyncHandler(async (req, res) => {
  const { pageNumber = 1, pageSize = 20 } = req.query

  const products = await Product.find({ newArrival: true }).sort({ createdAt: -1 }).populate("category subcategory specialcategory size countInStock").skip((pageNumber - 1) * pageSize).limit(pageSize)

  if (!products || products.length === 0) {
    return res.status(400).send({ messge: 'No New Arrival Products Found' })
  }

  const totalDocuments = await Product.countDocuments({ newArrival: true })
  const pageCount = Math.ceil(totalDocuments / pageSize)

  res.status(200).send({ products, pageCount })

})

const shareBestSellerProducts = asyncHandler(async (req, res) => {
  const { pageNumber = 1, pageSize = 20 } = req.query

  const products = await Product.find({ bestSeller: true }).sort({ createdAt: -1 }).populate("category subcategory specialcategory size countInStock").skip((pageNumber - 1) * pageSize).limit(pageSize)

  if (!products || products.length === 0) {
    return res.status(400).send({ messge: 'No New Arrival Products Found' })
  }

  const totalDocuments = await Product.countDocuments({ bestSeller: true })
  const pageCount = Math.ceil(totalDocuments / pageSize)

  res.status(200).send({ products, pageCount })
})

const searchNewArrivalProducts = asyncHandler(async (req, res) => {

  const products = await Product.find({
    $and: [
      {
        $or: [
          { name: { $regex: req.query.Query, $options: "i" } },
          { details: { $regex: req.query.Query, $options: "i" } },
          { description: { $regex: req.query.Query, $options: "i" } },
          { ingredients: { $regex: req.query.Query, $options: "i" } },
          { category: { $regex: req.query.Query, $options: "i" } },
        ],
      },
      { bestSeller: true }
    ]

  }).populate("category subcategory specialcategory size countInStock");;

  if (!products || products.length === 0) {
    return res.status(404).json({ message: "No products found" });
  }

  res.status(200).json(products);

})


const searchBestSellerProducts = asyncHandler(async (req, res) => {

  const products = await Product.find({
    $and: [
      {
        $or: [
          { name: { $regex: req.query.Query, $options: "i" } },
          { details: { $regex: req.query.Query, $options: "i" } },
          { description: { $regex: req.query.Query, $options: "i" } },
          { ingredients: { $regex: req.query.Query, $options: "i" } },
          { category: { $regex: req.query.Query, $options: "i" } },
        ],
      },
      { newArrival: true }
    ]

  }).populate("category subcategory specialcategory size countInStock");;

  if (!products || products.length === 0) {
    return res.status(404).json({ message: "No products found" });
  }

  res.status(200).json(products);

})

const bestSellerDownload = asyncHandler(async (req, res) => {
  const products = await Product.find({ bestSeller: true }).sort({ createdAt: -1 }).populate("category subcategory specialcategory size countInStock").skip((pageNumber - 1) * pageSize).limit(pageSize)

  if (!products || products.length === 0) {
    return res.status(400).send({ messge: 'No New Arrival Products Found' })
  }

  res.status(200).send({ products })
})

const newArrivalDownload = asyncHandler(async (req, res) => {
  const products = await Product.find({ newArrival: true }).sort({ createdAt: -1 }).populate("category subcategory specialcategory size countInStock").skip((pageNumber - 1) * pageSize).limit(pageSize)

  if (!products || products.length === 0) {
    return res.status(400).send({ messge: 'No New Arrival Products Found' })
  }

  res.status(200).send({ products })
})

const deleteProductImage = asyncHandler(async (req, res) => {
  const { imageURL, productId } = req.query

  const product = await Product.findById(productId)

  if (!product) {
    return res.status(400).send({ message: 'Product not found' })
  }

  if (!product.image || product.image.length === 0 || product.image.length === 1) {
    return res.status(400).send({ message: 'Product has not much image' })
  }

  product.image = product.image.filter(img => img !== imageURL)
  await product.save()


  let image = imageURL;
  image = Array.isArray(image) ? image : [image];

  for (const file of image) {
    const fileName = file.split("//")[1].split("/")[1];

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: fileName,
    });
    const result = await s3.send(command)

  }
  res.status(200).send({ message: 'Deletion successful' });

})

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProduct,
  createProductReview,
  getProductById,
  searchProducts,
  getProductByGroupId,
  getProductInventory,
  mostOrderedProducts,
  getNewArrivalsProducts,
  downloadAllProduct,
  getAllProductsByStockSorting,
  addItemInRecentlyViewed,
  getRecentlyViewedItems,
  toggleBestSellerProducts,
  toggleNewArrivalProducts,
  shareNewArrivalProducts,
  shareBestSellerProducts,
  searchBestSellerProducts,
  searchNewArrivalProducts,
  bestSellerDownload,
  newArrivalDownload,
  deleteProductImage
};
