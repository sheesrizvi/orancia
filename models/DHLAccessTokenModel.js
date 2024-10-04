const mongoose = require('mongoose')

const dhlAccessToken = mongoose.Schema({
    token: { type:String, required: true },
    createdAt : { type: Date, required: true, default: Date.now }
})

const DHLAccessToken = mongoose.model('DHLAccessToken' , dhlAccessToken)

module.exports = DHLAccessToken