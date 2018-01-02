(function () {
    'use strict';
    angular.module('The.Power.Soul.Search.Results', ['ngMaterial'])
        .controller('searchResultsCtrl', ['$scope', '$http', '$stateParams', 'BaseUrl', function ($scope, $http, $stateParams, BaseUrl) {
            $scope.topics = [];
            $scope.articles = [];
            var keyword = $stateParams.get('keyword');
            var category = $stateParams.get('category');
            var topicPageNum = 1;
            var articlePageNum = 1;
            $scope.disableLoadMoreTopic = false;
            $scope.disableLoadMoreArticle = false;
            $scope.showTopicPanel = true;
            $scope.switchButtonText = "看文章";

            $scope.switchPanel = function () {
                $scope.showTopicPanel = !$scope.showTopicPanel;
                if ($scope.showTopicPanel) {
                    $scope.switchButtonText = "看文章";
                } else {
                    $scope.switchButtonText = "看帖子";
                }
            };

            $scope.loadMoreTopics = function () {
                getTopicSearchResults(++topicPageNum, category, keyword, true);
            };

            $scope.loadMoreArticles = function () {
                getArticleSearchResults(++articlePageNum, category, keyword, true);
            };

            function getTopicSearchResults(pageNum, category, keyword, isLoadingMore) {
                var body = {
                    Page: pageNum,
                    Category: category,
                    Keyword: keyword,
                    LoadAll: false
                }
                return $http.get(BaseUrl + '/topic', body)
                    .then(function (response) {
                        if (isLoadingMore) {
                            $scope.topics = $scope.topics.concat(response.data);
                            if (response.data.length < 5) {
                                $scope.disableLoadMoreTopic = true;
                            }
                        } else {
                            $scope.topics = response.data;
                        }
                    }, function (error) {

                    });
            }

            function getArticleSearchResults(pageNum, category, keyword, isLoadingMore) {
                var body = {
                    Page: pageNum,
                    Category: category,
                    Keyword: keyword,
                    LoadAll: false
                }
                $http.get(BaseUrl + '/article', body)
                    .then(function (response) {
                        if (isLoadingMore) {
                            $scope.articles = $scope.articles.concat(response.data);
                            if (response.data.length < 5) {
                                $scope.disableLoadMoreArticle = true;
                            }
                        } else {
                            $scope.articles = response.data;
                        }
                    }, function (error) {

                    });
            }

            getTopicSearchResults(topicPageNum, category, keyword, false)
                .then(getArticleSearchResults(articlePageNum, category, keyword, false));

        }])
}());