(function () {
    'use strict';

    var subModules = ['The.Power.Soul.Introduction', 'The.Power.Soul.BBS', 'The.Power.Soul.Caculator', 'The.Power.Soul.Tools', 'The.Power.Soul.Topic.Detail', 'The.Power.Soul.NewArticle', 'The.Power.Soul.UserDetail', 'The.Power.Soul.Mall', 'The.Power.Soul.Search.For.Users', 'LocalStorageModule'];
    angular.module('The.Power.Soul', ['ngMaterial', 'ui.router'].concat(subModules)).constant('BaseUrl', "http://localhost:3030").config(function (localStorageServiceProvider) {
        localStorageServiceProvider.setPrefix('thepowersoul');
    }).config(function ($httpProvider) {
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        // Serialize function  
        //只能是嵌套两层的对象  
        var param = function (obj) {
            var query = '',
                name,
                value,
                fullSubName,
                subName,
                subValue,
                innerObj,
                i;
            for (name in obj) {
                value = obj[name];
                //如果值是数组  
                if (value instanceof Array) {
                    for (i = 0; i < value.length; ++i) {
                        subValue = value[i];
                        fullSubName = name + '[' + i + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                    //如果值是对象  
                } else if (value instanceof Object) {
                    for (subName in value) {
                        subValue = value[subName];
                        fullSubName = name + '[' + subName + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                    如果值是字符串;
                } else if (value !== undefined && value !== null) {
                    query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                }
            }

            return query.length ? query.substr(0, query.length - 1) : query;
        };

        //重写transformRequest参数处理方法(利用param function 处理)  
        $httpProvider.defaults.transformRequest = [function (data) {
            return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
        }];
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
            url: '/user-detail/{id}',
            templateUrl: 'dist/pages/user-detail.html',
            controller: 'userDetailCtrl'
        }).state('mall', {
            url: '/mall',
            templateUrl: 'dist/pages/mall.html',
            controller: 'mallCtrl'
        });
    }]).controller('loginOrSignupCtrl', ['$scope', '$http', '$mdDialog', '$state', 'BaseUrl', 'localStorageService', 'alertService', function ($scope, $http, $mdDialog, $state, BaseUrl, localStorageService, alertService) {
        var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
        $scope.flag = true;
        $scope.signupButtonText = "";
        $scope.loginButtonText = "";
        $scope.isLogining = false;
        $scope.isSigningup = false;
        $scope.loginErrorText = "";
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

        $scope.login = function (ev) {
            $scope.isLogining = true;
            $http.post(BaseUrl + '/login', $scope.user).then(function (response) {
                $scope.isLogining = false;
                localStorageService.set('userInfo', response.data);
                $mdDialog.hide();
                alertService.showAlert('登录成功', ev);
            }, function (error) {
                $scope.isLogining = false;
                if (error.status === 400) {
                    $scope.loginErrorText = error.data;
                } else {
                    alertService.showAlert('登录失败，请重试', ev);
                }
            });
        };

        $scope.signup = function (ev) {
            $scope.isSigningup = true;
            $http.post(BaseUrl + '/signup', $scope.newUser).then(function (response) {
                // 注册成功，直接进行登录后的流程。
                $scope.isSigningup = false;
                localStorageService.set('userInfo', response.data);
                $mdDialog.hide();
                alertService.showAlert('注册成功，已自动登录', ev);
            }, function (error) {
                $scope.isSigningup = false;
                if (error.status === 400 && error.data === "邮箱已存在") {
                    $scope.newUser.Email = "邮箱已存在，请重新输入";
                } else if (error.status === 400 && error.data === "显示名已被占用") {
                    $scope.newUser.DisplayName = "显示名已被占用，请重新输入";
                } else {
                    alertService.showAlert('注册发生错误，请重试', ev);
                }
            });
        };

        $scope.disableSignupButtonOrNot = function () {
            if ($scope.newUser.Name.length === 0 || $scope.newUser.Name.length > 5 || !reg.test($scope.newUser.Email) || $scope.newUser.Password === "" || $scope.newUser.ConfirmPassword === "" || $scope.newUser.Password !== $scope.newUser.ConfirmPassword || $scope.newUser.Password.length < 6 || $scope.newUser.ConfirmPassword.length < 6) {
                $scope.signupButtonText = "请输入正确的注册信息";
                return true;
            } else {
                $scope.signupButtonText = "注册";
                return false;
            }
        };

        $scope.disableLoginButtonOrNot = function () {
            if ($scope.user.Email === "" || $scope.user.Password === "" || !reg.test($scope.user.Email) || $scope.user.Password.length < 6 || !reg.test($scope.user.Email)) {
                $scope.loginButtonText = "请输入正确的邮箱和密码";
                return true;
            } else {
                $scope.loginButtonText = "登录";
                return false;
            }
        };

        $scope.closeDialog = function (ev) {
            if ($scope.isLogining || $scope.isSigningup) {
                alertService.showAlert('正在进行操作，请勿关闭弹窗', ev);
            } else {
                $mdDialog.hide();
            }
        };
    }]).controller('mainCtrl', ['$scope', '$state', '$http', '$rootScope', '$mdDialog', 'localStorageService', function ($scope, $state, $http, $rootScope, $mdDialog, localStorageService) {
        $scope.loggedIn = false;
        // localstorage check
        if (localStorageService.get('userInfo')) {
            updateUserLoginState();
        }

        $rootScope.$on('$USERLOGGEDIN', function () {
            updateUserLoginState();
        });

        // 登录或注册成功，更新页面状态
        function updateUserLoginState() {
            $scope.loggedIn = true;
            $scope.loggedInUser = localStorageService.get('userInfo');
        }

        $scope.logOut = function () {
            $scope.loggedIn = false;
            localStorageService.remove('userInfo');
            $state.go('bbs');
        };

        $scope.searchForUsers = function (ev) {
            $mdDialog.show({
                controller: 'searchForUsersCtrl',
                templateUrl: 'dist/pages/search-for-users.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: false
            }).then(function (data) {
                updateUserLoginState();
            }, function () {
                // canceled mdDialog
            });
        };

        $scope.goToUserDetail = function () {
            $state.go('user-detail', { id: $scope.loggedInUser._id });
        };

        $scope.openLoginOrSignupPanel = function (ev) {
            $mdDialog.show({
                controller: 'loginOrSignupCtrl',
                templateUrl: 'dist/pages/login-and-signup.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: false
            }).then(function (data) {
                updateUserLoginState();
            }, function () {
                // canceled mdDialog
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

	angular.module('The.Power.Soul.BBS', ['ngMaterial', 'The.Power.Soul.Tools', 'ngResource']).constant('selectorItems', [{
		Title: "我关注的",
		Value: "FOLLOWING"
	}, {
		Title: "力量训练",
		Value: "STRENGTH"
	}, {
		Title: "瑜伽训练",
		Value: "YOGA"
	}, {
		Title: "形体训练",
		Value: "FITNESS"
	}, {
		Title: "跑步训练",
		Value: "RUNNING"
	}, {
		Title: "全部",
		Value: "ALL"
	}]).controller('addNewTopicCtrl', ['$scope', '$mdDialog', 'selectorItems', function ($scope, $mdDialog, selectorItems) {
		$scope.topic = {
			Title: "",
			Content: "",
			Category: ""
		};

		$scope.closeDialog = function (ev) {
			$mdDialog.hide();
		};

		$scope.categories = selectorItems;

		$scope.submit = function () {
			$mdDialog.hide($scope.topic);
		};
	}]).controller('bbsCtrl', ['$scope', '$mdDialog', '$rootScope', 'selectorItems', '$state', 'alertService', 'localStorageService', '$http', 'BaseUrl', function ($scope, $mdDialog, $rootScope, selectorItems, $state, alertService, localStorageService, $http, BaseUrl) {
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

		/*
  filter topic
  */
		$scope.getSelectedCategory = function () {
			// pageNum, category, keyword, loadMoreSignal
			loadTopics(1, $scope.selectedItem, $scope.searchContext, '');
		};

		/*
  search topic
  */
		$scope.searchTopic = function () {
			loadTopics(1, $scope.selectedItem, $scope.searchContext, '');
		};

		$scope.searchTopicKeyboard = function (ev) {
			if (ev.keyCode === 13) {
				loadTopics(1, $scope.selectedItem, $scope.searchContext, '');
			}
		};

		/*
   	topic operation
  */
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
					clickOutsideToClose: false,
					fullscreen: false
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
					clickOutsideToClose: false,
					fullscreen: false
				}).then(function (data) {
					$rootScope.$broadcast('$USERLOGGEDIN');
				}, function () {
					// canceled
				});
			}
		};

		$scope.addNewTopic = function (ev) {
			if (localStorageService.get('userInfo')) {
				var user_id = localStorageService.get('userInfo')._id;
				$mdDialog.show({
					controller: 'addNewTopicCtrl',
					templateUrl: 'dist/pages/add-new-topic.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose: false,
					fullscreen: false
				}).then(function (data) {
					$scope.isSubmittingTopic = false;
					topicOperation.res.addNewTopic({ id: user_id }, data, function (result) {
						loadTopics(1, $scope.selectedItem, $scope.searchContext, '');
						alertService.showAlert('发表帖子成功。', ev);
					}, function (error) {
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
					clickOutsideToClose: false,
					fullscreen: false
				}).then(function (data) {
					// handle user data
				}, function () {
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
			};
			if (category === 'ALL') {
				body.LoadAll = true;
			}
			$scope.isLoadingTopic = true;

			$http.get(BaseUrl + "topic/user-111").then(function (response) {
				if (loadMoreSignal === 'load-more') {
					$scope.topicList = $scope.topicList.concat(response.data);
				} else {
					$scope.topicList = response.data;
				}
			});
		}
		loadTopics(1, 'ALL', '', '');
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

    angular.module('The.Power.Soul.Search.For.Users', ['ngMaterial']).controller('searchForUsersCtrl', ['$scope', '$mdDialog', '$http', '$state', 'BaseUrl', 'localStorageService', function ($scope, $mdDialog, $http, $state, BaseUrl, localStorageService) {
        $scope.isSearching = false;
        $scope.isSearchingHasError = false;
        $scope.searchContext = "";
        $scope.currentSelectedUser = null;
        $scope.users = [];
        var currentLoggedUser = localStorageService.get('userInfo');

        $scope.searchForUsers = function (ev) {
            if (ev.keyCode === 13) {
                if ($scope.searchContext === "") {
                    $scope.users = [];
                } else {
                    $scope.isSearching = true;
                    $http.post(BaseUrl + '/users', { EmailKeyword: $scope.searchContext }).then(function (response) {
                        $scope.isSearching = false;
                        $scope.users = filterDataToRemoveCurrentUser(response.data);
                    }, function (error) {
                        $scope.isSearching = false;
                    });
                }
            }
        };

        function filterDataToRemoveCurrentUser(arr) {
            angular.forEach(arr, function (user) {
                if (user._id === currentLoggedUser._id) {
                    var index = arr.indexOf(user);
                    arr.splice(index, 1);
                }
            });
            return arr;
        }

        $scope.goToUserPage = function (ev, user) {
            ev.stopPropagation();
            $mdDialog.hide();
            var url = $state.href('user-detail', { id: user._id });
            window.open(url, '_blank');
        };

        $scope.sendPrivateMessage = function (ev, user) {
            ev.stopPropagation();
        };

        $scope.closeDialog = function () {
            $mdDialog.hide();
        };
    }]);
})();
(function () {
	'use strict';

	angular.module('The.Power.Soul.Topic.Detail', ['ngMaterial']).service('topicOperation', ['$resource', function ($resource) {
		var serviceUrl = "localhost:3000/";
		var res = $resource(serviceUrl + 'topic', { id: '@id', receptor: '@receptor' }, {
			'getTopics': { method: 'GET', isArray: true },
			'getTopicDetail': { method: 'GET', isArray: false },
			'addNewTopic': { method: 'POST', isArray: false },
			'deleteTopic': { method: 'DELETE', inArray: false }
		});
		return {
			res: res
		};
	}]).service('commentOperation', ['$resource', function ($resource) {
		var serviceUrl = "localhost:3000/";
		var res = $resource(serviceUrl + 'comment', { id: '@id', receptor: '@receptor' }, {
			'getComments': { method: 'GET', isArray: true },
			'getCommentDetail': { method: 'GET', isArray: false },
			'addNewComment': { method: 'POST', isArray: false },
			'deleteComment': { method: 'DELETE', inArray: false }
		});
		return {
			res: res
		};
	}]).controller('addNewCommentCtrl', ['$scope', '$mdDialog', function ($scope, $mdDialog) {
		$scope.comment = "";
		$scope.submit = function () {
			$mdDialog.hide($scope.comment);
		};
	}]).controller('topicDetailCtrl', ['$scope', '$stateParams', '$mdDialog', 'topicOperation', 'commentOperation', function ($scope, $stateParams, $mdDialog, topicOperation, commentOperation) {
		var topicID = $stateParams.id;

		/*
  loading state
  */
		$scope.isPostingNewComment = false;
		$scope.isReplyingComment = false;
		$scope.isLoading = false;
		$scope.isLoadingHasError = false;
		$scope.isLoadingComments = false;
		$scope.isLoadingCommentsHasError = false;

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
				fullscreen: false
			}).then(function (data) {
				// handle comment data
			}, function () {
				// canceled
			});
		};

		$scope.changeExpandState = function () {
			$scope.topic.Expand = !$scope.topic.Expand;
		};

		$scope.loadMore = function () {
			loadTopicComments();
		};

		function loadTopicDetail() {
			$scope.isLoading = true;
			return topicOperation.res.getTopicDetail({ id: '', receptor: '' }, null, function (result) {
				// success
				angular.extend($scope.topic, result);
			}, function (error) {
				$scope.isLoadingHasError = true;
			}).$promise.finally(function () {
				$scope.isLoading = false;
			});
		}

		function loadTopicComments(loadMoreSignal) {
			$scope.isLoadingComments = true;
			commentOperation.res.getComments({ id: topicID }, null, function (result) {
				// success
				if (loadMoreSignal === 'load-more') {} else {}
			}, function (error) {
				$scope.isLoadingCommentsHasError = true;
			}).$promise.finally(function () {
				$scope.isLoadingComments = false;
			});
		}

		loadTopicDetail().then(loadTopicComments());
	}]);
})();
(function () {
    'use strict';

    angular.module('The.Power.Soul.UserDetail', ['ngMaterial']).controller('userDetailCtrl', ['$scope', '$http', '$stateParams', 'localStorageService', 'BaseUrl', function ($scope, $http, $stateParams, localStorageService, BaseUrl) {
        $scope.isLoading = false;
        $scope.isLoadingHasError = false;
        $scope.user = null;
        $scope.showActionButton = false;
        $scope.disableFollowButton = false;
        $scope.disableButtonText = "";
        var user_id = $stateParams.id;
        var loggedUser = localStorageService.get('userInfo');
        if (loggedUser._id === user_id) {
            // 进入当前页面的是登录用户本人
            $scope.user = localStorageService.get('userInfo');
        } else {
            // 查看其它人的页面
            $scope.isLoading = true;
            $http.get(BaseUrl + '/user-detail/' + loggedUser._id + '/' + user_id).then(function (response) {
                $scope.showActionButton = true;
                $scope.disableFollowButton = response.data.IsFollowing;
                $scope.disableButtonText = $scope.disableFollowButton ? "已关注" : '关注';
                $scope.user = response.data.Data;
                $scope.isLoading = false;
            }, function (error) {
                $scope.isLoading = false;
                $scope.isLoadingHasError = true;
            });
        }
    }]);
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