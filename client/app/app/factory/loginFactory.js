(function(){
	angular.module('login')
	.factory('loginFactory',loginFactory);
	 var user = null;
	 loginFactory.$inject = ['$q','$timeout','$http'];
	 function loginFactory($q,$timeout,$http){
		 return{
			isLoggedIn: isLoggedIn,
			getUserStatus: getUserStatus,
			login: login
		 };
		 
    function isLoggedIn() {
      if(user) {
        return true;
      } else {
        return false;
      }
    }

    function getUserStatus() {
      return $http.get('/user/status')
      // handle success
      .success(function (data) {
        if(data.status){
          user = true;
        } else {
          user = false;
        }
      })
      // handle error
      .error(function (data) {
        user = false;
      });
    }
	function login(username, password) {

	  // create a new instance of deferred
	  var deferred = $q.defer();

	  // send a post request to the server
	  $http.post('/user/login',
		{username: username, password: password})
		// handle success
		.success(function (data, status) {
		  if(status === 200 && data.status){
			user = true;
			deferred.resolve(status);
		  } else {
			user = false;
			deferred.reject();
		  }
		})
		// handle error
		.error(function (data) {
		  user = false;
		  deferred.reject();
		});

	  // return promise object
	  return deferred.promise;

	}
	 }

})(angular);