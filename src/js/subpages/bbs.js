(function() {   
    'use strict';
    angular.module('The.Power.Soul.BBS', ['ngMaterial', 'The.Power.Soul.Tools', 'ngResource'])
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
		.service('topicOperation', ['$resource', function($resource) {
			var serviceUrl = "localhost:3000/"
			var res = $resource(serviceUrl + 'topic', {id: '@id', receptor: '@receptor'}, {
				'getTopics': {method: 'GET', isArray: true},
				'addNewTopic': {method: 'POST', isArray: false},
				'deleteTopic': {method: 'DELETE', inArray: false}
			});
			return {
				res: res
			};
		}])
    	.controller('addNewTopicCtrl', ['$scope', '$mdDialog', function($scope, $mdDialog) {
    		$scope.topic = {
    			Title: "",
				Content: "",
				Category: "",
			};
			
			$scope.categories = [
				{
					Title: "力量",
					Value: "STRENGTH"
				},
				{
					Title: "瑜伽",
					Value: "YOGA"
				},
				{
					Title: "形体",
					Value: "FITNESS"
				},
				{
					Title: "跑步",
					Value: "RUNNING"
				}
			];

    		$scope.submit = function() {	
    			$mdDialog.hide($scope.topic);
    		};

    	}])
		.controller('bbsCtrl', ['$scope', '$mdDialog', 'selectorItems', '$state', 'alertService', 'topicOperation',
			'localStorageService',
    		function($scope, $mdDialog, selectorItems, $state, alertService, topicOperation, localStorageService) {
    			$scope.selectedItem = "STRENGTH";
    			$scope.selectorItems = selectorItems;
    			$scope.searchContext = "";
    			$scope.topicList = [
    				{	
    					ID: "111",
    					Title: "PowerliftingPowerliftingPowerliftingPowerliftingPowerliftingPowerliftingPowerliftingPowerliftingPowerliftingPowerliftingPowerliftingPowerlifting",
    					Content: "作为同一时期的作家，蒋方舟似乎有点“固守”自己的领域。郭敬明已经拍了两部电影了，韩寒也在做自己的电影。但蒋方舟对自己要不要做这些事情，想得很清楚。她鼓励现代人不要害怕被时代抛下。她调侃地说，其实被时代淘汰也挺好的，一定还有一些跟你一样被时代淘汰的人，慢腾腾地在后面溜达，你们自己组一个局不是很好吗？对于韩寒日前表示，在自己想清楚之前不再写长篇小说了。蒋方舟说，她还是很期待韩寒的长篇小说的。蒋方舟的业余生活跟普通女生一样，喜欢淘宝，买的衣服曾把大学宿舍淹没。喜欢本身不胖还是嚷着要减肥，做饭对她来说，只是一个调剂，不是很喜欢，但可以减压。她还喜欢爬山，想在30岁之前多爬几座山，因为爬山的过程很痛苦，但下山后就会感受到放大了的快乐。作为同一时期的作家，蒋方舟似乎有点“固守”自己的领域。郭敬明已经拍了两部电影了，韩寒也在做自己的电影。但蒋方舟对自己要不要做这些事情，想得很清楚。她鼓励现代人不要害怕被时代抛下。她调侃地说，其实被时代淘汰也挺好的，一定还有一些跟你一样被时代淘汰的人，慢腾腾地在后面溜达，你们自己组一个局不是很好吗？对于韩寒日前表示，在自己想清楚之前不再写长篇小说了。蒋方舟说，她还是很期待韩寒的长篇小说的。蒋方舟的业余生活跟普通女生一样，喜欢淘宝，买的衣服曾把大学宿舍淹没。喜欢本身不胖还是嚷着要减肥，做饭对她来说，只是一个调剂，不是很喜欢，但可以减压。她还喜欢爬山，想在30岁之前多爬几座山，因为爬山的过程很痛苦，但下山后就会感受到放大了的快乐。",
    					CreatedAt: new Date(),
    					Category: "STRENGTHTRAINING",
    					Like: 111,
    					Dislike: 222,
    					Author: "Joey"
    				}
    			];

    			/*
					loading state
    			*/
    			$scope.isLoadingTopic = false;
    			$scope.isSubmittingTopic = false;
				$scope.isChangingCategory = false;
				$scope.isLoadingTopicHasError = false;

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
						var url = $state.href('new-article');
						window.open(url, '_blank');
					} else {
						$mdDialog.show({ 
							controller: 'loginOrSignupCtrl',
							templateUrl: 'dist/pages/login-and-signup.html',
							parent: angular.element(document.body),
							targetEvent: ev,
							clickOutsideToClose:true,
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
    					var url = $state.href('topic-detail', {id: topic.ID});
    					window.open(url, '_blank');
    				} else {
    					$mdDialog.show({ 
							controller: 'loginOrSignupCtrl',
							templateUrl: 'dist/pages/login-and-signup.html',
							parent: angular.element(document.body),
							targetEvent: ev,
							clickOutsideToClose:true,
							fullscreen: false
						})
						.then(function(data) {
								// handle user data
						}, function() {
								// canceled
						});
					}
    			};

	    		$scope.addNewTopic = function(ev) {
	    			if (localStorageService.get('userInfo')) {
						var user_id = localStorageService.get('userInfo')._id;
	    				$mdDialog.show({ 
				            controller: 'addNewTopicCtrl',
				            templateUrl: 'dist/pages/add-new-topic.html',
				            parent: angular.element(document.body),
				            targetEvent: ev,
				            clickOutsideToClose:true,
				            fullscreen: false
				        })
				        .then(function(data) {
							$scope.isSubmittingTopic = false;
				        	topicOperation.res.addNewTopic({id: user_id}, data, function(result) {
								loadTopics(1, $scope.selectedItem, $scope.searchContext, '');
								alertService.showAlert('发表帖子成功。', ev);
							}, function(error) {
								alertService.showAlert('发表帖子失败，请重试。', ev);
							}).$promise.finally(function() {
								$scope.isSubmittingTopic = false;
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
				            clickOutsideToClose:true,
				            fullscreen: false
				        })
				        .then(function(data) {
				        	// handle user data
				        }, function() {
				        	// canceled
				        });
	    			}
				};
				
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
					topicOperation.res.getTopics({id: ""}, body, function(result) {
						if (loadMoreSignal === 'load-more') {
							$scope.topicList = $scope.topicList.concat(result.Topics);
						} else {
							$scope.topicList = result.Topics;
						}
					}, function(error) {
						$scope.isLoadingTopicHasError = true;
					}).$promise.finally(function() {
						$scope.isLoadingTopic = false;
					});
				}
				loadTopics(1, 'ALL', '', '');

    	}])
}());