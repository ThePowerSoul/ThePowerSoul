(function () {
	'use strict';
	angular.module('The.Power.Soul.NewArticle', ['ngMaterial'])
		.controller('addNewArticleCtrl', ['$scope', '$http', '$mdToast', '$state', 'BaseUrl', 'localStorageService', 'categoryItems',
			'$stateParams', 'randomString',
			function ($scope, $http, $mdToast, $state, BaseUrl, localStorageService, categoryItems, $stateParams, randomString) {
				var accessid = 'LTAILjmmB1fnhHlx';
				var host = "http://thepowersoul2018.oss-cn-qingdao.aliyuncs.com";
				var params = {}

				// init simditor
				// var editor = new Simditor({
				// 	textarea: $('#editor'),
				// 	upload: {
				// 		url : host, //文件上传的接口地址
				// 		params: params, //键值对,指定文件上传接口的额外参数,上传的时候随文件一起提交
				// 		fileKey: params.Filename, //服务器端获取文件数据的参数名
				// 		connectionCount: 3,
				// 		leaveConfirm: '正在上传图片，确定离开？'
				// 	},
				// 	success: function(data) {
				// 		console.log(data);
				// 	}
				// });

				var editor = new Simditor({
					textarea: $('#editor'),
					upload: {
						url: BaseUrl + '/upload-picture-rich-text', //文件上传的接口地址
						params: null, //键值对,指定文件上传接口的额外参数,上传的时候随文件一起提交
						fileKey: 'upload_file', //服务器端获取文件数据的参数名
						connectionCount: 3,
						leaveConfirm: '正在上传图片，确定离开？'
					},
					success: function (data) {
						console.log(data);
					}
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
					$http.put(BaseUrl + '/article-draft/' + article_id, $scope.article)
						.then(function (response) {
							alertSuccessMsg('保存草稿成功');
						}, function (error) {

						});
				}

				function setUploadParams(data) {
					var randomFileName = randomString.getRandomString(10);
					params = {
						'Filename': '${filename}',
						'key': '${filename}',
						'policy': data.PolicyText,
						'OSSAccessKeyId': accessid,
						'success_action_status': '200', //让服务端返回200，不然，默认会返回204
						'signature': data.Signature,
					}
				}

				function getUploadPolicy() {
					$http.get(BaseUrl + '/get-upload-policy')
						.then(function (response) {
							setUploadParams(response.data);
						}, function (error) {
							alertService.showAlert('获取上传文件信息失败，请重试');
						});
				}

				function loadArticleDraft() {
					return $http.get(BaseUrl + '/article-draft/' + article_id)
						.then(function (response) {
							$scope.isLoading = false;
							$scope.article = response.data;
							$('.simditor-body')[0].innerHTML = $scope.article.Content;
						}, function (error) {
							$scope.isLoading = false;
							$scope.isLoadingHasError = true;
						});
				}
				// loadArticleDraft().then(getUploadPolicy());
				loadArticleDraft();

				function alertSuccessMsg(content) {
					$mdToast.show(
						$mdToast.simple()
							.textContent(content)
							.highlightClass('md-primary')
							.position('top right')
					);
				}

			}])
}());