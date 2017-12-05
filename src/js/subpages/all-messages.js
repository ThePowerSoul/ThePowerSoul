(function() {   
    'use strict';
    angular.module('The.Power.Soul.All.Messages', ['ngMaterial'])
        .controller('allMessagesCtrl', ['$scope', '$stateParams', '$http', 
        function($scope, $stateParams, $http) {
            var user_id = $stateParams.id;

            function init() {
                $http.get(BaseUrl + '')
            }
            init();
    	}])
}());