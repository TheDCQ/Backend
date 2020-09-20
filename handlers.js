const databaseInt = require("./database");

function subscribeHandler(db) {
	return function(req, res) {
		reqObj = req.body;
		databaseInt.subscribeUser(
			db,
			reqObj.mail,
			Date.now(),
			0,
			reqObj.difficulty,
			false
		);
		res.send("OK");
	};
}
function unsubscribeHandler(db) {
	return function(req, res) {
		reqObj = req.body;
		databaseInt.unsubscribeUser(db, reqObj.mail);
		res.send("OK");
	};
}
function activatePremiumUserHandler(db) {
	return function(req, res) {
		reqObj = req.body;
		databaseInt.addPremium(db, reqObj.mail);
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

exports.subscribe = subscribeHandler;
exports.unsubscribe = unsubscribeHandler;
exports.activatePremium = activatePremiumUserHandler;
exports.ipn = ipnHandler;
