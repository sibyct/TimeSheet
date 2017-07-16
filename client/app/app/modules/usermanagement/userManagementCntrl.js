(function(angular){
	angular.module('userManagement',['md.data.table','ngMessages']);

	angular.module('userManagement')
	.controller('userManagementCntrl',userManagementCntrl);
	userManagementCntrl.$inject = ['userData','$mdDialog','httpFactory','$mdToast'];
	function userManagementCntrl(userData,$mdDialog,httpFactory,$mdToast){
		var vm = this;
		vm.data = userData.data.data;
		vm.addUser = addUser;
		vm.deleteUser = deleteUser;
		vm.editUser = editUser;
		vm.addProject = addProject;
		vm.customFullscreen = false;
		vm.resetPassword = resetPassword;

		function resetPassword(data){
			var confirm = $mdDialog.confirm()
	          .title('Reset?')
	          .textContent('Do you want to Reset Password.')
	          .ariaLabel('Reset')
	          .ok('Reset')
	          .cancel('Cancel');
			    $mdDialog.show(confirm).then(function() {
			      resetUserPassword(data);
			    }, function() {
			      //$scope.status = 'You decided to keep your debt.';
			    });
			/*httpFactory.postData('/admin/resetPassword/',data)
			.then(function(res){

			})*/
		}

		function resetUserPassword(data){

			httpFactory.getData('/admin/resetPassword/'+data.username)
			.then(function(res){
				var ele = angular.element(document.getElementsByClassName("userdetail-view"));
				$mdToast.show(
				  $mdToast.simple()
					.textContent('Password Changed Successfully')
					.position('top right')
					.hideDelay(3000)
					.parent(ele)
				);
			})
		}
		function addProject(){
			httpFactory.getData('/admin/getProjectList')
			.then(function(data){
				$mdDialog.show({
				  controller: addProjectCntrl,
				  templateUrl: 'app/modules/usermanagement/addProject.html',
				  parent: angular.element(document.body),
				  clickOutsideToClose:false,
				  controllerAs:'addProject',
				  locals:{
				  	projectList:data.data
				  },
				  fullscreen: vm.customFullscreen // Only for -xs, -sm breakpoints.
				})
				.then(function(data) {

				}, function() {
				  //$scope.status = 'You cancelled the dialog.';
				});
			});

		}
		addProjectCntrl.$inject = ['projectList','$scope']
		function addProjectCntrl(projectList,scope){
			var projectCntrl = this;
			projectCntrl.clients = projectList.data;
			projectCntrl.readonly = false;
			projectCntrl.removable = true;
			projectCntrl.addnewProject = addnewProject;
			projectCntrl.newObj = newObj;
			projectCntrl.save = save;
			projectCntrl.deleteClient = deleteClient;
			projectCntrl.cancel = cancel;
			if(projectList.data.length==0){
				var obj = {
					clientName:"",
					newproject:true,
					projects:[]
				};
				projectCntrl.clients.push(obj);
			}
			function cancel() {
				$mdDialog.hide();
			}
			function addnewProject(){
				var obj = {
					clientName:"",
					newproject:true,
					projects:[]
				};
				projectCntrl.clients.push(obj);
			}

			function newObj(chip){
				return{
					projectName:chip
				}
			}

			function save(){
				var list = projectCntrl.clients,
				listTosave = [],
				updatedList =[];
				len = list.length;
				for(var i=0;i<len;i++){
					var client = projectCntrl.clients[i];
					if(client.newproject){
						var obj = {
							clientName:client.clientName,
							projects:client.projects
						}
						listTosave.push(obj);
					}
					if(scope.addclientForm['clientForm-'+i].$dirty&&!client.newproject){
						var obj = {
							clientName:client.clientName,
							_id:client._id,
							projects:client.projects
						}
						updatedList.push(obj);
					}
				}
				var data = {
					newClients:listTosave,
					updatedList:updatedList
				}
				httpFactory.postData('/admin/saveProjectList',data)
				.then(function(res){
					projectCntrl.clients = res.data.data;
					$mdToast.show(
						  $mdToast.simple()
							.textContent('Saved Successfully')
							.position('top right')
							.hideDelay(3000)
							.parent(angular.element(document).find('body'))
						);
				});
			}

			function deleteClient(data,index){
				if(data.newproject){
					projectCntrl.clients.splice(index,1);
				}
				else{
					httpFactory.getData('/admin/deleteProjectList/'+data._id)
					.then(function(res){
						if(res.data.status =='deleted'){
							projectCntrl.clients.splice(index,1);
							$mdToast.show(
							  $mdToast.simple()
								.textContent('Deleted Successfully')
								.position('top right')
								.hideDelay(3000)
								.parent(angular.element(document).find('body'))
							);
						}
					});
				}
			}
		}
		function deleteUser(data){
			var confirm = $mdDialog.confirm()
          .title('Delete?')
          .textContent('Do you want to delete the user.')
          .ariaLabel('delete')
          .ok('Delete')
          .cancel('Cancel');
		    $mdDialog.show(confirm).then(function() {
		      deleteUserDetails(data);
		    }, function() {
		      //$scope.status = 'You decided to keep your debt.';
		    });
		}

		function editUser(data){
			//alert(1)
			var userId ="";
			httpFactory.getData('/admin/getProjectList')
			.then(function(res){
				showDiaog(userId,res.data.data,data);
			});
		}
		function deleteUserDetails(data){
			httpFactory.getData('/admin/deleteUser/'+data.userId)
			.then(function(data){
				vm.data = data.data.data;
				$mdToast.show(
						  $mdToast.simple()
							.textContent('User Deleted Successfully')
							.position('top right')
							.hideDelay(3000)
							.parent(angular.element(document.getElementsByClassName("user-display")))
						);
			})
		}
		function addUser(){

			httpFactory.getData('/admin/getuserId').then(function(data){
				var userId = data.data.data[0].userId+1,
				projects = data.data.projects;
				showDiaog(userId,projects);
			});

		}

		function showDiaog(userId,project,userData){
			$mdDialog.show({
				  controller: DialogController,
				  templateUrl: 'app/modules/usermanagement/adduser.html',
				  parent: angular.element(document.body),
				  clickOutsideToClose:false,
				  controllerAs:'adduser',
				  locals:{
					  userId:userId,
					  userData:userData,
					  project:project
				  },
				  fullscreen: vm.customFullscreen // Only for -xs, -sm breakpoints.
				})
				.then(function(data) {
					if(data){
						var textContent = "";
						if(data.flg){
							vm.data = data.data;
							textContent = 'Updated Successfully';
						}
						else{
							vm.data.push(data.data);
							textContent = 'User Added Successfully';
						}

						$mdToast.show(
							  $mdToast.simple()
								.textContent(textContent)
								.position('top right')
								.hideDelay(3000)
								.parent(angular.element(document.getElementsByClassName("user-display")))
							);
					}
				}, function() {
				  //$scope.status = 'You cancelled the dialog.';
				});
		}
		DialogController.$inject = ['userId','$scope','userData','project']
		function DialogController(userId,$scope,userData,clients){
			var cntrl = this;
			cntrl.clientsList = [];
			cntrl.projectList = [];
			cntrl.projectLst = [];
			cntrl.clients = clients;
			cntrl.user = {};
			cntrl.onClientSelect = onClientSelect;
			cntrl.projectQuerySearch = projectQuerySearch;

			cntrl.contractType = ['PartTime','Permenent'];
			if(userData){
				cntrl.title = "Edit User";
				cntrl.editBtn = true;
				cntrl.user = userData;
				cntrl.projectList = userData.projects;
				cntrl.clientsList = userData.clients;
				createProjectList(cntrl.clientsList);
			}
			else{
				cntrl.title = "Add User"
				cntrl.editBtn = false;
				cntrl.user = {
					userId:userId,
					userName:'',
					emailAddress:'',
					phoneNo:'',
					firstName:'',
					projects:[],
					clients:[],
					lastName:'',
					address:'',
					address2:'',
					city:'',
					state:'',
					postalCode:''
				}
			}
			cntrl.saveProfileData = saveProfileData;
			cntrl.saveEditProfileData = saveEditProfileData;
			cntrl.querySearch = querySearch;
			cntrl.autocompleteDemoRequireMatch = true;
    		cntrl.transformChip = transformChip;
    		//cntrl.user.projects = [];
    		cntrl.cancelProfileData = cancelProfileData;
    		cntrl.onRemoveSelect =onRemoveSelect;
    		cntrl.selectedItem = null;
    		cntrl.searchText = null;
    		cntrl.projectSelectedItem = null;
    		cntrl.projectSearchText = null;

    		function onRemoveSelect(chip,index){
    			var id = chip._id,
    			prjLst = cntrl.projectLst,
    			len = prjLst.length;
				for (var i = len - 1; i >= 0; i--) {
				    if(id==prjLst[i].refId){
    					cntrl.projectLst.splice(i,1);
    				}
				}

				var lst = cntrl.projectList,
				len = lst.length;

				for (var i = len - 1; i >= 0; i--) {
				    if(id==lst[i].refId){
    					cntrl.projectList.splice(i,1);
    				}
				}
    		}

    		function createProjectList(clients){
    			for (var i = 0; i < clients.length; i++) {
    				onClientSelect(clients[i]);
    			};
    		}

    		function onClientSelect(chip){
    			var selectedItem = angular.copy(chip.projects),
    			len = selectedItem.length,
    			id = chip._id;
    			for(var i=0 ;i<len;i++){
    				selectedItem[i].refId = id;
    			}
    			cntrl.projectLst = cntrl.projectLst.concat(selectedItem);
    		}

    		function cancelProfileData(){
    			$mdDialog.hide();
    		}
			function querySearch (query) {
		      var results = query ? cntrl.clients.filter(createFilterFor(query)) : [];
		      return results;
		    }

		    function projectQuerySearch(query){
		    	var results = query ? cntrl.projectLst.filter(createFilterForProjects(query)) : [];
		      return results;
		    }

		    function createFilterForProjects(query){
		    	 var lowercaseQuery = angular.lowercase(query);
			     return function filterFn(project) {
			        return (angular.lowercase(project.projectName).indexOf(lowercaseQuery) === 0);
			     };
		    }

		    function transformChip(chip){
		    	if (angular.isObject(chip)) {
			        return chip;
			      }
			      // Otherwise, create a new one
			      return { name: chip, type: 'new' }
		    }
		    function createFilterFor(query) {
		      var lowercaseQuery = angular.lowercase(query);
		      return function filterFn(project) {
		        return (angular.lowercase(project.clientName).indexOf(lowercaseQuery) === 0);
		      };
		    }
			function saveProfileData(){
				$scope.userForm.$setSubmitted();
				$scope.userForm.userName.$setValidity('duplicate',true);
				if(!$scope.userForm.$valid){
					return
				}
				cntrl.user.projectList = cntrl.projectList;
				cntrl.user.clientsList = cntrl.clientsList;
				httpFactory.postData('/admin/register',cntrl.user)
				.then(function(data){
					if(data.data.res=='duplicatesFound'){
						$scope.userForm.userName.$setValidity('duplicate',false);
						return;
					}
					var dataObj = {
						data:data.data.data,
						flg:false
					}
					$mdDialog.hide(dataObj)
				});
			}

			function saveEditProfileData(){
				$scope.userForm.$setSubmitted();
				$scope.userForm.userName.$setValidity('duplicate',true);
				cntrl.user.projects = cntrl.projectList;
				httpFactory.postData('/admin/updateUserDetails',cntrl.user)
				.then(function(data){
					if(data.data.res=='duplicatesFound'){
						$scope.userForm.userName.$setValidity('duplicate',false);
						return;
					}
					var dataObj = {
						data:data.data.data,
						flg:true
					}
					$mdDialog.hide(dataObj)
				});
			}
		}
	}
}(angular))
