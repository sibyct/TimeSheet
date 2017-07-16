(function () {
	 angular
  	.module('timesheetApp', ['ngMaterial','ui.router.state','userTimeSheet','profile','common'])

    fetchData();

    function fetchData() {
        var initInjector = angular.injector(["ng"]);
        var $http = initInjector.get("$http");
        var $window = initInjector.get("$window");
        //var $location = initInjector.get("$location");
        $http.get('/user/isAuthenticated')
        .then(function(res){
            var location = $window.location.href;
        	if(res.data.authenticate&&res.data.userData.role==1){
                angular.module('timesheetApp').constant("userDetails",res.data.userData);
        		bootstrapApplication();
        	}
        	else{
        		$window.location.href = location.toLocaleLowerCase().split("/app")[0]+'/app/login';
        	}
        });
    }

    function bootstrapApplication() {
        angular.element(document).ready(function() {
            angular.bootstrap(document, ["timesheetApp"]);
            //angular.element(document.getElementsByClassName("toolbar"))[0].style.display="";

        });
    }
}())
