const nodemailer = require("nodemailer");
const fs = require("fs");
const { MongoClient } = require("mongodb");
const url =
	"mongodb+srv://admin:TPWcwmgMMhf7JbLE@thedcq.tjnx3.gcp.mongodb.net/DCQ?retryWrites=true&w=majority";

const client = new MongoClient(url);

async function dbSetup() {
	await client.connect();

	const db = client.db("DCQ");
	return [db, client];
}

function addUserToDB(rdb, mail, expiration, problem, difficulty, premium) {
	rdb.collection("users").insertOne(
		{
			mail: mail,
			problem: problem,
			activated: false,
			difficulty: difficulty,
			premium: premium,
		},
		(err, res) => {
			if (err) console.log("Eroare : ", err);
		}
	);
}
function removeUserFromDB(rdb, mail) {
	var query = { mail: mail };
	rdb.collection("users").deleteOne(query, (err, res) => {
		if (err) console.log("Eroare : ", err);
	});
}

function addPremium(rdb, mail) {
	var query = { mail: mail };
	rdb.collection("users").updateOne(
		query,
		{ $set: { premium: true } },
		(err, res) => {
			if (err) console.log("Eoare : ", err);
		}
	);
}

function clickedSubscribe(rdb) {
	rdb.collection("vladProst").findOne({}, function(err, data) {
		rdb.collection("vladProst").updateOne(
			{},
			{ $set: { value: data.value + 1 } },
			(err, data) => {}
		);
	});
}

function sendMails(rdb) {
	rdb.collection("problems").findOne({}, function(err, result) {
		rdb.collection("users")
			.find({ activated: true })
			.forEach(function(ent) {
				console.log("Mail sent to : ", ent.mail);

				var mail = nodemailer.createTransport({
					host: "mini.axigen.com",
					port: 587,
					secure: false,
					auth: {
						user: "question@thedcq.com",
						pass: "o5t5d43c",
					},
				});

				var mailOptions = {
					from: "The DCQ <question@thedcq.com>",
					to: ent.mail,
					subject: "Your Daily Question! :)",
				};
				fs.readFile(
					"Problemset/" + result.difficulty + "/" + result.name,
					"utf8",
					function(err, data) {
						if (err) throw err;
						adp = data.toString();
						mailOptions.html = adp;
						mail.sendMail(mailOptions, function(error, info) {
							if (error) {
								console.log(error);
							} else {
								console.log("Email sent: " + info.response);
							}
						});
					}
				);

				rdb.collection("problems").deleteOne(
					{ name: result.name, difficulty: result.difficulty },
					function(err, res) {}
				);
			});
	});
}

exports.subscribeUser = addUserToDB;
exports.unsubscribeUser = removeUserFromDB;
exports.init = dbSetup;
exports.addPremium = addPremium;
exports.sendMails = sendMails;
exports.clickedSubscribe = clickedSubscribe;
