(function () {
    'use strict';

    var subModules = ['The.Power.Soul.Introduction', 'The.Power.Soul.BBS', 'The.Power.Soul.Caculator', 'The.Power.Soul.Tools', 'The.Power.Soul.Topic.Detail', 'The.Power.Soul.NewArticle', 'The.Power.Soul.UserDetail', 'The.Power.Soul.Mall', 'LocalStorageModule'];
    angular.module('The.Power.Soul', ['ngMaterial', 'ui.router'].concat(subModules)).config(function (localStorageServiceProvider) {
        localStorageServiceProvider.setPrefix('thepowersoul');
    }).config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
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
            templateUrl: 'dist/pages/topic-detail.html',
            controller: 'topicDetailCtrl'
        }).state('new-article', {
            url: '/new-article',
            templateUrl: 'dist/pages/add-new-article.html',
            controller: 'addNewArticleCtrl'
        }).state('user-detail', {
            url: '/user-detail',
            templateUrl: 'dist/pages/user-detail.html',
            controller: 'userDetailCtrl'
        }).state('mall', {
            url: '/mall',
            templateUrl: 'dist/pages/mall.html',
            controller: 'mallCtrl'
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
            var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
            if ($scope.newUser.Name.length === 0 || $scope.newUser.Name.length > 5 || !reg.test($scope.newUser.Email) || $scope.newUser.Password === "" || $scope.newUser.ConfirmPassword === "" || $scope.newUser.Password !== $scope.newUser.ConfirmPassword) {
                $scope.signupButtonText = "请输入正确的注册信息";
                return true;
            } else {
                $scope.signupButtonText = "注册";
                return false;
            }

            // if ($scope.newUser.Name === "" || $scope.newUser.DisplayName === "" ||
            //     $scope.newUser.Email === "" || $scope.newUser.Password === "" || 
            //     $scope.newUser.ConfirmPassword === "") {
            //     $scope.signupButtonText = "请输入正确的注册信息";
            //     return true;
            // } else {
            //     $scope.signupButtonText = "注册";
            //     return false;
            // }
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
    }]).controller('mainCtrl', ['$scope', '$state', '$mdDialog', 'localStorageService', function ($scope, $state, $mdDialog, localStorageService) {
        $scope.loggedIn = false;
        // localstorage check
        if (localStorageService.get('userInfo')) {
            $socpe.loggedIn = true;
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

        $scope.goToMall = function () {
            $state.go('mall');
        };
    }]);
})();
(function () {
				'use strict';

				angular.module('The.Power.Soul.NewArticle', ['ngMaterial', 'textAngular']).config(['$provide', function ($provide) {
								// this demonstrates how to register a new tool and add it to the default toolbar
								$provide.decorator('taOptions', ['$delegate', function (taOptions) {
												// $delegate is the taOptions we are decorating
												// here we override the default toolbars and classes specified in taOptions.
												taOptions.forceTextAngularSanitize = true; // set false to allow the textAngular-sanitize provider to be replaced
												taOptions.keyMappings = []; // allow customizable keyMappings for specialized key boards or languages
												taOptions.toolbar = [['bold', 'italics', 'underline', 'ul', 'ol']];
												taOptions.classes = {
																focussed: 'focussed',
																toolbar: 'btn-toolbar',
																toolbarGroup: 'btn-group',
																toolbarButton: 'btn btn-default',
																toolbarButtonActive: 'active',
																disabled: 'disabled',
																textEditor: 'form-control',
																htmlEditor: 'form-control'
												};
												return taOptions; // whatever you return will be the taOptions
								}]);
								// this demonstrates changing the classes of the icons for the tools for font-awesome v3.x
								$provide.decorator('taTools', ['$delegate', function (taTools) {
												taTools.bold.iconclass = 'fa fa-bold';
												taTools.italics.iconclass = 'fa fa-italic';
												taTools.underline.iconclass = 'fa fa-underline';
												taTools.ul.iconclass = 'fa fa-list-ul';
												taTools.ol.iconclass = 'fa fa-list-ol';
												taTools.undo.iconclass = 'icon-undo';
												taTools.redo.iconclass = 'icon-repeat';
												taTools.justifyLeft.iconclass = 'icon-align-left';
												taTools.justifyRight.iconclass = 'icon-align-right';
												taTools.justifyCenter.iconclass = 'icon-align-center';
												taTools.clear.iconclass = 'icon-ban-circle';
												taTools.insertLink.iconclass = 'icon-link';
												taTools.insertImage.iconclass = 'icon-picture';
												// there is no quote icon in old font-awesome so we change to text as follows
												delete taTools.quote.iconclass;
												taTools.quote.buttontext = 'quote';
												return taTools;
								}]);
				}]).controller('addNewArticleCtrl', ['$scope', function ($scope) {
								$scope.richTextContent = "";
								$scope.publishArticle = function () {};

								$scope.saveAsDraft = function () {};

								function autoSaveDraft() {}
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
	}]).service('topicOperation', ['$resource', function ($resource) {
		var serviceUrl = "localhost:3000/";
		var res = $resource(serviceUrl + 'topic', { id: '@id' }, {
			'getTopic': { method: 'GET', isArray: true },
			'addNewTopic': { method: 'POST', isArray: false },
			'deleteTopic': { method: 'DELETE', inArray: false }
		});
		return {
			res: res
		};
	}]).controller('addNewTopicCtrl', ['$scope', '$mdDialog', function ($scope, $mdDialog) {
		$scope.topic = {
			Title: "",
			Content: ""
		};

		$scope.submit = function () {
			$mdDialog.hide($scope.topic);
		};
	}]).controller('bbsCtrl', ['$scope', '$mdDialog', 'selectorItems', '$state', 'alertService', 'topicOperation', 'localStorageService', function ($scope, $mdDialog, selectorItems, $state, alertService, topicOperation, localStorageService) {
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
		$scope.isSubmittingTopic = false;
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

		$scope.addNewArticle = function (ev) {
			if (localStorageService.get('userInfo')) {
				var url = $state.href('new-article');
				window.open(url, '_blank');
			} else {
				$mdDialog.show({
					controller: 'loginOrSignupCtrl',
					templateUrl: 'dist/pages/login-and-signup.html',
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

		$scope.goTopicDetail = function (topic, ev) {
			if (localStorageService.get('userInfo')) {
				var url = $state.href('topic-detail', { id: topic.ID });
				window.open(url, '_blank');
			} else {
				$mdDialog.show({
					controller: 'loginOrSignupCtrl',
					templateUrl: 'dist/pages/login-and-signup.html',
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

		$scope.addNewTopic = function (ev) {
			if (localStorageService.get('userInfo')) {
				$mdDialog.show({
					controller: 'addNewTopicCtrl',
					templateUrl: 'dist/pages/add-new-topic.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose: true,
					fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
				}).then(function (data) {
					$scope.isSubmittingTopic = false;
					topicOperation.res.addNewTopic({}, data, function (result) {}, function (error) {
						alertService.showAlert('发表帖子失败，请重试。', ev);
					}).$promise.finally(function () {
						$scope.isSubmittingTopic = false;
					});
				}, function () {
					// dialog canceled
				});
			} else {
				$mdDialog.show({
					controller: 'loginOrSignupCtrl',
					templateUrl: 'dist/pages/login-and-signup.html',
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

    angular.module('The.Power.Soul.Mall', ['ngMaterial']).controller('mallCtrl', ['$scope', function ($scope) {}]);
})();
(function () {
	'use strict';

	angular.module('The.Power.Soul.Topic.Detail', ['ngMaterial']).controller('addNewCommentCtrl', ['$scope', '$mdDialog', function ($scope, $mdDialog) {
		$scope.comment = "";

		$scope.submit = function () {
			$mdDialog.hide($scope.comment);
		};
	}]).controller('topicDetailCtrl', ['$scope', '$stateParams', '$mdDialog', function ($scope, $stateParams, userInfoService, $mdDialog) {
		var topicID = $stateParams.id;
		// $scope.user = userInfoService.get();

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
				templateUrl: 'dist/pages/add-new-comment.html',
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

    angular.module('The.Power.Soul.UserDetail', ['ngMaterial']).controller('userDetailCtrl', ['$scope', function ($scope) {}]);
})();
(function () {
    'use strict';

    angular.module('The.Power.Soul.Tools', []).service('alertService', ['$mdDialog', function ($mdDialog) {
        return {
            showAlert: function (text, ev) {
                $mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).title('提示').textContent(text).ariaLabel('Alert Dialog Demo').ok('好的').targetEvent(ev));
            }
        };
    }]);
})();