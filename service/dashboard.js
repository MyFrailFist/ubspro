var request = require('request');
var async = require('async');
var cheerio = require('cheerio');

var Currency = require('../models/currency');
var product = require('../models/product');


exports.dashboardRender = function(req, res){
	console.log('inside dashboard render');
	res.render("dashboard");
}