const bodyParser = require("body-parser");
const express = require("express");
var ipn = require("express-ipn");
const handlers = require("./handlers");
const databaseInt = require("./database");

const PORT = process.env.PORT || 8080;

async function main() {
	const [db, client] = await databaseInt.init();

	var app = express();
	app.use(express.json());
	console.log("okj");
	app.get("/test", (req, res) => {
		res.send("124");
	});

	app.get("/subscribe", handlers.subscribe(db));
	app.get("/unsubscribe", handlers.unsubscribe(db));
	app.get("/activate", handlers.activatePremium(db));
	app.listen(PORT, () => {
		console.log("Opened on port 8080");
	});
}

main();
