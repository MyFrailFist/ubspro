
var async = require('async');
var request = require('request');
var Traders = require('../models/trader');
var Product	= require('../models/product');
var xlsx = require('xlsx');
var path = require('path');
var excelParser = require('exceljs');


exports.excelParseTrades = function(input, callback){
	console.log('yoooo');
	var fileName = 'TradePortfolios.xlsx'
	var workbook = new excelParser.Workbook();
	workbook.xlsx.readFile(path.resolve(__dirname)+'/../excel/'+fileName)
	.then(function(){		
		console.log(workbook);
		var traderArray = [];
		workbook.eachSheet(function(worksheet, sheetId){
			
			worksheet.eachRow({includeEmpty: false}, function(row, rowNumber){
				//first row return, labels
				if(row.values[1] == 'Symbol'){
					return;
				}
				var action = 'BUY';
				if(row.values[6]<0){
					action =' SELL';
				}
				var trader = new Traders({
					traderName: row.values[10]
				});
				var report = {
					name: row.values[2],//abbreviation
					productType: 'Stocks',
					actions: action,
					volume: Math.abs(row.values[6]),
					price: row.values[9],
					baseCurrency: 'HKD'
				}
				console.log('the reports are: ', report);
				trader.tradeReport.push(report);

				traderArray.push(trader);
				console.log(traderArray)
			});
		});
		Traders.create(traderArray, function(err, traders){
			if(err) return(err);
			console.log('saved the traders: ', traders);
			return callback(null, traders);
		})
	})


}


exports.excelParseStocks = function(input, callback){
	var filename = 'stockData.xlsx'
	var workbook = new excelParser.Workbook();
	var nameArray = [];
	workbook.xlsx.readFile(path.resolve(__dirname)+'/../excel/'+filename)
	.then(function(){
		var stockArray = [];
		workbook.eachSheet(function(worksheet, sheetId){
			worksheet.eachRow(function(row, rowNumber){
				if(row.values[1] == 'Symbol'){
					return;
				}
				if(nameArray.indexOf(row.values[2])>-1){
					return;
				}
				if(nameArray.indexOf(row.values[2]==-1)){
					nameArray.push(row.values[2]);
				}
				var stock = {
					symbol: row.values[2],
					productType: 'Stocks',
					internalPrice: row.values[9],
					baseCurrency: 'HKD'
				}

				stockArray.push(stock);
				console.log(stockArray);
			});
		});
			return callback(null, stockArray);
	})
}


// exports.excelParsePl = function(input, callback){
// 	var filename = 'TradePortfolios.xslx'
// 	var workbook = new excelParser.Workbook();
// 	var nameArray = [];
// 	workbook.xlsx.readFile(path.resolve(__dirname)+'/../excel/'+filename)
// 	.then(function(){
// 		var traderArray = [];
// 		workbook.eachSheet(function(worksheet, sheetId){
// 			worksheet.eachRow(function(row, rowNumber){
// 				if(row.values[1] == 'Symbol'){
// 					return;
// 				}
// 				var actions = 'BUY';
// 				if(row.values[6]<=0){
// 					actions = 'SELL'
// 				}
// 				var trader
// 			})
// 		})
// 	})
// }


