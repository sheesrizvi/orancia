const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
// const UserReward = require("../models/userReward");
const nodemailer = require("nodemailer");
// const emailTemplate = require("../document/email");
// const endOfDay = require("date-fns/endOfDay");
// const startOfDay = require("date-fns/startOfDay");
// const startOfMonth = require("date-fns/startOfMonth");
// const endOfMonth = require("date-fns/endOfMonth");
// const pdf = require("html-pdf");
// const template = require("../document/template");
// const { parseISO } = require("date-fns");
// const OrderPDF = require("./orderPdf");
// const Razorpay = require("razorpay");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// const sendEmail = (orderItems, paymentMethod, totalPrice, user) => {
//   const items = orderItems;
//   var options = { format: "A4" };

//   pdf
//     .create(OrderPDF({ items, user, paymentMethod, totalPrice }), options)
//     .toFile(`${__dirname}/invoice1.pdf`, (err) => {
//       transporter.sendMail({
//         from: ` Oransia <info@oransia.com>`, // sender address
//         to: `${user.email}`, // list of receivers
//         replyTo: `<info@oransia.com>`,
//         subject: `Order Confirm ${user?.name}`, // Subject line
//         text: `Order from Oransia`, // plain text body
//         html: emailTemplate(orderItems, paymentMethod, totalPrice), // html body
//         attachments: [
//           {
//             filename: "invoice1.pdf",
//             path: `${__dirname}/invoice1.pdf`,
//           },
//         ],
//       });
//     });
// };

const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    invoiceId,
    shippingPrice,
    paidAt,
    itemsPrice,
    totalPrice,
    paymentResult,
    deliveryStatus,
    userId,
    notes,
    isPaid,
  } = req.body;
  console.log(req.body);
  if (paymentMethod == "COD") {
    const order = await Order.create({
      orderItems,
      user: userId,
      shippingAddress,
      paymentResult,
      paymentMethod,
      itemsPrice,
      deliveryStatus,
      isPaid: true,
      totalPrice,
      notes,
      invoiceId,
      shippingPrice,
      paidAt,
    });
    if (order) {
      for (let i = 0; i < orderItems.length; i++) {
        const product = await Product.findById(orderItems[i].product);
        if (product) {
          product.countInStock = product.countInStock - orderItems[i].qty;
          await product.save();
        }
      }

      //   sendEmail(orderItems, paymentMethod, totalPrice, user);
      res.status(201).json(order);
    }
  } else {
    const order = await Order.create({
      orderItems,
      user: userId,
      shippingAddress,
      paymentResult,
      paymentMethod,
      itemsPrice,
      deliveryStatus,
      totalPrice,
      notes,
      invoiceId,
      shippingPrice,
      deliveryAt,
      paidAt,
      isPaid,
    });
    if (order && isPaid == true) {
      // count in stock algo

      for (let i = 0; i < orderItems.length; i++) {
        const product = await Product.findById(orderItems[i].product);
        if (product) {
          product.countInStock = product.countInStock - orderItems[i].qty;
          await product.save();
        }
      }

      //   sendEmail(orderItems, paymentMethod, totalPrice, user);
      res.status(201).json(order);
    }
  }
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

const updateOrderToPaid = asyncHandler(async (req, res) => {
  const a = req.body.invoiceId;
  const order = await Order.findById(req.body.id);
  const user = await User.findById(order.user);
  const orderItems = order.orderItems;
  const paymentMethod = order.paymentMethod;
  const totalPrice = order.totalprice;
  if (order) {
    order.isPaid = true;
    order.invoiceId = a;
    order.paidAt = Date.now();

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});
const updateOrderToPaidAdmin = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.body.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});
const updateOrderToUnPaid = asyncHandler(async (req, res) => {
  const a = req.body.invoiceId;
  const order = await Order.findById(req.body.id);

  if (order) {
    order.isPaid = false;
    order.invoiceId = a;

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

const getMyOrders = asyncHandler(async (req, res) => {
  const pageSize = 30;
  const page = Number(req.query.pageNumber) || 1;
  const orders = await Order.find({ user: req.query.userId })
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));
  res.json(orders);
});

const getFailedOnlineOrders = asyncHandler(async (req, res) => {
  const pageSize = 30;
  const page = Number(req.query.pageNumber) || 1;
  const count = await Order.countDocuments({ isPaid: false });
  var pageCount = Math.floor(count / 10);
  if (count % 10 !== 0) {
    pageCount = pageCount + 1;
  }
  const orders = await Order.find({ isPaid: false })
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ orders, pageCount });
});
const updateOrderDeliveryStatus = asyncHandler(async (req, res) => {
  const { orderId, deliveryStatus } = req.body;

  const order = await Order.findOneAndUpdate(
    { _id: orderId },
    { deliveryStatus: deliveryStatus },
    { new: true }
  );
  if (order && order.deliveryStatus == "Cancelled") {
    order.isPaid = false;
    for (let i = 0; i < order.orderItems.length; i++) {
      const product = await Product.findById(order.orderItems[i].product);
      if (product) {
        product.countInStock = product.countInStock + order.orderItems[i].qty;
        await product.save();
      }
    }
    // reward algo
    const reward = await UserReward.findOne({ user: order.user });

    reward.amount =
      reward.amount - order.itemsPrice * 0.01 < 0
        ? 0
        : reward.amount - order.itemsPrice * 0.01;
    const updatedOrder = await order.save();
    await reward.save();
    res.json(updatedOrder);
  } else if (order && order.deliveryStatus == "Delivered") {
    order.deliveredAt = Date.now();
    order.isPaid = true;
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.json(order);
  }
});

const getOrders = asyncHandler(async (req, res) => {
  const pageSize = 30;
  const page = Number(req.query.pageNumber) || 1;
  const count = await Order.countDocuments({ isPaid: true });
  var pageCount = Math.floor(count / 30);
  if (count % 30 !== 0) {
    pageCount = pageCount + 1;
  }
  const orders = await Order.find({ isPaid: true })
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .populate("user", "id name");

  res.json({ orders, pageCount });
});
const getPendingOrders = asyncHandler(async (req, res) => {
  const count = await Order.countDocuments({
    deliveryStatus: { $ne: "Delivered" },
  });
  const count2 = await Order.countDocuments({
    deliveryStatus: "Cancelled",
  });

  const total = count - count2;

  res.json(total);
});
const getMonthlySales = asyncHandler(async (req, res) => {
  const date = req.query.date;
  const pageSize = 30;
  const page = Number(req.query.pageNumber) || 1;
  const count = await Order.countDocuments({});
  var pageCount = Math.floor(count / 10);
  if (count % 10 !== 0) {
    pageCount = pageCount + 1;
  }
  const d1 = parseISO(date);
  const monthlySales = await Order.find({
    $and: [
      {
        createdAt: {
          $gte: startOfMonth(d1),
          $lte: endOfMonth(d1),
        },
      },
      { isPaid: true },
      { deliveryStatus: "Delivered" },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .populate("user", "id name");

  res.json({ monthlySales, pageCount });
});
const getSalesDateRange = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const s1 = parseISO(startDate);
  const s2 = parseISO(endDate);

  const pageSize = 30;
  const page = Number(req.query.pageNumber) || 1;
  const count = await Order.countDocuments({ isPaid: true });
  var pageCount = Math.floor(count / 10);
  if (count % 10 !== 0) {
    pageCount = pageCount + 1;
  }

  const monthlySales = await Order.find({
    $and: [
      {
        createdAt: {
          $gte: startOfDay(s1),
          $lte: endOfDay(s2),
        },
      },
      { isPaid: true },
      { deliveryStatus: "Delivered" },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .populate("user", "id name")
    .populate("orderItems.product");

  res.json({
    monthlySales,
    pageCount,
  });
});
const getOrderFilter = asyncHandler(async (req, res) => {
  const { startDate, endDate, status } = req.query;
  const s1 = parseISO(startDate);
  const s2 = parseISO(endDate);
  if (status) {
    const monthlySales = await Order.find({
      $and: [
        {
          createdAt: {
            $gte: startOfDay(s1),
            $lte: endOfDay(s2),
          },
        },
        { deliveryStatus: status },
        { isPaid: true },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("user", "id name")
      .populate("orderItems.product");

    res.json({
      monthlySales,
    });
  } else {
    const monthlySales = await Order.find({
      $and: [
        {
          createdAt: {
            $gte: startOfDay(s1),
            $lte: endOfDay(s2),
          },
        },
        { isPaid: true },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("user", "id name")
      .populate("orderItems.product");

    res.json({
      monthlySales,
    });
  }
});

// const payment = asyncHandler(async (req, res) => {
//   const userdtls = JSON.parse(req.query.user);
//   const total = JSON.parse(req.query.total);

//   const user = await User.findById(userdtls.id);

//   const instance = new Razorpay({
//     key_id: process.env.RAZOR_PAY_ID,
//     key_secret: process.env.RAZOR_PAY_SECRET,
//   });

//   const result = await instance.orders.create({
//     amount: total * 100,
//     currency: "INR",
//     receipt: "receipt#1",
//     notes: {
//       userId: user._id,
//       key: process.env.RAZOR_PAY_ID,
//     },
//   });

//   res.json(result);
// });

module.exports = {
  //   payment,
  getOrderFilter,
  getPendingOrders,
  getMonthlySales,
  getSalesDateRange,
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderDeliveryStatus,
  getMyOrders,
  getOrders,
  updateOrderToUnPaid,
  getFailedOnlineOrders,
  updateOrderToPaidAdmin,
};
