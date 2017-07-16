var express = require('express');
var pageRoutes = express.Router();
var path = require('path');
var User = require('../models/user.js');

pageRoutes.get('/login', function(req, res) {
	var cookie = req.cookies; 
	console.log(cookie);
	if (req.isAuthenticated()&&cookie.userId&&cookie.username) {
		
    	User.findOne({$and:[{userId:{$eq:parseInt(cookie.userId)}},{username:{$eq:cookie.username}}]})
	      .exec(function(err,userTime){
			  console.log(userTime);
	        if(err){
	        	res.sendFile(path.join(__dirname, '../../client', 'login.html'));
	        }
	        else{
	         	if(userTime.role==0){
	         		res.redirect('admin');
	         	}
	         	else{
	         		res.redirect('user');
	         	}
	        }
	     });
  	}
  	else{
  		res.sendFile(path.join(__dirname, '../../client', 'login.html'));
  	}
});
pageRoutes.get('/user', function(req, res) {
  res.sendFile(path.join(__dirname, '../../client', 'index.html'));
});
pageRoutes.get('/admin', function(req, res) {
	var cookie = req.cookies; 
	console.log(cookie);
	if (req.isAuthenticated()&&cookie.userId&&cookie.username) {
		console.log(req.isAuthenticated());
    	User.findOne({$and:[{userId:{$eq:parseInt(cookie.userId)}},{username:{$eq:cookie.username}}]})
	      .exec(function(err,userTime){
	        if(err){
	        	res.sendFile(path.join(__dirname, '../../client', 'login.html'));
	        }
	        else{
	         	if(userTime.role==0){
	         		res.sendFile(path.join(__dirname, '../../client', 'admin.html'));
	         	}
	         	else{
	         		res.redirect('user');
	         	}
	        }
	     });
  	}
  	else{
  		res.sendFile(path.join(__dirname, '../../client', 'login.html'));
  	}
  
});

module.exports = pageRoutes;