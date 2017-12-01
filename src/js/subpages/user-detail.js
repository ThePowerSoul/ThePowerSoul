(function() {   
    'use strict';
    angular.module('The.Power.Soul.UserDetail', ['ngMaterial'])
        .controller('userDetailCtrl', ['$scope', '$http', '$stateParams', 'localStorageService', 'BaseUrl', 'alertService',
        function($scope, $http, $stateParams, localStorageService, BaseUrl, alertService) {
            $scope.isLoading = false;
            $scope.isLoadingHasError = false;
            $scope.user = null;
            $scope.showActionButton = false;
            $scope.isFollowing = false;
            $scope.followButtonText = "";
            var user_id = $stateParams.id;
            var loggedUser = localStorageService.get('userInfo');
            if (loggedUser._id === user_id) { // 进入当前页面的是登录用户本人
                $scope.user = localStorageService.get('userInfo');
            } else { // 查看其它人的页面
                $scope.isLoading = true;
                $http.get(BaseUrl + '/user-detail/' + loggedUser._id + '/' + user_id)
                    .then(function(response) {
                        $scope.showActionButton = true;
                        $scope.isFollowing = response.data.IsFollowing;
                        $scope.followButtonText = $scope.isFollowing ? "取消关注" : '关注';
                        $scope.user = response.data.Data;
                        $scope.isLoading = false;
                    }, function(error) {
                        $scope.isLoading = false;
                        $scope.isLoadingHasError = true;
                    });
            }

            $scope.followOperation = function(ev) {
                $scope.isOperating = true;
                if ($scope.isFollowing) {
                    $http.put(BaseUrl + '/user-unfollow/' + loggedUser._id + '/' + user_id)
                        .then(function(response) {
                            $scope.followButtonText = "关注";
                            $scope.isOperating = false;
                            $scope.isFollowing = false;
                        }, function(error) {
                            alertService.showAlert('取消关注失败', ev);
                            $scope.isOperating = false;
                        });
                } else {
                    $http.put(BaseUrl + '/user-follow/' + loggedUser._id + '/' + user_id)
                        .then(function(response) {
                            $scope.followButtonText = "取消关注";
                            $scope.isOperating = false;
                            $scope.isFollowing = true;
                        }, function(error) {
                            alertService.showAlert('关注失败', ev);
                            $scope.isOperating = false;
                        });
                }
            };  
    	}])
}());