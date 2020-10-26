const bodyParser = require("body-parser");
const http = require("http");
const https = require("https");
const express = require("express");
const cors = require("cors");
const path = require("path");
const schedule = require("node-schedule");
const fs = require("fs");
const stripe = require("stripe")("sk_test_4eC39HqLyjWDarjtT1zdp7dc");

var ipn = require("express-ipn");
const handlers = require("./handlers");
const databaseInt = require("./database");
const { emitKeypressEvents } = require("readline");

const PORT = process.env.PORT || 8800;
const targetBaseUrl = "https://thedcq.com";

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
	var appHttp = express();
	appHttp.get("*", function handleRedirect(req, res) {
		const targetUrl = targetBaseUrl + req.originalUrl;
		res.redirect(targetUrl);
	});
	app.use(
		express.urlencoded({
			extended: true,
		})
	);
	app.use(express.json());
	app.use(cors());
	app.get("/visit", (req, res) => {
		db.collection("vladProst2").findOne({}, function(err, data) {
			db.collection("vladProst2").updateOne(
				{},
				{ $set: { value: data.value + 1 } },
				(err, data) => {}
			);
		});
		res.send("ok");
	});
	app.use("/", express.static(path.join(__dirname, "Public")));
	app.get("/clickedSubscribe", handlers.vladSubscribe(db));
	app.get("/subscribe", handlers.subscribe(db));
	app.get("/unsubscribe", handlers.unsubscribe(db));
	app.get("/unsubcribeUser", (req, res) => {
		req.send(`<html>
		<head>
	
		</head>
		<body>
			<label for="email">Your mail</label><br>
	  <input type="email" id="email" name="email" ><br>
	  <button onclick="UnsubscribeButtonClick()"> Unsubscribe </button>
		<script>
			function UnsubscribeButtonClick()
			{
				link = "https://thedcq.com/unsubscribe?mail=" + document.getElementById('email').value;
				 window.location.href = link;
			}
		</script>
		</body>
	</html>`);
	});
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
		if (fs.existsSync("Problemset/" + dif + "/" + name + "_sol"))
			fs.readFile(
				"Problemset/" + dif + "/" + name + "_sol",
				"utf8",
				function(err, data) {
					if (err) throw err;
					adp = data.toString();
					res.send(adp);
				}
			);
		else res.status(404).send("File doesn't exist");
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
	app.post(
		"/stripe-webhook",
		bodyParser.raw({ type: "application/json" }),
		async (req, res) => {
			// Retrieve the event by verifying the signature using the raw body and secret.
			let event;

			try {
				event = stripe.webhooks.constructEvent(
					req.body,
					req.headers["stripe-signature"],
					process.env.STRIPE_WEBHOOK_SECRET
				);
			} catch (err) {
				console.log(err);
				console.log(`⚠️  Webhook signature verification failed.`);
				console.log(
					`⚠️  Check the env file and enter the correct webhook secret.`
				);
				return res.sendStatus(400);
			}
			const dataObject = event.data.object;
			switch (event.type) {
				case "invoice.paid":
					databaseInt.addPremium(db, req.body.mail);
					break;
				case "invoice.payment_failed":
					break;
				case "customer.subscription.deleted":
					if (event.request != null) {
					} else {
					}
					break;
				default:
			}
			res.sendStatus(200);
		}
	);
	var Scheds = schedule.scheduleJob(
		"0 0 0 * * *",
		databaseInt.sendMails.bind(null, db)
	);
	var httpsServer = https.createServer(credentials, app);
	var httpServer = http.createServer(appHttp);
	http.createServer(app).listen(8080);
	httpServer.listen(80);
	httpsServer.listen(443);
}

main();
