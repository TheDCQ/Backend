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
		res.send("OK");
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
