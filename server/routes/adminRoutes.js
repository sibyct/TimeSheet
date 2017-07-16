var express = require('express');
var adminSheetRoute = express.Router();
var userTimeDetails = require('../models/userTimeDetails.js');
var clientAndProjects = require('../models/clients.js');
var moment = require('moment');
var nodeExcel=require('excel-export');
var ObjectId = require('sails-mongo/node_modules/mongodb').ObjectID;

var passport = require('passport');
var users = require('../models/user.js');
var moment = require('moment');
var email   = require("emailjs");
var server  = email.server.connect({
   user:    "sibyctt@gmail.com",
   password:"kerala@16",
   host:    "smtp.gmail.com",
   ssl:     true
});
//var ObjectId = require('sails-mongo/node_modules/mongodb').ObjectID;

adminSheetRoute.get('/getuserInfo',function(req,res){
	if(!req.isAuthenticated()){
		 return res.status(401).json({
			status: 'UnAuthoirized'
		 });
	 }
	users.find({role: { $eq: 1}},{ _id: 0, salt:0,hash:0,__v:0})
	.exec(function(err,resData){
		if(err){
			return;
		}
		return res.status(200).json({
			data:resData,
			status: 'retrived Successfully'
		});
	})
});
adminSheetRoute.get('/getuserId',function(req,res){
	if(!req.isAuthenticated()){
		 return res.status(401).json({
			status: 'UnAuthoirized'
		 });
	 }
	users.find().sort({userId:-1}).limit(1)
	.exec(function(err,resData){
		if(err){
			return;
		}

		clientAndProjects.find({})
		.exec(function(err,projects){
			if (err) {
				return;
			}
			return res.status(200).json({
				data:resData,
				projects:projects
			});
		});
	})
});

adminSheetRoute.post('/register', function(req, res) {
	if(!req.isAuthenticated()){
		 return res.status(401).json({
			status: 'UnAuthoirized'
		 });
	 }
	var data = req.body;
	var passwordStr = Math.random().toString(36).slice(-8);
	users.find({username: { $eq: data.username}})
	.exec(function(err,resData){
		if(err){
			return res.status(500).json({
	       		 err: err
	     	 });
		}

		if(resData.length>0){
			return res.status(200).json({
					res: 'duplicatesFound'
				});
		}
		users.register(new users({ username: data.username }),
	    passwordStr, function(err, account) {
	    if (err) {
	      return res.status(500).json({
	        err: err
	      });
	    }
		  users.update(
		   { username: data.username },
		   { $set:
			  {
				userId:data.userId,
				hourlyPay:data.hourlyPay,
				firstName: data.firstName,
				lastName: data.lastName,
				emailAddress:data.emailAddress,
				phoneNo:data.phoneNo,
				role:1,
				contractType:data.contractType,
				projects:data.projectList,
				clients:data.clientsList,
				address:data.address,
				address2:data.address2
			  }
		   }
		).exec(function(err,d){
			if(err){
				return;
			}

				server.send({
				   text:    "Username:"+data.username+"  password:"+passwordStr+"",
				   from:    "Siby <sibyctt@gmail.com>",
				   to:      "someone <"+data.emailAddress+">",
				   cc:      "",
				   subject:"password Notification"
				}, function(err, message) {
						console.log(err);
					 console.log(message);
				});
				return res.status(200).json({
					data:data,
					status: 'saved'
				});

		});
	  });
  });
});

adminSheetRoute.get('/deleteUser/:userId',function(req,res){
	if(!req.isAuthenticated()){
		 return res.status(401).json({
			status: 'UnAuthoirized'
		 });
	 }

	users.remove({userId: { $eq:req.params.userId}})
	.exec(function(err,d){
		if(err){
			return res.status(500).json({
	        	err: err
	      	});
		}

		users.find({role: { $eq: 1}},{ _id: 0, salt:0,hash:0,__v:0})
		.exec(function(err,resData){
			if(err){
				return res.status(500).json({
	        		err: err
	      		});
			}
			return res.status(200).json({
				data:resData,
				status: 'retrived Successfully'
			});
		})

	});
});

adminSheetRoute.post('/updateUserDetails', function(req, res) {
	if(!req.isAuthenticated()){
		 return res.status(401).json({
			status: 'UnAuthoirized'
		 });
	 }
	var data = req.body;
	users.update(
		   { username: data.username },
		   { $set:
			  {
				firstName: data.firstName,
				lastName: data.lastName,
				emailAddress:data.emailAddress,
				phoneNo:data.phoneNo,
				contractType:data.contractType,
				clients:data.clients,
				projects:data.projects,
				address:data.address,
				address2:data.address2
			  }
		   }
		).exec(function(err,d){
			if(err){
				return;
			}
			users.find({role: { $eq: 1}})
			.exec(function(err,resData){
				return res.status(200).json({
					data:resData,
					status: 'saved'
				});
			});

		});
});

adminSheetRoute.get('/getProjectList', function(req, res) {
	if(!req.isAuthenticated()){
		 return res.status(401).json({
			status: 'UnAuthoirized'
		 });
	 }
	clientAndProjects.find({})
	.exec(function(err,data){
		if (err) {
			return;
		}
		return res.status(200).json({
			data:data,
			status: 'saved'
		});
	});
});

adminSheetRoute.post('/saveProjectList', function(req, res) {
	if(!req.isAuthenticated()){
		 return res.status(401).json({
			status: 'UnAuthoirized'
		 });
	 }
	 var newClients = req.body.newClients;
	 var updatedList = req.body.updatedList;

	 function updateData(){
			var dataLen = updatedList.length;
			var bulkUpdate = clientAndProjects.collection.initializeUnorderedBulkOp();
			for(var i=0;i< dataLen;i++){
				var id = updatedList[i]._id
				updatedList[i]._id = ObjectId(id);
				 bulkUpdate.find({_id: { $eq:ObjectId(id)}})
				 .updateOne(updatedList[i]);
			}
			bulkUpdate.execute(function(err,data){
				if(err){
					return;
				}
				clientAndProjects.find({})
				.exec(function(err,d){
					if (err) {
						return;
					}
					console.log(d);
					return res.status(200).json({
						data:d,
						status: 'saved'
					});
				});
			});
		}
	 if(newClients.length==0){
	 		updateData();
	 }
	 clientAndProjects.collection.insert(newClients,function(err){
		if (err) {
			return;
		}

		if(updatedList.length!=0){
			updateData()
		}

		else{
			clientAndProjects.find({})
			.exec(function(err,d){
				if (err) {
					return;
				}
				console.log(d);
				return res.status(200).json({
					data:d,
					status: 'saved'
				});
			});
		}

	});
});
adminSheetRoute.get('/deleteProjectList/:id', function(req, res) {
		if(!req.isAuthenticated()){
			 return res.status(401).json({
				status: 'UnAuthoirized'
			 });
		 }
		 var id = req.params.id;
		 console.log(id)
		 clientAndProjects.remove({_id: { $eq:ObjectId(id)}})
		 .exec(function(err,d){
		 	if(err){
		 		return;
		 	}
		 	return res.status(200).json({
				status: 'deleted'
			});
		 });

});

adminSheetRoute.get('/getProjectListAndUserList', function(req, res) {
		if(!req.isAuthenticated()){
			 return res.status(401).json({
				status: 'UnAuthoirized'
			 });
		 }
		clientAndProjects.find({})
			.exec(function(err,projectLst){
				if (err) {
					return;
				}
			users.find({role: { $eq: 1}})
			.exec(function(err,userList){
				if(err){
					return;
				}
				return res.status(200).json({
					clientsList:projectLst,
					userList:userList
				});
			});
		});

});

adminSheetRoute.post('/getSearchDetails', function(req, res) {
		if(!req.isAuthenticated()){
			 return res.status(401).json({
				status: 'UnAuthoirized'
			 });
		 }
		 var reqData = req.body;
		 var query = createQuery(reqData);
		 //{date: {$gte:firstWeekDay.toDate(),$lte:lastWeekDay.toDate()}},{ userId: { $eq: parseInt(req.cookies.userId) } }
		 userTimeDetails.find({$and:query})
		 .sort({date:1})
		 .exec(function(err,userTime){
		 		return res.status(200).json({
		 			data:userTime
				});
		 });

});

adminSheetRoute.post('/saveAdminData', function(req, res) {
		if(!req.isAuthenticated()){
			 return res.status(401).json({
				status: 'UnAuthoirized'
			 });
		 }
		var saveData = req.body.dataToUpdate,
		searchCriteria = req.body.searchCriteria,
		dataLen = saveData.length;
		var bulkUpdate = userTimeDetails.collection.initializeUnorderedBulkOp();
		for(var i=0;i< dataLen;i++){
			saveData[i]._id = ObjectId(saveData[i]._id);
			saveData[i].date = new Date(saveData[i].date);
      saveData[i].admincomments = saveData[i].admincomments;
  		saveData[i].adminProject = saveData[i].adminProject;
  		saveData[i].adminClient = saveData[i].adminClient;
  		saveData[i].adminProjectType = saveData[i].adminProjectType;
			bulkUpdate.find({$and: [ { _id: { $eq: saveData[i]._id}}, { userId: { $eq: parseInt(saveData[i].userId) } } ]})
			.updateOne(saveData[i]);
		}
		bulkUpdate.execute(function(err,data){
			var query = createQuery(searchCriteria);
			 userTimeDetails.find({$and:query})
			 .sort({date:1})
			 .exec(function(err,userTime){
			 		return res.status(200).json({
			 			data:userTime
					});
			 });
		});

});
adminSheetRoute.post('/exportToExcel', function(req, res) {
		if(!req.isAuthenticated()){
			 return res.status(401).json({
				status: 'UnAuthoirized'
			 });
		 }
		 var conf ={};
		 conf.name = "dsssssssssss";
		 conf.cols = [{
		 	caption:'Date',
        	type:'date',
        	width:35.7109375,
        	beforeCellWrite:function(row, cellData){
        		return moment(new Date(cellData)).format("MM/DD/YYYY");
        		//return cellData?cellData:"";
        	}
		 },{
		 	caption:'User Id',
        	type:'string',
        	width:35.7109375,
		 },{
		 	caption:'Client',
        	type:'string',
        	width:28.7109375,
        	beforeCellWrite:function(row, cellData){
        		return cellData?cellData:"";
        	}
		 },{
		 	caption:'Project',
        	type:'string',
        	width:35.7109375,
        	beforeCellWrite:function(row, cellData){
        		return cellData?cellData:"";
        	}
		 },{
		 	caption:'Project Type',
        	type:'string',
        	width:35.7109375,
        	beforeCellWrite:function(row, cellData){
        		return cellData?cellData:"";
        	}
		 },{
		 	caption:'Hours Worked',
        	type:'number',
        	width:35.7109375,
        	beforeCellWrite:function(row, cellData){
        		return cellData?cellData:"";
        	}
		 },{
		 	caption:'Comments',
        	type:'string',
        	width:35.7109375,
        	beforeCellWrite:function(row, cellData){
        		return cellData?cellData:"";
        	}
		 }];
		 var query = createQuery(req.body);
		 conf.rows = [];
		 //{date: {$gte:firstWeekDay.toDate(),$lte:lastWeekDay.toDate()}},{ userId: { $eq: parseInt(req.cookies.userId) } }
		 userTimeDetails.find({$and:query})
		 .sort({date:1})
		 .exec(function(err,userTime){
		 		if(err){
		 			return;
		 		}
		 		else{
		 			//conf.rows = [];
		 			var len = userTime.length;
		 			for (var i = 0; i < len; i++) {
		 				var obj = userTime[i].toObject();
		 				var arr = [obj.date,obj.userId,obj.clients,obj.project,obj.projectType,obj.hours,obj.comments];
		 				conf.rows.push(arr);
		 			};
		 			var result = nodeExcel.execute(conf);
				    res.setHeader('Content-disposition', 'attachment; filename=file.xls');
					res.setHeader('Content-type', 'application/vnd.ms-excel');
				    res.end(result, 'binary');
		 		}
		 });
});

adminSheetRoute.get('/resetPassword/:username', function(req, res) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      status: false
    });
  }
  var userId = req.params.username,
  passwordStr = Math.random().toString(36).slice(-8);;
  users.findByUsername(userId).then(function(sanitizedUser){
		if (sanitizedUser){
			sanitizedUser.setPassword(passwordStr, function(){
				sanitizedUser.save();
				server.send({
				   text:    "New Password:"+passwordStr+"",
				   from:    "Siby <sibyctt@gmail.com>",
				   to:      ""+sanitizedUser.firstName+"<"+sanitizedUser.emailAddress+">",
				   cc:      "",
				   subject:"password Notification"
				}, function(err, message) {
						console.log(err);
					 console.log(message);
				});
				return res.status(200).json({message: 'password reset successful'});
			});
		} else {
			return res.status(500).json({message: 'This user does not exist'});
		}
	},function(err){
		console.error(err);
	})

});

function createQuery(reqData){
		var query = [],
		 dateObj = {};
		 if(reqData.fromDate){
		 	dateObj.date = {};
		 	dateObj.date.$gte = moment(reqData.fromDate).toDate();
		 }

		 if(reqData.toDate){
		 	if(!dateObj.date){
		 		dateObj.date = {};
		 	}
		 	dateObj.date.$lte = moment(reqData.toDate).toDate();
		 }
		 query.push(dateObj);
		 if(reqData.project){
		 	var projectObj = {};
		 	projectObj.adminProject = {};
		 	projectObj.adminProject.$eq = reqData.project;
		 	query.push(projectObj);
		 }
		 if(reqData.client){
		 	var clientObj = {};
		 	clientObj.adminClient = {};
		 	clientObj.adminClient.$eq = reqData.client;
		 	query.push(clientObj);
		 }
		 if(reqData.projectType){
		 	var projectTypeObj = {};
		 	projectTypeObj.adminProjectType = {};
		 	projectTypeObj.adminProjectType.$eq = reqData.projectType;
		 	query.push(projectTypeObj);
		 }

		 if(reqData.users){
		 	var userObj = {};
		 	userObj.userId = {};
		 	userObj.userId.$eq = parseInt(reqData.users.userId);
		 	query.push(userObj);
		 }
		 query.push({
		 	submitted:{
		 		$eq:1
		 	}
		 });

		 return query;
}
module.exports = adminSheetRoute;
