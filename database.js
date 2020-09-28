const nodemailer = require("nodemailer");
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
			expiration: expiration,
			problem: problem,
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

function sendMails(rdb) {
	rdb.collection("users")
		.find()
		.forEach(function(ent) {
			console.log("Mail sent to : ", ent.mail);
			var mail = nodemailer.createTransport({
				service: "gmail",
				auth: {
					user: "the.dcq.company@gmail.com",
					pass: "dcq@mail!2020",
				},
			});
			var mailOptions = {
				from: "the.dcq.company@gmail.com",
				to: ent.mail,
				subject: "TheDCQ",
				text: "Test mail",
			};
			mail.sendMail(mailOptions, function(error, info) {
				if (error) {
					console.log(error);
				} else {
					console.log("Email sent: " + info.response);
				}
			});
		});
}

exports.subscribeUser = addUserToDB;
exports.unsubscribeUser = removeUserFromDB;
exports.init = dbSetup;
exports.addPremium = addPremium;
exports.sendMails = sendMails;
