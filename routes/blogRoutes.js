const express = require("express");
const { admin } = require('../middleware/authMiddleware.js')
const {
  createBlog,
  getBlogs,
  deleteBlog,
  getBlogById,
  updateBlog,
  searchBlog,

} = require("../controller/blogController");

const router = express.Router();

router.post("/create", admin, createBlog);
router.post("/update", admin, updateBlog);
router.get("/", getBlogs);
router.delete("/delete", admin, deleteBlog);
router.route("/blogbyid/:id").get(getBlogById);
router.route("/search-blog").get(searchBlog)

module.exports = router;
