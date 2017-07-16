// user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var project = new Schema({
	projectName:String,
	refId:String
});

var client = new Schema({
   	_id:String,
	clientName:String,
	projects:[project]
});
var User = new Schema({
	username: String,
	password: String,
	userId:Number,
	contractType:String,
	projects:[project],
	clients:[client],
	hourlyPay:Number,
	firstName: String,
	lastName: String,
	emailAddress:String,
	phoneNo:Number,
	address:String,
	role:Number,
	city:String,
	state:String,
	address2:String,
	postalCode:Number
});

User.plugin(passportLocalMongoose);


module.exports = mongoose.model('users', User);