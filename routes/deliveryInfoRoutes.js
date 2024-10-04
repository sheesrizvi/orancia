const express = require('express')
const { generateAccessToken, getAccessToken, checkDeliveryExists, fetchWayBill, cancelWayBill, updateWayBill, trackShipment } = require('../controller/dhlController')
const router = express.Router()

router.get('/generate-dhl-token', generateAccessToken)
router.get('/get-access-token', getAccessToken)
router.get('/check-delivery-exist-by-pincode', checkDeliveryExists)
router.post("/generate-way-bill", fetchWayBill)
router.delete("/cancel-way-bill", cancelWayBill)
router.get("/track-shipment", trackShipment)

module.exports = router