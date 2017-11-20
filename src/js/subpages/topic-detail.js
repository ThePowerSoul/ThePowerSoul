(function() {   
    'use strict';
    angular.module('The.Power.Soul.Topic.Detail', ['ngMaterial'])
    	.controller('addNewCommentCtrl', ['$scope', '$mdDialog', function($scope, $mdDialog) {
    		$scope.comment = "";

    		$scope.submit = function() {
    			$mdDialog.hide($scope.comment);
    		};	
    	}])
    	.controller('topicDetailCtrl', ['$scope', '$stateParams', 'userInfoService', '$mdDialog',
    		function($scope, $stateParams, userInfoService, $mdDialog) {
    		var topicID = $stateParams.id;
    		$scope.user = userInfoService.get();

    		/*
			loading state
    		*/
    		$scope.isPostingNewComment = false;
    		$scope.isReplyingComment = false;
    		$scope.isLoading = false;
    		$scope.isLoadingHasError = false;

    		$scope.topic = {	
				ID: "111",
				Title: "PowerliftingPowerliftingPowerlifting",
				Content: "作为同一时期的作家，蒋方舟似乎有点“固守”自己的领域。郭敬明已经拍了两部电影了，韩寒也在做自己的电影。但蒋方舟对自己要不要做这些事情，想得很清楚。她鼓励现代人不要害怕被时代抛下。她调侃地说，其实被时代淘汰也挺好的，一定还有一些跟你一样被时代淘汰的人，慢腾腾地在后面溜达，你们自己组一个局不是很好吗？对于韩寒日前表示，在自己想清楚之前不再写长篇小说了。蒋方舟说，她还是很期待韩寒的长篇小说的。蒋方舟的业余生活跟普通女生一样，喜欢淘宝，买的衣服曾把大学宿舍淹没。喜欢本身不胖还是嚷着要减肥，做饭对她来说，只是一个调剂，不是很喜欢，但可以减压。她还喜欢爬山，想在30岁之前多爬几座山，因为爬山的过程很痛苦，但下山后就会感受到放大了的快乐。作为同一时期的作家，蒋方舟似乎有点“固守”自己的领域。郭敬明已经拍了两部电影了，韩寒也在做自己的电影。但蒋方舟对自己要不要做这些事情，想得很清楚。她鼓励现代人不要害怕被时代抛下。她调侃地说，其实被时代淘汰也挺好的，一定还有一些跟你一样被时代淘汰的人，慢腾腾地在后面溜达，你们自己组一个局不是很好吗？对于韩寒日前表示，在自己想清楚之前不再写长篇小说了。蒋方舟说，她还是很期待韩寒的长篇小说的。蒋方舟的业余生活跟普通女生一样，喜欢淘宝，买的衣服曾把大学宿舍淹没。喜欢本身不胖还是嚷着要减肥，做饭对她来说，只是一个调剂，不是很喜欢，但可以减压。她还喜欢爬山，想在30岁之前多爬几座山，因为爬山的过程很痛苦，但下山后就会感受到放大了的快乐。",
				CreatedAt: new Date(),
				Category: "STRENGTHTRAINING",
				Like: 111,
				Dislike: 222,
				Author: "Joey",
				Expand: false
			};

			$scope.commentList = [
				{
					ID: "c-1",
					TopicID: "t-1",
					UserID: "u-1",
					CreatedAt: new Date(),
					Author: "Joe",
					Content: "说的确实有道理",
					Like: 10,
					Dislike: 11
				},
				{
					ID: "c-1",
					TopicID: "t-1",
					UserID: "u-1",
					CreatedAt: new Date(),
					Author: "Leo",
					Content: "说的确实没有道理",
					Like: 10,
					Dislike: 11
				}
			];

			$scope.commentReply = function(comment, ev) {
				$mdDialog.show({ 
		            controller: 'addNewCommentCtrl',
		            templateUrl: 'dist/pages/add-new-comment.html',
		            parent: angular.element(document.body),
		            targetEvent: ev,
		            clickOutsideToClose:true,
		            fullscreen: $scope.customFullscreen// Only for -xs, -sm breakpoints.
		        })
		        .then(function(data) {
		        	// handle comment data
		        }, function() {
		        	// canceled
		        });
			};

			$scope.changeExpandState = function() {
				$scope.topic.Expand = !$scope.topic.Expand;
			};
    	}])
}());