const asyncHandler = require('express-async-handler')
const axios = require('axios');
const DHLAccessToken = require('../models/DHLAccessTokenModel');
var cron = require('node-cron');
const schedule = require('node-schedule');

const generateAccessToken = asyncHandler(async (req, res) => {
    const options = {
        method: 'GET',
        url: process.env.DHL_GENERATE_TOKEN_URI,
        headers: {
          ClientID: process.env.DHL_CLIENT_ID,
          clientSecret: process.env.DHL_CLIENT_SECRET,
        },
      };
      const tokenResponse = await axios.request(options);
      const { JWTToken: token } = tokenResponse.data;
       await DHLAccessToken.deleteMany({})
       await DHLAccessToken.create({
        token
      })
      res.status(200).send({token})
})

const getAccessToken = asyncHandler(async (req, res) => {
  const tokenArr =  await DHLAccessToken.find({})
  let token
  if(tokenArr.length > 0) {
    token = tokenArr[0].token
    createdAt = tokenArr[0].createdAt
  }
  res.status(200).send({token})
})

const checkDeliveryExists = asyncHandler(async(req, res) => {
  const { pinCode } = req.query
  const tokenArr =  await DHLAccessToken.find({})
  let token
  if(tokenArr.length > 0) {
    token = tokenArr[0].token
    createdAt = tokenArr[0].createdAt
  }
  
  const options = {
    method: 'POST',
    url: process.env.DHL_PINCODE_CHECK_URI,
    headers: {
      'content-type': 'application/json',
      JWTToken: token,
    },
    data: {
      pinCode ,
      profile: {
        LoginID: process.env.DHL_LOGIN_ID,
        Api_type: process.env.DHL_API_TYPE,
        LicenceKey: process.env.DHL_LICENSE_KEY,
      },
    },
  };

  axios
    .request(options)
    .then(function (response) {
      const ApexInbound  = response.data.GetServicesforPincodeResult.ApexInbound;
      const ApexOutbound = response.data.GetServicesforPincodeResult.GroundInbound;

      return res.status(200).send({
        inboundServiceExist: ApexInbound,
        outboundServiceExist: ApexOutbound
      })
    })
    .catch(function (error) {
        throw new Error(error)
    });
})

const fetchWayBill = asyncHandler(async (req, res) => {
  const { Request } = req.body
  const tokenArr =  await DHLAccessToken.find({})
  let token
  if(tokenArr.length > 0) {
    token = tokenArr[0].token
    createdAt = tokenArr[0].createdAt
  }
    const options = {
      method: 'POST',
      url: process.env.DHL_GENERATE_WAYBILL_URI,
      headers: {
        'content-type': 'application/json',
        JWTToken: token,
      },
      data: {
       Request: Request ,
       Profile: {
        LoginID: process.env.DHL_LOGIN_ID,
        Api_type: process.env.DHL_API_TYPE,
        LicenceKey: process.env.DHL_LICENSE_KEY,
      },
      },
    };
  
    axios
      .request(options)
      .then(function (response) {
        console.log(response.data)
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
    const tokenArr =  await DHLAccessToken.find({})
    let token
    if(tokenArr.length > 0) {
      token = tokenArr[0].token
      createdAt = tokenArr[0].createdAt
    }
    const options = {
      method: 'POST',
      url: process.env.DHL_CANCEL_WAYBILL_URI,
      headers: {
        'content-type': 'application/json',
        JWTToken:token,
      },
      data: {
        Request: { AWBNo: wayBillNo },
        Profile: {
            LoginID: process.env.DHL_LOGIN_ID,
            Api_type: process.env.DHL_API_TYPE,
            LicenceKey: process.env.DHL_LICENSE_KEY,
          },
      },
    };
  
    axios
      .request(options)
      .then(function (response) {
        res.status(200).send({
            message: 'Waybill cancelled succesfully'
        })
      })
      .catch(function (error) {
        res.status(400).send({message: 'Waybill Error', error})
      });
  });



const trackShipment = async () => {
    const { wayBillNo } = req.query
    const tokenArr =  await DHLAccessToken.find({})
    let token
    if(tokenArr.length > 0) {
      token = tokenArr[0].token
      createdAt = tokenArr[0].createdAt
    }
  const options = {
    method: 'GET',
    url: process.env.DHL_SHIPMENT_TRACK_URI,
    params: {
      handler: 'tnt',
      action: 'custawbquery',
      loginid: process.env.DHL_LOGIN_ID,
      numbers: wayBillNo,
      format: 'json',
      lickey: process.env.DHL_LICENSE_KEY,
      scan: '1',
      verno: '1',
      awb: 'WAYBILL_NUMBER',
    },
    headers: {
      JWTToken: token,
    },
  };

  axios
    .request(options)
    .then(function (response) {
      console.log(response.data);
      console.log(response.data.ShipmentData.Error);
    })
    .catch(function (error) {
      console.error(error);
    });
};

const scheduleDHLTokenJob = asyncHandler(() => {
    const date = new Date(Date.now() + 10000)
    schedule.scheduleJob(date, async function () {
        await generateAccessToken();
    })
  });
  

module.exports = {
generateAccessToken,
getAccessToken,
fetchWayBill,
cancelWayBill,
checkDeliveryExists,
trackShipment,
scheduleDHLTokenJob
}