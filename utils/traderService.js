
var async = require('async');
var Traders = require('../models/trader');
var request = require('request');




exports.renderTraders = function(req, res){
	Traders.find({})
	.exec(function(err, traders){
		if(err) return(err);
		console.log(traders);
		res.render('traders', {"rows": JSON.stringify(traders)});
	})
}
