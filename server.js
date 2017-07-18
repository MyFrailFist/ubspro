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
var PlGenerator = require('./utils/PLgenerator');
var excelParser = require('./utils/excelParser');



mongoose.connect('mongodb://test13:13test@ds137261.mlab.com:37261/hunglinga12');

const PORT = process.env.PORT || 8800;

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.set('views',path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('stylus').middleware(path.join(__dirname, 'public')));

const router = express.Router();

router.use(function(req, res, next){
	//log activities
	console.log('something is happening');
	next();
});

router.route('/dataValidate')//gather data from the internet
	.get(function(req, res){
		console.log('gathering data from internate to validate internal data')
		scraper.validateStocks(null, function(err, response){
			if(err) return(err);
			Product.find({})
			.exec(function(err, products){
				res.render('dashboard', {"rows": products})
			})
		})
	})


router.route('/generatePL')
	.get(function(req, res){
		console.log('preparing to generate new PL')
		PlGenerator.generatePL(null, function(err, response){
			if(err) return(err);
			var curr = parseFloat(response.PandLUSDTotalExt/response.PandLHKDTotalExt).toFixed(5);
			res.render('PLreport', {"rows": JSON.stringify(response.traders),"finalPLUSDRMS":parseFloat(response.RMSPandLUSDTotal).toFixed(2), "finalPLHKDRMS": parseFloat(response.RMSPandLHKDTotal).toFixed(2), "finalPLHKDInt": parseFloat(response.PandLHKDTotalInt).toFixed(2), "finalPLUSDInt": parseFloat(response.PandLUSDTotalInt).toFixed(2), "finalPLHKDExt": parseFloat(response.PandLHKDTotalExt).toFixed(2), "finalPLUSDExt": parseFloat(response.PandLUSDTotalExt).toFixed(2), "curr":curr});
			return;
		})
	})

router.route('/upload')
	.get(function(req, res){
		console.log('entered upload page');
		res.render('upload');
	})

router.route('/upload1')
	.post(upload.single('xlsxFileStock'), function(req, res){
		console.log('Uploaded stocks data');
		var newPath = path.resolve(__dirname) + '/excel/Products/stockData.xlsx';
		fs.unlink(newPath, function(err, response){
			console.log('Deleted old stock data');
			fs.readFile(req.file.path, function(err, data){
				fs.writeFile(newPath, data, function(err, response){
					console.log('wrote new file sotck data');
					fs.unlink(req.file.path, function(err, result){
						console.log('deleted old link file')
						res.redirect('/ubs/dataValidate');
					})					
				})
			})
		})
	})

router.route('/upload2')
	.post(upload.single('xlsxFileTrade'), function(req, res){
		console.log("uploaded new trader portfolios");
		var newPath = path.resolve(__dirname) + '/excel/Trades/TraderPortfolios.xlsx';
		fs.unlink(newPath, function(err, response){
			console.log('deleted old tradersportfolio')
			fs.readFile(req.file.path, function(err, data){
				fs.writeFile(newPath, data, function(err, response){
					console.log('wrote new traders portfolios data')
					fs.unlink(req.file.path, function(err, results){
						console.log('deleted old link file')
						res.redirect('/ubs/generatePL');
					})
				})
			})
		})
	})


//register our routes
app.use('/ubs', router);

//start the server, listening...
app.listen(PORT);
console.log('Started and Connected to ' + PORT);


