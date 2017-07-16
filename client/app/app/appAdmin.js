'use strict';

/**
 * @ngdoc overview
 * @name timesheetApp
 * @description
 * # timesheetApp
 *
 * Main module of the application.
 */
(function(){
angular
  .module('timesheetAdminApp', ['ngMaterial','ui.router.state','common','userManagement','adminTimeSheetView'])
  .config(function($stateProvider,$urlRouterProvider,$httpProvider,$mdThemingProvider){
	   $mdThemingProvider.theme('docs-dark', 'default')
      .primaryPalette('yellow')
      .dark();
		$urlRouterProvider.otherwise("/userList");
		// $stateProvider
    //   .state('adminHeader',{
    //     url: "/admin",
    //     controller:'adminCntrl',
    //     templateUrl: "app/modules/usermanagement/AdminHeader.html",
    //   })
			 $stateProvider.state('userList', {
			  url: "/userList",
			  controller:'userManagementCntrl',
			  controllerAs:'userlist',
			  templateUrl: "app/modules/usermanagement/usermanagement.html",
			  resolve:{
				  userData:function(httpFactory){
					  var url = '/admin/getuserInfo';
					  return httpFactory.getData(url)
				  }
			  }
			})
			.state('adminTimesheetView', {
			  url: "/adminTimesheetView",
			 controller:'adminTimesheetCntrl',
			  controllerAs:'vm',
			  templateUrl: "app/modules/adminTimeSheet/adminTimesheetView.html",
			  resolve:{
				   userData:function(httpFactory){
					  var url = '/admin/getProjectListAndUserList';
					  return httpFactory.getData(url)
				  }
			  }
			})
	 $httpProvider.interceptors.push('httpIntercepterFactory');

  })
  .factory('moment',function(){
	  return moment;
  })
  .controller('adminCntrl',adminCntrl);
  adminCntrl.$inject = ['$scope','$mdDialog','httpFactory','$window','$state','$location'];
  function adminCntrl($scope,$mdDialog,httpFactory,$window,$state,$location){
	 //$scope.items = ['User Management','Time Sheets'];
	 $scope.items = [{
	 	name:'User Management',
	 	state:'userList',
	 	imgUrl:'images/userid.svg'
	 },{
	 	name:'Time Sheets',
	 	state:'adminTimesheetView',
	 	imgUrl:'images/time.svg'
	 }];
	 $scope.customFullscreen = false;
	 $scope.logout = logout;
	 $scope.changePassword = changePassword;
	 $scope.navClick = navClick;
	 $scope.selectedIndex=0;	
	 function navClick(item,index){
		$scope.selectedIndex = index; 
	 	$state.go(item.state);
	 }
	 function logout(){
		 var url = '/user/logout'
		 httpFactory.getData(url)
		 .then(function(res,status){
			 if(res.status==200){
				$window.location.href = $location.absUrl().toLocaleLowerCase().split("/app")[0]+'/app/login';  /* location.absUrl().split("#")[0]+'index.html' */;
			}
		 })
	 }


	 function changePassword(){
		 $mdDialog.show({
		  controller: DialogController,
		  template: getTemplate(),
		  parent: angular.element(document.body),
		  clickOutsideToClose:false,
		  controllerAs:'changePassword',
		  fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
		})
		.then(function(answer) {
			$mdToast.show(
				  $mdToast.simple()
					.textContent('password Changed Successfully')
					.position('top right')
					.hideDelay(3000)
					.parent(angular.element(document.getElementsByClassName("content")))
				);
		}, function() {
		  //$scope.status = 'You cancelled the dialog.';
		});
	 }
	 function getTemplate(){
		 var template = ['<md-dialog aria-label="ChangePassword" flex="30">',
							'<md-toolbar>',
								 '<div class="md-toolbar-tools" style="background-color:#498fd1">',
									'<h2>Change Password</h2>',
								  '</div>',
							'</md-toolbar>',
							 '<form name="passwrdForm" ng-cloak style="margin:7px;">',
								'<md-input-container flex style="margin:10px;">',
									'<input name="newpassword" type="password" placeholder="New Password" name="newpassword" ng-required="true" ng-model="changePassword.newpassword">',
									'<div ng-messages="passwrdForm.newpassword.$error">',
										 '<div ng-message="required">This Field is required!</div>',
									'</div>',
								'</md-input-container>',
								'<md-input-container flex style="margin:10px;">',
									'<input type="password" placeholder="Confirm New Password" name="confirmnewpassword" ng-required="true" ng-model="changePassword.confirmnewpassword">',
									'<div ng-messages="passwrdForm.confirmnewpassword.$error">',
										 '<div ng-message="required">This Field is required!</div>',
										 '<div ng-message="mismatch">Password does not matching</div>',
									'</div>',
								'</md-input-container>',
								'<md-button class="md-raised md-primary" aria-label="Settings" ng-click="changePassword.changePassword()">',
									'<span>Change Password</span>',
								'</md-button>',
								'</form>',
						'</md-dialog>'].join("");
						return template;
	 }
	 DialogController.$inject = ['$scope','httpFactory','$mdDialog']
	 function DialogController(scope,httpFactory,$mdDialog){
		var vm = this;
		vm.changePassword = function(){
			scope.passwrdForm.$setSubmitted();
			scope.passwrdForm.confirmnewpassword.$setValidity('mismatch',true);
			if(!scope.passwrdForm.$valid){
				return
			}
			if(vm.newpassword != vm.confirmnewpassword){
				scope.passwrdForm.confirmnewpassword.$setValidity('mismatch',false);
				return;
			}
			var url = '/user/changePassword';
			httpFactory.postData(url,{'password':vm.newpassword}).then(function(res,status){
				if(res.status==200){
					$mdDialog.hide({passwordChanged:true})
				}
			});

		}
	 }
  }
  })()
