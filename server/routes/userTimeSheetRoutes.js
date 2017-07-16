var express = require('express');
var timeSheetRoute = express.Router();
var userTimeDetails = require('../models/userTimeDetails.js');
var moment = require('moment');
var users = require('../models/user.js');
var ObjectId = require('sails-mongo/node_modules/mongodb').ObjectID;
timeSheetRoute.get('/getUserTimeLogin', function(req, res) {
	if(!req.isAuthenticated()){
		 return res.status(401).json({
			status: 'UnAuthoirized'
		 });
	 }
	 var dateArr = [],
	 startDate = moment(new Date(2016,7,1)),
	 endDate = moment(new Date());

	var weeks = [];
	var day = startDate;

	while (day <= endDate){
		var firstDate = day.format("MM/DD/YYYY");
		var lastDate = day.clone().add(6, 'd').format("MM/DD/YYYY");
		if(moment(new Date(lastDate))>endDate){
			lastDate =  moment(new Date()).format("MM/DD/YYYY");
		}
		var dateStr = firstDate+'-'+lastDate;
		day.add(1, 'd');
		day = day.add(6, 'd');
		weeks.push(dateStr);
	}
	var dateRanges = weeks[0].split('-'),
	firstWeekDay = moment(new Date(dateRanges[0])),
	lastWeekDay = moment(new Date(dateRanges[1]));
	saveDateRange(firstWeekDay,lastWeekDay,req,res,weeks);
});

function saveDateRange(firstWeekDay,lastWeekDay,req,res,weeks){
	userTimeDetails.find({$and:[{date: {$gte:firstWeekDay.toDate(),$lte:lastWeekDay.toDate()}},{ userId: { $eq: parseInt(req.cookies.userId) } }]})
	.sort({date:1}).exec(function(err,resData){
		if(err){
			return
		}
		weeks = weeks?weeks:[];
		if(resData.length == 0){
			var datesArr = [],
			firstDay =firstWeekDay,
			lastDayCounter = lastWeekDay;
			while(firstDay <= lastDayCounter){
				var obj = {
					userId:parseInt(req.cookies.userId),
					date:firstDay.toDate(),
					projectName:'',
					hours:0,
					adminTime:0,
					comments: '',
					submitted: 0,
					saved: 0
				};
				datesArr.push(obj);
				firstDay.add(1, 'd');
			}
			userTimeDetails.collection.insert(datesArr,afterInsert);

			function afterInsert(err,docs){
				if(err){
					return;
				}
				users.findOne({userId: { $eq: parseInt(req.cookies.userId)}},{ userId: 0, _id: 0, salt:0,hash:0,__v:0,role:0})
				.exec(function(err,resData){
					return res.status(200).json({
						data:docs.ops,
						dateRanges:weeks,
						projects:resData.projects,
						clients:resData.clients
					});
				})
			};
		}
		else{
			 var lastDate = resData[resData.length-1].toObject().date,
			momentDate = moment(lastDate),
			dateCompare = compare();
			if((momentDate.isoWeekday()!=7)&& (momentDate.toDate().setHours(0, 0, 0, 0, 0)<new Date().setHours(0, 0, 0, 0, 0))){
				var datesArr = [],
				firstDay =momentDate.add(1, 'd'),
				lastDayCounter = moment(new Date());
				while(firstDay <= lastDayCounter){
					var obj = {
						userId:parseInt(req.cookies.userId),
						date:firstDay.toDate(),
						projectName:'',
						hours:0,
						adminTime:0,
						comments: '',
						submitted: 0,
						saved: 0
					};
					datesArr.push(obj);
					firstDay.add(1, 'd');
				}
				userTimeDetails.collection.insert(datesArr,dataInsertedCallback);

				function dataInsertedCallback(err,insertedData){
					if(err){
						return
					}

					var data = insertedData?insertedData:[];
					users.findOne({userId: { $eq: parseInt(req.cookies.userId)}},{ userId: 0, _id: 0, salt:0,hash:0,__v:0,role:0})
					.exec(function(err,resData){
						return res.status(200).json({
							data:data.concat(datesArr),
							dateRanges:weeks,
							projects:resData.projects,
							clients:resData.clients
						});
					})
				}
			}else{
				users.findOne({userId: { $eq: parseInt(req.cookies.userId)}},{ userId: 0, _id: 0, salt:0,hash:0,__v:0,role:0})
				.exec(function(err,userData){
					return res.status(200).json({
						data:resData,
						dateRanges:weeks,
						projects:userData.projects,
						clients:userData.clients
					});
				});
			}/*
			return res.status(200).json({
					data:resData,
					dateRanges:weeks
				}); */
		}
	 });
}
timeSheetRoute.post('/getDateInfoBetweenDates',function(req,res){
	if(!req.isAuthenticated()){
		 return res.status(401).json({
			status: 'UnAuthoirized'
		 });
	 }
	 var dateRanges = req.body.date.split('-'),
	 firstWeekDay = moment(new Date(dateRanges[0])),
	lastWeekDay = moment(new Date(dateRanges[1]));
	saveDateRange(firstWeekDay,lastWeekDay,req,res);

});

timeSheetRoute.post('/updateTimeSheet',function(req,res){
	if(!req.isAuthenticated()){
		 return res.status(401).json({
			status: 'UnAuthoirized'
		 });
	 }
	 var saveData = req.body.dataNeedToUpdate,
	 newData = req.body.newData,dataLen,
	 name = req.body.name;
	 if(saveData){
		dataLen = saveData.length;

		var bulkUpdate = userTimeDetails.collection.initializeUnorderedBulkOp();
		for(var i=0;i< dataLen;i++){
			saveData[i]._id = ObjectId(saveData[i]._id);
			saveData[i].firstName = name;
			saveData[i].date = new Date(saveData[i].date);
			saveData[i].adminTime = saveData[i].hours;
			saveData[i].admincomments = saveData[i].comments;
			saveData[i].adminProject = saveData[i].project;
			saveData[i].adminClient = saveData[i].clients;
			saveData[i].adminProjectType = saveData[i].projectType;
			 bulkUpdate.find({$and: [ { _id: { $eq: ObjectId(saveData[i]._id) } }, { userId: { $eq: parseInt(req.cookies.userId) } } ]})
			 .updateOne(saveData[i]);
		}
		bulkUpdate.execute(function(err,data){
			if(newData.length>0){
				addnewTimeData(req,res,newData,false,callback);
			}
			else{
				callback();
			}
		});
	 }

	 function callback(){
	 	var startDate = saveData[0].date,
		lastDate = saveData[saveData.length-1].date;
		getSubmittedData(res,startDate,lastDate,req);
	 }

});

timeSheetRoute.post('/submitTimeSheet',function(req,res){
	if(!req.isAuthenticated()){
		 return res.status(401).json({
			status: 'UnAuthoirized'
		 });
	 }
	 var saveData = req.body.dataNeedToUpdate,
	 newData = req.body.newData;
	 if(saveData){
		dataLen = saveData.length
		name = req.body.name,
		newdataLen = newData.length;

		var bulkUpdate = userTimeDetails.collection.initializeUnorderedBulkOp();
		for(var i=0;i< dataLen;i++){
			saveData[i]._id = ObjectId(saveData[i]._id);
			saveData[i].date = new Date(saveData[i].date);
			saveData[i].firstName = name;
			saveData[i].adminTime = saveData[i].hours;
			saveData[i].submitted = 1;
			saveData[i].admincomments = saveData[i].comments;
			saveData[i].adminProject = saveData[i].project;
			saveData[i].adminClient = saveData[i].clients;
			saveData[i].adminProjectType = saveData[i].projectType;
			 bulkUpdate.find({$and: [ { _id: { $eq: ObjectId(saveData[i]._id) } }, { userId: { $eq: parseInt(req.cookies.userId) } }]})
			 .updateOne(saveData[i]);
		}
		bulkUpdate.execute(function(err,data){

			if(newData.length>0){
				for(var i=0;i< newdataLen;i++){
					newData[i]._id = ObjectId(newData[i]._id);
					newData[i].firstName = name;
					newData[i].date = new Date(newData[i].date);
					newData[i].adminTime = newData[i].hours;
					newData[i].submitted = 1;
					newData[i].admincomments = newData[i].comments;
					newData[i].adminProject = newData[i].project;
					newData[i].adminClient = newData[i].clients;
					newData[i].adminProjectType = newData[i].projectType;
				}
				addnewTimeData(req,res,newData,true,callback);
			}
			else{
				var startDate = saveData[0].date,
				lastDate = saveData[saveData.length-1].date;
				getSubmittedData(res,startDate,lastDate,req);
			}
		});
	 }

	 function callback(){
	 	var startDate = saveData[0].date,
		lastDate = saveData[saveData.length-1].date;
		getSubmittedData(res,startDate,lastDate,req);
	 }

});
timeSheetRoute.get('/getProfileInfo',function(req,res){
	if(!req.isAuthenticated()){
			 return res.status(401).json({
				status: 'UnAuthoirized'
			 });
		}
	users.findOne({userId: { $eq: parseInt(req.cookies.userId)}},{ userId: 0, _id: 0, salt:0,hash:0,__v:0,role:0})
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

timeSheetRoute.post('/saveProfileInfo',function(req,res){
	if(!req.isAuthenticated()){
			 return res.status(401).json({
				status: 'UnAuthoirized'
			 });
		}
	var data = req.body;
	users.update(
	   { userId: parseInt(req.cookies.userId) },
	   { $set:
		  {
			firstName: data.firstName,
			lastName: data.lastName,
			emailAddress:data.emailAddress,
			phoneNo:data.phoneNo,
			address:data.address,
			address2:data.address2
		  }
	   }
	).exec(function(err,data){
		if(err){
			return;
		}
		return res.status(200).json({
			data:data,
			status: 'retrived Successfully'
		});
	});
})
 function compare(dateTimeA, dateTimeB) {
    var momentA = moment(dateTimeA,"DD/MM/YYYY");
    var momentB = moment(dateTimeB,"DD/MM/YYYY");
    if (momentA > momentB) return 1;
    else if (momentA < momentB) return -1;
    else return 0;
}

function getSubmittedData(res,startDate,endDate,req){
	userTimeDetails.find({$and:[{date: {$gte:moment(startDate).toDate(),$lte:moment(endDate).toDate()}},{ userId: { $eq: parseInt(req.cookies.userId) } }]})
	.sort({date:1}).exec(function(err,resData){
		debugger;
		return res.status(200).json({
			data:resData,
			status: 'Saved Successfully'
		});
	});
}

function addnewTimeData(req,res,data,flg,callback){
	var userId = req.cookies.userId;
	for(var i=0;i<data.length;i++){
		data[i].date = new Date(data[i].date);
		data[i].adminTime = data[i].hours;
		data[i].userId = parseInt(userId);
		data[i].submitted = 0;
		data[i].admincomments = data[i].comments;
		data[i].adminProject = data[i].project;
		data[i].adminClient = data[i].clients;
		data[i].adminProjectType = data[i].projectType;
		if(flg){
			data[i].submitted = 1;
		}
	}
	userTimeDetails.collection.insert(data,function(){
		callback();
		//getTimeSheetData();
		/*return res.status(200).json({
			status: 'Saved Successfully'
		});*/
	});
}
module.exports = timeSheetRoute;
