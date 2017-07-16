(function(angular){
	angular.module('common')
	.directive('errorMsg',errorMsg);
	errorMsg.$inject = ['$parse','tooltipService'];
	
	function errorMsg($parse,tooltipService){
		return {
			restrict:'AE',
			scope:{
				'message':'='
			},
			replace:true,
			template:'<div class="error-parent" ng-show="show"><md-icon class="error error-child" md-svg-src="/images/error.svg" aria-label="android "></md-icon></div>',
			link:linkFunction
		};
		function linkFunction(scope,ele,attr){
			scope.$watch('message',function(newVal, oldVal){
				if(newVal){
					var flg = false;
					for (var key in newVal) {
					  if (newVal.hasOwnProperty(key)&&newVal[key]) {
					  		flg = true;
					  		break;
					  }
					}
					scope.show = flg;
				}
			},true);

			ele.bind('mouseover',function(evt){
				var msgArr = [];
				var msg = scope.message;
				for (var key in msg) {
				  if (msg.hasOwnProperty(key)&&msg[key]) {
				  		var msgStr = attr[key+"Msg"];
				  		msgArr.push(msgStr);
				  }
				}
				tooltipService.show(evt,msgArr);
			});

			ele.bind('mouseleave',function(){
				tooltipService.hide();
			});
		}
	}
})(angular);