(function() {   
    'use strict';
    angular.module('The.Power.Soul.UserDetail', ['ngMaterial'])
        .controller('userDetailCtrl', ['$scope', '$http', 'localStorageService', 'BaseUrl', 
        function($scope, $http, localStorageService, BaseUrl) {
            $scope.user = localStorageService.get('userInfo');
    	}])
}());