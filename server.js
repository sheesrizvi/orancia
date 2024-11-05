require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const adminRoutes = require("./routes/adminRoutes");
const variationRoutes = require("./routes/variationRoutes");
const productRoutes = require("./routes/productRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const userRoutes = require("./routes/userRoutes");
const upload = require("./routes/upload");
const blogRoutes = require("./routes/blogRoutes");
const orderRoutes = require("./routes/orderRoutes");
const deliveryInfoRoutes = require("./routes/deliveryInfoRoutes")

const cors = require("cors");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { scheduleDHLTokenJob } = require("./controller/dhlController");

const app = express();
const source = process.env.MONGO_URI;
app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());
app.use("/api/admin", adminRoutes);
app.use("/api/variation", variationRoutes);
app.use("/api/upload", upload);
app.use("/api/blog", blogRoutes);
app.use("/api/product", productRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/user", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/delivery", deliveryInfoRoutes)

app.use(notFound)
app.use(errorHandler)
mongoose
  .connect(source)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB connection error", err));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Successfully served on port: ${PORT}.`);
  scheduleDHLTokenJob()
});
