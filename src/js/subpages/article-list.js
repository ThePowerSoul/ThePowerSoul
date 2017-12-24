(function() {   
    'use strict';
    angular.module('The.Power.Soul.Article.List', ['ngMaterial'])
        .controller('articleListCtrl', ['$scope', '$http', '$state', 'BaseUrl', 'localStorageService', 'alertService', '$mdDialog',
        function($scope, $http, $state, BaseUrl, localStorageService, alertService, $mdDialog) {
            $scope.articles = [];
            $scope.articleDrafts = [];
            $scope.isLoading = false;
            $scope.isLoadingDraft = false;
            $scope.isLoadingHasError = false;
            $scope.user = localStorageService.get('userInfo');

            $scope.goToEdit = function(article) {
                $state.go('new-article', {id: article._id});
            };

            $scope.goToArticleDetail = function(article) {
                $state.go('article-detail', {id: article._id});
            };

            // 生成新草稿，内容为正文内容，成功后删除正文
            $scope.editArticle = function(article, ev) {
                $http.post(BaseUrl + '/article-draft/' + $scope.user._id, article)
                    .then(function(response) {
                        removeFromArticleList(article, response.data, ev);
                    }, function(error) {
                        alertService.showAlert('生成编辑内容失败，请重试', ev);
                    });     
            };

            $scope.deleteArticleDraft = function(article, ev) {
                var confirm = $mdDialog.confirm()
				.title('提示')
				.textContent('确定删除草稿？')
				.ariaLabel('')
				.targetEvent(ev)
				.ok('确定')
				.cancel('取消');
		
				$mdDialog.show(confirm).then(function() {
					$http.delete(BaseUrl + '/article-draft/' + article._id)
                    .then(function(response) {
                        alertService.showAlert('删除文章草稿成功');
                    }, function(error) {
                        alertService.showAlert('删除文章草稿失败');
                    });
				}, function() {
					// canceled
				});
            };

            $scope.deleteArticle = function(article, ev) {
                var confirm = $mdDialog.confirm()
				.title('提示')
				.textContent('确定删除文章？')
				.ariaLabel('')
				.targetEvent(ev)
				.ok('确定')
				.cancel('取消');
		
				$mdDialog.show(confirm).then(function() {
					$http.delete(BaseUrl + '/article/' + article._id)
                    .then(function(response) {
                        alertService.showAlert('删除文章成功');
                    }, function(error) {
                        alertService.showAlert('删除文章失败', ev);
                    });
				}, function() {
					// canceled
				});
                
            };
            
            function removeFromArticleList(article, data,  ev) {
                $http.delete(BaseUrl + '/article/' + article._id)
                    .then(function(response) {
                        $state.go('new-article', {id: data._id})
                    }, function(error) {
                        alertService.showAlert('清楚文章失败', ev);
                    });
            }

            function loadArticles() {
                $scope.isLoading = true;
                $http.get(BaseUrl + '/articles/' + $scope.user._id)
                    .then(function(response) {
                        $scope.articles = response.data;
                    }, function(error) {
                        $scope.isLoadingHasError = true;
                    });
            }

            function loadArticleDrafts() {
                $scope.isLoadingDraft = true;
                $http.get(BaseUrl + '/article-drafts/' + $scope.user._id)
                    .then(function(response) {
                        $scope.articleDrafts = response.data;
                    }, function(error) {
                        $scope.isLoadingHasError = true;
                    });
            }

            loadArticles();
            loadArticleDrafts();

    	}])
}());