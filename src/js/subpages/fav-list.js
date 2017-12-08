(function() {   
    'use strict';
    angular.module('The.Power.Soul.Fav.List', ['ngMaterial'])
        .controller('favListCtrl', ['$scope', '$http', 'localStorageService', 'BaseUrl', '$rootScope', '$state',
        function($scope, $http, localStorageService, BaseUrl, $rootScope, $state) {
            $scope.isLoading = false;
            $scope.isLoadingHasError = false;
            $scope.isLoadingArticlesHasError = false;
            $scope.isLoadingArticles = false;
            $scope.favTopics = [];
            $scope.favArticles = [];
            var user = localStorageService.get('userInfo');

            $scope.goToTopicDetail = function(topic) {
                if (localStorageService.get('userInfo')) {
                    var url = $state.href('topic-detail', {id: topic._id});
                    window.open(url, '_blank');
                } else {
                    $mdDialog.show({ 
                        controller: 'loginOrSignupCtrl',
                        templateUrl: 'dist/pages/login-and-signup.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: false,
                        fullscreen: false
                    })
                    .then(function(data) {
                        $rootScope.$broadcast('$USERLOGGEDIN');
                    }, function() {
                        // canceled
                    });
                }
            };  

            $scope.goToArticleDetail = function(article) {
                if (localStorageService.get('userInfo')) {
                    var url = $state.href('article-detail', {id: article._id});
                    window.open(url, '_blank');
                } else {
                    $mdDialog.show({ 
                        controller: 'loginOrSignupCtrl',
                        templateUrl: 'dist/pages/login-and-signup.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: false,
                        fullscreen: false
                    })
                    .then(function(data) {
                        $rootScope.$broadcast('$USERLOGGEDIN');
                    }, function() {
                        // canceled
                    });
                }
            };

            $scope.goToArticleDetail = function(article) {

            };
 
            function loadFavTopics() {
                $scope.isLoading = true;
                $http.get(BaseUrl + '/user-fav-topics/' + user._id)
                    .then(function(response) {
                        $scope.isLoading = false;
                        $scope.favTopics = response.data;
                    }, function(error) {
                        $scope.isLoading = false;
                        $scope.isLoadingHasError = true;
                    });
            }

            function loadFavArticles() {
                $scope.isLoadingArticles = false;
                $http.get(BaseUrl + '/user-fav-articles/' + user._id)
                    .then(function(response) {
                        $scope.isLoadingArticles = false;
                        $scope.favArticles = response.data;
                    }, function(error) {
                        $scope.isLoadingArticlesHasError = true;
                        $scope.isLoadingArticles = false;
                    });
            }
            loadFavTopics();
            loadFavArticles();

    	}])
}());