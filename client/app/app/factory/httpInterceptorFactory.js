(function(angular){
	angular.module('common')
	.factory('httpIntercepterFactory',httpIntercepterFactory);
	httpIntercepterFactory.$inject = ['$q','$window','$location','$rootScope'];
	
	function httpIntercepterFactory($q,$window,$location,$rootScope){
		return{
			'request':request,
			'responseError':responseError,
			response:response
		};
		
		function responseError(Err,status){
			if(Err.status == 401){
				 $window.location.href =  $location.absUrl().toLocaleLowerCase().split("/app")[0]+'/app/login';
			}
			return $q.reject(Err);
		}
		
		function request(config){
			if(config.url.search(".svg")==-1){
				$rootScope.$broadcast("START_LOAD");
			}
			return config
		}
		function response(config){
			$rootScope.$broadcast("STOP_LOAD");
			return config;
			
		}
	}
})(angular);