(function() {   
    'use strict';
    var subModules = [
    	'The.Power.Soul.Introduction',
    	'The.Power.Soul.BBS', 
    	'The.Power.Soul.Caculator',
        'The.Power.Soul.Tools'
    ];
    angular.module('The.Power.Soul', ['ngMaterial', 'ui.router'].concat(subModules))
    	.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	        $urlRouterProvider.when('', 'introduction');
	        $stateProvider
	            .state('introduction', {
	                url: '/introduction',
	                templateUrl: 'dist/pages/introduction.html',
	                controller: 'introductionCtrl',
	            })
	            .state('caculator', {
	                url: '/caculator',
	                templateUrl: 'dist/pages/caculator.html',
	                controller: 'caculatorCtrl',
	            })
	            .state('bbs', {
	                url: '/bbs',
	                templateUrl: 'dist/pages/bbs.html',
	                controller: 'bbsCtrl',
	            });
	    }])
    	.controller('mainCtrl', ['$scope', '$state',
    		function($scope, $state) {
    			$scope.goToIntroduction = function() {
    				$state.go('introduction');
    			};

    			$scope.goToCaculator = function() {
    				$state.go('caculator');
    			};

    			$scope.goToBBS = function() {
    				$state.go('bbs');
    			};
    	}])
}());