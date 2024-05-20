const express = require("express");
const { admin } = require("../middleware/authmiddleware");
const {
  createBlog,
  getBlogs,
  deleteBlog,

  getBlogById,
  updateBlog,

} = require("../controller/blogController");

const router = express.Router();

router.post("/create", admin, createBlog);
router.post("/update", admin, updateBlog);
router.get("/", getBlogs);
router.delete("/delete", admin, deleteBlog);
router.route("/blogbyid/:id").get(getBlogById);

module.exports = router;
