(function() {   
    'use strict';
    angular.module('The.Power.Soul.BBS', ['ngMaterial', 'The.Power.Soul.Tools', 'ngResource'])
    	.controller('addNewTopicCtrl', ['$scope', '$mdDialog', 'categoryItems', function($scope, $mdDialog, categoryItems) {
    		$scope.topic = {
    			Title: "",
				Content: "",
				Category: "",
			};

			$scope.closeDialog = function(ev) {
				$mdDialog.cancel();
			};	
			
			$scope.categories = categoryItems;

    		$scope.submit = function() {	
    			$mdDialog.hide($scope.topic);
    		};

    	}])
		.controller('bbsCtrl', ['$scope', '$mdDialog', '$rootScope', 'selectorItems', '$state', 'alertService',
			'localStorageService', '$http', 'BaseUrl',
			function($scope, $mdDialog, $rootScope, selectorItems, $state, alertService, localStorageService, $http, BaseUrl) {
<<<<<<< HEAD
    			$scope.selectedItem = "ALL";
    			$scope.selectorItems = selectorItems;
=======
>>>>>>> dad236db9484c5a76d7f0b970d7a023ee2cf2568
				$scope.searchContext = "";
				$rootScope.$broadcast('$SHOWMESSAGEENTRANCE');
    			$scope.isLoadingTopic = false;
    			$scope.isSubmittingTopic = false;
				$scope.isChangingCategory = false;
				$scope.isLoadingTopicHasError = false;

				var user = localStorageService.get('userInfo');

    			/*
					filter topic
    			*/
    			$scope.getSelectedCategory = function() {
					// pageNum, category, keyword, loadMoreSignal
					loadTopics(1, $scope.selectedItem, $scope.searchContext, false);
    			};

    			/*
					search topic
    			*/
    			$scope.searchTopic = function() {
    				loadTopics(1, $scope.selectedItem, $scope.searchContext, '');
    			};

    			$scope.searchTopicKeyboard = function(ev) {
    				if (ev.keyCode === 13) {
    					loadTopics(1, $scope.selectedItem, $scope.searchContext, '');
    				}
    			}

				/********************** 页面新建文章按钮操作 ********************/
				$scope.addNewArticle = function(ev) {
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
						.then(function(data) {
							// handle user data
						}, function() {
							// canceled
						});
					}
				};

				/********************** 查看帖子详情 ********************/
    			$scope.goTopicDetail = function(topic, ev) {
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

				/********************** 发表新帖 ********************/
	    		$scope.addNewTopic = function(ev) {
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
				        .then(function(data) { // 发表新贴
							$scope.isSubmittingTopic = false;
							$http.post(BaseUrl + '/topic/' + user._id, {
									Author: user.DisplayName,
									Topic: data
								})
								.then(function(response) {
									$scope.isSubmittingTopic = false;
									loadTopics(1, $scope.selectedItem, $scope.searchContext, '');
									alertService.showAlert('发表帖子成功。', ev);
								}, function(error) {
									$scope.isSubmittingTopic = false;
									alertService.showAlert('发表帖子失败，请重试。', ev);
								});
				        }, function() {
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
				        .then(function(data) {
				        	// handle user data
				        }, function() {
				        	// canceled
				        });
	    			}
				};

				/********************** 添加帖子到我的收藏 ********************/
				$scope.goAddTopicToFav = function(topic, ev) {
					$http.put(BaseUrl + '/user-topic-fav/' + user._id + '/' + topic._id)
						.then(function(response) {
							alertService.showAlert('收藏成功', ev);
						}, function(error) {
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
						.then(function(response) {
							var url = $state.href('new-article', {id: response.data._id});
							window.open(url, '_blank');
						}, function(error) {	
							alertService.showAlert('新建文章模板失败，请重试', ev);
						});
				}
				
				/********************** 初始化加载
				 * 								我关注的话题
				 * 								我关注的人关注的帖子信息
				 * 								我关注的人发表的帖子
				 * 								去重
				 * 	 ********************/
				function loadTopics(pageNum, loadMoreSignal) {
					var body = {
						Page: pageNum,
					}
					$scope.isLoadingTopic = true;
				
					$http.post(BaseUrl + "/topic", body)
						.then(function(response) {
					  		if (loadMoreSignal) {
								$scope.topicList = $scope.topicList.concat(response.data);
							} else {
								$scope.topicList = response.data;
							}
					});
				}
				loadTopics(1, false); // 数据初始化

    	}])
}());