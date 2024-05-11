const jwt = require("jsonwebtoken");

const generateTokenAdmin = (id, name, email, userType) => {
  return jwt.sign({ id, name, email, userType }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};
const generateTokenUser = (id, name, email) => {
  return jwt.sign({ id, name, email }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};
const generateTokenFinance = (id, name, email, userType) => {
  return jwt.sign(
    {
      id,
      name,
      email,
      userType,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};
const generateTokenGate = (id, name, email, userType) => {
  return jwt.sign(
    {
      id,
      name,
      email,
      userType,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};
const generateTokenInventory = (id, name, email, userType) => {
  return jwt.sign(
    {
      id,
      name,
      email,
      userType,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};
const generateTokenSeo = (id, name, email, userType) => {
  return jwt.sign(
    {
      id,
      name,
      email,
      userType,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

module.exports = {
  generateTokenAdmin,
  generateTokenUser,
  generateTokenGate,
  generateTokenFinance,
  generateTokenSeo,
  generateTokenInventory,
};
