'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var clientSchema = new Schema({
	clientName: {
		type: String
	},
	portfolio: [
		portfolioSchema
	]
})


var portfolioSchema = new Schema({
	product:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Product',
		required: true
	},
	quantity: {
		type: Number
	}
})

var Client = mongoose.model('Client', clientSchema);

module.exports = Client