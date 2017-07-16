(function(){

    angular.module('common')
    .directive('numbersOnly',numbersOnly);
    numbersOnly.$inject = ['$parse'];
        function numbersOnly($parse) {
            return {
                require: 'ngModel',
                restrict:'A',
                link: function (scope, element, attr, ngModelCtrl) {
                    function parser(text) {
                        if (text) {
                            var transformedInput = text.replace(/[^0-9\.]/g, '');

                            if (transformedInput !== text) {
                                ngModelCtrl.$setViewValue(transformedInput);
                                ngModelCtrl.$render();
                            }
                            return transformedInput;
                        }
                        return text;
                    } 
                    function validateData(evt,data){
                        var val = parseFloat(ngModelCtrl.$viewValue).toFixed(2);
                        ngModelCtrl.$setViewValue(val);
                        ngModelCtrl.$render();
                    }

                    element.bind('blur',validateData)          
                    ngModelCtrl.$parsers.push(parser);

                   if(attr.max){
                        var maxVal = parseFloat($parse(attr.max)(scope));
                        ngModelCtrl.$validators.max = function(modelValue) { 
                            var val = parseFloat(modelValue);
                            if(modelValue){
                                return ((val<maxVal)?true:false);
                            }
                            else{
                                return true;
                            }
                        }
                   }
                }
            };
    }
}());