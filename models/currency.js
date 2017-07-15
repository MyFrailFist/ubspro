'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CurrencySchema = new Schema ({
	name:{
		type: String||Number
	},
	baseCurrency: {
		type: String||Number
	},
	againstCurrency:{
		type: String||Number
	},
	value: {
		type: Number
	}

})

var Currency = mongoose.model('Currency', CurrencySchema);

module.exports = Currency;
