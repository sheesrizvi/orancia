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
const Coupon = require("../models/couponModel");
const BottomBanner = require("../models/bottomBannerModel");

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
  const products = await Product.find({categoy: req.query.id})
  if(products.length > 0) {
    return res.status(400).send({status: false, message: "Delete all Products of this category first"})
  }
  const subcategories = await SubCategory.find({category: req.query.id})
  if(subcategories.length > 0) {
    return res.status(400).send({status: false, message: 'Delete SubCategories First'})
  }
  // const specialCategories = await SpecialCategory.find({category: req.query.id}) 
  // if(specialCategories.length > 0) {
  //   return res.status(400).send({status: false, message: 'Delete Special Categories First'})
  // }
  await Category.deleteOne({ _id: req.query.id });
  res.json("deleted");
});

const getAllCategory = asyncHandler(async (req, res) => {
  const categories = await Category.find({});
  res.json(categories);
});

const getAllCategoryPaginationApplied = asyncHandler(async (req, res) => {
  const pageNumber = Number(req.query.pageNumber) || 1
  const pageSize = Number(req.query.pageSize) || 20
  const totalCategories = await Category.countDocuments({})
  const pageCount = Math.ceil(totalCategories/pageSize)

  const categories = await Category.find({}).skip((pageNumber - 1) * pageSize).limit(pageSize)

  res.status(200).send({categories, pageCount})
})

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

  const products = await Product.find({subcategory: req.query.id})
  if(products.length > 0) {
    return res.status(400).send({status: false, message: "Delete all Products of this subcategory first"})
  }

  // const specialCategories = await SpecialCategory.find({subcategory: req.query.id}) 
  // if(specialCategories.length > 0) {
  //   return res.status(400).send({status: false, message: 'Delete Special Categories First'})
  // }

  await SubCategory.deleteOne({ _id: req.query.id });
  res.json("deleted");
});

const getAllSubCategory = asyncHandler(async (req, res) => {
  const categories = await SubCategory.find({});
  res.json(categories);
});

const getAllSubCategoryPaginationApplied = asyncHandler(async(req, res) => {
  const pageNumber = Number(req.query.pageNumber) || 1
  const pageSize = Number(req.query.pageSize) || 20
  const totalDocuments = await SubCategory.countDocuments({})

  const pageCount = Math.ceil(totalDocuments/pageSize)
  const subcategories = await SubCategory.find({}).skip((pageNumber - 1) * pageSize).limit(pageSize)
  return res.status(200).send({status: true, categories: subcategories, pageCount})
})

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
  console.log(subid)
  const sub = await SpecialCategory.findById(subid);
  console.log(sub)
  const f1 = sub.image;
  console.log(f1)
  // if (f1) {
  //   const fileName = f1.split("//")[1].split("/")[1];

  //   const command = new DeleteObjectCommand({
  //     Bucket: process.env.AWS_BUCKET,
  //     Key: fileName,
  //   });
  //   const response = await s3.send(command);
  // }
  // await Product.deleteMany({category: req.query.id})
  const products = await Product.find({specialcategory: req.query.id})
  if(products.length > 0) {
    return res.status(400).send({status: false, message: "Delete all Products of this special category first"})
  }

  await SpecialCategory.deleteOne({ _id: req.query.id });
  res.json("deleted");
});

const getAllSpecialCategory = asyncHandler(async (req, res) => {
  const categories = await SpecialCategory.find({});
  res.json(categories);
});

//size

const getAllSpecialCategoryPaginationApplied = asyncHandler(async(req, res) => {
  const pageNumber = Number(req.query.pageNumber) || 1
  const pageSize = Number(req.query.pageSize) || 20

  const totalDocuments = await SpecialCategory.countDocuments({})
  const pageCount = Math.ceil(totalDocuments/pageSize)

  const specialcategories = await SpecialCategory.find({}).skip((pageNumber - 1) * pageSize).limit(pageSize)

  return res.status(200).json({status: true, categories: specialcategories, pageCount})

})

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

const updateSize = asyncHandler(async (req, res) => {
  const { id, name } = req.body;
  const ecomCategory = await Size.findById(id)
  if(!ecomCategory) {
    return res.status(400).send({message: 'No Size found'})
  }

  ecomCategory.name = name || ecomCategory.name
  await ecomCategory.save()

  res.status(200).send(ecomCategory)
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

const getAllSizePaginationApplied = asyncHandler(async (req, res) => {

  const pageNumber = Number(req.query.pageNumber) || 1
  const pageSize = Number(req.query.pageSize) || 10
  const totalDocuments = await Size.countDocuments({})
  
  const pageCount = Math.ceil(totalDocuments/pageSize)
  const size = await Size.find({}).skip((pageNumber  - 1) * pageSize).limit(pageSize)
  
  res.status(200).send({size, pageCount})
})
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

const getBannerPaginationApplied = asyncHandler(async (req, res) => {
  const pageNumber = Number(req.query.pageNumber) || 1
  const pageSize = Number(req.query.pageSize) || 20
  const totalDocuments = await Banner.countDocuments({})
  
  const pageCount = Math.ceil(totalDocuments/pageSize)
  const banner = await Banner.find({}).skip((pageNumber  - 1) * pageSize).limit(pageSize)
  res.status(200).send({banner, pageCount})
})


const deleteBanner = asyncHandler(async (req, res) => {
  console.log('del')
  const subid = req.query.id;
  const sub = await Banner.findById(subid);

  const f1 = sub.image;
  // const fileName = f1.split("//")[1].split("/")[1];
  // const command = new DeleteObjectCommand({
  //   Bucket: process.env.AWS_BUCKET,
  //   Key: fileName,
  // });
  // const response = await s3.send(command);
   
  await Banner.deleteOne({ _id: req.query.id });
  res.json("deleted");
});

const searchCategory = asyncHandler(async (req, res) => {
  const pageNumber = Number(req.query.pageNumber) || 1
  const pageSize = Number(req.query.pageSize) || 1
  const totalDocuments = await  Category.countDocuments({
    $or: [
      { name: { $regex: req.query.Query, $options: "i" } },
      { _id: req.query.Query }  
    ]
  })

  const pageCount = Math.ceil(totalDocuments/pageSize)

  const categories = await Category.find({
    $or: [
      { name: { $regex: req.query.Query, $options: "i" } },
      { _id: req.query.Query }  
    ]
  }).skip((pageNumber - 1) * pageSize).limit(pageSize)
  
  if (!categories || categories.length === 0) {
    return res.status(404).json({ message: "No categories found" });
  }
  
  res.status(200).json({categories, pageCount});
})

const searchSubCategory = asyncHandler(async (req, res) => {
  const pageNumber = Number(req.query.pageNumber) || 1
  const pageSize = Number(req.query.pageSize) || 1
  const totalDocuments =  await SubCategory.countDocuments({
    $or: [
      { name: { $regex: req.query.Query, $options: "i" } },
      { _id: req.query.Query },
      { category: { $regex: req.query.Query, $options: "i" } }
    ]
  })

  const pageCount = Math.ceil(totalDocuments/pageSize)

  const subCategories = await SubCategory.find({
    $or: [
      { name: { $regex: req.query.Query, $options: "i" } },
      { _id: req.query.Query },
      { category: { $regex: req.query.Query, $options: "i" } }
    ]
  }).skip((pageNumber -1) * pageSize).limit(pageSize)
  
  if (!subCategories || subCategories.length === 0) {
    return res.status(404).json({ message: "No subcategories found" });
  }
  
  res.status(200).json({categories: subCategories, pageCount});
  
})

const searchSpecialCategory = asyncHandler(async (req, res) => {
  const pageNumber = Number(req.query.pageNumber) || 1
  const pageSize = Number(req.query.pageSize) || 1
  const totalDocuments = await SpecialCategory.find({
    $or: [
      { name: { $regex: req.query.Query, $options: "i" } },
      { _id: req.query.Query },
      { category: { $regex: req.query.Query, $options: "i" } },
      { subcategory: { $regex: req.query.Query, $options: "i" } }
    ]
  })
  const pageCount = Math.ceil(totalDocuments/pageSize)

  const specialCategories = await SpecialCategory.find({
    $or: [
      { name: { $regex: req.query.Query, $options: "i" } },
      { _id: req.query.Query },
      { category: { $regex: req.query.Query, $options: "i" } },
      { subcategory: { $regex: req.query.Query, $options: "i" } }
    ]
  }).skip((pageNumber - 1) * pageSize).limit(pageSize)
  
  if (!specialCategories || specialCategories.length === 0) {
    return res.status(404).json({ message: "No special categories found" });
  }
  
  res.status(200).json({categories: specialCategories, pageCount});
  
})



const searchCoupons = asyncHandler(async (req, res) => {
  
  const query = req.query.Query || "";
  const pageSize = 30;
  const page = Number(req.query.pageNumber) || 1;
  
  const matchCriteria = {
    $or: [
      { name: { $regex: query, $options: "i" } }
    ],
  };

  const count = await Coupon.countDocuments(matchCriteria);
  const pageCount = Math.ceil(count / pageSize);
 
  const coupons = await Coupon.find(matchCriteria)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });
   
  if (!coupons || coupons.length === 0) {
    return res.status(404).json({ message: "No coupons found" });
  }
 
  res.status(200).json({
    coupons,
    pageCount,
  });
});


const createBottomBanner = asyncHandler(async (req, res) => {
  const { title, image } = req.body

  if(!title || !image) {
    return res.status(400).send({ message: 'No Title or Image Found' })
  }

  await BottomBanner.create({
    title,
    image
  })

  res.status(200).send({ message: 'Bottom Banner created successfully' })
})

const listBottomBanners = asyncHandler(async (req, res) => {

  const banners = await BottomBanner.find({})
  if(!banners) {
    return res.status(400).send({ message: 'Banner not found' })
  }
  res.status(200).send({ message: 'Bottom Banner created successfully', banners })
})

const deleteBottomBanner = asyncHandler(async (req, res) => {
    const { id } = req.query
    console.log(req.query)
    const bottomBanner =  await BottomBanner.findOneAndDelete({ _id: id })
    if(!bottomBanner) {
      return res.status(400).send({ message: 'Banner not found' })
    }

    res.status(200).send({ banner: bottomBanner })
})

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
  updateSize,
  getAllSize,
  deleteSize,
  getSubCategoryByCategory,
  getAllCategoryPaginationApplied,
  getAllSpecialCategoryPaginationApplied,
  getAllSubCategoryPaginationApplied,
  searchCategory,
  searchSubCategory,
  searchSpecialCategory,
  getAllSizePaginationApplied,
  getBannerPaginationApplied,
  searchCoupons,
  createBottomBanner,
  listBottomBanners,
  deleteBottomBanner
};
