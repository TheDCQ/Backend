const nodemailer = require("nodemailer");
const fs = require("fs");
const mongooid=require("mongodb").ObjectID;
const { MongoClient, ObjectID } = require("mongodb");
const ejs = require("ejs");
const path = require("path");
const url =
	"mongodb+srv://admin:TPWcwmgMMhf7JbLE@thedcq.tjnx3.gcp.mongodb.net/DCQ?retryWrites=true&w=majority";

const client = new MongoClient(url);

async function dbSetup() {
	await client.connect();

	const db = client.db("DCQ");
	return [db, client];
}

function addUserToDB(rdb, mail, expiration, problem, difficulty, premium,refid) {
	idins = rdb.collection("users").insertOne(
		{
			mail: mail,
			problem: problem,
			activated: false,
			difficulty: difficulty,
			premium: premium,
			inivted:0,
			monthsfree:0,
			remainingdays:7
		},
		(err, res) => {
			if (err) console.log(err);
			else {
				if(refid=="" || refid==undefined);
				else addReferal(rdb,refid);
				sendConfirmationMail(rdb, res.insertedId, mail);
		}}
	);
}

function sendConfirmationMail(rdb, id, email) {
	ejs.renderFile(
		path.join(__dirname, "mail_template", "confirmation_mail.html"),
		{
			id: id,
		},
		{},
		function(err, str) {
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
				to: email,
				subject: "Confirmation Mail",
			};
			if (err) throw err;
			mailOptions.html = str;
			mail.sendMail(mailOptions, function(error, info) {
				if (error) {
					console.log(error);
				} else {
					console.log("Email sent: " + info.response);
				}
			});
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
function siteTraficAdd(rdb) {
	rdb.collection("totalTrafic").findOne({}, function(err, data) {
		rdb.collection("totalTrafic").updateOne(
			{},
			{ $set: { value: data.value + 1 } },
			(err, data) => {}
		);
	});
	
}

function addReferal(rdb,refid){
	if(mongooid.isValid(refid)){
		
		rdb.collection("users").updateOne({_id:ObjectID(refid)},{$inc:{inivted:1}},(err)=>{
			if(err)console.log(err);
		});
		rdb.collection("users").findOne({_id:ObjectID(refid)},(err,data)=>{
			if(data.inivted%3==0)
			rdb.collection("users").updateOne({_id:ObjectID(refid)},{$inc:{remainingdays:30}},(err)=>{
				if(err)console.log(err);
			});
		});
	}
}

async function sendMails(rdb) {
	rdb.collection("problems").findOne({}, function(err, result) {
		users = rdb.collection("users").find();
		fs.readFile(
			"Problemset/" + result.difficulty + "/" + result.name,
			"utf8",
			function(err, data) {
				users.forEach((ent, index, array) => {
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
					if (err) throw err;
					adp = data.toString();
					mailOptions.html = adp;
					console.log();
					mail.sendMail(mailOptions, function(error, info) {
						if (error) {
							console.log(error);
						} else {
							console.log("Email sent: " + info.response);
						}
					});
				});
				rdb.collection("problems").deleteOne(
					{ name: result.name, difficulty: result.difficulty },
					function(err, res) {}
				);
			}
		);
	});
}

exports.subscribeUser = addUserToDB;
exports.unsubscribeUser = removeUserFromDB;
exports.init = dbSetup;
exports.addPremium = addPremium;
exports.sendMails = sendMails;
exports.clickedSubscribe = clickedSubscribe;
exports.traficCount = siteTraficAdd;
exports.addReferal =addReferal;