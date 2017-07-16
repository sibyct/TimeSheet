(function(angular){
	angular.module('common',[])
	.directive('loadingMask',loadingMask);
	loadingMask.$inject = ['$rootScope','$compile'];
	
	function loadingMask($rootScope,$compile){
		return {
			link:linkFunction
		};
		function linkFunction(scope,ele,attr){
			scope.loading = false;
			var ele = $compile(getTemplate())(scope);
			angular.element(document).find('body').append(angular.element(ele));
			 $rootScope.$on('START_LOAD',function(){
				scope.loading = true;
			});
			$rootScope.$on('STOP_LOAD',function(){
				scope.loading = false;
			});
		}
		
		function getTemplate(){
			var  template= ['<div class="load-mask" ng-if="loading" layout="row" layout-align="center center">',
							'<md-progress-circular md-diameter="100" md-mode="indeterminate"></md-progress-circular>',
							'</div>'].join("");
			return template;
		}
	}
})(angular);