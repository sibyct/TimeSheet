// user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var projects = new Schema({
	projectName:String
});
var clientDetails = new Schema({
	clientName:String,
	projects:[projects]
},
{collection: 'clients'} );

module.exports = mongoose.model('clients', clientDetails);