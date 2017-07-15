'use strict'

var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');
var Product = require('../models/product');
var async = require('async')

var excelParseUtil = require('./excelParser');


exports.validateStocks = function(input, callback){
	var yahooUrl = 'https://finance.yahoo.com/quote/'//0006.HK?p=0006.HK, whatever is the stick symbol
	var bloomUrl = 'https://www.bloomberg.com/quote/'
	var reuterUrl = 'http://www.reuters.com/finance/stocks/overview?symbol='
	//first take in the excel an process to json
	async.waterfall([
		function(cb){
			excelParseUtil.excelParseStocks(null, function(err, response){
				if(err) return cb(err);
				console.log("we have the repsonse", response);
				cb(null, response);
			})
		},
		function(response, cb){
			var stockArraySave = [];
			async.map(response, function(elem, callback){
				var stockSymbol = elem.symbol;
				stockSymbol = encodeURIComponent(stockSymbol);

				async.parallel([
					function(cb){
						//using yahoo
						var URL = yahooUrl + stockSymbol + '?p=' + stockSymbol;
						request(URL, function(err, response, html){
							if(err) return(err);
							else if(response.body.error){
								return(err);
							}
							else{
								var $ = cheerio.load(html);
								var yahooQuote = $('#quote-header-info').children().next().next().children().children().children().first().text();
								var stockName = $('#quote-header-info').children().next().children().children().children().first().text();
								elem.yahooQuote = yahooQuote;
								elem.stockName = stockName;
								stockName = stockName.replace('('+stockSymbol+')', '')
								console.log(stockName);
								return cb(null, yahooQuote, stockName);
							}
						})
					},
					function(cb){
						//using reuters
						var URL = reuterUrl + stockSymbol;
						request(URL, function(err, response, html){
							if(err) return(err);
							else if(response.body.error){
								return(err);
							}else{
								var $ = cheerio.load(html);
								var reutersQuote = $('#headerQuoteContainer').children().children().children().first().next().next().next().first().text();
								console.log('the reuter quote is: ', reutersQuote)
								reutersQuote = reutersQuote.trim();
								return cb(null, reutersQuote)
							}
						})
					},
					function(cb){
						//using bloom change 0700.HK to 700:HK
						var symb = stockSymbol;
						symb = symb.split("");
						if(symb[0]==0||symb[0]=='0'){
							splicer(symb);	
						}
						function splicer(symb){
							//removes all the zeroes at the front
							symb.splice(0,1);
							if(symb[0]==0||symb[0]=='0'){
								return splicer(symb);
							}
							else{return;}
						}
						
						symb=symb.join('');
						symb = symb.replace('.',':');
						var URL = bloomUrl + symb;
						console.log(URL)
						request(URL, function(err, response, html){
							if(err) return(err);
							else if(response.body.error){
								return(err);
							}else{
								var $ = cheerio.load(html);
								//var bloomQuote = $('#content').children().children().children().children().next().next().next().next().children().next().text();
								var bloomQuote = $('.price', '#content').text();
								console.log('the bloomquote is: ', bloomQuote);
								return cb(null, bloomQuote);
							}
						})
					}
				], function(err, results){
					console.log('the resuls are:', results)
						var newStock = new Product({
							name: results[0][1],
							abbreviation: stockSymbol,
							productType: 'Stock',
							internalPrice: elem.internalPrice,
							yahooQuote: results[0][0],
							reutersQuote: results[1],
							bloomQuote: results[2],
							baseCurrency: 'HKD'
						})
						console.log('newstock here', newStock)
						stockArraySave.push(newStock)
						return callback(null, stockArraySave);
					})
				},function(err, outputs){
					if(err) return(err);
					return cb(null,stockArraySave);
				} )				
		},
		function(results, cb){
			Product.find({})
			.remove()
			.exec(function(err, products){
				if(err) return(err);
				return cb(null, results);
			})
		},
		function(results, cb){
			Product.create(results, function(err, products){
				if(err) throw(err);
				console.log('the products are saved: ', products);
				return cb();
			})
		}
		], function(err, results){
			if(err) return callback(err);
			return callback(null, 'success');
		})
}

// exports.scrapeYahooMajorIndices = function(req, res){
// 	//let me scrape the world major indices first 
// 	console.log('hello')
// 	var URL = 'https://sg.finance.yahoo.com/world-indices'
// 	var megaArr = [];
// 	request(URL, function(error, response, html){
// 		if(error) { return callback(error) }
// 		else if(response.body.error) { return callback(error) }
// 		else{
// 			var $ = cheerio.load(html)
// 			//console.log($('tbody'));

// 			$('tbody').children().each(function(i, elem){
// 				console.log('whefiwefwef', $(elem).children('.data-col2').text())
// 				var title = $(elem).children().children().attr('title');
// 				var symbol = $(elem).children().children().attr('data-symbol');
// 				var lastPrice = $(elem).children('.data-col2').text();
// 				//console.log(lastPrice);
// 				var indexJson = {
// 					title: title,
// 					symbol: symbol,
// 					lastPrice: lastPrice
// 				}
// 				megaArr.push(indexJson);
			
// 				//else(console.log('somebody extraa'));
// 			}) 
// 		}
// 		megaArr.splice(0,1);
// 		//console.log('my megar arr is: ', megaArr);
// 		getEachStockFromIndex(megaArr, function(err, response){
// 			if(err) return (err)
// 				console.log(response)
// 			Product.insertMany(response, function(err, result){
// 				if (err) return callback(err);
// 				console.log('DONE');
// 			})
// 			//res.json(response);
// 		})
// 		//res.json(megaArr);
// 		//return an array of json containing title symbol and last price
// 	})
// }

// exports.getEachStockFromIndex=function(arrayJsonData, callback){
// 	var array = arrayJsonData;
// 	var keyUrl = 'https://finance.yahoo.com/quote/';
// 	var qs = '/components?p=';
// 	array = [{
// 		title: 'HANG SENG INDEX',
// 		symbol: '^HSI',
// 		lastPrice: '25,670.05'
// 	}]
// 	array.forEach(function(elem){
// 		var title = elem.title;
// 		var symbol = elem.symbol;
// 		var indexEnc = encodeURIComponent(symbol);
// 		var finalUrl = keyUrl + indexEnc + qs + indexEnc;
// 		request(finalUrl, function(error, response, html){
// 			if(error) return callback(error);
// 			else if(response.body.error) return callback(error);
// 			else{
// 				var $ = cheerio.load(html);
// 				var megamegaArr = [];
// 				$('tbody[data-reactid=24]').children().each(function(i,elem){
// 					var symbol = $(elem).children().children().attr('title');
// 					var companyName = $(elem).children().next().html();
// 					var lastPrice = $(elem).children().next().next().html()
// 					// var compJson = {
// 					// 	companyName: companyName,
// 					// 	symbol: symbol,
// 					// 	lastPrice: lastPrice
// 					// }

// 					var product = new Product();
// 					product.name = companyName;
// 					product.abbreviation= symbol;
// 					product.yahooQuote = lastPrice;


// 					megamegaArr.push(product);
// 					console.log('megamegaArr', megamegaArr)
// 				})

// 			}
// 			return callback(null, megamegaArr);
// 			//res.json(megamegaArr);
// 		})

// 	})
// }

// exports.scrapeBloom = function(req, res, callback){
// 	var url = baseUrl + 'americas';

// 	request(url, function(error, response, html){
// 		//take by region
// 		if(error) return callback(error);
// 		else if(response.body.error){
// 			return callback(error);
// 		}else{
// 			var $ = cheerio.load(html);
// 			var megaArr = [];
// 			//console.log('wewfweffew',html, $)
// 			//identify exact row of values then just collect the name followde
// 			$('.section-front__main-content').children().find('.data-tables').each(function(i, elem){
// 				//var productData = {};
// 				console.log('wewoefwnef',elem);
// 				console.log('rwerewrw', i);
// 				$(this).children().find('.data-table').children().find('.data-table-row').each(function(i,elem){
// 					console.log('uhuhuh', elem);
// 					var product = new Product();
// 					var text = $(this).children().text();
// 					var name = 
// 					product.name = $(this).children().text();
// 					product.price = $(this).children().find('full').text()
// 					console.log(product);
// 					megaArr.push(product);
// 				})
// 			})
// 		}res.json(megaArr);
// 	})
// }

// exports.scrapeBloom = function(req, res, callback){
// 	var url = bloombergBaseUrl + 'americas';
// 	request(url, function(error, response, html){
// 		if(error) return callbacK(error);
// 		else if(response.body.error){
// 			return callback(err);
// 		} else{
// 			var $ = cheerio.load(html);
// 			var megaArr = [];
// 			$('.data-table-row').each(function(i, elem){
// 				var productType = $(elem).parent().parent().parent().parent().parent().children().children().children().first().text();
			
// 				var abbr = $(elem).children().attr('data-type', 'name').children().children().attr('data-type', 'abbreviation').first().text();
// 				var fullName = $(elem).children().attr('data-type', 'name').children().children().attr('data-type', 'full').first().text();
// 				var value = $(elem).children().attr('data-type', 'value').text();
// 				var valueChange = $(elem).children().attr('next-value');
// 				var nextValue = $(elem).children().attr('next-value');
// 				var productJson = new Product();
// 				productJson = {
// 					name: fullName,
// 					abbreviation: abbr,
// 					productType: productType,
// 					price: value,
// 					percentageChange: valueChange,
// 					pointChange: nextValue
// 				}

// 				//console.log('huhe', name)
// 				megaArr.push(productJson);
// 			})
// 			res.json(megaArr);
// 		}
// 	})
// }


