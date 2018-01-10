(function () {
	'use strict';
	angular.module('The.Power.Soul.Square', ['ngMaterial'])
		.constant('selectorItems', [
			{
				Title: "力量训练",
				Value: "STRENGTH"
			},
			{
				Title: "瑜伽训练",
				Value: "YOGA"
			},
			{
				Title: "形体训练",
				Value: "FITNESS"
			},
			{
				Title: "跑步训练",
				Value: "RUNNING"
			},
			{
				Title: "全部",
				Value: "ALL"
			}
		])
		.controller('squareCtrl', ['$scope', '$http', '$rootScope', '$stateParams', '$state', 'BaseUrl', 'selectorItems', 'localStorageService',
			'alertService', '$mdDialog',
			function ($scope, $http, $rootScope, $stateParams, $state, BaseUrl, selectorItems, localStorageService,
				alertService, $mdDialog) {
				$scope.selectedItem = "ALL";
				$scope.selectorItems = selectorItems;
				$scope.topicList = [];
				$scope.articleList = [];
				$scope.hotTopics = [];
				$scope.hotArticles = [];
				$scope.isOperating = false;
				$scope.isLoadingTopic = false;
				$scope.isLoadingArticle = false;
				$scope.disableLoadMore = false;
				$scope.disableLoadMoreArticle = false;
				$scope.showTopic = true;
				$scope.switchButtonText = '看文章';
				var pageNum = 1;
				var articlePageNum = 1;
				var user = localStorageService.get('userInfo');

				$scope.switchDisplay = function (evt) {
					$scope.showTopic = !$scope.showTopic;
					$scope.switchButtonText = '看帖子';
				};

				$scope.goTopicDetail = function (topic) {
					var url = $state.href('topic-detail', { id: topic._id });
					window.open(url, '_blank');
				};

				$scope.goArticleDetail = function (article) {
					var url = $state.href('article-detail', { id: article._id });
					window.open(url, '_blank');
				};

				/********************** 页面新建文章按钮操作 ********************/
				$scope.addNewArticle = function (ev) {
					if (localStorageService.get('userInfo')) {
						generateNewArticleDraft();
					} else {
						$mdDialog.show({
							controller: 'loginOrSignupCtrl',
							templateUrl: 'dist/pages/login-and-signup.html',
							parent: angular.element(document.body),
							targetEvent: ev,
							clickOutsideToClose: false,
							fullscreen: false
						})
							.then(function (data) {
								// handle user data
							}, function () {
								// canceled
							});
					}
				};

				/********************** 查看帖子详情 ********************/
				$scope.goTopicDetail = function (topic, ev) {
					if (localStorageService.get('userInfo')) {
						var url = $state.href('topic-detail', { id: topic._id });
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
							.then(function (data) {
								$rootScope.$broadcast('$USERLOGGEDIN');
							}, function () {
								// canceled
							});
					}
				};

				$scope.goArticleDetail = function (article, ev) {
					if (localStorageService.get('userInfo')) {
						var url = $state.href('article-detail', { id: article._id });
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
							.then(function (data) {
								$rootScope.$broadcast('$USERLOGGEDIN');
							}, function () {
								// canceled
							});
					}
				};

				/********************** 删除帖子 ********************/
				// $scope.deleteTopic = function (topic, ev) {
				// 	var confirm = $mdDialog.confirm()
				// 		.title('提示')
				// 		.textContent('确定删除这条帖子？')
				// 		.ariaLabel('')
				// 		.targetEvent(ev)
				// 		.ok('确定')
				// 		.cancel('取消');

				// 	$mdDialog.show(confirm).then(function () {
				// 		$scope.isDeleting = true;
				// 		$http.delete(BaseUrl + '/topic/' + topic._id)
				// 			.then(function (data) {
				// 				alertService.showAlert('删除成功', ev);
				// 				$state.go('bbs');
				// 			}, function (error) {
				// 				alertService.showAlert('删除失败', ev);
				// 			});
				// 	}, function () {
				// 		// canceled
				// 	});
				// };

				/********************** 发表新帖 ********************/
				$scope.addNewTopic = function (ev) {
					if (localStorageService.get('userInfo')) {
						var user = localStorageService.get('userInfo');
						$mdDialog.show({
							controller: 'addNewTopicCtrl',
							templateUrl: 'dist/pages/add-new-topic.html',
							parent: angular.element(document.body),
							targetEvent: ev,
							clickOutsideToClose: false,
							fullscreen: false
						})
							.then(function (data) { // 发表新贴
								$scope.isOperating = true;
								$http.post(BaseUrl + '/topic/' + user._id, {
									Author: user.DisplayName,
									Avatar: user.AvatarID,
									Topic: data
								})
									.then(function (response) {
										$scope.isOperating = false;
										loadTopics(1, $scope.selectedItem, "", false);
										alertService.showAlert('发表帖子成功。', ev);
									}, function (error) {
										$scope.isOperating = false;
										alertService.showAlert('发表帖子失败，请重试。');
									});
							}, function () {
								// dialog canceled
							});
					} else {
						$mdDialog.show({
							controller: 'loginOrSignupCtrl',
							templateUrl: 'dist/pages/login-and-signup.html',
							parent: angular.element(document.body),
							targetEvent: ev,
							clickOutsideToClose: false,
							fullscreen: false
						})
							.then(function (data) {
								// handle user data
							}, function () {
								// canceled
							});
					}
				};

				/********************** 添加帖子到我的收藏 ********************/
				$scope.goAddTopicToFav = function (topic, ev) {
					$http.put(BaseUrl + '/user-topic-fav/' + user._id + '/' + topic._id)
						.then(function (response) {
							alertService.showAlert('收藏成功', ev);
						}, function (error) {
							if (error.status === 404 && error.data === 'UserNotFound') {
								alertService.showAlert('用户不存在，请重新登录', ev);
							} else if (error.status === 400 && error.data === 'Added') {
								alertService.showAlert('请勿重复收藏', ev);
							} else {
								alertService.showAlert('收藏失败，请重试', ev);
							}
						});
				};

				$scope.goAddArticleToFav = function (article, ev) {
					$http.put(BaseUrl + '/user-article-fav/' + user._id + '/' + article._id)
						.then(function (response) {
							alertService.showAlert('收藏成功', ev);
						}, function (error) {
							if (error.status === 404 && error.data === 'UserNotFound') {
								alertService.showAlert('用户不存在，请重新登录', ev);
							} else if (error.status === 400 && error.data === 'Added') {
								alertService.showAlert('请勿重复收藏', ev);
							} else {
								alertService.showAlert('收藏失败，请重试', ev);
							}
						});
				};

				/********************** 创建新的文章草稿对象并保存 ********************/
				function generateNewArticleDraft(ev) {
					var body = {
						Title: "",
						Category: "",
						Author: user.DisplayName,
						Content: ""
					}
					$http.post(BaseUrl + '/article-draft/' + user._id, body)
						.then(function (response) {
							var url = $state.href('new-article', { id: response.data._id });
							window.open(url, '_blank');
						}, function (error) {
							alertService.showAlert('新建文章模板失败，请重试', ev);
						});
				}

				$scope.changeCategoryFilter = function () {
					pageNum = 1;
					if ($scope.showTopic) {
						loadTopics(pageNum, $scope.selectedItem, '', false);
					} else {
						loadArticles(pageNum, $scope.selectedItem, '', false);
					}
				};

				$scope.loadMore = function () {
					loadTopics(++pageNum, $scope.selectedItem, '', true)
						.then(loadHotTopics()
							.then(loadHotArticles()));
				};

				$scope.loadMoreArticle = function () {
					loadArticles(++articlePageNum, $scope.selectedItem, '', true)
						.then(loadHotTopics()
							.then(loadHotArticles()));
				};

				function loadHotTopics() {
					$scope.isLoadingTopic = true;
					return $http.get(BaseUrl + '/topic')
						.then(function (response) {
							$scope.hotTopics = response.data;
							$scope.isLoadingTopic = false;
						}, function (error) {
							$scope.isLoadingTopic = false;
						});
				}

				function loadHotArticles() {
					$scope.isLoadingArticle = true;
					$http.get(BaseUrl + '/article')
						.then(function (response) {
							$scope.isLoadingArticle = false;
							$scope.hotArticles = response.data;
						}, function (error) {
							$scope.isLoadingArticle = false;
						});
				}

				function loadArticles(pageNum, category, keyword, isLoadingMore) {
					var body = {
						PageNum: pageNum,
						Category: category,
						Keyword: keyword,
						LoadAll: false
					}
					if (category === 'All') {
						body.LoadAll = true;
					}
					$scope.isLoadingArticle = true;
					return $http.post(BaseUrl + '/articles', body)
						.then(function (response) {
							$scope.isLoadingArticle = false;
							if (isLoadingMore) {
								$scope.articleList = $scope.articleList.concat(response.data);
								if (response.data.length < 5) {
									$scope.disableLoadMoreArticle = true;
								}
							} else {
								$scope.articleList = response.data;
							}
						}, function (error) {
							$scope.isLoadingArticle = false;
							alertService.showAlert('加载文章失败，请重试。');
						});
				}

				/********************** 初始化加载帖子信息 ********************/
				function loadTopics(pageNum, category, keyword, loadMoreSignal) {
					var body = {
						Page: pageNum,
						Category: category,
						Keyword: keyword,
						LoadAll: false
					}
					if (category === 'ALL') {
						body.LoadAll = true;
					}
					$scope.isLoadingTopic = true;
					return $http.post(BaseUrl + "/topic", body)
						.then(function (response) {
							$scope.isLoadingTopic = false;
							if (loadMoreSignal) {
								$scope.topicList = $scope.topicList.concat(response.data);
							} else {
								$scope.topicList = response.data;
							}
							if (response.data.length < 5) {
								$scope.disableLoadMore = true;
							}
						}, function (error) {
							$scope.isLoadingTopic = false;
							alertService.showAlert('加载帖子失败，请重试。');
						});
				}

				loadTopics(1, 'ALL', '', false)
					.then(loadArticles(1, 'ALL', '', false)
						.then(loadHotTopics()
							.then(loadHotArticles())));

			}])
}());