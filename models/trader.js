'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//save 1 day trade report each time only

var traderSchema = new Schema({
	traderName: {
		type: String
	},
	tradeReport: {
		type: [tradeActionSchema]
	}
})

// var tradeActionSchema = new Schema({
// 	action: {
// 		type: String,
// 		enum: ['Buy', 'Sell'],
// 		product: {
// 			type: mongoose.Schema.Types.ObjectId,
// 			ref: 'Product',
// 			required: true
// 		},
// 		quantity: {
// 			type: Number
// 		}
// 	}
// },
// 	{
// 		timestamps: true
// 	}
// )
var tradeActionSchema = new Schema({
	name: String,
	productType: String,
	actions: {
		type: String,
		enum: ['BUY', 'SELL']
	},
	volume: Number,
	price: Number||String,
	bloomQuote: Number,
	yahooQuote: Number,
	reutersQuote: Number,
	internalPrice: Number,
	baseCurrency: String,
	RMSVolume: Number,
	RMSQuotePrice: Number,
	RMSaction: String
})
var Trader = mongoose.model('Trader', traderSchema)

module.exports = Trader