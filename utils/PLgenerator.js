var request = require('request');
var async = require('async');
var cheerio = require('cheerio');

var excelParserUtils = require('./excelParser');

var Currency = require('../models/currency');
var Product = require('../models/product');
var Traders = require('../models/trader');


exports.generatePL = function(input, callback){
	var PandLHKDTotalExt = 0;
	var PandLUSDTotalExt = 0;
	var PandLHKDTotalInt = 0;
	var PandLHKDTotalInt = 0;
	async.waterfall([
		function(cb){
			// just to remove all traders inside to clear all the data inside
			Traders.find({})
			.remove()
			.exec(function(err, response){
				if(err) return(err);
				console.log('deleted traders')
				cb();
			})
		},
		function(cb){
			//upload the excel into database
			excelParserUtils.excelParseTrades(null, function(err, response){
				if(err) return(err);
				console.log('uploaded trades');
				cb(null, response);
			})
		},
		function(response, cb){//here will attach the closing prices
			//add the currency thing here
			console.log('going to start attaching prices');
			async.map(response, function(elem, callback){
				Product.findOne({"abbreviation": elem.tradeReport[0].name}, function(err, productItem){
					if(err) return(err);
					elem.tradeReport[0].yahooQuote = productItem.yahooQuote;
					elem.tradeReport[0].bloomQuote = productItem.bloomQuote;
					elem.tradeReport[0].reutersQuote = productItem.reutersQuote;
					elem.tradeReport[0].internalPrice = productItem.internalPrice;
					console.log('elem', elem);
					Traders.update({_id: elem._id}, {$set:{tradeReport:elem.tradeReport[0]}}, function(err, savedProduct){
						if(err) return(err);
						return callback(null);
					})
				})
			}, function(err, results){
				if(err) return(err);
				console.log('attached the prices')
				cb(null);
			})
		},
		function(cb){
			//now to filter them and arrange them
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
					// results orgasnised here
					console.log('finished aggreg: ', JSON.stringify(results))
					Traders.find({})
					.remove()
					.exec(function(err, response){
						if(err) return(err);
						cb(null, results)
					})					
				})
		},
		function(traders, cb){
			var numberOfTraders = traders.length;
			getCurrency('HKD', null, null, function(err, response){
				
				var HKDtoUSD = JSON.parse(response.body).rates.USD;
				//console.log('in the currency: ', HKDtoUSD);
				async.map(traders, function(element,callback){
					//gotno internal closing price yet
					var numberOfTrades = element.tradeReport.length;
					element.PandLHKDExt=0;
					element.PandLHKDInt=0;
					for(var x=0;x<numberOfTrades;x++){
						var trade = element.tradeReport[x];
						var volume = (trade.volume);
						var buyPrice = parseFloat(trade.price).toFixed(2);
						var closePriceExt = parseFloat(trade.yahooQuote).toFixed(2);
						var closePriceInt = parseFloat(trade.internalPrice).toFixed(2);

						element.PandLHKDExt += parseFloat(((closePriceExt - buyPrice) * volume));
						element.PandLUSDExt = parseFloat(element.PandLHKDExt*HKDtoUSD);
						PandLHKDTotalExt+= parseFloat(((closePriceExt-buyPrice)*volume))
						PandLUSDTotalExt = parseFloat(PandLHKDTotalExt*HKDtoUSD)

						element.PandLHKDInt += parseFloat(((closePriceInt - buyPrice) * volume))
						element.PandLUSDInt = parseFloat(element.PandLHKDInt * HKDtoUSD)
						PandLHKDTotalInt += parseFloat(((closePriceInt - buyPrice) * volume))
						PandLUSDTotalInt = parseFloat(PandLHKDTotalInt * HKDtoUSD)
						console.log('breakles', closePriceExt, buyPrice, volume,(((closePriceExt - buyPrice) * volume)))
						//in HKD
					}
					if(x==numberOfTrades){
						return callback(null);
					}
				}, function(err, results){
					if(err) return(err);
					console.log('newly attached details: ', traders)
					cb(null, traders);
				});				
			})				
		},
		function(results, cb){
			var parameters = {
				traders: results,
				PandLHKDTotalExt: PandLHKDTotalExt,
				PandLUSDTotalExt: PandLUSDTotalExt,
				PandLHKDTotalInt: PandLHKDTotalInt,
				PandLUSDTotalInt: PandLUSDTotalInt
			}
			cb(null, parameters);
		}
		], function(err, results){
			if(err) return(err);
			console.log('the results', results);
			return callback(null, results);
		})
}





exports.generatePL1 = function(req, res){
	console.log('wifbwiuefbwieuf');
	var currency = req.params.currency;
	console.log('1123123123');
	getCurrency(currency, null, null, function(err, response){
		if(err) return(err);
		res.json(response);
	})

}

function getCurrency(baseCurrency, secondCurrency, date, callback ){
	//scrape all the currency available 
	console.log(baseCurrency);
	request({
		url: 'http://api.fixer.io/latest?base=' + baseCurrency,
		method: 'GET'
	}, function(err, response){
		if(err) return callback(err);
		return callback(null, response);
	})

}

