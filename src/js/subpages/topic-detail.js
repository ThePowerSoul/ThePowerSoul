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
			$scope.user = localStorageService.get('userInfo');
			$scope.followButtonText = "";
			$scope.isFollowing = false;
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
			$scope.topicAuthor = {
				ID: '',
				TopicNumber: 0,
				ArticleNumber: 0
			};
			$scope.commentList = [];
			$scope.newCommentContent = "";

			/*
				评论帖子 
			*/
			$scope.addNewCommentToTopic = function(ev) {
				$scope.isPostingNewComment = true;
				$http.post(BaseUrl + '/comment/' + $scope.user._id + '/' + topic_id,
					{
						Comment: $scope.newCommentContent,
						ContextID: "",
						TargetUserID: "",
						Author: $scope.user.DisplayName,
						TargetAuthor: ""
					})
					.then(function(response) {
						$scope.newCommentContent = "";
						$scope.commentList.push(response.data);
						$scope.isPostingNewComment = false;
					}, function(error) {
						$scope.isPostingNewComment = false;
						alertService.showAlert('发布评论失败，请重试', ev);
					});	
			};

			/*
				打开回复评论的对话框
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
			
			/*
				查看对话
			*/
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

			/*
				收藏这个话题
			*/
			$scope.goAddTopicToFav = function(ev) {
				$http.put(BaseUrl + '/user-topic-fav/' + $scope.user._id + '/' + topic_id)
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

			/*
				举报这个话题
			*/
			$scope.reportTheTopic = function(ev) {
				$mdDialog.show({ 
					controller: 'addReportCtrl',
					templateUrl: 'dist/pages/add-report.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose: false,
					fullscreen: false,
					locals: {
						target: $scope.topic
					}
				})
				.then(function(data) {
					postNewReportMessage(data);
				}, function() {
					// canceled
				});
			};

			/*
				关注发帖人
			*/
			$scope.addToFollowingUsers = function() {
				
			};

			/*
				给发帖人发私信
			*/
			$scope.sendPrivateMessage = function() {

			};

			function postNewReportMessage(data) {
				var body = {};
				$http.post(BaseUrl + '/complaint-message/' + $scope.user._id, body)
					.then(function(response) {
						alertService.showAlert('举报成功，请耐心等待处理结果', ev);
					}, function(error) {
						alertService.showAlert('举报失败，请重试', ev);
					});
			}

			/*
				点赞帖子
			*/
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

			/*
				踩帖子
			*/
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

			/*
				点赞评论
			*/
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

			/*
				踩评论
			*/
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

			/*
				收起，展开帖子内容
			*/
			$scope.changeExpandState = function() {
				$scope.topic.Expand = !$scope.topic.Expand;
			};

			/*
				加载更多
			*/
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

			function getTopicAuthorInfo() {
				$scope.isLoadingUserInfo = true;
				return $http.get(BaseUrl + '/get-publish-number/' + $scope.topic.UserID)
					.then(function(response) {
						$scope.isLoadingUserInfo = false;
						$scope.topicAuthor.ID = $scope.topic.UserID;
						$scope.topicAuthor.TopicNumber = response.data.TopicNumber;
						$scope.topicAuthor.ArticleNumber = response.data.ArticleNumber;
						checkFollowingState();
					}, function(error) {
						$scope.isLoadingUserInfo = false;
						$scope.isLoadingUserInfoHasError = true;
					});
			}

			function checkFollowingState() {
				$http.get(BaseUrl + '/user-detail/' + $scope.user._id + '/' + $scope.topic.UserID)
					.then(function(response) {
						$scope.isLoading = false;
						$scope.isFollowing = response.data.IsFollowing;
						$scope.followButtonText = $scope.isFollowing ? "取消关注" : '关注';
					}, function(error) {
						$scope.isLoading = false;
						$scope.isLoadingHasError = true;
					});
			}

			$scope.followOperation = function(ev) {
                $scope.isOperating = true;
                if ($scope.isFollowing) {
                    $http.put(BaseUrl + '/user-unfollow/' + $scope.user._id + '/' + $scope.topic.UserID)
                        .then(function(response) {
                            $scope.followButtonText = "关注";
                            $scope.isOperating = false;
                            $scope.isFollowing = false;
                        }, function(error) {
                            alertService.showAlert('取消关注失败', ev);
                            $scope.isOperating = false;
                        });
                } else {
                    $http.put(BaseUrl + '/user-follow/' + $scope.user._id + '/' + $scope.topic.UserID)
                        .then(function(response) {
                            $scope.followButtonText = "取消关注";
                            $scope.isOperating = false;
                            $scope.isFollowing = true;
                        }, function(error) {
                            alertService.showAlert('关注失败', ev);
                            $scope.isOperating = false;
                        });
				}
			};

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
				.then(getTopicAuthorInfo()
					.then(loadTopicComments()));

    	}])
}());