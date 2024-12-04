const asyncHandler = require("express-async-handler");
const generateToken = require("../utils/generateToken.js");
const Gate = require("../models/gateAdmin.js");
const Finance = require("../models/financeAdminModel.js");
const InventoryAdmin = require("../models/inventoryAdminModel.js");
const SeoAdmin = require("../models/seoAdminModel.js");



const authGate= asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Gate.findOne({ email });

  if (admin && (await admin.matchPassword(password))) {
    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      userType: admin.userType,
      token: generateToken.generateTokenGate(admin._id, admin.name, admin.email, admin.userType),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

const registerGate = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await Gate.findOne({ email });

  if (userExists) {
    res.status(404);
    throw new Error("User already exists");
  }

  const admin = await Gate.create({
    name,
    email,
    password,
  });

  if (admin) {
    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      userType: admin.userType,
      token: generateToken.generateTokenGate(admin._id, admin.name, admin.email, admin.userType),
    });
  } else {
    res.status(404);
    throw new Error("Invalid user data");
  }
});

const authFinance= asyncHandler(async (req, res) => {
    const { email, password } = req.body;
  
    const admin = await Finance.findOne({ email });
  
    if (admin && (await admin.matchPassword(password))) {
      res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        userType: admin.userType,
        token: generateToken.generateTokenFinance(admin._id, admin.name, admin.email, admin.userType),
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  });
  const registerFinance = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
  
    const userExists = await Finance.findOne({ email });
  
    if (userExists) {
      res.status(404);
      throw new Error("User already exists");
    }
  
    const admin = await Finance.create({
      name,
      email,
      password,
    });
  
    if (admin) {
      res.status(201).json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        userType: admin.userType,
        token: generateToken.generateTokenFinance(admin._id, admin.name, admin.email, admin.userType),
      });
    } else {
      res.status(404);
      throw new Error("Invalid user data");
    }
  });

  const authInventory= asyncHandler(async (req, res) => {
    const { email, password } = req.body;
  
    const admin = await InventoryAdmin.findOne({ email });
  
    if (admin && (await admin.matchPassword(password))) {
      res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        userType: admin.userType,
        token: generateToken.generateTokenInventory(admin._id, admin.name, admin.email, admin.userType),
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  });
  
  const registerInventory = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
  
    const userExists = await InventoryAdmin.findOne({ email });
  
    if (userExists) {
      res.status(404);
      throw new Error("User already exists");
    }
  
    const admin = await InventoryAdmin.create({
      name,
      email,
      password,
    });
  
    if (admin) {
      res.status(201).json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        userType: admin.userType,
        token: generateToken.generateTokenInventory(admin._id, admin.name, admin.email, admin.userType),
      });
    } else {
      res.status(404);
      throw new Error("Invalid user data");
    }
  });

  const authSeo= asyncHandler(async (req, res) => {
    const { email, password } = req.body;
  
    const admin = await SeoAdmin.findOne({ email });
  
    if (admin && (await admin.matchPassword(password))) {
      res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        userType: admin.userType,
        token: generateToken.generateTokenSeo(admin._id, admin.name, admin.email, admin.userType),
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  });
  const registerSeo = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
  
    const userExists = await SeoAdmin.findOne({ email });
  
    if (userExists) {
      res.status(404);
      throw new Error("User already exists");
    }
  
    const admin = await SeoAdmin.create({
      name,
      email,
      password,
    });
  
    if (admin) {
      res.status(201).json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        userType: admin.userType,
        token: generateToken.generateTokenSeo(admin._id, admin.name, admin.email, admin.userType),
      });
    } else {
      res.status(404);
      throw new Error("Invalid user data");
    }
  });


module.exports = {
  authGate,
  registerGate,
  authFinance,
  registerFinance,
  authInventory,
  registerInventory,
  authSeo,
  registerSeo
};
