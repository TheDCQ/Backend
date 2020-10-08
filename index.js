const bodyParser = require("body-parser");
const http = require("http");
const https = require("https");
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
	var privateKey = fs.readFileSync(
		path.join(__dirname, "sslcert", "privatekey.pem"),
		"utf8"
	);
	var certificate = fs.readFileSync(
		path.join(__dirname, "sslcert", "cert.pem"),
		"utf8"
	);
	console.log(privateKey, certificate);
	var credentials = { key: privateKey, cert: certificate };
	var app = express();
	app.use(
		express.urlencoded({
			extended: true,
		})
	);
	app.use(express.json());
	app.use(cors());
	app.use("/", express.static(path.join(__dirname, "Public")));
	app.get("/clickedSubscribe", handlers.vladSubscribe(db));
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
			(username == "vlad" ||
				username == "mihai" ||
				username == "tudor") &&
			password == "TPWcwmgMMhf7JbLE"
		) {
			fs.readFile("AddProblem/add.html", "utf8", function(err, data) {
				if (err) throw err;
				adp = data.toString();
				res.send(adp);
			});
		} else res.send("Wrong username/password");
	});
	app.get("/solution", (req, res) => {
		dif = req.query.difficulty;
		name = req.query.name;
		user = req.query.mail;
		console.log(dif, name, user);
		fs.readFile("Problemset/" + dif + "/" + name + "_sol", "utf8", function(
			err,
			data
		) {
			if (err) throw err;
			adp = data.toString();
			res.send(adp);
		});
	});
	app.post("/addProblem", (req, res) => {
		if (req.body.password == "TPWcwmgMMhf7JbLE") {
			if (
				fs.existsSync(
					"Problemset/" + req.body.difficulty + "/" + req.body.num
				)
			)
				res.send("Probem already exits");
			else {
				db.collection("problems").insertOne({
					name: req.body.num,
					difficulty: req.body.difficulty,
				});
				fs.writeFile(
					"Problemset/" + req.body.difficulty + "/" + req.body.num,
					req.body.enunt,
					function(err) {
						if (err) throw err;
						console.log("File is created successfully.");
					}
				);
				fs.writeFile(
					"Problemset/" +
						req.body.difficulty +
						"/" +
						req.body.num +
						"_sol",
					req.body.sol,
					function(err) {
						if (err) throw err;
						console.log("File is created succesfully");
					}
				);
				res.send("Problem Added");
			}
		} else {
			res.send("NOT OK");
		}
	});
	var Scheds = schedule.scheduleJob(
		"0 0 0 * * *",
		databaseInt.sendMails.bind(null, db)
	);
	var httpsServer = https.createServer(credentials, app);
	var httpServer = http.createServer(app);
	httpServer.listen(80);
	httpsServer.listen(443);
}

main();
