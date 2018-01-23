(function () {
    'use strict';
    angular.module('The.Power.Soul.Search.Results', ['ngMaterial'])
        .controller('searchResultsCtrl', ['$scope', '$http', '$state', '$stateParams', 'BaseUrl',
            function ($scope, $http, $state, $stateParams, BaseUrl) {
                $scope.topics = [];
                $scope.articles = [];
                var keyword = $stateParams.keyword;
                var category = 'ALL';
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

                $scope.goToTopic = function (topic, ev) {
                    var url = $state.href('topic-detail', { id: topic._id });
                    window.open(url, '_blank');
                };

                $scope.goToArticle = function (article, ev) {
                    var url = $state.href('article-detail', { id: article._id });
                    window.open(url, '_blank');
                };

                function getTopicSearchResults(pageNum, category, keyword, isLoadingMore) {
                    var body = {
                        Page: pageNum,
                        Category: category,
                        Keyword: keyword,
                        LoadAll: true
                    }
                    return $http.post(BaseUrl + '/topic', body)
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
                        LoadAll: true
                    }
                    $http.post(BaseUrl + '/articles', body)
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