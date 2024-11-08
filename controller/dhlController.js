const asyncHandler = require('express-async-handler')
const axios = require('axios');
const DHLAccessToken = require('../models/DHLAccessTokenModel');
var cron = require('node-cron');
const schedule = require('node-schedule');
const Order = require('../models/orderModel');

const generateAccessToken = asyncHandler(async (req, res) => {

   let config = {
     method: 'get',
     maxBodyLength: Infinity,
     url: process.env.DHL_PRODUCTION_GENERATE_TOKEN_URI,
     headers: { 
       'ClientID': process.env.DHL_PRODUCTION_CLIENT_ID, 
       'clientSecret': process.env.DHL_PRODUCTION_CLIENT_SECRET
     }
   };
   
   await axios.request(config)
   .then(async (response) => {
     const { JWTToken: token } = response.data
     await DHLAccessToken.deleteMany({})
     await DHLAccessToken.create({
           token
      })
     res.status(200).send(token)
   })
   .catch((error) => {
     res.send(error)
   });

  
})

const getAccessToken = asyncHandler(async (req, res) => {
 
  const tokenDocument =  await DHLAccessToken.findOne({})
  let token
  if(tokenDocument) {
    token = tokenDocument.token
  } else {
    return res.status(400).send({ message: 'Auth Token not found' })
  }
  res.status(200).send({token})
})

const checkDeliveryExists = asyncHandler(async(req, res) => {
  const { pinCode } = req.query
  if(!pinCode) return res.status(400).send({message: 'PinCode is required'})
  const tokenDocument =  await DHLAccessToken.findOne({})
  let token
  if(tokenDocument) {
    token = tokenDocument.token
  } else {
    return res.status(400).send({ message: 'DHL Token not found' })
  }
  let data = JSON.stringify({
    pinCode: req.query.pinCode,
    profile: {
      LoginID: process.env.DHL_PRODUCTION_LOGIN_ID,
      Api_type: process.env.DHL_SHIPPING_API_TYPE,
      LicenceKey: process.env.DHL_PRODUCTION_SHIPPING_LICENSE_KEY
    }
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: process.env.DHL_PRODUCTION_PINCODE_TRACKING_URI,
    headers: { 
      'content-type': 'application/json', 
      'JWTToken': token
    },
    data : data
  };
  
  const response = await axios.request(config).catch((error) => {
    return res.status(400).send(error)
  });

  if (response && response.data && response.data.GetServicesforPincodeResult) {
    const ApexInbound  = response.data.GetServicesforPincodeResult?.ApexInbound 
    const ApexOutbound = response.data.GetServicesforPincodeResult?.GroundInbound;
    return res.status(200).send({
            result: response.data,
            inboundServiceExist: ApexInbound || undefined,
            outboundServiceExist: ApexOutbound || undefined
          })
  } else {
    return res.status(400).send();
  }

})
// @ only for testing purpose as of now
const fetchWayBill = asyncHandler(async (req, res) => {
  const { Request } = req.body
  const tokenDocument =  await DHLAccessToken.findOne({})
  let token
  if(tokenDocument) {
    token = tokenDocument.token
  } else {
    return res.status(400).send({ message: 'Auth Token not found' })
  }

    const options = {
      method: 'POST',
      url: process.env.DHL_PRODUCTION_GENERATE_WAYBILL_URI,
      headers: {
        'content-type': 'application/json',
        JWTToken: token,
      },
      data: {
       Request: Request ,
       Profile: {
        LoginID: process.env.DHL_PRODUCTION_LOGIN_ID,
        Api_type: process.env.DHL_SHIPPING_API_TYPE,
        LicenceKey: process.env.DHL_PRODUCTION_SHIPPING_LICENSE_KEY,
      },
      },
    };
  
    await axios
      .request(options)
      .then(function (response) {
        res.status(200).send({waybillInfo: response.data})
      })
      .catch(function (error) {
        res.status(400).send({
            message: 'Waybill error',
            error
        })
      });

   
  });


  const cancelWayBill = asyncHandler(async (req, res) => {
    const { wayBillNo } = req.query
    const tokenDocument =  await DHLAccessToken.findOne({})
    let token
    if(tokenDocument) {
      token = tokenDocument.token
    } else {
      return res.status(400).send({ message: 'Auth Token not found' })
    }
    const options = {
      method: 'POST',
      url: process.env.DHL_PRODUCTION_CANCEL_WAYBILL_URI,
      headers: {
        'content-type': 'application/json',
        JWTToken:token,
      },
      data: {
        Request: { AWBNo: wayBillNo },
        Profile: {
            LoginID: process.env.DHL_PRODUCTION_LOGIN_ID,
            Api_type: process.env.DHL_SHIPPING_API_TYPE,
            LicenceKey: process.env.DHL_PRODUCTION_SHIPPING_LICENSE_KEY,
          },
      },
    };
  
    try {
      const response = await axios.request(options);
      if (response) {
        await Order.findOneAndUpdate(
          { wayBill: wayBillNo },
          { $unset: { wayBill: "" } },
          { new: true }
        );
      }
      return res.status(200).send({ message: 'Waybill Cancelled Successfully' });
      
    } catch (error) {
      return res.status(400).send({ message: 'Waybill Error', error });
    }
  });

const cancelWayBillByOrderNo = asyncHandler(async (req, res) => {
  const { orderId } = req.query
  const order = await Order.findOne({ _id: orderId })
  
  if(!order || !order.wayBill) {
    return res.status(400).send({ message: 'Order or WayBill Number is not found' })
  }
  
  const wayBillNo = order.wayBill

  const tokenDocument =  await DHLAccessToken.findOne({})
  let token
  if(tokenDocument) {
    token = tokenDocument.token
  } else {
    return res.status(400).send({ message: 'Auth Token not found' })
  }
  const options = {
    method: 'POST',
    url: process.env.DHL_PRODUCTION_CANCEL_WAYBILL_URI,
    headers: {
      'content-type': 'application/json',
      JWTToken:token,
    },
    data: {
      Request: { AWBNo: wayBillNo },
      Profile: {
          LoginID: process.env.DHL_PRODUCTION_LOGIN_ID,
          Api_type: process.env.DHL_SHIPPING_API_TYPE,
          LicenceKey: process.env.DHL_PRODUCTION_SHIPPING_LICENSE_KEY,
        },
    },
  };

  await axios
    .request(options)
    .then(function (response) {
      return Order.findByIdAndUpdate(order._id, {
        $unset: { wayBill: "" }
      }, { new: true })
    }).then((result) => {
      return res.status(200).send({ message: 'Waybill Cancelled Succesfully', order: result})
    })
    .catch(function (error) {
      res.status(400).send({message: 'Waybill Error', error})
    });

})
const generateWayBill = asyncHandler(async (order) => {
 
  const tokenDocument =  await DHLAccessToken.findOne({})
  let token
  if(tokenDocument) {
    token = tokenDocument.token
  } else {
    return false
  }

  const createdAtDate = new Date(order.createdAt);
  const pickupDate = new Date(createdAtDate);
  pickupDate.setDate(pickupDate.getDate() + 2); 
  const formattedPickupDate = `/Date(${pickupDate.getTime()})/`
  const formattedOrderDate = `/Date(${createdAtDate.getTime()})/`
  const prefix = 'TestCr3_lck';
  const randomNumber = Math.floor(100000000 + Math.random() * 900000000);
  const creditReference = `${prefix}${randomNumber}`
  
 
 
  const Request =  {
    Consignee: {
      AvailableDays: "",
      AvailableTiming: "",
      ConsigneeAddress1: order.shippingAddress.address,
      ConsigneeAddress2: order.shippingAddress.area,
      ConsigneeAddress3: order.shippingAddress.landmark,
      ConsigneeAddressType: "",
      ConsigneeAddressinfo: "",
      ConsigneeAttention: order.user.name,
      ConsigneeEmailID: order.shippingAddress.email,
      ConsigneeFullAddress:  `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state}`,
      ConsigneeGSTNumber: "",
      ConsigneeLatitude: "",
      ConsigneeLongitude: "",
      ConsigneeMaskedContactNumber: "",
      ConsigneeMobile: order.shippingAddress.mobileNumber?.toString() || "",
      ConsigneeName: order.user.name,
      ConsigneePincode: order.shippingAddress.pinCode?.toString() , // need to make it dynamically
      ConsigneeTelephone: ""
    },
    Returnadds: {
      ManifestNumber: "",
      ReturnAddress1: "Test RTO Addr1",
      ReturnAddress2: "Test RTO Addr2",
      ReturnAddress3: "Test RTO Addr3",
      ReturnAddressinfo: "",
      ReturnContact: "Test RTO",
      ReturnEmailID: "testemail@bluedart.com",
      ReturnLatitude: "",
      ReturnLongitude: "",
      ReturnMaskedContactNumber: "",
      ReturnMobile: "9995554447",
      ReturnPincode: "400057",
      ReturnTelephone: ""
    },
    Services: {
      AWBNo: "",
      ActualWeight: "0.50",
      CollectableAmount: 0,
      Commodity: {
        CommodityDetail1: order.orderItems.map(item => item.name).join(", "),
        CommodityDetail2: "",
        CommodityDetail3: ""
      },
      CreditReferenceNo: creditReference,
      CreditReferenceNo2: "",
      CreditReferenceNo3: "",
      DeclaredValue: order.totalPrice,
      DeliveryTimeSlot: "",
      Dimensions: [
        {
          Breadth: 32.7,
          Count: 1,
          Height: 3.2,
          Length: 28.9
        }
      ],
      FavouringName: "",
      IsDedicatedDeliveryNetwork: false,
      IsDutyTaxPaidByShipper: false,
      IsForcePickup: false,
      IsPartialPickup: false,
      IsReversePickup: false, // initially it was true
      ItemCount: order.orderItems.length,
      Officecutofftime: "",
      PDFOutputNotRequired: true,
      PackType: "L", // -> BharatDart
      ParcelShopCode: "",
      PayableAt: "",
      PickupDate: formattedPickupDate,
      PickupMode: "",
      PickupTime: "1600",
      PickupType: "",
      PieceCount: "1",
      PreferredPickupTimeSlot: "",
      ProductCode: "A", // D  or A -> Apex
      ProductFeature: "",
      ProductType: 1,
      RegisterPickup: true,
      SpecialInstruction: "",
      SubProductCode: "P",
      TotalCashPaytoCustomer: 0,
      itemdtl: [
        {
          CGSTAmount: 0,
          HSCode: "",
          IGSTAmount: 0,
          Instruction: "",
          InvoiceDate: formattedOrderDate,
          InvoiceNumber: "",
          ItemID: "Test Item ID1",
          ItemName: "Test Item1",
          ItemValue: 100,
          Itemquantity: 1,
          PlaceofSupply: "",
          ProductDesc1: "",
          ProductDesc2: "",
          ReturnReason: "",
          SGSTAmount: 0,
          SKUNumber: "",
          SellerGSTNNumber: "",
          SellerName: "",
          SubProduct1: "Test Sub 1",
          SubProduct2: "Test Sub 2",
          TaxableAmount: 0,
          TotalValue: 100,
          cessAmount: "0.0",
          countryOfOrigin: "",
          docType: "",
          subSupplyType: 0,
          supplyType: ""
        }
      ],
      noOfDCGiven: 0
    },
    Shipper: {
      CustomerAddress1: "Test Cust Addr1",
      CustomerAddress2: "Test Cust Addr2",
      CustomerAddress3: "Test Cust Addr3",
      CustomerAddressinfo: "",
      CustomerBusinessPartyTypeCode: "",
      CustomerCode: "318430",
      CustomerEmailID: "TestCustEmail@bd.com",
      CustomerGSTNumber: "",
      CustomerLatitude: "",
      CustomerLongitude: "",
      CustomerMaskedContactNumber: "",
      CustomerMobile: "9996665554",
      CustomerName: "Pinakishine Ecom Pvt Ltd",
      CustomerPincode: "226010",
      CustomerTelephone: "",
      IsToPayCustomer: false,
      OriginArea: "LCK",
      Sender: "TestRvp",
      VendorCode: ""
    }
  }

  const options = {
    method: 'POST',
    url: process.env.DHL_PRODUCTION_GENERATE_WAYBILL_URI,
    headers: {
      'content-type': 'application/json',
      JWTToken: token,
    },
    data: {
     Request: Request ,
     Profile: {
      LoginID: process.env.DHL_PRODUCTION_LOGIN_ID,
      Api_type: process.env.DHL_SHIPPING_API_TYPE,
      LicenceKey: process.env.DHL_PRODUCTION_SHIPPING_LICENSE_KEY,
    },
    },
  };
 
  const response = await axios.request(options).catch((error) => {
    console.log(error)
    return false;
  });

  if (response && response.data && response.data.GenerateWayBillResult) {
    const awbNo = response.data.GenerateWayBillResult.AWBNo;
    
    
    const wayBillOrder = await Order.findOne({ _id: order._id });
    wayBillOrder.wayBill = awbNo;
    await wayBillOrder.save();
  
    return awbNo;
  } else {
    return false;
  }
  
})


const trackShipment = async (req, res) => {
     const { wayBillNo } = req.query
    const tokenDocument =  await DHLAccessToken.findOne({})
    let token
    if(tokenDocument) {
      token = tokenDocument.token
    } else {
      return false
    }
  
  const options = {
    method: 'GET',
    url: process.env.DHL_PRODUCTION_SHIPMENT_TRACK_URI,
    params: {
      handler: 'tnt',
      loginid: process.env.DHL_PRODUCTION_LOGIN_ID,
      numbers: wayBillNo,
      format: 'json',
      lickey: process.env.DHL_PRODUCTION_TRACKING_LICENSE_KEY,
      scan: '1',
      action: 'custawbquery',
      verno: '1',
      awb: 'awb'
  },
    headers: {
      JWTToken: token,
    },
  };

  await axios
    .request(options)
    .then(function (response) {
      res.status(200).send(response.data)
    })
    .catch(function (error) {
      res.status(400).send({message: 'Shipment Tracking Error', error})
    });
};

const generateTokenInInterval = asyncHandler(async (req, res) => {

  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: process.env.DHL_PRODUCTION_GENERATE_TOKEN_URI,
    headers: { 
      'ClientID': process.env.DHL_PRODUCTION_CLIENT_ID, 
      'clientSecret': process.env.DHL_PRODUCTION_CLIENT_SECRET
    }
  };
  
  await axios.request(config)
  .then(async (response) => {
    const { JWTToken: token } = response.data
    await DHLAccessToken.deleteMany({})
    await DHLAccessToken.create({
          token
     })
  })
  .catch((error) => {
    console.log(error)
  });


})

const scheduleDHLTokenJob = asyncHandler(() => {
  const rule = new schedule.RecurrenceRule();
  rule.hour = 0;
  rule.minute = 0;
  schedule.scheduleJob(rule, async function () {
        await generateTokenInInterval();
    })
  });
  
  
const addWayBillInOrder = asyncHandler(async (req, res) => {
  
  const { orderId } = req.body
  const order = await Order.findOne({ _id: orderId }).populate('user')
  console.log(order)
  if(!order || order.wayBill) {
    return res.status(400).send({message: 'Order not found or Waybill is already attached with order' })
  }
 
  const result = await generateWayBill(order)
  if(result) {
    const updatedOrder = await Order.findByIdAndUpdate(
     order._id,
      { $set: { wayBill: result } },
      { new: true }
  );
  return res.status(201).json(updatedOrder);
}
res.status(400).send({message: 'Waybill generation failed'})
})

module.exports = {
generateAccessToken,
getAccessToken,
fetchWayBill,
cancelWayBill,
checkDeliveryExists,
trackShipment,
scheduleDHLTokenJob,
generateWayBill,
cancelWayBillByOrderNo,
addWayBillInOrder
}