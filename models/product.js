'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productSchema = new Schema({
	name: {
		type: String||Number
	},
	abbreviation:{
		type: String||Number
	},
	productType:{
		type: String
	},
	internalPrice:{
		type: Number
	},
	yahooQuote:{
		type: Number
	},
	reutersQuote:{
		type: Number
	},
	bloomQuote:{
		type: Number
	},
	baseCurrency:{
		type: String
	},
	percentageChange:{
		type: Number
	},
	pointChange:{
		type: Number
	}
	//do i need to record a time line of product prices?
})

var Product = mongoose.model('Product', productSchema)

module.exports = Product