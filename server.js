'use strict'
var express = require('express');
var path = require('path');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const fetch = require('node-fetch');
const request = require('request');
const moment = require('moment');
const mongoose = require('mongoose');
const aync = require('async');
const app = express();
var favicon = require('serve-favicon');
var logger = require('morgan');
var fs = require('fs')
var multer = require('multer')
var upload = multer({dest: path.resolve(__dirname)+'/excel/'});

var excel = require('exceljs');

var Product = require('./models/product');

var scraper = require('./utils/scraper');
var dashboardService = require('./service/dashboard');
var PlGenerator = require('./utils/PLgenerator');
var traderService = require('./utils/traderService');
var excelParser = require('./utils/excelParser');



mongoose.connect('mongodb://test13:13test@ds137261.mlab.com:37261/hunglinga12');

const PORT = process.env.PORT || 8800;

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
//directing to pug templates
app.set('views',path.join(__dirname, 'views'));
app.set('view engine', 'pug');
//directing to the css/html side of things
app.use(express.static(path.join(__dirname, 'public')));
//app.set('view engine', 'jade');
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
//app.use('/scripts', express.static(__dirname + '/node_modules/bootstrap/dist'))

const router = express.Router();

router.use(function(req, res, next){
	//log activities
	console.log('something is happening');
	next();
});


router.route('/welcome')
	.get(function(req, res){
		var hi = 'hi';
		console.log('wiebfiwfbwef');
		res.render("index");
	})

// router.route('/scrapeBloom')
// 	.get(scraper.scrapeBloom)

// router.route('/scrapeYahooMajorIndices')
// 	.get(scraper.scrapeYahooMajorIndices)

// router.route('/viewhtml')
// 	.get(function(req, res){
// 		res.sendFile("views/public/dashboard.html");
// 	})

// router.route('/viewDash')
// 	.get(dashboardService.dashboardRender);

router.route('/dataValidate')//gather data from the internet
	.get(function(req, res){
		scraper.validateStocks(null, function(err, response){
			if(err) return(err);
			Product.find({})
			.exec(function(err, products){
				res.render('dashboard', {"rows": products})
			})
		})
	})


// router.route('/slotValues')//display data validate
// 	.get(function(req, res){
// 		Product.find({})
// 		.exec(function(err, products){
// 			res.render('dashboard', {"rows": products})
// 		})
// 	})


router.route('/generatePL')
	.get(function(req, res){
		PlGenerator.generatePL(null, function(err, response){
			if(err) return(err);
			var curr = parseFloat(response.PandLUSDTotal/response.PandLHKDTotal).toFixed(5);
			res.render('PLreport', {"rows": JSON.stringify(response.traders), "finalPLHKD": response.PandLHKDTotal, "finalPLUSD": response.PandLUSDTotal, "curr":curr});
			return;
		})
	})

router.route('/upload')
	.get(function(req, res){
		res.render('upload');
	})

router.route('/upload1')
	.post(upload.single('xlsxFileStock'), function(req, res){
		console.log('wiuebviwevfiwevf')
		var newPath = path.resolve(__dirname) + '/excel/Products/stockData.xlsx';
		fs.unlink(newPath, function(err, response){
			fs.readFile(req.file.path, function(err, data){
				fs.writeFile(newPath, data, function(err, response){
					fs.unlink(req.file.path, function(err, result){
						res.redirect('/ubs/dataValidate');
					})					
				})
			})
		})
	})

router.route('/upload2')
	.post(upload.single('xlsxFileTrade'), function(req, res){
		var newPath = path.resolve(__dirname) + '/excel/Trades/TraderPortfolios.xlsx';
		fs.unlink(newPath, function(err, response){
			fs.readFile(req.file.path, function(err, data){
				fs.writeFile(newPath, data, function(err, response){
					fs.unlink(req.file.path, function(err, results){
						res.redirect('/ubs/generatePL');
					})
				})
			})
		})
	})

router.route('/')

router.route('/traders')
	.get(traderService.renderTraders)






//register our routes
app.use('/ubs', router);

//start the server, listening...
app.listen(PORT);
console.log('Started and Connected to ' + PORT);


