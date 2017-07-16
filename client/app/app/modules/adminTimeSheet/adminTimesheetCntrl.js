(function(angular){
	angular.module('adminTimeSheetView',['md.data.table','common','ngMessages']);
	
	angular.module('adminTimeSheetView')
	.controller('adminTimesheetCntrl',adminTimesheetCntrl);
	adminTimesheetCntrl.$inject = ['userData','httpFactory','moment','$http','$mdToast'];
	function adminTimesheetCntrl(userData,httpFactory,moment,$http,$mdToast){
		var vm = this,
		data = userData.data;
		vm.userData = data.userList;
		vm.clientList = data.clientsList;
		vm.projectTypes = ['Maintainence','support'];
		vm.searchClick = searchClick;
		vm.search = {};
		var projectListArr = [];
		vm.formatDate = formatDate;
		vm.save = save;
		vm.exportToExcel = exportToExcel; 

		for (var i = 0; i < vm.clientList.length; i++) {
			projectListArr = projectListArr.concat(vm.clientList[i].projects)
		}
		vm.projects =  projectListArr;

		function searchClick(){
			var url = '/admin/getSearchDetails';
			httpFactory.postData(url,vm.search)
			.then(function(res){
				vm.timedata = res.data.data;
			});
		}

		function formatDate(date){
			return moment(date).format('MM/DD/YYYY')
		}

		function save(){
			var url = '/admin/saveAdminData';
			var data={
				dataToUpdate:vm.timedata,
				searchCriteria:vm.search
			};
			httpFactory.postData(url,data)
			.then(function(res){
				var ele = angular.element(document.getElementsByClassName("search-view"));
				vm.timedata = res.data.data;
				$mdToast.show(
				  $mdToast.simple()
					.textContent('Saved Successfully')
					.position('top right')
					.hideDelay(3000)
					.parent(ele)
				);
				vm.timedata = res.data.data;
			});
		}

		function exportToExcel(){
			var url = '/admin/exportToExcel';
			/*httpFactory.getData(url)
			.then(function(res){
				vm.timedata = res.data.data;
			});*/
			$http({
			    url: url,
			    method: "post",
			    data:vm.search,
			    headers: {
			       'Content-type': 'application/json'
			    },
			    responseType: 'arraybuffer'
			}).then(function (data, status, headers, config) {
			    // sa = true;
				 var myBlob =  new Blob( [data] ,  {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
				 var url = window.URL.createObjectURL(myBlob);
				 var a = document.createElement("a");
				 document.body.appendChild(a);
				 a.href = url;
				 a.download = "newfile.xls";
				 a.click();
				//adding some delay in removing the dynamically created link solved the problem in FireFox
				 setTimeout(function() {window.URL.revokeObjectURL(url);},0);
				},function (data, status, headers, config) {
				    //upload failed
				});
		}

	}
}(angular));