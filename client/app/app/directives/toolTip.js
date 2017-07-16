(function(){

    angular.module('common')
    .directive('tooltip',tooltip)
    .service('tooltipService',function(){
        this.show = angular.noop;

        this.hide = angular.noop
    });
    tooltip.$inject = ['tooltipService','$compile'];
    function tooltip(tooltipService,$compile) {
        return {
            //template:'<div ng-show="show" class="tooltip">haiiiiiii</div>',
            link: function (scope, element, attr) {
               // scope.show = false;
                var ele = $compile(getTemplate())(scope);
                angular.element(document).find('body').append(angular.element(ele));
               tooltipService.show = function(parentEle,msg){
                    scope.show = true;
                    var position = parentEle.target.getBoundingClientRect(),
                    posX =position.left,
                    posY = position.top;
                    scope.msgs = msg;
                    ele.css({
                        top:(posY-7)+"px",
                        left:(posX+20)+"px"
                    });
                    scope.$apply();
                    
               }

               tooltipService.hide = function(){
                    scope.show = false;
                    scope.$apply();
               }
            }
        };
    }
    function getTemplate(){
        var  template= ['<div ng-show="show" class="tooltip"><div ng-repeat="msg in msgs">{{msg}}</div></div>'].join("");
        return template;
    }
    
}())