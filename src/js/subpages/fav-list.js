(function() {   
    'use strict';
    angular.module('The.Power.Soul.Fav.List', ['ngMaterial'])
        .controller('favListCtrl', ['$scope', '$http', 'localStorageService', 'BaseUrl', 
        function($scope, $http, localStorageService, BaseUrl) {
            $scope.isLoading = false;
            $scope.isLoadingHasError = false;
            $scope.isLoadingArticlesHasError = false;
            $scope.isLoadingArticles = false;
            $scope.favTopics = [];
            $scope.favArticles = [];
            var user = localStorageService.get('userInfo');

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