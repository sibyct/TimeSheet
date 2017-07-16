'use strict';

/**
 * @ngdoc overview
 * @name timesheetApp
 * @description
 * # timesheetApp
 *
 * Main module of the application.
 */
angular
  .module('loginApp', ['ui.router','ngMaterial','login','ngMessages'])
  .config(function($urlRouterProvider,$stateProvider){
	   $urlRouterProvider.otherwise("/login")
		$stateProvider
			.state('login', {
			  url: "/login",
			  controller:'loginCntrl',
			  controllerAs:'login',
			  templateUrl: "app/modules/login/login.html"
			});

  })
  
