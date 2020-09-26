const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const path = require("path");
const schedule = require("node-schedule");

function init() {}

var ipn = require("express-ipn");
const handlers = require("./handlers");
const databaseInt = require("./database");

const PORT = process.env.PORT || 8800;

async function main() {
	const [db, client] = await databaseInt.init();

	var app = express();
	app.use(express.json());
	app.use(cors());
	app.use("/", express.static(path.join(__dirname, "Public")));
	app.get("/subscribe", handlers.subscribe(db));
	app.get("/unsubscribe", handlers.unsubscribe(db));
	app.get("/activate", handlers.activatePremium(db));

	var Scheds = schedule.scheduleJob(
		"0 0 0 * * *",
		databaseInt.sendMails.bind(null, db)
	);

	app.listen(PORT, () => {
		console.log("Opened on port 8800");
	});
}

main();
