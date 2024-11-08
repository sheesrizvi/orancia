const asyncHandler = require('express-async-handler')
const User = require("../models/userModel.js");
const Product = require("../models/productModel");
const Order = require('../models/orderModel.js');

const dashboardData = asyncHandler(async (req, res) => {
    const totalCustomers = await User.countDocuments({})
    const totalProducts = await Product.countDocuments({})
    const totalOrders = await Order.countDocuments({})
    let totalSales = await Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { 
            _id: null,
            sales: { $sum:  '$totalPrice' }
        } }
    ])

   totalSales = totalSales.length > 0 ? totalSales[0]?.sales?.toFixed(2) : 0

   const currentYear = new Date().getFullYear()
   const monthlySales = await Order.aggregate([
    { $match: {isPaid: true} },
    {  $project: {
        month: { $month: "$createdAt" },
        year: { $year: "$createdAt" },
        finalPrice: { $sum: "$totalPrice" }
    } },
    { $match: { year: currentYear } },
    { $group: {
        _id: "$month",
        sales: { $sum: "$finalPrice" }
    } },
    { $sort: { _id: 1 } }
   ])
   res.status(200).send({ totalCustomers, totalProducts, totalOrders, totalSales, monthlySales })  
})

const topCustomers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.pageNumber) || 1
    const pageSize = parseInt(req.query.pageSize) || 20

    const totalResults = await Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: "$user" } },
        { $count: "total" } 
    ]);

    const totalCustomers = totalResults[0]?.total || 0;
    const pageCount = Math.ceil(totalCustomers / pageSize);

    const topCustomer = await Order.aggregate([
        { $match: { isPaid: true } },
        { $group: {
            _id: "$user",
            finalPrice: { $sum: "$totalPrice" }
        } },
        {$sort: { finalPrice: -1 }},
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "user"
            }
        },
        { $unwind: "$user" },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize }
    ])

    res.status(200).send({ topCustomer, pageCount })
})

const topSellingProducts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.pageNumber) || 1; 
    const pageSize = parseInt(req.query.pageSize) || 20; 
    const searchQuery = req.query.search || ""
   
    const totalResults = await Order.aggregate([
        { $unwind: "$orderItems" },
        { $match: { isPaid: true } },
        { $group: { _id: "$orderItems.product" } },
        { $count: "total" } 
    ]);

    const totalProducts = totalResults[0]?.total || 0;
    const pageCount = Math.ceil(totalProducts / pageSize);

    const topSelling = await Order.aggregate([
        { $unwind: "$orderItems"  },
        { $match: { isPaid: true } },
        { $group: { 
            _id: "$orderItems.product",
            finalPrice: { $sum: "$orderItems.price"}
        }  },
        { $sort: { finalPrice: -1 } },
        { $lookup: {
            from: 'products',
            localField: "_id",
            foreignField: "_id",
            as: "product"
        } },
        { $unwind: "$product" },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize }
    ])

    res.status(200).send({topSelling, pageCount})
})


const searchTopSellingProducts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.pageNumber) || 1; 
    const pageSize = parseInt(req.query.pageSize) || 20; 
    const searchQuery = req.query.Query || ""; 
    

    const totalResults = await Order.aggregate([
        { $unwind: "$orderItems" },
        { $match: { isPaid: true } },
        { $lookup: {
            from: 'products',
            localField: "orderItems.product",
            foreignField: "_id",
            as: "product"
        } },
        { $unwind: "$product" },
        { 
            $match: { 
                "product.name": { $regex: searchQuery, $options: "i" } 
            } 
        },
        { $group: { _id: "$orderItems.product" } },
        { $count: "total" } 
    ]);

    const totalProducts = totalResults[0]?.total || 0;
    const pageCount = Math.ceil(totalProducts / pageSize);

    const topSelling = await Order.aggregate([
        { $unwind: "$orderItems" },
        { $match: { isPaid: true } },
        { $group: { 
            _id: "$orderItems.product",
            finalPrice: { $sum: "$orderItems.price" }
        } },
        { $sort: { finalPrice: -1 } },
        { $lookup: {
            from: 'products',
            localField: "_id",
            foreignField: "_id",
            as: "product"
        } },
        { $unwind: "$product" },
        { 
            $match: { 
                "product.name": { $regex: searchQuery, $options: "i" } 
            } 
        },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize }
    ]);

    res.status(200).send({ topSelling, pageCount });
});



const searchTopCustomers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.pageNumber) || 1
    const pageSize = parseInt(req.query.pageSize) || 20
    const searchQuery = req.query.Query || ""

    const totalResults = await Order.aggregate([
        { $match: { isPaid: true } },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user"
            }
        },
        { $unwind: "$user" },
        {
            $match: {
                "user.name": { $regex: searchQuery, $options: "i" }
            }
        },
        { $group: { _id: "$user._id" } },
        { $count: "total" }
    ]);

    const totalCustomers = totalResults[0]?.total || 0;
    const pageCount = Math.ceil(totalCustomers / pageSize);

    const topCustomer = await Order.aggregate([
        { $match: { isPaid: true } },
        {
            $group: {
                _id: "$user",
                finalPrice: { $sum: "$totalPrice" }
            }
        },
        { $sort: { finalPrice: -1 } },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "user"
            }
        },
        { $unwind: "$user" },
        {
            $match: {
                "user.name": { $regex: searchQuery, $options: "i" }
            }
        },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize }
    ])

    res.status(200).send({ topCustomer, pageCount })
})


const topCustomersForDownload = asyncHandler(async (req, res) => {
   
    const topCustomer = await Order.aggregate([
        { $match: { isPaid: true } },
        { $group: {
            _id: "$user",
            finalPrice: { $sum: "$totalPrice" }
        } },
        {$sort: { finalPrice: -1 }},
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "user"
            }
        },
        { $unwind: "$user" },
    ])

    res.status(200).send({ topCustomer })
})


const topSellingProductsForDownload = asyncHandler(async (req, res) => {
   
    const topSelling = await Order.aggregate([
        { $unwind: "$orderItems"  },
        { $match: { isPaid: true } },
        { $group: { 
            _id: "$orderItems.product",
            finalPrice: { $sum: "$orderItems.price"}
        }  },
        { $sort: { finalPrice: -1 } },
        { $lookup: {
            from: 'products',
            localField: "_id",
            foreignField: "_id",
            as: "product"
        } },
        { $unwind: "$product" },
    ])

    res.status(200).send({topSelling})
})

module.exports = {
    dashboardData,
    topCustomers,
    topSellingProducts,
    searchTopSellingProducts,
    searchTopCustomers,
    topCustomersForDownload,
    topSellingProductsForDownload
}