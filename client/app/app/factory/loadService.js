(function(){
	angular.module('common',[])
	.service('loadMaskService',loadMaskService);
	 loadMaskService.$inject = ['$rootScope','$mdDialog'];
	 function loadMaskService($rootScope,$mdDialog){
		 alert(1)
		 this.loading = false;
		 $rootScope.$on('START_LOAD',startLoad);
		 function startLoad(){
			 this.loading = false;
			 var parentEl = angular.element(document.body);
			  $mdDialog.show({
				 parent: parentEl,
				 fullscreen:true, 
				 template:
				   '<md-dialog style="background-color:#949494;opacity:.90;box-shadow:none" aria-label="List dialog">' +
				   '<div layout="row" layout-sm="column" style="z-index:10;opacity:.9" layout-align="space-around" style="width:100px;height:100px;">'+
						'<md-progress-circular md-diameter="100" style="z-index:10;opacity:.7" md-mode="indeterminate"></md-progress-circular>'+
					'</div>'+
				   '</md-dialog>'
			  });
		 }
		 $rootScope.$on('STOP_LOAD',function(){
			 this.loading = false;
			 $mdDialog.hide();
		 });
	 }

})(angular);