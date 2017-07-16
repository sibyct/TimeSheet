(function(angular){
	angular.module('profile',['common']);

	angular.module('profile')
	.controller('profileCntrl',profileCntrl);
	profileCntrl.$inject = ['profileData','httpFactory','$mdToast','$scope','$state']
	function profileCntrl(profileData,httpFactory,$mdToast,scope,state){
		var vm = this;
		vm.states = ["Kerala","Karnataka"];
		vm.user = profileData.data.data;
		vm.saveProfileData = saveProfileData;
		vm.goBack = goBack;

		function goBack(){
			state.go('timesheet.userTimeSheet');
		}

		function saveProfileData(){
			scope.userForm.$setSubmitted();
			if(!scope.userForm.$valid){
				return
			}
			var url = '/time/saveProfileInfo';
			httpFactory.postData(url,vm.user).then(function(res){
				var ele = angular.element(document.getElementsByClassName("inputdemoIcons"));
				$mdToast.show(
				  $mdToast.simple()
				.textContent('Saved Successfully')
				.position('top right')
				.hideDelay(3000)
				.parent(ele)
				);
			});
		}
	}
}(angular))
