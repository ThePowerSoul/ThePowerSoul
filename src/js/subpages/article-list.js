(function() {   
    'use strict';
    angular.module('The.Power.Soul.Article.List', ['ngMaterial'])
        .controller('articleListCtrl', ['$scope', '$http', '$state', 'BaseUrl', 'localStorageService', 'alertService', '$mdDialog',
        function($scope, $http, $state, BaseUrl, localStorageService, alertService, $mdDialog) {
            $scope.articles = [];
            $scope.articleDrafts = [];
            $scope.isLoading = false;
            $scope.isLoadingDraft = false;
            $scope.isDeleting = false;
            $scope.isEditing = false;
            $scope.user = localStorageService.get('userInfo');

            $scope.goToEdit = function(article) {
                $state.go('new-article', {id: article._id});
            };

            $scope.goToArticleDetail = function(article) {
                $state.go('article-detail', {id: article._id});
            };

            // 生成新草稿，内容为正文内容，成功后删除正文
            $scope.editArticle = function(article, ev) {
                $scope.isEditing = true;
                $http.post(BaseUrl + '/article-draft/' + $scope.user._id, article)
                    .then(function(response) {
                        $scope.isEditing = false;
                        removeFromArticleList(article, response.data, ev);
                    }, function(error) {
                        $scope.isEditing = false;
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
                    $scope.isDeleting = true;
					$http.delete(BaseUrl + '/article-draft/' + article._id)
                    .then(function(response) {
                        $scope.isDeleting = false;
                        var index = $scope.articleDrafts.indexOf(article);
                        $scope.articleDrafts.splice(index, 1);
                        alertService.showAlert('删除文章草稿成功');
                    }, function(error) {
                        $scope.isDeleting = false;
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
                    $scope.isDeleting = true;
					$http.delete(BaseUrl + '/article/' + article._id)
                    .then(function(response) {
                        $scope.isDeleting = false;
                        var index = $scope.articles.indexOf(article);
                        $scope.articles.splice(index, 1);
                        alertService.showAlert('删除文章成功');
                    }, function(error) {
                        $scope.isDeleting = false;
                        alertService.showAlert('删除文章失败', ev);
                    });
				}, function() {
					// canceled
				});
            };
            
            function removeFromArticleList(article, data,  ev) {
                $scope.isEditing = true;
                $http.delete(BaseUrl + '/article/' + article._id)
                    .then(function(response) {
                        $scope.isEditing = false;
                        $state.go('new-article', {id: data._id})
                    }, function(error) {
                        $scope.isEditing = false;
                        alertService.showAlert('清楚文章失败', ev);
                    });
            }

            function loadArticles() {
                $scope.isLoading = true;
                return $http.get(BaseUrl + '/articles/' + $scope.user._id)
                    .then(function(response) {
                        $scope.isLoading = false;
                        $scope.articles = response.data;
                    }, function(error) {
                        $scope.isLoading = false;
                    });
            }

            function loadArticleDrafts() {
                $scope.isLoadingDraft = true;
                $http.get(BaseUrl + '/article-drafts/' + $scope.user._id)
                    .then(function(response) {
                        $scope.articleDrafts = response.data;
                        $scope.isLoadingDraft = false;
                    }, function(error) {
                        $scope.isLoadingDraft = false;
                    });
            }

            loadArticles()
                .then(loadArticleDrafts());

    	}])
}());