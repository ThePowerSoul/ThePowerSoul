(function () {
    'use strict';

    var subModules = ['The.Power.Soul.Introduction', 'The.Power.Soul.BBS', 'The.Power.Soul.Caculator', 'The.Power.Soul.Tools', 'The.Power.Soul.Topic.Detail'];
    angular.module('The.Power.Soul', ['ngMaterial', 'ui.router'].concat(subModules)).config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.when('', 'introduction');
        $stateProvider.state('introduction', {
            url: '/introduction',
            templateUrl: 'dist/pages/introduction.html',
            controller: 'introductionCtrl'
        }).state('caculator', {
            url: '/caculator',
            templateUrl: 'dist/pages/caculator.html',
            controller: 'caculatorCtrl'
        }).state('bbs', {
            url: '/bbs',
            templateUrl: 'dist/pages/bbs.html',
            controller: 'bbsCtrl'
        }).state('topic-detail', {
            url: '/topic-detail/{id}',
            templateUrl: 'dist/pages/topicDetail.html',
            controller: 'topicDetailCtrl'
        });
    }]).controller('loginOrSignupCtrl', ['$scope', '$mdDialog', function ($scope, $mdDialog) {
        $scope.flag = true;
        $scope.signupButtonText = "";
        $scope.loginButtonText = "";
        $scope.newUser = {
            Name: "",
            DisplayName: "",
            Email: "",
            Password: "",
            ConfirmPassword: ""
        };
        $scope.user = {
            Email: "",
            Password: ""
        };

        $scope.changePanel = function (signal) {
            if (signal === "signup") {
                $scope.flag = true;
            } else if (signal === "login") {
                $scope.flag = false;
            }
        };

        $scope.login = function () {
            $mdDialog.hide();
        };

        $scope.signup = function () {
            $mdDialog.hide();
        };

        $scope.disableSignupButtonOrNot = function () {
            if ($scope.newUser.Name === "" || $scope.newUser.DisplayName === "" || $scope.newUser.Email === "" || $scope.newUser.Password === "" || $scope.newUser.ConfirmPassword === "") {
                $scope.signupButtonText = "请输入正确的注册信息";
                return true;
            } else {
                $scope.signupButtonText = "注册";
                return false;
            }
        };

        $scope.disableLoginButtonOrNot = function () {
            if ($scope.user.Email === "" || $scope.user.Password === "") {
                $scope.loginButtonText = "请输入正确的邮箱和密码";
                return true;
            } else {
                $scope.loginButtonText = "登录";
                return false;
            }
        };
    }]).controller('mainCtrl', ['$scope', '$state', 'userInfoService', '$mdDialog', function ($scope, $state, userInfoService, $mdDialog) {
        $scope.loggedIn = false;
        if (userInfoService.get()) {
            $scope.loggedIn = true;
        }

        $scope.openLoginOrSignupPanel = function (ev) {
            $mdDialog.show({
                controller: 'loginOrSignupCtrl',
                templateUrl: 'dist/pages/loginAndSignup.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
            });
        };

        $scope.goToIntroduction = function () {
            $state.go('introduction');
        };

        $scope.goToCaculator = function () {
            $state.go('caculator');
        };

        $scope.goToBBS = function () {
            $state.go('bbs');
        };
    }]);
})();
(function () {
    'use strict';

    angular.module('The.Power.Soul.BBS', ['ngMaterial', 'The.Power.Soul.Tools']).constant('selectorItems', [{
        "Value": "STRENGTHTRAINING",
        "Title": "力量训练"
    }, {
        "Value": "YOGA",
        "Title": "瑜伽训练"
    }, {
        "Value": "AFTERSALE",
        "Title": "品牌售后"
    }]).controller('addNewTopicCtrl', ['$scope', '$mdDialog', function ($scope, $mdDialog) {
        $scope.topic = {
            Title: "",
            Content: ""
        };

        $scope.submit = function () {
            $mdDialog.hide($scope.topic);
        };
    }]).controller('bbsCtrl', ['$scope', '$mdDialog', 'userInfoService', 'selectorItems', '$state', 'alertService', function ($scope, $mdDialog, userInfoService, selectorItems, $state, alertService) {
        $scope.customFullscreen = false;
        $scope.selectedItem = "STRENGTHTRAINING";
        $scope.selectorItems = selectorItems;
        $scope.searchContext = "";
        $scope.topicList = [{
            ID: "111",
            Title: "PowerliftingPowerliftingPowerlifting",
            Content: "作为同一时期的作家，蒋方舟似乎有点“固守”自己的领域。郭敬明已经拍了两部电影了，韩寒也在做自己的电影。但蒋方舟对自己要不要做这些事情，想得很清楚。她鼓励现代人不要害怕被时代抛下。她调侃地说，其实被时代淘汰也挺好的，一定还有一些跟你一样被时代淘汰的人，慢腾腾地在后面溜达，你们自己组一个局不是很好吗？对于韩寒日前表示，在自己想清楚之前不再写长篇小说了。蒋方舟说，她还是很期待韩寒的长篇小说的。蒋方舟的业余生活跟普通女生一样，喜欢淘宝，买的衣服曾把大学宿舍淹没。喜欢本身不胖还是嚷着要减肥，做饭对她来说，只是一个调剂，不是很喜欢，但可以减压。她还喜欢爬山，想在30岁之前多爬几座山，因为爬山的过程很痛苦，但下山后就会感受到放大了的快乐。作为同一时期的作家，蒋方舟似乎有点“固守”自己的领域。郭敬明已经拍了两部电影了，韩寒也在做自己的电影。但蒋方舟对自己要不要做这些事情，想得很清楚。她鼓励现代人不要害怕被时代抛下。她调侃地说，其实被时代淘汰也挺好的，一定还有一些跟你一样被时代淘汰的人，慢腾腾地在后面溜达，你们自己组一个局不是很好吗？对于韩寒日前表示，在自己想清楚之前不再写长篇小说了。蒋方舟说，她还是很期待韩寒的长篇小说的。蒋方舟的业余生活跟普通女生一样，喜欢淘宝，买的衣服曾把大学宿舍淹没。喜欢本身不胖还是嚷着要减肥，做饭对她来说，只是一个调剂，不是很喜欢，但可以减压。她还喜欢爬山，想在30岁之前多爬几座山，因为爬山的过程很痛苦，但下山后就会感受到放大了的快乐。",
            CreatedAt: new Date(),
            Category: "STRENGTHTRAINING",
            Like: 111,
            Dislike: 222,
            Author: "Joey"
        }];
        $scope.commentList = [];

        /*
        loading state
        */
        $scope.isLoadingTopic = false;
        $scope.isSubmittingTipic = false;
        $scope.isChangingCategory = false;

        /*
        filter topic
        */
        $scope.getSelectedCategory = function () {};

        /*
        search topic
        */
        $scope.searchTopic = function () {
            console.log("search");
        };

        $scope.searchTopicKeyboard = function (ev) {
            if (ev.keyCode === 13) {
                console.log("search");
            }
        };

        $scope.goTopicDetail = function (topic) {
            if (userInfoService.get()) {
                var url = $state.href('topic-detail', { id: topic.ID });
                window.open(url, '_blank');
            } else {
                alertService.showAlert('登录才能查看');
            }
        };

        $scope.addNewTopic = function (ev) {
            if (userInfoService.get()) {
                $mdDialog.show({
                    controller: 'addNewTopicCtrl',
                    templateUrl: 'dist/pages/addNewTopic.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                }).then(function (data) {
                    // handle new topic data
                }, function () {
                    // canceled
                });
            } else {
                $mdDialog.show({
                    controller: 'loginOrSignupCtrl',
                    templateUrl: 'dist/pages/loginAndSignup.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                }).then(function (data) {
                    // handle user data
                }, function () {
                    // canceled
                });
            }
        };
    }]);
})();
(function () {
    'use strict';

    angular.module('The.Power.Soul.Caculator', ['ngMaterial']).controller('caculatorCtrl', ['$scope', function ($scope) {}]);
})();
(function () {
    'use strict';

    angular.module('The.Power.Soul.Introduction', ['ngMaterial']).controller('introductionCtrl', ['$scope', function ($scope) {}]);
})();
(function () {
	'use strict';

	angular.module('The.Power.Soul.Topic.Detail', ['ngMaterial']).controller('addNewCommentCtrl', ['$scope', '$mdDialog', function ($scope, $mdDialog) {
		$scope.comment = "";

		$scope.submit = function () {
			$mdDialog.hide($scope.comment);
		};
	}]).controller('topicDetailCtrl', ['$scope', '$stateParams', 'userInfoService', '$mdDialog', function ($scope, $stateParams, userInfoService, $mdDialog) {
		var topicID = $stateParams.id;
		$scope.user = userInfoService.get();
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

		$scope.commentList = [{
			ID: "c-1",
			TopicID: "t-1",
			UserID: "u-1",
			CreatedAt: new Date(),
			Author: "Joe",
			Content: "说的确实有道理",
			Like: 10,
			Dislike: 11
		}, {
			ID: "c-1",
			TopicID: "t-1",
			UserID: "u-1",
			CreatedAt: new Date(),
			Author: "Leo",
			Content: "说的确实没有道理",
			Like: 10,
			Dislike: 11
		}];

		$scope.commentReply = function (comment, ev) {
			$mdDialog.show({
				controller: 'addNewCommentCtrl',
				templateUrl: 'dist/pages/addNewComment.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose: true,
				fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
			}).then(function (data) {
				// handle comment data
			}, function () {
				// canceled
			});
		};

		$scope.changeExpandState = function () {
			$scope.topic.Expand = !$scope.topic.Expand;
		};
	}]);
})();
(function () {
    'use strict';

    angular.module('The.Power.Soul.Tools', []).factory('userInfoService', function () {
        var userInfoStorage = {};
        return {
            get: function () {
                return userInfoStorage;
            },
            set: function (data) {
                angular.extend(userInfoStorage, data);
                return userInfoStorage;
            }
        };
    }).service('alertService', ['$mdDialog', function ($mdDialog) {
        return {
            showAlert: function (text, ev) {
                $mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).title('提示').textContent(text).ariaLabel('Alert Dialog Demo').ok('好的').targetEvent(ev));
            }
        };
    }]);
})();