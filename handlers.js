const { application } = require("express");
const databaseInt = require("./database");

function subscribeHandler(db) {
	return function(req, res) {
		reqObj = req.body;
		console.log(req.params);
		databaseInt.subscribeUser(
			db,
			req.query.mail,
			Date.now(),
			0,
			req.query.difficulty,
			false
		);
		res.send("OK");
	};
}
function getDay(db) {
	return function(req, res) {
		reqObj = req.body;
		db.collection("dailyTraffic").findOne({date : req.query.date} , function(err, data){
			if(data != null){
			res.writeHead(200 , {"Content-Type" : "application/json"});
			res.write(JSON.stringify({value : data.value}));
			res.send();
			console.log(data.value);
			}
		})
		
	};
}

function vladSubscribe(db) {
	return function(req, res) {
		databaseInt.clickedSubscribe(db);
		res.end();
	};
}

function unsubscribeHandler(db) {
	return function(req, res) {
		reqObj = req.body;
		databaseInt.unsubscribeUser(db, req.query.mail);
		res.send("You have been unsubscribed");
	};
}
function activatePremiumUserHandler(db) {
	return function(req, res) {
		reqObj = req.body;
		databaseInt.addPremium(db, req.query.mail);
		res.send("ok");
	};
}

function ipnHandler(err, ipnContent) {
	if (err) {
		console.error("IPN invalid");
	} else {
		console.log(ipnContent);
	}
}

function adminHandler(req, res) {}

exports.subscribe = subscribeHandler;
exports.unsubscribe = unsubscribeHandler;
exports.activatePremium = activatePremiumUserHandler;
exports.ipn = ipnHandler;
exports.adminPage = adminHandler;
exports.vladSubscribe = vladSubscribe;
exports.getDaily = getDay;
