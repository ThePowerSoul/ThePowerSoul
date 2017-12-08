(function() {   
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
        'alertService',
        function($scope, $http, $rootScope, $stateParams, $state, BaseUrl, selectorItems, localStorageService, alertService) {
            $scope.selectedItem = "ALL";
            $scope.selectorItems = selectorItems;
            $scope.topicList = [];
            $scope.isLoadingTopic = false;
            $scope.isLoadingHasError = true;
            var user = localStorageService.get('userInfo');

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
                $http.post(BaseUrl + "/topic", body)
                    .then(function(response) {
                        if (loadMoreSignal) {
                            $scope.topicList = $scope.topicList.concat(response.data);
                        } else {
                            $scope.topicList = response.data;
                        }
                }, function(error) {
                    $scope.isLoadingHasError = true;
                });
            }
            loadTopics(1, 'ALL', '', false); // 数据初始化，第一次加载

    	}])
}());