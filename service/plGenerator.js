'use strict'

var request = require('request');
var async = require('async');
var cheerio = require('cheerio');

var Currency = require('../models/currency');
var product = require('../models/product');
var Traders = require('../models/trader');

var currency = {
	name: 'HKD-USD',
	rate: '1.4'
}
exports.generatePL = function(req, res){
	var currency = req.params.currency;
	console.log('ouwbefiuwbfeui');
	getCurrency(currency, null, null, function(err, response){
		if(err) return(err);
		res.json(response);
	})

}

function getCurrency(baseCurrency, secondCurrency, date, callback ){
	//base currency in HKD
	//scrape all the currency available 
	if(!secondCurrency){
	var secondCurrency = 'USD'
	}
	request({
		url: 'http://api.fixer.io/latest?base='+baseCurrency,
		method: 'GET'
	}, function(err, response){
		if(err) return callback(err);
		return callback(null, response.body);
	})
}



function calculateYourPlReport(date, callback){

	async.waterfall([
		function(cb){

		},
		function(cb){

		},
		//use chatbot for enquiries for users on vouch 
		])


}




// {
// 	_id:18723187231,
// 	name: 'Chris',
// 	tradeActions: [
// 	{name: 'wefiwbf',
// 	productType: 'heloo',
// 	actions: 'sell or buy',
// 	volume: 123123,
// 	price: 123,
// 	baseCurrency: 'HKD'

// 	}
// 	]
// }
exports.firstTestPL= function(req, res){
	basicPlGenerate(null, function(err, response){
		if(err) return (err);
		console.log('DONE');
		return;
	})
}

function basicPlGenerate(input, callback){
	var values = {
		cashFlow: null,
		currency: null,
		profitLoss : null,
		report: []
	}
	var closingPrice =[{'name':'Apple', 'price': 1300}, {'name':'Google', 'price': 123}, {'name':'Yahoo', 'price': 5884}, {'name':'Uber', 'price': 848}, {'name':'Grab', 'price': 994}, {'name':'FoodPanda', 'price': 99}]
	var currencyReport;
	async.waterfall([
		function(cb){
			getCurrency('HKD', null, null, function(err, response){
				if(err)  cb(err);
				var currencyArray = response.rates;
				 cb(null, currencyArray);
				 //need to find interest rates as well
			})
		},
		function(currencyArray, cb){
			var closingPriceArray = closingPrice;
			cb(null, currencyArray, closingPriceArray);
		},
		function(currencyArray, closingPriceArray, cb){
			var calculations;
			Traders.find({}).exec(function(err, traders){
				if(err) return callback(err);
				console.log(traders)
				async.map(traders, function(elem, cb){
					var report = elem.tradeReport;
					//this is an array
					console.log('webfubf',elem);
					var tradedPrice, closingPrice, volume, action, interestRate;
					for(var i =0; i<report.length;i++){
							tradedPrice = report[i].price;
							volume = report[i].volume;
							action = report[i].actions;
							var stockName = report[i].name
							closingPrice = getClosePrice(closingPriceArray, stockName);
							closingPrice = closingPrice[0].price;
							if(action =='SELL'){
								volume = volume * -1
							}

							values.profitLoss += (closingPrice-tradedPrice)*volume;
						
					}
					console.log(values, closingPrice)
					if(i==report.length){
						cb(null, values);
					}
				})
				cb(null, values)
			})
		},
		function(values,cb){
			//var calc = values;
			console.log(values);
			cb();
		}
		], function(err, response){
			if(err) return callback(err);
			return callback(null);
 		})
		
}

function getClosePrice(arr, stockName){
	return arr.filter(function(arr){return arr.name == stockName})
}

function processReport(currencyArray, report, callback){

}

exports.generateTestData = function(req, res){
	var stocksArray = ['Apple', 'Google', 'Yahoo', 'Uber', 'Grab', 'FoodPanda'];
	var symbolArray = ['2018.HK', '0003.HK', '2388.HK', '1880.HK', '0992.HK', '0016.HK'];
	var currencyArray = ['HKD', 'USD', 'CHF', 'CNY','MYR', 'SGD'];
	var volumeArray = [1323, 345, 645, 9686, 34, 4421];
	var priceArray = [23, 1, 45, 453, 13, 50];
	var traderName = ['Chris', 'John', 'Adam', 'Jack', 'Susan', 'Jane'];
	var actionArray = ['BUY', 'SELL','BUY', 'SELL','BUY', 'SELL'];
	
	var max = 6;
	var min = 0;
	
	async.waterfall([
			function(cb){
				// Traders.find({})
				// .remove()
				// .exec(function(err, response){
				// 	if(err) cb(err);
				// 	cb();
				// })
				cb();
			},
			function(cb){
				var traderArray = [];
				var i = 0;
				while(i<50){
					var a = Math.floor(Math.random()*(max-min)+min);

					var tradeAction = {
						name: stocksArray[Math.floor(Math.random()*(max-min)+min)],
						productType: 'Stocks',
						actions: actionArray[Math.floor(Math.random()*(max-min)+min)],
						volume: volumeArray[Math.floor(Math.random()*(max-min)+min)],
						price: priceArray[Math.floor(Math.random()*(max-min)+min)],
						baseCurrency: currencyArray[Math.floor(Math.random()*(max-min)+min)]
					};

					var traders = new Traders({
						traderName: traderName[a]
					});
					traders.tradeReport.push(tradeAction);
					traderArray.push(traders);
					 i++;
						
				}
				if(i==50){
					console.log('12123123',traderArray)
					Traders.create(traderArray, function(err, results){
						console.log('the results are:',results);
						if(err)  cb(err);
						cb();
					})
				}
			}, 
			function(cb){
				console.log('cb trying to pull now');
				Traders.aggregate([
					{
						$match:{}
					},
					{
						$unwind: "$tradeReport"
					},
					{
						$group:{
							_id: "$traderName",
							traderName: {$first: "$traderName"},
							count: {"$sum":1},
							tradeReport:{$addToSet: "$tradeReport"}
						},
						
					},
					{
						$project:{
							_id:0,
							traderName: 1,
							tradeReport: 1
						}
					}
					// ,
					// {
					// 	$push: "$tradeReport"
					// }
				], function(err, results){
					//console.log('the second set of results are:', JSON.stringify(results));
					if(err) return cb(err);
				 	cb(null, results);
				})
				
			},
			function(results, cb){
				Traders.find({})
				.remove()
				.exec(function(err, response){
					if(err) cb(err);
					async.map(results, function(result, callback){
						var trader = new Traders({
							traderName: result.traderName
						});
						for(var i =0; i<result.tradeReport.length;i++){
							trader.tradeReport.push(result.tradeReport[i]);
						}
						if(i==result.tradeReport.length){
							return callback(null, trader);
						}
					}, function(err, results){
						if(err) return cb(err);
						console.log("the results are:,", results)
						Traders.create(results, function(err, response){
							console.log(response);
							if(err) throw(err);
							cb(null, response);
						})
					})
				})
			}

		], function(err, result){
			if(err) return (err);
			res.json(result);
			return;
		})
}

function randomNumber1to6(min, max){
	var output = Math.floor(Math.random()*(max-min)+min);
	return output;
}