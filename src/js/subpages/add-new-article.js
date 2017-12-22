(function () {
	'use strict';
	angular.module('The.Power.Soul.NewArticle', ['ngMaterial'])
		.controller('addNewArticleCtrl', ['$scope', '$http', '$mdToast', '$state', 'BaseUrl', 'localStorageService', 'categoryItems',
			'$stateParams',
			function ($scope, $http, $mdToast, $state, BaseUrl, localStorageService, categoryItems, $stateParams) {
				// init simditor
				var editor = new Simditor({
					textarea: $('#editor')
				});

				$scope.simditorContent = $('.simditor-body')[0].innerHTML;

				var article_id = $stateParams.id;
				$scope.categories = categoryItems;
				$scope.user = localStorageService.get('userInfo');
				$scope.article = {
					Title: "",
					Author: $scope.user.DisplayName,
					Content: "",
					Category: ""
				};
				$scope.publishArticle = function (ev) {
					removeBlankSpace();
					$scope.article.Content = $('.simditor-body')[0].innerHTML;
					$scope.isPublishing = true;
					$http.post(BaseUrl + '/article/' + $scope.user._id, $scope.article)
						.then(function (response) {
							$scope.isPublishing = false;
							removeFromDraftList();
						}, function (error) {
							$scope.isPublishing = false;
							alertService.showAlert('发布失败，请重试', ev);
						});
				};

				$scope.saveAsDraft = function () {
					saveDraft();
				};

				function removeBlankSpace() {
					// 将文本中没有内容的标签去除
				}

				function removeFromDraftList() {
					$http.delete(BaseUrl + '/article-draft/' + $scope.article._id)
						.then(function (response) {
							$state.go('article-list');
						}, function (error) {
							alertService.showAlert('删除草稿失败，请重试', ev);
						});
				}

				function saveDraft() {
					$scope.article.Content = $('.simditor-body')[0].innerHTML;
					console.log($scope.article.Content);
					$http.put(BaseUrl + '/article-draft/' + article_id, $scope.article)
						.then(function (response) {
							alertSuccessMsg('保存草稿成功');
						}, function (error) {

						});
				}

				// 等待添加定时保存草稿的代码
				function autoSendSaveRequest() {

				}

				function alertSuccessMsg(content) {
					$mdToast.show(
						$mdToast.simple()
							.textContent(content)
							.highlightClass('md-primary')
							.position('top right')
					);
				}

				function loadArticleDraft() {
					$http.get(BaseUrl + '/article-draft/' + article_id)
						.then(function (response) {
							$scope.isLoading = false;
							$scope.article = response.data;
							$('.simditor-body')[0].innerHTML = $scope.article.Content;
						}, function (error) {
							$scope.isLoading = false;
							$scope.isLoadingHasError = true;
						});
				}
				loadArticleDraft();

			}])
}());