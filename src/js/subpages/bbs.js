(function() {   
    'use strict';
    angular.module('The.Power.Soul.BBS', ['ngMaterial', 'The.Power.Soul.Tools', 'ngResource'])
    	.constant('selectorItems', [
			{	
				Title: "我关注的",
				Value: "FOLLOWING"
			},
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
    			$scope.selectedItem = "STRENGTH";
    			$scope.selectorItems = selectorItems;
    			$scope.searchContext = "";
    			/*
					loading state
    			*/
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
					loadTopics(1, $scope.selectedItem, $scope.searchContext, '');
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

				/*
				 	topic operation
				*/
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

				$scope.addTopicToFav = function(topic) {
					
				};

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
					  		if (loadMoreSignal === 'load-more') {
								$scope.topicList = $scope.topicList.concat(response.data);
							} else {
								$scope.topicList = response.data;
							}
					});
				}
				loadTopics(1, 'ALL', '', '');

    	}])
}());