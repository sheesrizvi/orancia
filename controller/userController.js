const asyncHandler = require("express-async-handler");
const { generateTokenUser } = require("../utils/generateToken.js");
const User = require("../models/userModel.js");
const nodemailer = require("nodemailer");
// const emailTemplate = require("../document/email");

// @desc    Auth user & get token
// @route   POST /api/users/login
//@access   Public
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

const sendEmail = asyncHandler(async (pass, user) => {
  transporter.sendMail({
    from: `Orancia <info@orancia.com>`, // sender address
    to: `${user.email}`, // list of receivers
    replyTo: `<info@orancia.com>`,
    subject: `Password Reset Confirm ${user?.name}`, // Subject line
    text: `New Password`, // plain text body
    html: emailTemplate(pass, user), // html body
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (user) {
    let pass = "";
    let str =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "abcdefghijklmnopqrstuvwxyz0123456789@#$";

    for (let i = 1; i <= 8; i++) {
      let char = Math.floor(Math.random() * str.length + 1);

      pass += str.charAt(char);
    }
    user.password = pass;
    const updatedUser = await user.save();
    sendEmail(pass, user);
    res.status(201).json("success");
  } else {
    res.status(401);
    throw new Error("Invalid email");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,

      token: generateTokenUser(
        user._id,
        user.name,
        user.email,
        user.shippingAddress
      ),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    User registration
// @route   POST /api/users
//@access   Public

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(404);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,

      token: generateTokenUser(
        user._id,
        user.name,
        user.email,
        user.shippingAddress
      ),
    });
  } else {
    res.status(404);
    throw new Error("Invalid user data");
  }
});

// @desc    Get user profile
// @route   GET /api/users/login
//@access   Private

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      name: user.phone,
      email: user.email,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.body.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    // console.log(updatedUser);
    res.status(201).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,

      token: generateTokenUser(
        updatedUser._id,
        updatedUser.name,
        updatedUser.email
      ),
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Get all users
// @route   Get /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Delete users
// @route   DELETE /api/users/:id
// @access  Private/Admin

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await user.remove();
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Get user by Id
// @route   GET /api/users/:id
// @access  Private/Admin

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const saveShippingAddress = asyncHandler(async (req, res) => {
  console.log(req.body, "re");
  const user = await User.findById(req.body.userId);

  if (user) {
    // user.shippingAddress.email =
    // req.body.shippingAddress.email || user.shippingAddress.email;
    user.shippingAddress = req.body.shippingAddress || user.shippingAddress;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      shippingAddress: updateUser.shippingAddress,
      token: generateTokenUser(
        updatedUser._id,
        updatedUser.name,
        updatedUser.email,
        updatedUser.shippingAddress
      ),
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

module.exports = {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  resetPassword,
  saveShippingAddress,
};
