(function() {   
    'use strict';
	angular.module('The.Power.Soul.Topic.Detail', ['ngMaterial'])
    	.controller('addNewCommentCtrl', ['$scope', '$mdDialog', function($scope, $mdDialog) {
    		$scope.comment = "";
    		$scope.submit = function() {
    			$mdDialog.hide($scope.comment);
			};	
			$scope.closeDialog = function() {
				$mdDialog.cancel();
			};
		}])
		.controller('seeCommentConversationCtrl', ['$scope', '$mdDialog', 'Comment', 'BaseUrl', 'alertService', '$http',
			function($scope, $mdDialog, Comment, BaseUrl, alertService, $http) {
			$scope.isLoading = false;
			$scope.isLoadingHasError = false;
			$scope.commentList = [];
			$http.get(BaseUrl + '/comment/' + Comment.UserID + '/' + Comment.TargetUserID + '/' + Comment.TargetContextID)
				.then(function(response) {
					$scope.isLoading = false;
					$scope.commentList = response.data;
				}, function(error) {
					$scope.isLoading = false;
					$scope.isLoadingHasError = false;
				});
			$scope.closeDialog = function() {
				$mdDialog.cancel();
			};
    	}])
		.controller('topicDetailCtrl', ['$scope', '$stateParams', '$mdDialog', '$http', 
			'BaseUrl', 'localStorageService', 'alertService',
			function($scope, $stateParams, $mdDialog, $http,
				 BaseUrl, localStorageService, alertService) {
    		var topicID = $stateParams.id;
			$scope.user = localStorageService.get('userInfo');
			var topic_id = $stateParams.id;

    		/*
			loading state
    		*/
    		$scope.isPostingNewComment = false;
    		$scope.isReplyingComment = false;
    		$scope.isLoading = false;
			$scope.isLoadingHasError = false;
			$scope.isLoadingComments = false;
			$scope.isLoadingCommentsHasError = false;
			$scope.isChangingLikeStauts = false;
			$scope.isChangingTopicLikeStauts = false;
			$scope.topic = {};
			$scope.commentList = [];

			$scope.addNewCommentToTopic = function(ev) {
				$scope.isPostingNewComment = true;
				$http.post(BaseUrl + '/comment/' + $scope.user._id + '/' + topicID,
					{
						Comment: $scope.newCommentContent,
						ContextID: "",
						TargetUserID: "",
						Author: $scope.user.DisplayName,
						TargetAuthor: ""
					})
					.then(function(response) {
						$scope.commentList.push(response.data);
						$scope.isPostingNewComment = false;
					}, function(error) {
						$scope.isPostingNewComment = false;
						alertService.showAlert('发布评论失败，请重试', ev);
					});	

			};

			/*
				评论帖子
			*/
			$scope.commentReply = function(comment, ev) {
				$mdDialog.show({ 
					controller: 'addNewCommentCtrl',
					templateUrl: 'dist/pages/add-new-comment.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose: false,
					fullscreen: false
				})
				.then(function(data) {
					sendCommentReply(comment, data, ev);
					// handle comment data
				}, function() {
					// canceled
				});
			};
			
			$scope.seeConversation = function(comment, ev) {
				$mdDialog.show({ 
					controller: 'seeCommentConversationCtrl',
					templateUrl: 'dist/pages/see-conversation.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose: false,
					fullscreen: false,
					locals: {
						Comment: comment
					}
				})
				.then(function(data) {
					
				}, function() {
					// canceled
				});
			};

			$scope.likeTheTopic = function(ev) {
				$scope.isChangingTopicLikeStauts = true;
				$http.put(BaseUrl + '/topic/' + $scope.user._id + '/' + $scope.topic._id + '/up')
					.then(function(response) {
						$scope.isChangingTopicLikeStauts = false;
						var index = $scope.topic.LikeUser.indexOf($scope.user._id);
						var indexDis = $scope.topic.DislikeUser.indexOf($scope.user._id);
						if (indexDis >= 0) {
							$scope.topic.DislikeUser.splice(index, 1);
						}
						if (index < 0) {
							$scope.topic.LikeUser.push($scope.user._id)
						}
					}, function(error) {
						$scope.isChangingTopicLikeStauts = false;
						if (error.status === 400 && error.data === "Added") {
							return;
						}
					});
			};

			$scope.dislikeTheTopic = function(ev) {
				$scope.isChangingTopicLikeStauts = true;
				$http.put(BaseUrl + '/topic/' + $scope.user._id + '/' + $scope.topic._id + '/down')
					.then(function(response) {
						$scope.isChangingTopicLikeStauts = false;
						var index = $scope.topic.LikeUser.indexOf($scope.user._id);
						var indexDis = $scope.topic.DislikeUser.indexOf($scope.user._id);
						if (index >= 0) {
							$scope.topic.LikeUser.splice(index, 1);
						}
						if (indexDis < 0) {
							$scope.topic.DislikeUser.push($scope.user._id)
						}
					}, function(error) {
						$scope.isChangingTopicLikeStauts = false;
						if (error.status === 400 && error.data === "Removed") {
							return;
						}
					});
			};

			$scope.likeTheComment = function(comment, ev) {
				$scope.isChangingLikeStauts = true;
				$http.put(BaseUrl + '/comment/' + $scope.user._id + '/' + comment._id + '/up')
					.then(function(response) {
						var index = comment.LikeUser.indexOf($scope.user._id);
						var indexDis = comment.DislikeUser.indexOf($scope.user._id);
						if (indexDis >= 0) {
							comment.DislikeUser.splice(index, 1);
						}
						if (index < 0) {
							comment.LikeUser.push($scope.user._id)
						}
						$scope.isChangingLikeStauts = false;
					}, function(error) {
						$scope.isChangingLikeStauts = false;
						if (error.status === 400 && error.data === "Added") {
							return;
						}
					});
			};

			$scope.dislikeTheComment = function(comment, ev) {
				$scope.isChangingLikeStauts = true;
				$http.put(BaseUrl + '/comment/' + $scope.user._id + '/' + comment._id + '/down')
					.then(function(response) {
						var index = comment.LikeUser.indexOf($scope.user._id);
						var indexDis = comment.DislikeUser.indexOf($scope.user._id);
						if (index >= 0) {
							comment.LikeUser.splice(index, 1);
						}
						if (indexDis < 0) {
							comment.DislikeUser.push($scope.user._id)
						}
						$scope.isChangingLikeStauts = false;
					}, function(error) {
						$scope.isChangingLikeStauts = false;
						if (error.status === 400 && error.data === "Removed") {
							return;
						}
					});
			};

			$scope.changeExpandState = function() {
				$scope.topic.Expand = !$scope.topic.Expand;
			};

			$scope.loadMore = function() {
				loadTopicComments();
			};

			/*
				回复评论
			*/
			function sendCommentReply(comment, newComment, ev) {
				$http.post(BaseUrl + '/comment/' + $scope.user._id + '/' + topic_id, 
					{
						Comment: newComment,
						ContextID: comment.TargetContextID,
						TargetUserID: comment.UserID,
						Author: $scope.user.DisplayName,
						TargetAuthor: comment.Author
					})
					.then(function(response) {
						$scope.commentList.push(response.data);
					}, function(error) {
						alertService.showAlert('回复评论失败，请重试', ev);
					});
			}

			function loadTopicDetail() {
				$scope.isLoading = true;
				return $http.get(BaseUrl + '/topic/' + $scope.user._id + '/' + topic_id)
					.then(function(response) {
						$scope.isLoading = false;
						angular.extend($scope.topic, response.data);
					}, function(error) {
						$scope.isLoading = false;
						$scope.isLoadingHasError = true;
					});
			}

			function loadTopicComments(loadMoreSignal) {
				$scope.isLoadingComments = true;
				$http.get(BaseUrl + '/comment/' + topic_id)
					.then(function(response) {
						$scope.isLoadingComments = false;
						if (loadMoreSignal === 'load-more') {
							
						} else {
							$scope.commentList = response.data;
						}
					}, function(error) {	
						$scope.isLoadingComments = false;
						$scope.isLoadingCommentsHasError = true;
					});
			}

			loadTopicDetail()
				.then(loadTopicComments());

    	}])
}());