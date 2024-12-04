const express = require("express");
const { registerAdmin, authAdmin } = require("../controller/adminController.js");

const {  
    authGate,
    registerGate,
    authFinance,
    registerFinance,
    authInventory,
    registerInventory,
    authSeo,
    registerSeo } = require('../controller/employeeController.js');
const router = express.Router();

router.route("/admin-register").post(registerAdmin);
router.route("/admin-login").post(authAdmin);

router.post('/gate-register', registerGate)
router.post('/gate-login', authGate)
router.post('/inventory-register', registerInventory)
router.post('/inventory-login', authInventory)
router.post('/seo-register', registerSeo)
router.post('/seo-login', authSeo)
router.post('/finance-register', registerFinance)
router.post('/finance-login', authFinance)

module.exports = router;