(function () {
	'use strict';
	angular.module('The.Power.Soul.Topic.Detail', ['ngMaterial'])
		.controller('addNewCommentCtrl', ['$scope', '$mdDialog', function ($scope, $mdDialog) {
			$scope.comment = "";
			$scope.submit = function () {
				$mdDialog.hide($scope.comment);
			};
			$scope.closeDialog = function () {
				$mdDialog.cancel();
			};
		}])
		.controller('seeCommentConversationCtrl', ['$scope', '$mdDialog', 'Comment', 'BaseUrl', 'alertService', '$http',
			'localStorageService',
			function ($scope, $mdDialog, Comment, BaseUrl, alertService, $http, localStorageService) {
				$scope.isLoading = false;
				$scope.isLoadingHasError = false;
				$scope.commentList = [];
				$scope.user = localStorageService.get('userInfo');
				$http.get(BaseUrl + '/comment/' + Comment.UserID + '/' + Comment.TargetUserID + '/' + Comment.TargetContextID)
					.then(function (response) {
						$scope.isLoading = false;
						$scope.commentList = response.data;
					}, function (error) {
						$scope.isLoading = false;
						$scope.isLoadingHasError = false;
					});

				/*
					点赞评论
				*/
				$scope.likeTheComment = function (comment, ev) {
					$scope.isChangingLikeStauts = true;
					$http.put(BaseUrl + '/comment/' + $scope.user._id + '/' + comment._id + '/up')
						.then(function (response) {
							var index = comment.LikeUser.indexOf($scope.user._id);
							var indexDis = comment.DislikeUser.indexOf($scope.user._id);
							if (indexDis >= 0) {
								comment.DislikeUser.splice(index, 1);
							}
							if (index < 0) {
								comment.LikeUser.push($scope.user._id)
							}
							$scope.isChangingLikeStauts = false;
						}, function (error) {
							$scope.isChangingLikeStauts = false;
							if (error.status === 400 && error.data === "Added") {
								return;
							}
						});
				};

				/*
					踩评论
				*/
				$scope.dislikeTheComment = function (comment, ev) {
					$scope.isChangingLikeStauts = true;
					$http.put(BaseUrl + '/comment/' + $scope.user._id + '/' + comment._id + '/down')
						.then(function (response) {
							var index = comment.LikeUser.indexOf($scope.user._id);
							var indexDis = comment.DislikeUser.indexOf($scope.user._id);
							if (index >= 0) {
								comment.LikeUser.splice(index, 1);
							}
							if (indexDis < 0) {
								comment.DislikeUser.push($scope.user._id)
							}
							$scope.isChangingLikeStauts = false;
						}, function (error) {
							$scope.isChangingLikeStauts = false;
							if (error.status === 400 && error.data === "Removed") {
								return;
							}
						});
				};

				$scope.closeDialog = function () {
					$mdDialog.cancel();
				};
			}])
		.controller('topicDetailCtrl', ['$scope', '$stateParams', '$mdDialog', '$http',
			'BaseUrl', 'localStorageService', 'alertService', '$state',
			function ($scope, $stateParams, $mdDialog, $http,
				BaseUrl, localStorageService, alertService, $state) {
				$scope.user = localStorageService.get('userInfo');
				$scope.followButtonText = "";
				$scope.isFollowing = false;
				$scope.disableLoadingMore = false;
				$scope.topic = {};
				$scope.topicAuthor = {
					ID: '',
					TopicNumber: 0,
					ArticleNumber: 0
				};
				$scope.commentList = [];
				$scope.newCommentContent = "";
				var pageNum = 1;
				var topic_id = $stateParams.id;

				/*
				loading state
				*/
				$scope.isPostingNewComment = false;
				$scope.isReplyingComment = false;
				$scope.isLoading = false;
				$scope.isLoadingComments = false;
				$scope.isChangingLikeStauts = false;
				$scope.isChangingTopicLikeStauts = false;

				/*
					评论帖子 
				*/
				$scope.addNewCommentToTopic = function (ev) {
					$scope.isPostingNewComment = true;
					$http.post(BaseUrl + '/comment/' + $scope.user._id + '/' + topic_id,
						{
							Comment: $scope.newCommentContent,
							ContextID: "",
							TargetUserID: "",
							Author: $scope.user.DisplayName,
							TargetAuthor: ""
						})
						.then(function (response) {
							$scope.newCommentContent = "";
							$scope.commentList.unshift(response.data);
							$scope.isPostingNewComment = false;
						}, function (error) {
							$scope.isPostingNewComment = false;
							alertService.showAlert('发布评论失败，请重试', ev);
						});
				};

				/*
					打开回复评论的对话框
				*/
				$scope.commentReply = function (comment, ev) {
					$mdDialog.show({
						controller: 'addNewCommentCtrl',
						templateUrl: 'dist/pages/add-new-comment.html',
						parent: angular.element(document.body),
						targetEvent: ev,
						clickOutsideToClose: false,
						fullscreen: false
					})
						.then(function (data) {
							sendCommentReply(comment, data, ev);
							// handle comment data
						}, function () {
							// canceled
						});
				};

				/*
					查看对话
				*/
				$scope.seeConversation = function (comment, ev) {
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
						.then(function (data) {

						}, function () {
							// canceled
						});
				};

				/*
					收藏这个话题
				*/
				$scope.goAddTopicToFav = function (ev) {
					$http.put(BaseUrl + '/user-topic-fav/' + $scope.user._id + '/' + topic_id)
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

				/*
					举报这个话题
				*/
				$scope.reportTheTopic = function (ev) {
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
						.then(function (data) {
							postNewReportMessage(data, 'TOPIC', ev);
						}, function () {
							// canceled
						});
				};

				$scope.reportTheComment = function (comment, ev) {
					$mdDialog.show({
						controller: 'addReportCtrl',
						templateUrl: 'dist/pages/add-report.html',
						parent: angular.element(document.body),
						targetEvent: ev,
						clickOutsideToClose: false,
						fullscreen: false,
						locals: {
							target: comment
						}
					})
						.then(function (data) {
							postNewReportMessage(data, 'COMMENT', ev);
						}, function () {
							// canceled
						});
				};

				/*
					给发帖人发私信
				*/
				$scope.sendPrivateMessage = function (ev) {
					var topicAuthor = {
						_id: $scope.topic.UserID,
						DisplayName: $scope.topic.Author
					}
					$mdDialog.show({
						controller: 'sendSpecificMessageCtrl',
						templateUrl: 'dist/pages/send-specific-message.html',
						parent: angular.element(document.body),
						targetEvent: ev,
						clickOutsideToClose: false,
						fullscreen: false,
						locals: {
							targetUser: topicAuthor,
							user: $scope.user
						}
					})
						.then(function (data) {

						}, function () {
							// canceled mdDialog
						});
				};

				$scope.goToUserDetail = function () {
					var url = $state.href('user-detail', { id: $scope.topic.UserID });
					window.open(url, '_blank');
				};

				function postNewReportMessage(data, signal, ev) {
					var body = {};
					body.Author = data.Author;
					body.Category = data.Category.ID;
					body.Content = data.Content;
					body.TargetLink = data.TargetLink;
					body.TargetID = data.TargetID;
					body.Type = signal;
					body.TargetUserID = data.TargetUserID;
					$scope.isPosting = true;
					$http.post(BaseUrl + '/complaint-message/' + $scope.user._id, body)
						.then(function (response) {
							$scope.isPosting = false;
							alertService.showAlert('举报成功，请耐心等待处理结果');
						}, function (error) {
							$scope.isPosting = false;
							if (error.status === 400) {
								alertService.showAlert('您已举报过该内容，请勿重复举报');
							} else {
								alertService.showAlert('举报失败，请重试');
							}
						});
				}

				/*
					点赞帖子
				*/
				$scope.likeTheTopic = function (ev) {
					$scope.isChangingTopicLikeStauts = true;
					$http.put(BaseUrl + '/topic/' + $scope.user._id + '/' + $scope.topic._id + '/up')
						.then(function (response) {
							$scope.isChangingTopicLikeStauts = false;
							var index = $scope.topic.LikeUser.indexOf($scope.user._id);
							var indexDis = $scope.topic.DislikeUser.indexOf($scope.user._id);
							if (indexDis >= 0) {
								$scope.topic.DislikeUser.splice(index, 1);
							}
							if (index < 0) {
								$scope.topic.LikeUser.push($scope.user._id)
							}
						}, function (error) {
							$scope.isChangingTopicLikeStauts = false;
							if (error.status === 400 && error.data === "Added") {
								return;
							}
						});
				};

				/*
					踩帖子
				*/
				$scope.dislikeTheTopic = function (ev) {
					$scope.isChangingTopicLikeStauts = true;
					$http.put(BaseUrl + '/topic/' + $scope.user._id + '/' + $scope.topic._id + '/down')
						.then(function (response) {
							$scope.isChangingTopicLikeStauts = false;
							var index = $scope.topic.LikeUser.indexOf($scope.user._id);
							var indexDis = $scope.topic.DislikeUser.indexOf($scope.user._id);
							if (index >= 0) {
								$scope.topic.LikeUser.splice(index, 1);
							}
							if (indexDis < 0) {
								$scope.topic.DislikeUser.push($scope.user._id)
							}
						}, function (error) {
							$scope.isChangingTopicLikeStauts = false;
							if (error.status === 400 && error.data === "Removed") {
								return;
							}
						});
				};

				/*
					删除帖子
				*/
				$scope.deleteTopic = function (ev) {
					var confirm = $mdDialog.confirm()
						.title('提示')
						.textContent('确定删除这条帖子？')
						.ariaLabel('')
						.targetEvent(ev)
						.ok('确定')
						.cancel('取消');
					$mdDialog.show(confirm).then(function () {
						$scope.isDeleting = true;
						$http.delete(BaseUrl + '/topic/' + $scope.topic._id)
							.then(function (data) {
								alertService.showAlert('删除成功', ev);
								$state.go('bbs');
							}, function (error) {
								alertService.showAlert('删除失败', ev);
							});
					}, function () {
						// canceled
					});
				};

				/*
					删除评论
				*/
				$scope.deleteComment = function (comment, ev) {
					var confirm = $mdDialog.confirm()
						.title('提示')
						.textContent('确定删除这条评论？')
						.ariaLabel('')
						.targetEvent(ev)
						.ok('确定')
						.cancel('取消');
					$mdDialog.show(confirm).then(function () {
						$http.delete(BaseUrl + '/comment/' + comment._id)
							.then(function (response) {
								$scope.commentList.splice($scope.commentList.indexOf(comment), 1);
							}, function (error) {
								alertService.showAlert('删除评论成功', ev);
							});
					}, function () {
						// canceled
					});
				};

				/*
					点赞评论
				*/
				$scope.likeTheComment = function (comment, ev) {
					$scope.isChangingLikeStauts = true;
					$http.put(BaseUrl + '/comment/' + $scope.user._id + '/' + comment._id + '/up')
						.then(function (response) {
							var index = comment.LikeUser.indexOf($scope.user._id);
							var indexDis = comment.DislikeUser.indexOf($scope.user._id);
							if (indexDis >= 0) {
								comment.DislikeUser.splice(index, 1);
							}
							if (index < 0) {
								comment.LikeUser.push($scope.user._id)
							}
							$scope.isChangingLikeStauts = false;
						}, function (error) {
							$scope.isChangingLikeStauts = false;
							if (error.status === 400 && error.data === "Added") {
								return;
							}
						});
				};

				/*
					踩评论
				*/
				$scope.dislikeTheComment = function (comment, ev) {
					$scope.isChangingLikeStauts = true;
					$http.put(BaseUrl + '/comment/' + $scope.user._id + '/' + comment._id + '/down')
						.then(function (response) {
							var index = comment.LikeUser.indexOf($scope.user._id);
							var indexDis = comment.DislikeUser.indexOf($scope.user._id);
							if (index >= 0) {
								comment.LikeUser.splice(index, 1);
							}
							if (indexDis < 0) {
								comment.DislikeUser.push($scope.user._id)
							}
							$scope.isChangingLikeStauts = false;
						}, function (error) {
							$scope.isChangingLikeStauts = false;
							if (error.status === 400 && error.data === "Removed") {
								return;
							}
						});
				};

				/*
					收起，展开帖子内容
				*/
				$scope.changeExpandState = function () {
					$scope.topic.Expand = !$scope.topic.Expand;
				};

				/*
					加载更多
				*/
				$scope.loadMore = function () {
					loadTopicComments(++pageNum, true);
				};

				/*
					回复评论
				*/
				function sendCommentReply(comment, newComment, ev) {
					$scope.isReplyingComment = true;
					$http.post(BaseUrl + '/comment/' + $scope.user._id + '/' + topic_id,
						{
							Comment: newComment,
							ContextID: comment.TargetContextID,
							TargetUserID: comment.UserID,
							Author: $scope.user.DisplayName,
							TargetAuthor: comment.Author
						})
						.then(function (response) {
							$scope.commentList.push(response.data);
							$scope.isReplyingComment = false;
						}, function (error) {
							alertService.showAlert('回复评论失败，请重试', ev);
							$scope.isReplyingComment = false;
						});
				}

				$scope.followOperation = function (ev) {
					$scope.isOperating = true;
					if ($scope.isFollowing) {
						$http.put(BaseUrl + '/user-unfollow/' + $scope.user._id + '/' + $scope.topic.UserID)
							.then(function (response) {
								$scope.followButtonText = "关注";
								$scope.isOperating = false;
								$scope.isFollowing = false;
							}, function (error) {
								alertService.showAlert('取消关注失败', ev);
								$scope.isOperating = false;
							});
					} else {
						$http.put(BaseUrl + '/user-follow/' + $scope.user._id + '/' + $scope.topic.UserID)
							.then(function (response) {
								$scope.followButtonText = "取消关注";
								$scope.isOperating = false;
								$scope.isFollowing = true;
							}, function (error) {
								alertService.showAlert('关注失败', ev);
								$scope.isOperating = false;
							});
					}
				};

				function getTopicAuthorInfo() {
					$scope.isLoadingUserInfo = true;
					return $http.get(BaseUrl + '/get-publish-number/' + $scope.topic.UserID)
						.then(function (response) {
							$scope.isLoadingUserInfo = false;
							$scope.topicAuthor.ID = $scope.topic.UserID;
							$scope.topicAuthor.TopicNumber = response.data.TopicNumber;
							$scope.topicAuthor.ArticleNumber = response.data.ArticleNumber;
							checkFollowingState();
						}, function (error) {
							$scope.isLoadingUserInfo = false;
							$scope.isLoadingUserInfoHasError = true;
						});
				}

				function checkFollowingState() {
					$http.get(BaseUrl + '/user-detail/' + $scope.user._id + '/' + $scope.topic.UserID)
						.then(function (response) {
							$scope.isLoading = false;
							$scope.isFollowing = response.data.IsFollowing;
							$scope.followButtonText = $scope.isFollowing ? "取消关注" : '关注';
						}, function (error) {
							$scope.isLoading = false;
							$scope.isLoadingHasError = true;
						});
				}

				function addTopicView() {
					$http.put(BaseUrl + '/topic/' + topic_id)
						.then(function (response) {
							// 文章浏览加1
						}, function (error) {

						});
				}

				function loadTopicDetail() {
					$scope.isLoading = true;
					return $http.get(BaseUrl + '/topic/' + $scope.user._id + '/' + topic_id)
						.then(function (response) {
							$scope.isLoading = false;
							angular.extend($scope.topic, response.data);
							getTopicAuthorInfo();
						}, function (error) {
							$scope.isLoading = false;
							alertService.showAlert('加载帖子失败，请重试');
						});
				}

				function loadTopicComments(pageNum, isLoadingMore) {
					$scope.isLoadingComments = true;
					var body = {
						PageNum: pageNum
					}
					return $http.post(BaseUrl + '/comment/' + topic_id, body)
						.then(function (response) {
							$scope.isLoadingComments = false;
							if (isLoadingMore) {
								$scope.commentList = $scope.commentList.concat(response.data);
								if (response.data.length < 5) {
									$scope.disableLoadingMore = true;
								}
							} else {
								$scope.commentList = response.data;
							}
						}, function (error) {
							$scope.isLoadingComments = false;
							alertService.showAlert('加载评论，请重试');
						});
				}

				loadTopicDetail().then(loadTopicComments(1, false).then(addTopicView()));

			}])
}());