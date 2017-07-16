(function(angular){
	angular.module('common')
	.factory('httpFactory',httpFactory);
	httpFactory.$inject = ['$http'];
	
	function httpFactory($http){
		return{
			getData:getData,
			postData:postData
		};
		
		function getData(url){
			return $http.get(url);
		}
		
		function postData(url,data){
			return $http.post(url,data);
		}
	}
})(angular);