var express = require('express');
var router = express.Router();
var passport = require('passport');

var User = require('../models/user.js');


router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
	  
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }
	  var userObj = user.toObject();
	  res.cookie('userId',userObj.userId);
	  res.cookie('username',userObj.username);
      res.status(200).json({
        role:userObj.role,
        status: 'Login successful!'
      }); 
    });
  })(req, res, next);
});

router.get('/logout', function(req, res) {
  req.logout();
  
  res.status(200).json({
    status: 'Bye!'
  });
});

router.get('/isAuthenticated', function(req, res) {
	console.log(res);
  if (!req.isAuthenticated()) {
    return res.status(200).json({
      authenticate: false
    });
  }
  var cookie = req.cookies; 
  if(cookie.userId&&cookie.username){
      User.findOne({$and:[{userId:{$eq:parseInt(cookie.userId)}},{username:{$eq:cookie.username}}]})
      .exec(function(err,userTime){
        if(err){
          return res.status(200).json({
              authenticate: false
          });
        }
        else{
          return res.status(200).json({
            authenticate: true,
            userData:userTime
          });
        }
     });
  }
  else{
    return res.status(200).json({
        authenticate: false
    });
  }
  //debugger;
});

router.post('/changePassword', function(req, res) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      status: false
    });
  }
  var newpassword = req.body.password;
  User.findByUsername(req.cookies.username).then(function(sanitizedUser){
		if (sanitizedUser){
			sanitizedUser.setPassword(newpassword, function(){
				sanitizedUser.save();
				return res.status(200).json({message: 'password reset successful'});
			});
		} else {
			return res.status(500).json({message: 'This user does not exist'});
		}
	},function(err){
		console.error(err);
	}) 
	
});


module.exports = router;