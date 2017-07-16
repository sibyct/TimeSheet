(function(angular){
	angular.module('userTimeSheet',['md.data.table','common','ngMessages']);
	
	angular.module('userTimeSheet')
	.controller('timesheetCntrl',timesheetCntrl);
	timesheetCntrl.$inject = ['userDetails','screenData','moment','httpFactory','$mdToast','$rootScope','$scope'];
	function timesheetCntrl(userDetails,screenData,moment,httpFactory,$mdToast,$rootScope,$scope){
		var vm=this;
		vm.projects = screenData.data.projects;
		vm.clients = screenData.data.clients;
		vm.dates = screenData.data.dateRanges;
		vm.startEndDate = vm.dates[0];
		vm.save = save;
		vm.total = "";
		vm.timedata = screenData.data.data;
		calcTotal(vm.timedata);
		vm.formatDate = formatDate;
		vm.getDateInfoBetweenDates = getDateInfoBetweenDates;
		vm.submitTimeSheet = submitTimeSheet;
		vm.addDate = addDate;
		vm.checkAddBtn = checkAddBtn;
		vm.checkdelBtn = checkdelBtn;
		vm.deleteNewDate = deleteNewDate;
		if(userDetails.contractType =="PartTime"){
			vm.maxHours = 8;
 		}else{
 			vm.maxHours = 9;
		}
		function checkAddBtn(data){
			if(data.submitted==1){
				return false;
			}
			else if(data.newData){
				return false;
			}
			else{
				return true;
			}
		}

		function checkdelBtn(data){
			if(data.submitted==1){
				return false;
			}
			else if(data.newData){
				return true;
			}
			else{
				return false;
			}
		}
		vm.projectTypes = ['Maintainence','support'];
		function getDateInfoBetweenDates(){
			var url = '/time/getDateInfoBetweenDates';
			httpFactory.postData(url,{date:vm.startEndDate}).then(function(res){
				vm.timedata = res.data.data;
				calcTotal(vm.timedata);
			});
		}
		
		function formatDate(date){
			return moment(date).format('MM/DD/YYYY')
		}
		
		function calcTotal(data){
			var len = data.length,total=0;
			for(var i=0;i<len;i++){
				total+=parseInt(checkDefined(data[i].hours));
			}
			vm.total = total;
		}
		function checkDefined(val){
			return val?val:0;
		}
		 function save(){
		 	if(!$scope.usertimesheet.$valid){
		 		createTosat();
				return;
		 	}
			 var url = '/time/updateTimeSheet';
			 var newData = [],
			 dataNeedToUpdate = [],
			 len = vm.timedata.length;
			 for(var i=0;i<len;i++){
			 	if(vm.timedata[i].newData){
			 		delete vm.timedata[i].newData;
			 		newData.push(vm.timedata[i]);
			 	}
			 	else{
			 		dataNeedToUpdate.push(vm.timedata[i]);
			 	}
			 }
			 var dataNeedtoSave = {
			 	name:userDetails.firstName,
			 	newData:newData,
			 	dataNeedToUpdate:dataNeedToUpdate
			 }
			httpFactory.postData(url,dataNeedtoSave).then(function(res){
				var ele = angular.element(document.getElementsByClassName("table-container"));
				vm.timedata = res.data.data;
				$mdToast.show(
				  $mdToast.simple()
					.textContent('Saved Successfully')
					.position('top right')
					.hideDelay(3000)
					.parent(ele)
				);
			});
		}
		
			
		function createTosat(){
			var ele = angular.element(document.getElementsByClassName("table-container"));
		 		
			$mdToast.show({
	          hideDelay   : 4000,
	          parent      :ele,
	          position    : 'top right',
	          template : '<md-toast>'+
	          				'<md-icon class="error-toast" md-svg-src="../images/error.svg" aria-label="android"></md-icon>'+
						  '<span style="color:red" class="md-toast-text flex">Please Check the errors</span>'+
						'</md-toast>'
	        });
		}
		function submitTimeSheet(){

		 	if(!$scope.usertimesheet.$valid){
		 		createTosat();
				return;
		 	}
			 var url = '/time/submitTimeSheet';
			 var newData = [],
			 dataNeedToUpdate = [],
			 len = vm.timedata.length;
			 for(var i=0;i<len;i++){
			 	if(vm.timedata[i].newData){
			 		delete vm.timedata[i].newData;
			 		newData.push(vm.timedata[i]);
			 	}
			 	else{
			 		dataNeedToUpdate.push(vm.timedata[i]);
			 	}
			 }
			 var dataNeedtoSave = {
			 	name:userDetails.firstName,
			 	newData:newData,
			 	dataNeedToUpdate:dataNeedToUpdate
			 }
			httpFactory.postData(url,dataNeedtoSave).then(function(res){
				vm.timedata = res.data.data;
				 var ele = angular.element(document.getElementsByClassName("table-container"));
				$mdToast.show(
				  $mdToast.simple()
					.textContent('Submitted Successfully')
					.position('top right')
					.hideDelay(3000)
					.parent(ele)
				);
			});
		}

		function addDate(data,index){
			var data = {
				date:formatDate(data.date),
				clients:"",
				project:"",
				projectType:"",
				hours:0,
				comments:"",
				newData:true
			}
			//vm.timedata.push(data);
			vm.timedata.splice(index+1, 0, data);
		}

		function deleteNewDate(data,index){
			vm.timedata.splice(index,1);
		}
	}
}(angular))