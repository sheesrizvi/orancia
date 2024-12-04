const express = require('express')
const { generateAccessToken, getAccessToken, checkDeliveryExists, fetchWayBill, cancelWayBill, trackShipment, cancelWayBillByOrderNo, addWayBillInOrder } = require('../controller/dhlController.js')
const router = express.Router()

router.get('/generate-dhl-token', generateAccessToken)
router.get('/get-access-token', getAccessToken)
router.get('/check-delivery-exist-by-pincode', checkDeliveryExists)
// @ only for testing purpose e are adding waybill dynamically in order at time of order creation
router.post("/generate-way-bill", fetchWayBill) 
router.delete("/cancel-way-bill", cancelWayBill) // @ cancel waybill by waybill no
router.get("/track-shipment", trackShipment) // @ track-shipment
router.get("/cancel-waybill-by-order", cancelWayBillByOrderNo) // @ cancel waybill by order no
router.post("/add-waybill-in-order", addWayBillInOrder) // this is only for admin purpose we are adding waybill dynamically in order at time of order creation

module.exports = router