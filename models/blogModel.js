const mongoose = require("mongoose");

const blogSchema = mongoose.Schema(
  {
  
    heading: {
      type: String,
      trim: true,
      min: 3,
      max: 160,
      required: true,
    },
    image: [
      {
        type: String,
        required: true,
      },
    ],
    slug: {
        type: String,
    },
    content: {
      type: {},
      required: true,
    },
    mtitle: {
      type: String,
    },
    mdesc: {
      type: String,
    },   
    user: {
      type: String,
    },
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
