(function() {   
    'use strict';
    angular.module('The.Power.Soul.UserDetail', ['ngMaterial'])
        .controller('userDetailCtrl', ['$scope', '$http', '$stateParams', 'localStorageService', 'BaseUrl', 
        function($scope, $http, $stateParams, localStorageService, BaseUrl) {
            $scope.isLoading = false;
            $scope.isLoadingHasError = false;
            $scope.user = null;
            $scope.showActionButton = false;
            $scope.disableFollowButton = false;
            $scope.disableButtonText = "";
            var user_id = $stateParams.id;
            var loggedUser = localStorageService.get('userInfo');
            if (loggedUser._id === user_id) { // 进入当前页面的是登录用户本人
                $scope.user = localStorageService.get('userInfo');
            } else { // 查看其它人的页面
                $scope.isLoading = true;
                $http.get(BaseUrl + '/user-detail/' + loggedUser._id + '/' + user_id)
                    .then(function(response) {
                        $scope.showActionButton = true;
                        $scope.disableFollowButton = response.data.IsFollowing;
                        $scope.disableButtonText = $scope.disableFollowButton ? "已关注" : '关注';
                        $scope.user = response.data.Data;
                        $scope.isLoading = false;
                    }, function(error) {
                        $scope.isLoading = false;
                        $scope.isLoadingHasError = true;
                    });
            }
    	}])
}());