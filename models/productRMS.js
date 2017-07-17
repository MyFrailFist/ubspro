'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productSchema = new Schema({
  symbol:{
    type: String||Number
  },
  productType:{
    type: String
  },
  internalPriceQuote:{
    //price of buy sell
    type: Number
  },
  action:{
    type:String
  },
  volume:{
      type: Number
  },
  baseCurrency:{
    type: String
  },
  traderName:{
    type: String
  }
  //do i need to record a time line of product prices?
})

var ProductRMS = mongoose.model('ProductRMS', productSchema)

module.exports = ProductRMS