(function(angular){
	angular.module('login',[]);
	
	angular.module('login')
	.controller('loginCntrl',loginController);
	
	loginController.$inject = ['$http','$window','$location','$scope'];
	function loginController($http,$window,location,$scope){
		var vm=this;
		vm.loginBtnClick = loginBtnClick;
		
		function loginBtnClick(){
			$scope.loginForm.$setSubmitted();
			$scope.loginForm.password.$setValidity('wrongPassword',true);
			if(!$scope.loginForm.$valid){
				return
			}
				
			$http.post('/user/login',
				{username:  vm.name, password: vm.password})
				.then(function (data, status) {
					if(data.status==200&&data.data.role==1){
						$window.location.href = location.absUrl().toLocaleLowerCase().split("/app")[0]+'/app/user';  /* location.absUrl().split("#")[0]+'index.html' */;
					}
					else if(data.status==200&&data.data.role==0){
						$window.location.href = location.absUrl().toLocaleLowerCase().split("/app")[0]+'/app/admin';
					}
					else{
						$scope.loginForm.password.$error.wrongPassword = true;
					}
				},function (data) {
					$scope.loginForm.password.$setValidity('wrongPassword',false);
				});
			
		}
	}
})(angular)