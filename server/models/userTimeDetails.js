// user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var UserTimeDetails = new Schema({
	userId:Number,
	date:Date,
	firstName:String,
	projectType:String,
	projects:{
		_id:String,
		projectName:String
	},
	clients:{
		_id:String,
		clientName:String
	},
	hours:Number,
	adminTime:Number,
	comments: String,
	submitted: Number,
	saved: Number
},
{collection: 'userTimeData'} );

module.exports = mongoose.model('userTimeData', UserTimeDetails);