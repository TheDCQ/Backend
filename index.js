const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const path = require("path");
const schedule = require("node-schedule");
const fs = require("fs");

var ipn = require("express-ipn");
const handlers = require("./handlers");
const databaseInt = require("./database");

const PORT = process.env.PORT || 8800;

async function main() {
	const [db, client] = await databaseInt.init();

	var app = express();
	app.use(
		express.urlencoded({
			extended: true,
		})
	);
	app.use(express.json());
	app.use(cors());
	app.use("/", express.static(path.join(__dirname, "Public")));
	app.get("/subscribe", handlers.subscribe(db));
	app.get("/unsubscribe", handlers.unsubscribe(db));
	app.get("/activate", handlers.activatePremium(db));
	app.get("/", (req, res) => {
		fs.readFile("index.html", "utf8", function(err, data) {
			if (err) throw err;
			adp = data.toString();
			res.send(adp);
		});
	});
	app.get("/admin_panel", (req, res) => {
		fs.readFile("Admin/admin.html", "utf8", function(err, data) {
			if (err) throw err;
			adp = data.toString();
			res.send(adp);
		});
	});
	app.post("/submit-form", (req, res) => {
		const username = req.body.username;
		const password = req.body.password;

		if (
			(username == "vlad" || username == "mihai") &&
			password == "TPWcwmgMMhf7JbLE"
		) {
			fs.readFile("AddProblem/add.html", "utf8", function(err, data) {
				if (err) throw err;
				adp = data.toString();
				res.send(adp);
			});
		} else res.send("Wrong username/password");
	});
	app.post("/addProblem", (req, res) => {
		if (req.body.password == "TPWcwmgMMhf7JbLE") {
			fs.writeFile(
				"Problemset/" + req.body.difficulty + "/" + req.body.num,
				req.body.enunt,
				function(err) {
					if (err) throw err;
					console.log("File is created successfully.");
				}
			);
			res.send("OK");
		} else {
			res.send("NOT OK");
		}
	});
	var Scheds = schedule.scheduleJob(
		"0 0 0 * * *",
		databaseInt.sendMails.bind(null, db)
	);

	app.listen(PORT, () => {
		console.log("Opened on port 8800");
	});
}

main();
