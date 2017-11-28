(function() {   
    'use strict';
    angular.module('The.Power.Soul.Article.Detail', ['ngMaterial', 'The.Power.Soul.Topic.Detail'])
        .controller('articleDetailCtrl', ['$scope', '$http', 'BaseUrl', 'localStorageService', '$stateParams',
        'alertService', '$mdDialog',
        function($scope, $http, BaseUrl, localStorageService, $stateParams, alertService, $mdDialog) {
            $scope.isLoading = false;
            $scope.isLoadingHasError = false;
            $scope.isLoadingComments = false;
            $scope.isLoadingCommentsHasError = false;
            $scope.isPosingNewComment = false;
            $scope.article = {};
            $scope.comments = [];
            $scope.newComment = "";
            $scope.isChangingLikeStauts = false;
            var user = localStorageService.get('userInfo');
            var article_id = $stateParams.id;

            $scope.goAddArticleToFav = function(ev) {
                $http.put(BaseUrl + '/user-article-fav/' + user._id + '/' + $scope.article._id)
                    .then(function(response) {
                        alertService.showAlert('收藏成功', ev);
                    }, function(error) {
                        if (error.status === 404 && error.data === 'UserNotFound') {
                            alertService.showAlert('用户不存在，请重新登录', ev);
                        } else if (error.status === 400 && error.data === 'Added') {
                            alertService.showAlert('已收藏，请勿重复添加', ev);
                        } else {
                            alertService.showAlert('收藏失败，请重试', ev);
                        }
                    });
            };

            $scope.postNewComment = function(ev) {
                $scope.isPosingNewComment = true;
                var body = {
                    Comment: $scope.newComment,
                    ContextID: "",
                    TargetUserID: "",
                    Author: user.DisplayName,
                    TargetAuthor: ""
                }
                $http.post(BaseUrl + '/comment/' + user._id + '/' + article_id, body)
                    .then(function(response) {
                        $scope.isPosingNewComment = false;
                        $scope.comments.push(response.data);
                        $scope.newComment = "";
                    }, function(error) {
                        $scope.isPosingNewComment = false;
                        alertService.showAlert('发表评论失败', ev);
                    });
            };

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

            $scope.likeTheArticle = function(ev) {
                $http.put(BaseUrl + '/article/' + user._id + '/' + $scope.article._id)
                    .then(function(response) {
                        $scope.article.LikeUser.push(user._id);
                    }, function(error) {
                        if (error.status === 400 && error.data === "Added") {
							return;
						}
                    }); 
            };

            $scope.likeTheComment = function(comment, ev) {
                $scope.isChangingLikeStauts = true;
				$http.put(BaseUrl + '/comment/' + user._id + '/' + comment._id + '/up')
					.then(function(response) {
						var index = comment.LikeUser.indexOf(user._id);
						var indexDis = comment.DislikeUser.indexOf(user._id);
						if (indexDis >= 0) {
							comment.DislikeUser.splice(index, 1);
						}
						if (index < 0) {
							comment.LikeUser.push(user._id)
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
				$http.put(BaseUrl + '/comment/' + user._id + '/' + comment._id + '/down')
					.then(function(response) {
						var index = comment.LikeUser.indexOf(user._id);
						var indexDis = comment.DislikeUser.indexOf(user._id);
						if (index >= 0) {
							comment.LikeUser.splice(index, 1);
						}
						if (indexDis < 0) {
							comment.DislikeUser.push(user._id)
						}
						$scope.isChangingLikeStauts = false;
					}, function(error) {
						$scope.isChangingLikeStauts = false;
						if (error.status === 400 && error.data === "Removed") {
							return;
						}
					});
            };  

            function sendCommentReply(comment, newComment, ev) {
                $http.post(BaseUrl + '/comment/' + user._id + '/' + article_id, 
                    {
                        Comment: newComment,
                        ContextID: comment.TargetContextID,
                        TargetUserID: comment.UserID,
                        Author: user.DisplayName,
                        TargetAuthor: comment.Author
                    })
                    .then(function(response) {
                        $scope.comments.push(response.data);
                    }, function(error) {
                        alertService.showAlert('回复评论失败，请重试', ev);
                    });
            }

            function getComments() {
                $scope.isLoadingComments = true;
                $http.get(BaseUrl + '/comment/' + article_id)
                    .then(function(response) {
                        $scope.isLoadingComments = false;
                        $scope.comments = response.data;
                    }, function(error) {
                        $scope.isLoadingComments = false;
                        $scope.isLoadingCommentsHasError = true;
                    });
            }

            function getArticle() {
                return $http.get(BaseUrl + '/article/' + article_id)
                    .then(function(response) {
                        $scope.isLoading = false;
                        $scope.article = response.data;
                    }, function(error) {
                        $scope.isLoadingHasError = true;
                        $scope.isLoading = false;
                    });
            }
            getArticle().then(getComments());

    	}])
}());