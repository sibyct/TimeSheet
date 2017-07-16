/* var mongo = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/timesheetDb';

var routeObj = {
	saveTimeSheetData:function(req,res){
		mongo.connect(url, function(err, db) {
			if(err){
				console.log("Err");
				return;
			}
			var collection = db.collection('movie');
			var data = req.body;
			collection.insert(data,function(){
			})
			db.close();
		});
	},
	getTimeSheetData:function(req,res){
		
	}
};

module.exports = routeObj;

 */
 
 module.exports = function(app,passport){
	 app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
	
	app.get('/saveTimeSheetData',function(req,res){
		debugger;
	})
	
 }
 
 
 function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}