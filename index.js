const bodyParser = require("body-parser");
const http = require("http");
const https = require("https");
const express = require("express");
const cors = require("cors");
const path = require("path");
const schedule = require("node-schedule");
const fs = require("fs");
const jds = require("jds");

var ipn = require("express-ipn");
const handlers = require("./handlers");
const databaseInt = require("./database");
const { emitKeypressEvents } = require("readline");
const { randomBytes } = require("crypto");
const { ObjectID } = require("mongodb");

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
	async function getDaily(){
		let data2 = new Date().toISOString().slice(0, 10);
		const found = await db.collection("dailyTraffic").findOne({date:data2} , function(err, data){
			if(err || data == null)
			{
				console.log("1");
				db.collection("dailyTraffic").insertOne(
					{date: data2 , value: 0},
					(err, data) =>
					
					 {}
				);
			}
			else{
				console.log("1");
			db.collection("dailyTraffic").findOne({date:data2} , function(err, datax){
				db.collection("dailyTraffic").updateOne(
					{},
					{ 	$set: { value: datax.value + 1}},
					(err, data) => {}
				);
			});
		}
		});
		
		
		
	}
	app.get("/visit", (req, res) => {
		db.collection("vladProst2").findOne({}, function(err, data) {
			db.collection("vladProst2").updateOne(
				{},
				{ $set: { value: data.value + 1 } },
				(err, data) => {}
			);
		});
		
		getDaily();
		res.send("ok");
	});
	app.use("/v1", express.static(path.join(__dirname, "Public")));
	app.use("/", express.static(path.join(__dirname, "PublicNew")));
	app.use("/blog" , express.static(path.join(__dirname , "Public" , "blog")));
	app.get("/clickedSubscribe", handlers.vladSubscribe(db));
	app.get("/subscribe", handlers.subscribe(db));
	app.get("/unsubscribe", handlers.unsubscribe(db));
	app.get("/dailyTraffic" ,handlers.getDaily(db));
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
	app.get("/confirm", (req, res) => {
		db.collection("users").updateOne(
			{ _id: ObjectID(req.query.id) },
			{ $set: { activated: true } },
			(err, data) => {
				res.send("You have been activated");
			}
		);
	});
	app.get("/unsubscribeID", (req, res) => {
		db.collection("users").deleteOne(
			{ _id: ObjectID(req.query.id) },
			(err, data) => {
				res.send("You have been unsubscribed");
			}
		);
	});
	app.get("/", (req, res) => {

		databaseInt.traficCount(db);
		console.log("ok");
		fs.readFile(path.join(__dirname,"PublicNew","index.html"), "utf8", function(err, data) {
			if (err) throw err;
			adp = data.toString();
			res.send(adp);
		});
	});

	app.get("/blog" , (req, res) => {
		res.sendFile(path.join(__dirname,"Public","blog","index.html"));
	}
	)
	app.get("/adminData", (req, res) => {
		
		fs.readFile("adminData.html", "utf8", function(err, data) {
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
		databaseInt.traficCount(db);
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

	app.get("/statement", (req, res) => {
		dif = req.query.difficulty;
		name = req.query.name;
		if (fs.existsSync("Problemset/" + dif + "/" + name))
			fs.readFile(
				"Problemset/" + dif + "/" + name ,
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
				db.collection("problemlist").updateOne({name:"list"},
							{
								$push:{
									problems:{
										name:req.body.num,
										difficulty:req.body.difficulty
									}
								}
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
	var httpServer = http.createServer(appHttp);
	http.createServer(app).listen(8080);
	httpServer.listen(80);
	httpsServer.listen(443);
}

main();
