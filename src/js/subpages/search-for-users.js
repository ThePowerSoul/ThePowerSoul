(function() {   
    'use strict';
    angular.module('The.Power.Soul.Search.For.Users', ['ngMaterial'])
        .controller('searchForUsersCtrl', ['$scope', '$mdDialog', '$http', '$state', 'BaseUrl', 'localStorageService',
        function($scope, $mdDialog, $http, $state, BaseUrl, localStorageService) {
            $scope.isSearching = false;
            $scope.isSearchingHasError = false;
            $scope.searchContext = "";
            $scope.currentSelectedUser = null;
            $scope.users = [];
            var currentLoggedUser = localStorageService.get('userInfo');
            
            $scope.searchForUsers = function(ev) {
                if (ev.keyCode === 13) {
                    if ($scope.searchContext === "") {
                        $scope.users = [];
                    } else {
                        $scope.isSearching = true;
                        $http.post(BaseUrl + '/users', {EmailKeyword: $scope.searchContext})
                            .then(function(response) {
                                $scope.isSearching = false;
                                $scope.users = filterDataToRemoveCurrentUser(response.data);
                            }, function(error) {
                                $scope.isSearching = false;
                            });
                    }
                }
            };

            function filterDataToRemoveCurrentUser(arr) {
                angular.forEach(arr, function(user) {
                    if (user._id === currentLoggedUser._id) {
                        var index = arr.indexOf(user);
                        arr.splice(index, 1);
                    }
                }); 
                return arr;
            }

            $scope.goToUserPage = function(ev, user) {
                ev.stopPropagation();
                $mdDialog.hide();
                var url = $state.href('user-detail', {id: user._id});
                window.open(url, '_blank');
            };

            $scope.sendPrivateMessage = function(ev, user) {
                ev.stopPropagation();
            };

            $scope.closeDialog = function() {
                $mdDialog.cancel();
            };
    	}])
}());