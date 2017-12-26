(function () {
    'use strict';

    var subModules = ['The.Power.Soul.Introduction', 'The.Power.Soul.BBS', 'The.Power.Soul.Square', 'The.Power.Soul.Tools', 'The.Power.Soul.Topic.Detail', 'The.Power.Soul.NewArticle', 'The.Power.Soul.UserDetail', 'The.Power.Soul.Mall', 'The.Power.Soul.Search.For.Users', 'The.Power.Soul.Article.List', 'The.Power.Soul.Article.Detail', 'The.Power.Soul.Fav.List', 'The.Power.Soul.Message.Detail', 'The.Power.Soul.All.Messages', 'The.Power.Soul.Report', 'LocalStorageModule'];
    angular.module('The.Power.Soul', ['ngMaterial', 'ui.router', 'ngSanitize'].concat(subModules)).constant('BaseUrl', "http://localhost:3030").config(function (localStorageServiceProvider, $locationProvider) {
        localStorageServiceProvider.setPrefix('thepowersoul');
    }).filter('to_trusted', ['$sce', function ($sce) {
        return function (text) {
            return $sce.trustAsHtml(text);
        };
    }]).factory('authorizationService', function ($http, $q, $rootScope, BaseUrl, localStorageService, $state, alertService) {
        return {
            permissionModel: { permission: {}, isPermissionLoaded: false },
            permissionCheck: function () {
                var token;
                if (localStorageService.get('token')) {
                    token = localStorageService.get('token').Token;
                } else {
                    $state.go('introduction');
                }
                var defer = $q.defer();
                var pointer = this;
                if (this.permissionModel.isPermissionLoaded) {
                    // auth successful
                } else {
                    $http.post(BaseUrl + '/permission-service', null, {
                        headers: { 'Authorization': token }
                    }).then(function (response) {
                        pointer.permissionModel.permission = response;
                        pointer.permissionModel.isPermissionLoaded = true;
                        pointer.getPermission(pointer.permissionModel, defer);
                    }, function (error) {
                        $state.go('introduction');
                        if (error.status === 400) {
                            alertService.showAlert(error.data);
                            localStorageService.remove('userInfo');
                            localStorageService.remove('token');
                            $rootScope.$broadcast('$ONSESSIONEXPIRED');
                        }
                    });
                }
                return defer;
            },
            getPermission: function (model, defer) {
                var isPermissionPassed = false;
                if (model.permission !== {} && model.isPermissionLoaded === true) {
                    isPermissionPassed = true;
                }
                if (!isPermissionPassed) {
                    $state.go('introduction');
                }
                defer.resolve();
            }
        };
    }).config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
        $urlRouterProvider.when('/', 'introduction').otherwise(function ($injector) {
            var state = $injector.get('$state');
            state.go('404');
        });
        // $locationProvider.html5Mode(true);
        $stateProvider.state('404', {
            url: '/error',
            templateUrl: 'dist/pages/not-found.html',
            controller: 'notFoundCtrl'
        }).state('introduction', {
            url: '/introduction',
            templateUrl: 'dist/pages/introduction.html',
            controller: 'introductionCtrl'
        }).state('square', {
            url: '/square',
            templateUrl: 'dist/pages/square.html',
            controller: 'squareCtrl',
            reload: true,
            resolve: {
                permission: function (authorizationService) {
                    return authorizationService.permissionCheck();
                }
            }
        }).state('bbs', {
            url: '/bbs',
            templateUrl: 'dist/pages/bbs.html',
            controller: 'bbsCtrl',
            reload: true,
            resolve: {
                permission: function (authorizationService) {
                    return authorizationService.permissionCheck();
                }
            }
        }).state('topic-detail', {
            url: '/topic-detail/{id}',
            templateUrl: 'dist/pages/topic-detail.html',
            controller: 'topicDetailCtrl',
            reload: true,
            resolve: {
                permission: function (authorizationService) {
                    return authorizationService.permissionCheck();
                }
            }
        }).state('new-article', {
            url: '/new-article/{id}',
            templateUrl: 'dist/pages/add-new-article.html',
            controller: 'addNewArticleCtrl',
            reload: true,
            resolve: {
                permission: function (authorizationService) {
                    return authorizationService.permissionCheck();
                }
            }
        }).state('user-detail', {
            url: '/user-detail/{id}',
            templateUrl: 'dist/pages/user-detail.html',
            controller: 'userDetailCtrl',
            reload: true,
            resolve: {
                permission: function (authorizationService) {
                    return authorizationService.permissionCheck();
                }
            }
        }).state('mall', {
            url: '/mall',
            templateUrl: 'dist/pages/mall.html',
            controller: 'mallCtrl',
            reload: true,
            resolve: {
                permission: function (authorizationService) {
                    return authorizationService.permissionCheck();
                }
            }
        }).state('article-list', {
            url: '/article-list',
            templateUrl: 'dist/pages/article-list.html',
            controller: 'articleListCtrl',
            reload: true,
            resolve: {
                permission: function (authorizationService) {
                    return authorizationService.permissionCheck();
                }
            }
        }).state('article-detail', {
            url: '/article-detail/{id}',
            templateUrl: 'dist/pages/article-detail.html',
            controller: 'articleDetailCtrl',
            reload: true,
            resolve: {
                permission: function (authorizationService) {
                    return authorizationService.permissionCheck();
                }
            }
        }).state('fav-list', {
            url: '/fav-list',
            templateUrl: 'dist/pages/fav-list.html',
            controller: 'favListCtrl',
            reload: true,
            resolve: {
                permission: function (authorizationService) {
                    return authorizationService.permissionCheck();
                }
            }
        }).state('message-detail', {
            url: '/message-detail/{id}',
            templateUrl: 'dist/pages/message-detail.html',
            controller: 'messageDetailCtrl',
            reload: true,
            resolve: {
                permission: function (authorizationService) {
                    return authorizationService.permissionCheck();
                }
            }
        }).state('all-messages', {
            url: '/all-messages/{id}',
            templateUrl: 'dist/pages/all-messages.html',
            controller: 'allMessagesCtrl',
            reload: true,
            resolve: {
                permission: function (authorizationService) {
                    return authorizationService.permissionCheck();
                }
            }
        });
    }]).controller('notFoundCtrl', ['$scope', '$state', function ($scope, $state) {
        $scope.goBackToIntroduction = function () {
            $state.go('introduction');
        };
    }]).controller('sendNewPrivateMessageCtrl', ['$scope', '$mdDialog', '$http', 'BaseUrl', 'localStorageService', 'alertService', function ($scope, $mdDialog, $http, BaseUrl, localStorageService, alertService) {
        $scope.newMessage = "";
        $scope.emailKeyword = "";
        $scope.users = [];
        $scope.targetUser = null;
        var user = localStorageService.get('userInfo');

        function filterDataToRemoveCurrentUser(arr) {
            angular.forEach(arr, function (u) {
                if (u._id === user._id) {
                    var index = arr.indexOf(u);
                    arr.splice(index, 1);
                }
            });
            return arr;
        }

        $scope.searchForUsers = function (ev) {
            if (ev.keyCode === 13) {
                $scope.users = [];
                var body = {
                    EmailKeyword: $scope.emailKeyword
                };
                $http.post(BaseUrl + '/users', body).then(function (response) {
                    $scope.users = filterDataToRemoveCurrentUser(response.data);
                }, function (error) {});
            }
        };

        $scope.selectUser = function (user) {
            $scope.targetUser = user;
            $scope.emailKeyword = "";
        };

        $scope.changeTargetUser = function () {
            $scope.targetUser = null;
            $scope.users = [];
        };

        $scope.closeDialog = function () {
            $mdDialog.cancel();
        };

        $scope.submit = function (ev) {
            var body = {
                Content: $scope.newMessage,
                UserName: user.DisplayName,
                TargetUserName: $scope.targetUser.DisplayName
            };
            $http.post(BaseUrl + '/private-message/' + user._id + '/' + $scope.targetUser._id, body).then(function (data) {
                alertService.showAlert('发送私信成功', ev);
                $mdDialog.cancel();
            }, function (error) {
                alertService.showAlert('发送私信失败', ev);
                $mdDialog.cancel();
            });
        };
    }]).controller('listPrivateMessageCtrl', ['$scope', '$mdDialog', '$http', '$state', 'BaseUrl', 'localStorageService', '$rootScope', function ($scope, $mdDialog, $http, $state, BaseUrl, localStorageService, $rootScope) {
        $scope.user = localStorageService.get('userInfo');
        $scope.messages = [];
        $scope.messagesShowed = [];
        $scope.isLoading = false;

        $scope.sendNewPrivateMessage = function (ev) {
            $mdDialog.cancel();
            $mdDialog.show({
                controller: 'sendNewPrivateMessageCtrl',
                templateUrl: 'dist/pages/send-private-message.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: false
            }).then(function (data) {}, function () {
                // canceled mdDialog
            });
        };

        $scope.showAllMessages = function (evt) {
            $mdDialog.cancel();
            $state.go('all-messages', { id: $scope.user._id });
        };

        $scope.checkMessgeConversation = function (message, ev) {
            $mdDialog.cancel();
            if (message.SenderID === $scope.user._id) {
                $state.go('message-detail', { id: message.TargetID });
            } else {
                $state.go('message-detail', { id: message.SenderID });
            }
        };

        $scope.getUnReadMessageNumber = function () {
            var num = 0;
            angular.forEach($scope.messages, function (message) {
                if (message.Status === "0") {
                    num++;
                }
            });
            return num;
        };

        function loadMessages() {
            $scope.isLoading = true;
            $http.get(BaseUrl + '/private-message/' + $scope.user._id).then(function (response) {
                $scope.messages = response.data;
            }, function (error) {
                $scope.isLoadingHasError = true;
                $scope.isLoading = false;
            });
        }

        function loadRecentMessages() {
            $scope.isLoading = true;
            $http.get(BaseUrl + '/user/' + $scope.user._id).then(function (response) {
                $scope.messagesShowed = response.data.MostRecentConversation.slice(0, 5);
            }, function (error) {
                $scope.isLoadingHasError = true;
                $scope.isLoading = false;
            });
        }
        loadMessages();
        loadRecentMessages();

        $scope.closeDialog = function () {
            $mdDialog.cancel();
        };
    }]).controller('loginOrSignupCtrl', ['$scope', '$http', '$mdDialog', '$state', 'BaseUrl', 'localStorageService', 'alertService', '$timeout', function ($scope, $http, $mdDialog, $state, BaseUrl, localStorageService, alertService, $timeout) {
        var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
        var waitSeconds = 120;
        $scope.sendButtonText = "发送验证码";
        $scope.isCountingDown = false;
        $scope.flag = true;
        $scope.signupButtonText = "";
        $scope.loginButtonText = "";
        $scope.isLogining = false;
        $scope.isSigningup = false;
        $scope.isSendingEmail = false;
        $scope.isSendingEmailHasError = false;
        $scope.loginErrorText = "";
        $scope.newUser = {
            Name: "",
            DisplayName: "",
            Email: "",
            Password: "",
            ConfirmPassword: "",
            EmailVerifyCode: ""
        };
        $scope.user = {
            Email: "",
            Password: ""
        };

        function time() {
            if (waitSeconds <= 0) {
                $scope.isCountingDown = false;
                $scope.sendButtonText = "发送验证码";
                waitSeconds = 60;
            } else {
                $scope.isCountingDown = true;
                $scope.sendButtonText = "重新发送(" + waitSeconds + ")";
                waitSeconds--;
                $timeout(function () {
                    time();
                }, 1000);
            }
        }

        $scope.disableVerifyEmailButtonOrNot = function () {
            return $scope.isSendingEmail || $scope.isCountingDown || $scope.newUser.EmailVerifyCode !== '';
        };

        $scope.changePanel = function (signal) {
            if (signal === "signup") {
                $scope.flag = true;
            } else if (signal === "login") {
                $scope.flag = false;
            }
        };

        $scope.verifyEmail = function (ev) {
            $scope.isSendingEmail = true;
            $scope.isSendingEmailHasError = false;
            var body = {
                Email: $scope.newUser.Email
            };
            $http.post(BaseUrl + '/verify-email', body).then(function (response) {
                $scope.isSendingEmail = false;
                if (response.status === 200 && response.data.Message !== "请勿短时间内重复索取验证码") {
                    $scope.newUser.EmailVerifyCode = body.Code;
                    time();
                } else if (response.status === 200 && response.data.Message === "请勿短时间内重复索取验证码") {
                    $scope.sendButtonText = response.data.Message;
                    $scope.newUser.EmailVerifyCode = response.data.Code;
                }
            }, function (error) {
                $scope.isSendingEmail = false;
                $scope.isSendingEmailHasError = true;
            });
        };

        $scope.login = function (ev) {
            $scope.isLogining = true;
            $http.post(BaseUrl + '/login', $scope.user).then(function (response) {
                $scope.isLogining = false;
                localStorageService.set('userInfo', response.data);
                localStorageService.set('token', { Token: response.data.SessionID });
                $mdDialog.hide();
                $state.go('square');
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
                } else if (error.status === 400) {
                    $scope.newUser.Emaiul = "邮箱验证码错误，请重新发送或填写";
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
                $mdDialog.cancel();
            }
        };
    }]).controller('mainCtrl', ['$scope', '$state', '$http', '$rootScope', '$mdDialog', 'localStorageService', 'BaseUrl', 'authorizationService', 'alertService', function ($scope, $state, $http, $rootScope, $mdDialog, localStorageService, BaseUrl, authorizationService, alertService) {
        $scope.loggedIn = false;
        $scope.loggedInUser = null;
        $scope.hasNewMessage = false;
        $scope.isLoadingMessageHasError = false;
        $scope.showMessageEntrance = true;
        // 检查当前是否有用户登录
        if (localStorageService.get('userInfo')) {
            updateUserLoginState();
            loadMessages();
        }

        var sessionExpired = $rootScope.$on('$ONSESSIONEXPIRED', function () {
            $scope.loggedIn = false;
        });

        var hideMessageEntrance = $rootScope.$on('$HIDEMESSAGEENTRANCE', function () {
            $scope.showMessageEntrance = false;
        });

        var showMessageEntrance = $rootScope.$on('$SHOWMESSAGEENTRANCE', function () {
            $scope.showMessageEntrance = true;
        });

        // 有用户登录时更新页面状态
        var userLoggedInListener = $rootScope.$on('$USERLOGGEDIN', function () {
            updateUserLoginState();
            loadMessages();
        });

        // 登录或注册成功，更新页面状态
        function updateUserLoginState() {
            $scope.loggedIn = true;
            $scope.loggedInUser = localStorageService.get('userInfo');
        }

        // 刷新页面检查是否有未读私信
        function loadMessages() {
            $scope.isLoading = true;
            $http.get(BaseUrl + '/private-message/' + $scope.loggedInUser._id).then(function (response) {
                response.data.forEach(function (message) {
                    if (message.Status === '0') {
                        $scope.hasNewMessage = true;
                    }
                });
            }, function (error) {
                $scope.isLoadingMessageHasError = true;
                $scope.isLoading = false;
            });
        }

        //　登出
        $scope.logOut = function () {
            var token;
            if (localStorageService.get('token')) {
                token = localStorageService.get('token').Token;
            } else {
                localStorageService.remove('userInfo');
                localStorageService.remove('token');
                alertService.showAlert('登出异常');
            }
            $http.post(BaseUrl + '/remove-session', null, {
                headers: { 'Authorization': token }
            }).then(function (response) {
                $scope.loggedIn = false;
                localStorageService.remove('userInfo');
                localStorageService.remove('token');
                $state.go('introduction');
            }, function (error) {
                $scope.loggedIn = false;
                localStorageService.remove('userInfo');
                localStorageService.remove('token');
                $state.go('introduction');
            });
        };

        /**
         * 右上角面板相关操作
         */
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

        $scope.listArticles = function () {
            $state.go('article-list');
        };

        $scope.listFavs = function () {
            $state.go('fav-list');
        };

        $scope.listPrivateMessage = function (ev) {
            if (!authorizationService.permissionModel.isPermissionLoaded) {
                alertService.showAlert('请先登录');
                return;
            }
            $mdDialog.show({
                controller: 'listPrivateMessageCtrl',
                templateUrl: 'dist/pages/list-private-message.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: false
            }).then(function (data) {
                //
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

        /**
         * 页面导航
         */
        $scope.goToIntroduction = function () {
            $state.go('introduction');
        };

        $scope.goToSquare = function () {
            $state.go('square');
        };

        $scope.goToBBS = function () {
            $state.go('bbs');
        };

        $scope.goToMall = function () {
            $state.go('mall');
        };

        $scope.$on('destroy', function () {
            userLoggedInListener();
            userLoggedInListener = null;
            hideMessageEntrance();
            hideMessageEntrance = null;
            showMessageEntrance();
            showMessageEntrance = null;
        });
    }]);
})();
(function () {
	'use strict';

	angular.module('The.Power.Soul.NewArticle', ['ngMaterial']).controller('addNewArticleCtrl', ['$scope', '$http', '$mdToast', '$state', 'BaseUrl', 'localStorageService', 'categoryItems', '$stateParams', 'randomString', function ($scope, $http, $mdToast, $state, BaseUrl, localStorageService, categoryItems, $stateParams, randomString) {
		var accessid = 'LTAILjmmB1fnhHlx';
		var host = "http://thepowersoul2018.oss-cn-qingdao.aliyuncs.com";
		var params = {};

		// init simditor
		// var editor = new Simditor({
		// 	textarea: $('#editor'),
		// 	upload: {
		// 		url : host, //文件上传的接口地址
		// 		params: params, //键值对,指定文件上传接口的额外参数,上传的时候随文件一起提交
		// 		fileKey: params.Filename, //服务器端获取文件数据的参数名
		// 		connectionCount: 3,
		// 		leaveConfirm: '正在上传图片，确定离开？'
		// 	},
		// 	success: function(data) {
		// 		console.log(data);
		// 	}
		// });

		var editor = new Simditor({
			textarea: $('#editor'),
			upload: {
				url: BaseUrl + '/upload-picture-rich-text', //文件上传的接口地址
				params: null, //键值对,指定文件上传接口的额外参数,上传的时候随文件一起提交
				fileKey: 'upload_file', //服务器端获取文件数据的参数名
				connectionCount: 3,
				leaveConfirm: '正在上传图片，确定离开？'
			},
			success: function (data) {
				console.log(data);
			}
		});

		$scope.simditorContent = $('.simditor-body')[0].innerHTML;

		var article_id = $stateParams.id;
		$scope.categories = categoryItems;
		$scope.user = localStorageService.get('userInfo');
		$scope.article = {
			Title: "",
			Author: $scope.user.DisplayName,
			Content: "",
			Category: ""
		};
		$scope.publishArticle = function (ev) {
			removeBlankSpace();
			$scope.article.Content = $('.simditor-body')[0].innerHTML;
			$scope.isPublishing = true;
			$http.post(BaseUrl + '/article/' + $scope.user._id, $scope.article).then(function (response) {
				$scope.isPublishing = false;
				removeFromDraftList();
			}, function (error) {
				$scope.isPublishing = false;
				alertService.showAlert('发布失败，请重试', ev);
			});
		};

		$scope.saveAsDraft = function () {
			saveDraft();
		};

		function removeBlankSpace() {
			// 将文本中没有内容的标签去除
		}

		function removeFromDraftList() {
			$http.delete(BaseUrl + '/article-draft/' + $scope.article._id).then(function (response) {
				$state.go('article-list');
			}, function (error) {
				alertService.showAlert('删除草稿失败，请重试', ev);
			});
		}

		function saveDraft() {
			$scope.article.Content = $('.simditor-body')[0].innerHTML;
			$http.put(BaseUrl + '/article-draft/' + article_id, $scope.article).then(function (response) {
				alertSuccessMsg('保存草稿成功');
			}, function (error) {});
		}

		function setUploadParams(data) {
			var randomFileName = randomString.getRandomString(10);
			params = {
				'Filename': '${filename}',
				'key': '${filename}',
				'policy': data.PolicyText,
				'OSSAccessKeyId': accessid,
				'success_action_status': '200', //让服务端返回200，不然，默认会返回204
				'signature': data.Signature
			};
		}

		function getUploadPolicy() {
			$http.get(BaseUrl + '/get-upload-policy').then(function (response) {
				setUploadParams(response.data);
			}, function (error) {
				alertService.showAlert('获取上传文件信息失败，请重试');
			});
		}

		function loadArticleDraft() {
			return $http.get(BaseUrl + '/article-draft/' + article_id).then(function (response) {
				$scope.isLoading = false;
				$scope.article = response.data;
				$('.simditor-body')[0].innerHTML = $scope.article.Content;
			}, function (error) {
				$scope.isLoading = false;
				$scope.isLoadingHasError = true;
			});
		}
		// loadArticleDraft().then(getUploadPolicy());
		loadArticleDraft();

		function alertSuccessMsg(content) {
			$mdToast.show($mdToast.simple().textContent(content).highlightClass('md-primary').position('top right'));
		}
	}]);
})();
(function () {
    'use strict';

    angular.module('The.Power.Soul.Report', ['ngMaterial']).directive('unitTree', function () {
        function link($scope, $element, $attrs) {
            function addParent(arr, parentNode) {
                for (var i = 0; i < arr.length; i++) {
                    if (parentNode === undefined) {
                        arr[i].ParentNode = null;
                    } else {
                        arr[i].ParentNode = parentNode;
                    }
                    arr[i].Belonging = arr;
                    arr[i].Selected = false;
                    if (arr[i].Children.length !== 0) {
                        addParent(arr[i].Children, arr[i]);
                    }
                }
            };

            addParent($scope.unitTreeItems);

            $scope.getNodePath = function (node) {
                var arr = [];
                while (node.ParentNode !== null) {
                    arr.unshift(node.ParentNode.Title);
                    node = node.ParentNode;
                }
                return arr.join('/');
            };

            $scope.backToLastLayer = function (node) {
                if (node.ParentNode) {
                    $scope.unitTreeItems = node.ParentNode.Belonging;
                }
                if ($scope.currentSelectedNode.ParentNode !== null) {
                    $scope.currentSelectedNode.Selected = false;
                    $scope.currentSelectedNode = $scope.currentSelectedNode.ParentNode;
                    angular.forEach($scope.unitTreeItems, function (item) {
                        if (item.ID === $scope.currentSelectedNode.ID) {
                            item.Selected = true;
                        }
                    });
                }
                // $scope.currentSelectedNode = null;
            };

            $scope.showBackButton = function () {
                var flag = true;
                if ($scope.currentSelectedNode) {
                    angular.forEach($scope.unitTreeItems, function (item) {
                        if ($scope.currentSelectedNode.ID === item.ID && $scope.currentSelectedNode.ParentNode === null) {
                            flag = false;
                        }
                    });
                } else {
                    flag = false;
                }
                return flag;
            };

            $scope.expandUnit = function (node) {
                if ($scope.currentSelectedNode !== null) {
                    $scope.currentSelectedNode.Selected = false;
                    $scope.currentSelectedNode = null;
                }
                if (node.Children.length !== 0) {
                    $scope.unitTreeItems = node.Children;
                } else {}
                node.Selected = true;
                $scope.currentSelectedNode = node;
            };
        }
        return {
            priority: 1,
            restrict: 'EA',
            replace: false,
            scope: false,
            templateUrl: "dist/pages/unit-tree-template.html",
            link: link
        };
    }).constant('Identities', [{
        ID: '01',
        Title: '侵犯我的权益',
        Children: [{
            ID: '01-1',
            Title: '骚扰我',
            Children: []
        }, {
            ID: '01-2',
            Title: '辱骂我，歧视我，挑衅等（不友善）',
            Children: []
        }, {
            ID: '01-3',
            Title: '抄袭了我的内容',
            Children: []
        }, {
            ID: '01-4',
            Title: '侵犯了我企业的权益',
            Children: []
        }, {
            ID: '01-5',
            Title: '侵犯了我个人的权益',
            Children: []
        }]
    }, {
        ID: '02',
        Title: '对社区有害的内容',
        Children: [{
            ID: '02-1',
            Title: '垃圾广告信息',
            Children: []
        }, {
            ID: '02-2',
            Title: '色情，暴力，血腥等违反法律法规的内容',
            Children: []
        }, {
            ID: '02-3',
            Title: '不规范转载',
            Children: []
        }, {
            ID: '02-4',
            Title: '政治敏感',
            Children: []
        }, {
            ID: '02-5',
            Title: '辱骂，歧视，挑衅',
            Children: []
        }]
    }]).controller('addReportCtrl', ['$scope', '$mdDialog', 'localStorageService', 'Identities', 'target', function ($scope, $mdDialog, localStorageService, Identities, target) {
        var user = localStorageService.get('userInfo');
        $scope.reportObj = {
            Content: '',
            Author: user.DisplayName,
            TargetID: target._id,
            TargetLink: window.location.href,
            Category: null
        };
        $scope.currentSelectedNode = null;
        $scope.unitTreeItems = addChildrenAttribute(Identities, null);

        function addChildrenAttribute(data, parentNode) {
            for (var i = 0; i < data.length; i++) {
                data[i].ParentNode = parentNode;
                if (data[i].Children.length > 0) {
                    addChildrenAttribute(data[i].Children, data[i]);
                }
            }
            return data;
        }

        $scope.getNewestPath = function () {
            var flag = false;
            var node = $scope.currentSelectedNode;
            if (!node) {
                return "--";
            } else {
                angular.forEach($scope.unitTreeItems, function (item) {
                    if (item.ID === $scope.currentSelectedNode.ID) {
                        flag = true;
                    }
                });
                var arr = [];
                if (node) {
                    arr.push(node.Title);
                    while (node && node.ParentNode !== null && node.ParentNode !== undefined) {
                        arr.unshift(node.ParentNode.Title);
                        node = node.ParentNode;
                    }
                }
            }
            if (flag) {
                return arr.join(' / ');
            } else {
                return arr.join(' / ') + " / -- ";
            }
        };

        $scope.disableSubmitButtonOrNot = function () {
            $scope.reportObj.Category = $scope.currentSelectedNode;
            return $scope.reportObj.Content === '' || $scope.reportObj.Category.ParentNode === null;
        };

        $scope.closeDialog = function (ev) {
            $mdDialog.cancel();
        };

        $scope.submit = function () {
            $scope.reportObj.Category = $scope.currentSelectedNode;
            $mdDialog.hide($scope.reportObj);
        };
    }]);
})();
(function () {
    'use strict';

    angular.module('The.Power.Soul.All.Messages', ['ngMaterial']).controller('allMessagesCtrl', ['$scope', '$stateParams', '$http', '$state', '$mdDialog', 'BaseUrl', 'alertService', function ($scope, $stateParams, $http, $state, $mdDialog, BaseUrl, alertService) {
        var user_id = $stateParams.id;
        $scope.messages = [];

        $scope.postNewMessage = function (ev) {
            $mdDialog.show({
                controller: 'sendNewPrivateMessageCtrl',
                templateUrl: 'dist/pages/send-private-message.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: false
            }).then(function (data) {}, function () {
                // canceled mdDialog
            });
        };

        $scope.deleteWholeConversation = function (message, ev) {
            var target_user_id = "";
            if (message.SenderID === user_id) {
                target_user_id = message.TargetID;
            } else if (message.TargetID === user_id) {
                target_user_id = message.SenderID;
            }
            var confirm = $mdDialog.confirm().title('提示').textContent('确定删除和这位用户的全部私信？').ariaLabel('').targetEvent(ev).ok('确定').cancel('取消');

            $mdDialog.show(confirm).then(function () {
                $scope.isDeleting = true;
                $http.put(BaseUrl + '/delete-conversation/' + user_id + '/' + target_user_id).then(function (response) {
                    location.reload();
                }, function (error) {
                    alertService.showAlert('删除对话失败，请重试', ev);
                });
            }, function () {
                // canceled
            });
        };

        $scope.checkConversation = function (message) {
            if (message.SenderID === user_id) {
                $state.go('message-detail', { id: message.TargetID });
            } else if (message.TargetID === user_id) {
                $state.go('message-detail', { id: message.SenderID });
            }
        };

        function init() {
            $scope.isLoading = true;
            $http.get(BaseUrl + '/user/' + user_id).then(function (response) {
                $scope.isLoading = false;
                $scope.messages = response.data.MostRecentConversation;
            }, function (error) {
                $scope.isLoadingHasError = true;
                $scope.isLoading = false;
            });
        }
        init();
    }]);
})();
(function () {
    'use strict';

    angular.module('The.Power.Soul.Article.Detail', ['ngMaterial', 'The.Power.Soul.Topic.Detail']).controller('articleDetailCtrl', ['$scope', '$http', 'BaseUrl', 'localStorageService', '$stateParams', 'alertService', '$mdDialog', function ($scope, $http, BaseUrl, localStorageService, $stateParams, alertService, $mdDialog) {
        $scope.isLoading = false;
        $scope.isLoadingHasError = false;
        $scope.isLoadingComments = false;
        $scope.isLoadingCommentsHasError = false;
        $scope.isPosingNewComment = false;
        $scope.disableLoadingMore = false;
        $scope.article = {};
        $scope.comments = [];
        $scope.newComment = "";
        $scope.isChangingLikeStauts = false;
        var user = localStorageService.get('userInfo');
        var article_id = $stateParams.id;
        var pageNum = 1;

        $scope.goAddArticleToFav = function (ev) {
            $http.put(BaseUrl + '/user-article-fav/' + user._id + '/' + article_id).then(function (response) {
                alertService.showAlert('收藏成功', ev);
            }, function (error) {
                if (error.status === 404 && error.data === 'UserNotFound') {
                    alertService.showAlert('用户不存在，请重新登录', ev);
                } else if (error.status === 400 && error.data === 'Added') {
                    alertService.showAlert('已收藏，请勿重复添加', ev);
                } else {
                    alertService.showAlert('收藏失败，请重试', ev);
                }
            });
        };

        $scope.postNewComment = function (ev) {
            $scope.isPosingNewComment = true;
            var body = {
                Comment: $scope.newComment,
                ContextID: "",
                TargetUserID: "",
                Author: user.DisplayName,
                TargetAuthor: ""
            };
            $http.post(BaseUrl + '/comment/' + user._id + '/' + article_id, body).then(function (response) {
                $scope.isPosingNewComment = false;
                $scope.comments.unshift(response.data);
                $scope.newComment = "";
            }, function (error) {
                $scope.isPosingNewComment = false;
                alertService.showAlert('发表评论失败', ev);
            });
        };

        $scope.commentReply = function (comment, ev) {
            $mdDialog.show({
                controller: 'addNewCommentCtrl',
                templateUrl: 'dist/pages/add-new-comment.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: false
            }).then(function (data) {
                sendCommentReply(comment, data, ev);
                // handle comment data
            }, function () {
                // canceled
            });
        };

        $scope.likeTheArticle = function (ev) {
            $http.put(BaseUrl + '/article/' + user._id + '/' + article_id).then(function (response) {
                $scope.article.LikeUser.push(user._id);
            }, function (error) {
                if (error.status === 400 && error.data === "Added") {
                    return;
                }
            });
        };

        $scope.likeTheComment = function (comment, ev) {
            $scope.isChangingLikeStauts = true;
            $http.put(BaseUrl + '/comment/' + user._id + '/' + comment._id + '/up').then(function (response) {
                var index = comment.LikeUser.indexOf(user._id);
                var indexDis = comment.DislikeUser.indexOf(user._id);
                if (indexDis >= 0) {
                    comment.DislikeUser.splice(index, 1);
                }
                if (index < 0) {
                    comment.LikeUser.push(user._id);
                }
                $scope.isChangingLikeStauts = false;
            }, function (error) {
                $scope.isChangingLikeStauts = false;
                if (error.status === 400 && error.data === "Added") {
                    return;
                }
            });
        };

        $scope.dislikeTheComment = function (comment, ev) {
            $scope.isChangingLikeStauts = true;
            $http.put(BaseUrl + '/comment/' + user._id + '/' + comment._id + '/down').then(function (response) {
                var index = comment.LikeUser.indexOf(user._id);
                var indexDis = comment.DislikeUser.indexOf(user._id);
                if (index >= 0) {
                    comment.LikeUser.splice(index, 1);
                }
                if (indexDis < 0) {
                    comment.DislikeUser.push(user._id);
                }
                $scope.isChangingLikeStauts = false;
            }, function (error) {
                $scope.isChangingLikeStauts = false;
                if (error.status === 400 && error.data === "Removed") {
                    return;
                }
            });
        };

        $scope.loadMore = function () {
            getComments(++pageNum, true);
        };

        function sendCommentReply(comment, newComment, ev) {
            $http.post(BaseUrl + '/comment/' + user._id + '/' + article_id, {
                Comment: newComment,
                ContextID: comment.TargetContextID,
                TargetUserID: comment.UserID,
                Author: user.DisplayName,
                TargetAuthor: comment.Author
            }).then(function (response) {
                $scope.comments.push(response.data);
            }, function (error) {
                alertService.showAlert('回复评论失败，请重试', ev);
            });
        }

        function getComments(pageNum, isLoadingMore) {
            var body = {
                PageNum: pageNum
            };
            $scope.isLoadingComments = true;
            $http.post(BaseUrl + '/comment/' + article_id, body).then(function (response) {
                $scope.isLoadingComments = false;
                if (isLoadingMore) {
                    $scope.comments = $scope.comments.concat(response.data);
                    if (response.data.length < 5) {
                        $scope.disableLoadingMore = true;
                    }
                } else {
                    $scope.comments = response.data;
                }
            }, function (error) {
                $scope.isLoadingComments = false;
                $scope.isLoadingCommentsHasError = true;
            });
        }

        function getArticle() {
            return $http.get(BaseUrl + '/article/' + article_id).then(function (response) {
                $scope.isLoading = false;
                $scope.article = response.data;
            }, function (error) {
                $scope.isLoadingHasError = true;
                $scope.isLoading = false;
            });
        }
        getArticle().then(getComments(1, false));
    }]);
})();
(function () {
    'use strict';

    angular.module('The.Power.Soul.Article.List', ['ngMaterial']).controller('articleListCtrl', ['$scope', '$http', '$state', 'BaseUrl', 'localStorageService', 'alertService', '$mdDialog', function ($scope, $http, $state, BaseUrl, localStorageService, alertService, $mdDialog) {
        $scope.articles = [];
        $scope.articleDrafts = [];
        $scope.isLoading = false;
        $scope.isLoadingDraft = false;
        $scope.isLoadingHasError = false;
        $scope.user = localStorageService.get('userInfo');

        $scope.goToEdit = function (article) {
            $state.go('new-article', { id: article._id });
        };

        $scope.goToArticleDetail = function (article) {
            $state.go('article-detail', { id: article._id });
        };

        // 生成新草稿，内容为正文内容，成功后删除正文
        $scope.editArticle = function (article, ev) {
            $http.post(BaseUrl + '/article-draft/' + $scope.user._id, article).then(function (response) {
                removeFromArticleList(article, response.data, ev);
            }, function (error) {
                alertService.showAlert('生成编辑内容失败，请重试', ev);
            });
        };

        $scope.deleteArticleDraft = function (article, ev) {
            var confirm = $mdDialog.confirm().title('提示').textContent('确定删除草稿？').ariaLabel('').targetEvent(ev).ok('确定').cancel('取消');

            $mdDialog.show(confirm).then(function () {
                $http.delete(BaseUrl + '/article-draft/' + article._id).then(function (response) {
                    alertService.showAlert('删除文章草稿成功');
                }, function (error) {
                    alertService.showAlert('删除文章草稿失败');
                });
            }, function () {
                // canceled
            });
        };

        $scope.deleteArticle = function (article, ev) {
            var confirm = $mdDialog.confirm().title('提示').textContent('确定删除文章？').ariaLabel('').targetEvent(ev).ok('确定').cancel('取消');

            $mdDialog.show(confirm).then(function () {
                $http.delete(BaseUrl + '/article/' + article._id).then(function (response) {
                    alertService.showAlert('删除文章成功');
                }, function (error) {
                    alertService.showAlert('删除文章失败', ev);
                });
            }, function () {
                // canceled
            });
        };

        function removeFromArticleList(article, data, ev) {
            $http.delete(BaseUrl + '/article/' + article._id).then(function (response) {
                $state.go('new-article', { id: data._id });
            }, function (error) {
                alertService.showAlert('清楚文章失败', ev);
            });
        }

        function loadArticles() {
            $scope.isLoading = true;
            $http.get(BaseUrl + '/articles/' + $scope.user._id).then(function (response) {
                $scope.articles = response.data;
            }, function (error) {
                $scope.isLoadingHasError = true;
            });
        }

        function loadArticleDrafts() {
            $scope.isLoadingDraft = true;
            $http.get(BaseUrl + '/article-drafts/' + $scope.user._id).then(function (response) {
                $scope.articleDrafts = response.data;
            }, function (error) {
                $scope.isLoadingHasError = true;
            });
        }

        loadArticles();
        loadArticleDrafts();
    }]);
})();
(function () {
	'use strict';

	angular.module('The.Power.Soul.BBS', ['ngMaterial', 'The.Power.Soul.Tools', 'ngResource']).controller('addNewTopicCtrl', ['$scope', '$mdDialog', 'categoryItems', function ($scope, $mdDialog, categoryItems) {
		$scope.topic = {
			Title: "",
			Content: "",
			Category: ""
		};

		$scope.closeDialog = function (ev) {
			$mdDialog.cancel();
		};

		$scope.categories = categoryItems;

		$scope.submit = function () {
			$mdDialog.hide($scope.topic);
		};
	}]).controller('bbsCtrl', ['$scope', '$mdDialog', '$rootScope', 'selectorItems', '$state', 'alertService', 'localStorageService', '$http', 'BaseUrl', function ($scope, $mdDialog, $rootScope, selectorItems, $state, alertService, localStorageService, $http, BaseUrl) {
		$scope.searchContext = "";
		$rootScope.$broadcast('$SHOWMESSAGEENTRANCE');
		$scope.isLoadingTopic = false;
		$scope.isSubmittingTopic = false;
		$scope.isChangingCategory = false;
		$scope.isLoadingTopicHasError = false;

		var user = localStorageService.get('userInfo');

		/*
  filter topic
  */
		$scope.getSelectedCategory = function () {
			// pageNum, category, keyword, loadMoreSignal
			loadTopics(1, $scope.selectedItem, $scope.searchContext, false);
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

		/********************** 页面新建文章按钮操作 ********************/
		$scope.addNewArticle = function (ev) {
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
				}).then(function (data) {
					// handle user data
				}, function () {
					// canceled
				});
			}
		};

		/********************** 查看帖子详情 ********************/
		$scope.goTopicDetail = function (topic, ev) {
			if (localStorageService.get('userInfo')) {
				var url = $state.href('topic-detail', { id: topic._id });
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

		/********************** 发表新帖 ********************/
		$scope.addNewTopic = function (ev) {
			if (localStorageService.get('userInfo')) {
				var user = localStorageService.get('userInfo');
				$mdDialog.show({
					controller: 'addNewTopicCtrl',
					templateUrl: 'dist/pages/add-new-topic.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose: false,
					fullscreen: false
				}).then(function (data) {
					// 发表新贴
					$scope.isSubmittingTopic = false;
					$http.post(BaseUrl + '/topic/' + user._id, {
						Author: user.DisplayName,
						Topic: data
					}).then(function (response) {
						$scope.isSubmittingTopic = false;
						loadTopics(1, $scope.selectedItem, $scope.searchContext, '');
						alertService.showAlert('发表帖子成功。', ev);
					}, function (error) {
						$scope.isSubmittingTopic = false;
						alertService.showAlert('发表帖子失败，请重试。', ev);
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

		/********************** 添加帖子到我的收藏 ********************/
		$scope.goAddTopicToFav = function (topic, ev) {
			$http.put(BaseUrl + '/user-topic-fav/' + user._id + '/' + topic._id).then(function (response) {
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

		/********************** 创建新的文章草稿对象并保存 ********************/
		function generateNewArticleDraft(ev) {
			var body = {
				Title: "",
				Category: "",
				Author: user.DisplayName,
				Content: ""
			};
			$http.post(BaseUrl + '/article-draft/' + user._id, body).then(function (response) {
				var url = $state.href('new-article', { id: response.data._id });
				window.open(url, '_blank');
			}, function (error) {
				alertService.showAlert('新建文章模板失败，请重试', ev);
			});
		}

		/********************** 初始化加载
   * 								我关注的话题
   * 								我关注的人关注的帖子信息
   * 								我关注的人发表的帖子
   * 								去重
   * 	 ********************/
		function loadTopics(pageNum, loadMoreSignal) {
			var body = {
				Page: pageNum
			};
			$scope.isLoadingTopic = true;

			$http.post(BaseUrl + "/topic", body).then(function (response) {
				if (loadMoreSignal) {
					$scope.topicList = $scope.topicList.concat(response.data);
				} else {
					$scope.topicList = response.data;
				}
			});
		}
		loadTopics(1, false); // 数据初始化
	}]);
})();
(function () {
    'use strict';

    angular.module('The.Power.Soul.Fav.List', ['ngMaterial']).controller('favListCtrl', ['$scope', '$http', 'localStorageService', 'BaseUrl', '$rootScope', '$state', function ($scope, $http, localStorageService, BaseUrl, $rootScope, $state) {
        $scope.isLoading = false;
        $scope.isLoadingHasError = false;
        $scope.isLoadingArticlesHasError = false;
        $scope.isLoadingArticles = false;
        $scope.favTopics = [];
        $scope.favArticles = [];
        var user = localStorageService.get('userInfo');

        $scope.goToTopicDetail = function (topic) {
            if (localStorageService.get('userInfo')) {
                var url = $state.href('topic-detail', { id: topic._id });
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

        $scope.goToArticleDetail = function (article) {
            if (localStorageService.get('userInfo')) {
                var url = $state.href('article-detail', { id: article._id });
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

        $scope.goToArticleDetail = function (article) {};

        function loadFavTopics() {
            $scope.isLoading = true;
            $http.get(BaseUrl + '/user-fav-topics/' + user._id).then(function (response) {
                $scope.isLoading = false;
                $scope.favTopics = response.data;
            }, function (error) {
                $scope.isLoading = false;
                $scope.isLoadingHasError = true;
            });
        }

        function loadFavArticles() {
            $scope.isLoadingArticles = false;
            $http.get(BaseUrl + '/user-fav-articles/' + user._id).then(function (response) {
                $scope.isLoadingArticles = false;
                $scope.favArticles = response.data;
            }, function (error) {
                $scope.isLoadingArticlesHasError = true;
                $scope.isLoadingArticles = false;
            });
        }
        loadFavTopics();
        loadFavArticles();
    }]);
})();
(function () {
    'use strict';

    angular.module('The.Power.Soul.Introduction', ['ngMaterial']).controller('introductionCtrl', ['$scope', function ($scope) {}]);
})();
(function () {
    'use strict';

    angular.module('The.Power.Soul.Mall', ['ngMaterial']).controller('mallCtrl', ['$scope', function ($scope) {
        $scope.goToAppleBlosom = function () {
            window.open('https://shop108569186.taobao.com/shop/view_shop.htm?spm=a313o.201708ban.favorite.d53.2ee350661KwgjM&mytmenu=mdianpu&user_number_id=152433083');
        };
    }]);
})();
(function () {
    'use strict';

    angular.module('The.Power.Soul.Message.Detail', ['ngMaterial']).controller('messageDetailCtrl', ['$scope', '$http', '$rootScope', '$stateParams', '$mdDialog', 'alertService', 'BaseUrl', 'localStorageService', function ($scope, $http, $rootScope, $stateParams, $mdDialog, alertService, BaseUrl, localStorageService) {
        $scope.isLoading = false;
        $scope.isLoadingHasError = false;
        $scope.isPosting = false;
        $scope.isDeleting = false;
        $scope.isSettingStatusHasError = false;
        $scope.newMessageContent = "";
        $scope.user = localStorageService.get('userInfo');
        $scope.disableLoadingMore = false;
        $scope.messages = [];
        var sender_id = $stateParams.id;
        var targetUser = null;
        var pageNum = 1;
        $rootScope.$broadcast('$HIDEMESSAGEENTRANCE');

        $scope.postNewMessage = function (ev) {
            $scope.isPosting = true;
            var body = {
                Content: $scope.newMessageContent,
                UserName: $scope.user.DisplayName,
                TargetUserName: targetUser.DisplayName
            };
            $http.post(BaseUrl + '/private-message/' + $scope.user._id + '/' + sender_id, body).then(function (response) {
                $scope.isPosting = false;
                alertService.showAlert('发送私信成功', ev);
                $scope.newMessageContent = "";
                location.reload();
            }, function (error) {
                $scope.isPosting = false;
                alertService.showAlert('发送私信失败，请重试', ev);
            });
        };

        $scope.showMessageOrNot = function (message) {
            if (message.UserID === $scope.user._id) {
                return message.UserDelStatus;
            } else if (message.TargetUserID === $scope.user._id) {
                return message.TargetUserDelStatus;
            }
        };

        $scope.deleteMessage = function (message, ev) {
            var confirm = $mdDialog.confirm().title('提示').textContent('确定删除这条私信？').ariaLabel('').targetEvent(ev).ok('确定').cancel('取消');

            $mdDialog.show(confirm).then(function () {
                $scope.isDeleting = true;
                $http.delete(BaseUrl + '/private-message/' + $scope.user._id + '/' + message._id).then(function (response) {
                    $scope.isDeleting = false;
                    $scope.messages.splice($scope.messages.indexOf(message), 1);
                    alertService.showAlert('删除私信成功', ev);
                }, function (error) {
                    $scope.isDeleting = false;
                    alertService.showAlert('删除私信失败，请重试', ev);
                });
            }, function () {
                // canceled
            });
        };

        $scope.loadMore = function () {
            getConversation(++pageNum, true);
        };

        function setReadStatus() {
            return $http.put(BaseUrl + '/private-message/' + $scope.user._id + '/' + sender_id).then(function (response) {}, function (error) {
                $scope.isSettingStatusHasError = true;
            });
        }

        function getConversation(pageNum, isLoadingMore) {
            var body = {
                PageNum: pageNum
            };
            $scope.isLoading = true;
            return $http.post(BaseUrl + '/private-messages/' + $scope.user._id + '/' + sender_id, body).then(function (response) {
                $scope.isLoading = false;
                if (isLoadingMore) {
                    $scope.messages = $scope.messages.concat(response.data);
                    if (response.data.length < 5) {
                        $scope.disableLoadingMore = true;
                    }
                } else {
                    $scope.messages = response.data;
                }
            }, function (error) {
                $scope.isLoading = false;
                $scope.isLoadingHasError = true;
            });
        }

        function getTargetUserName() {
            $http.get(BaseUrl + '/user/' + sender_id).then(function (response) {
                targetUser = response.data;
            }, function (error) {
                // 加载用户信息失败
            });
        }

        setReadStatus().then(getConversation(1, false).then(getTargetUserName()));
    }]);
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
            $mdDialog.cancel();
        };
    }]);
})();
(function () {
	'use strict';

	angular.module('The.Power.Soul.Square', ['ngMaterial']).constant('selectorItems', [{
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
	}]).controller('squareCtrl', ['$scope', '$http', '$rootScope', '$stateParams', '$state', 'BaseUrl', 'selectorItems', 'localStorageService', 'alertService', '$mdDialog', function ($scope, $http, $rootScope, $stateParams, $state, BaseUrl, selectorItems, localStorageService, alertService, $mdDialog) {
		$scope.selectedItem = "ALL";
		$scope.selectorItems = selectorItems;
		$scope.topicList = [];
		$scope.articleList = [];
		$scope.isLoadingTopic = false;
		$scope.isLoadingArticle = false;
		$scope.isLoadingTopicHasError = false;
		$scope.isLoadingArticleHasError = false;
		$scope.disableLoadMore = false;
		$scope.disableLoadMoreArticle = false;
		$scope.showTopic = true;
		$scope.switchButtonText = '看文章';
		var pageNum = 1;
		var articlePageNum = 1;
		var user = localStorageService.get('userInfo');

		$scope.switchDisplay = function (evt) {
			$scope.showTopic = !$scope.showTopic;
			$scope.switchButtonText = '看帖子';
		};

		/********************** 页面新建文章按钮操作 ********************/
		$scope.addNewArticle = function (ev) {
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
				}).then(function (data) {
					// handle user data
				}, function () {
					// canceled
				});
			}
		};

		/********************** 查看帖子详情 ********************/
		$scope.goTopicDetail = function (topic, ev) {
			if (localStorageService.get('userInfo')) {
				var url = $state.href('topic-detail', { id: topic._id });
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

		$scope.goArticleDetail = function (article, ev) {
			if (localStorageService.get('userInfo')) {
				var url = $state.href('article-detail', { id: article._id });
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

		/********************** 删除帖子 ********************/
		$scope.deleteTopic = function (topic, ev) {
			var confirm = $mdDialog.confirm().title('提示').textContent('确定删除这条帖子？').ariaLabel('').targetEvent(ev).ok('确定').cancel('取消');

			$mdDialog.show(confirm).then(function () {
				$scope.isDeleting = true;
				$http.delete(BaseUrl + '/topic/' + topic._id).then(function (data) {
					alertService.showAlert('删除成功', ev);
					$state.go('bbs');
				}, function (error) {
					alertService.showAlert('删除失败', ev);
				});
			}, function () {
				// canceled
			});
		};

		/********************** 发表新帖 ********************/
		$scope.addNewTopic = function (ev) {
			if (localStorageService.get('userInfo')) {
				var user = localStorageService.get('userInfo');
				$mdDialog.show({
					controller: 'addNewTopicCtrl',
					templateUrl: 'dist/pages/add-new-topic.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose: false,
					fullscreen: false
				}).then(function (data) {
					// 发表新贴
					$scope.isSubmittingTopic = false;
					$http.post(BaseUrl + '/topic/' + user._id, {
						Author: user.DisplayName,
						Topic: data
					}).then(function (response) {
						$scope.isSubmittingTopic = false;
						loadTopics(1, $scope.selectedItem, $scope.searchContext, '');
						alertService.showAlert('发表帖子成功。', ev);
					}, function (error) {
						$scope.isSubmittingTopic = false;
						alertService.showAlert('发表帖子失败，请重试。', ev);
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

		/********************** 添加帖子到我的收藏 ********************/
		$scope.goAddTopicToFav = function (topic, ev) {
			$http.put(BaseUrl + '/user-topic-fav/' + user._id + '/' + topic._id).then(function (response) {
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

		$scope.goAddArticleToFav = function (article, ev) {
			$http.put(BaseUrl + '/user-article-fav/' + user._id + '/' + article._id).then(function (response) {
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

		/********************** 创建新的文章草稿对象并保存 ********************/
		function generateNewArticleDraft(ev) {
			var body = {
				Title: "",
				Category: "",
				Author: user.DisplayName,
				Content: ""
			};
			$http.post(BaseUrl + '/article-draft/' + user._id, body).then(function (response) {
				var url = $state.href('new-article', { id: response.data._id });
				window.open(url, '_blank');
			}, function (error) {
				alertService.showAlert('新建文章模板失败，请重试', ev);
			});
		}

		$scope.changeCategoryFilter = function () {
			pageNum = 1;
			loadTopics(pageNum, $scope.selectedItem, '', false);
		};

		$scope.loadMore = function () {
			loadTopics(++pageNum, $scope.selectedItem, '', true);
		};

		$scope.loadMoreArticle = function () {
			loadArticles(++articlePageNum, $scope.selectedItem, '', true);
		};

		function loadArticles(pageNum, category, keyword, isLoadingMore) {
			var body = {
				PageNum: pageNum,
				Category: category,
				Keyword: keyword,
				LoadAll: false
			};
			if (category === 'All') {
				body.LoadAll = true;
			}
			$scope.isLoadingArticle = true;
			$http.post(BaseUrl + '/articles', body).then(function (response) {
				$scope.isLoadingArticle = false;
				if (isLoadingMore) {
					$scope.articleList = $scope.articleList.concat(response.data);
					if (response.data.length < 5) {
						$scope.disableLoadMoreArticle = true;
					}
				} else {
					$scope.articleList = response.data;
				}
			}, function (error) {
				$scope.isLoadingArticle = false;
			});
		}
		loadArticles(1, 'ALL', '', false);

		/********************** 初始化加载帖子信息 ********************/
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
			$http.post(BaseUrl + "/topic", body).then(function (response) {
				if (loadMoreSignal) {
					$scope.topicList = $scope.topicList.concat(response.data);
				} else {
					$scope.topicList = response.data;
				}
				if (response.data.length < 5) {
					$scope.disableLoadMore = true;
				}
			}, function (error) {
				$scope.isLoadingHasError = true;
			});
		}
		loadTopics(1, 'ALL', '', false); // 数据初始化，第一次加载
	}]);
})();
(function () {
	'use strict';

	angular.module('The.Power.Soul.Topic.Detail', ['ngMaterial']).controller('addNewCommentCtrl', ['$scope', '$mdDialog', function ($scope, $mdDialog) {
		$scope.comment = "";
		$scope.submit = function () {
			$mdDialog.hide($scope.comment);
		};
		$scope.closeDialog = function () {
			$mdDialog.cancel();
		};
	}]).controller('seeCommentConversationCtrl', ['$scope', '$mdDialog', 'Comment', 'BaseUrl', 'alertService', '$http', 'localStorageService', function ($scope, $mdDialog, Comment, BaseUrl, alertService, $http, localStorageService) {
		$scope.isLoading = false;
		$scope.isLoadingHasError = false;
		$scope.commentList = [];
		$scope.user = localStorageService.get('userInfo');
		$http.get(BaseUrl + '/comment/' + Comment.UserID + '/' + Comment.TargetUserID + '/' + Comment.TargetContextID).then(function (response) {
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
			$http.put(BaseUrl + '/comment/' + $scope.user._id + '/' + comment._id + '/up').then(function (response) {
				var index = comment.LikeUser.indexOf($scope.user._id);
				var indexDis = comment.DislikeUser.indexOf($scope.user._id);
				if (indexDis >= 0) {
					comment.DislikeUser.splice(index, 1);
				}
				if (index < 0) {
					comment.LikeUser.push($scope.user._id);
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
			$http.put(BaseUrl + '/comment/' + $scope.user._id + '/' + comment._id + '/down').then(function (response) {
				var index = comment.LikeUser.indexOf($scope.user._id);
				var indexDis = comment.DislikeUser.indexOf($scope.user._id);
				if (index >= 0) {
					comment.LikeUser.splice(index, 1);
				}
				if (indexDis < 0) {
					comment.DislikeUser.push($scope.user._id);
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
	}]).controller('topicDetailCtrl', ['$scope', '$stateParams', '$mdDialog', '$http', 'BaseUrl', 'localStorageService', 'alertService', '$state', function ($scope, $stateParams, $mdDialog, $http, BaseUrl, localStorageService, alertService, $state) {
		$scope.user = localStorageService.get('userInfo');
		$scope.followButtonText = "";
		$scope.isFollowing = false;
		$scope.disableLoadingMore = false;
		var pageNum = 1;

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
		var topic_id = $stateParams.id;

		/*
  	评论帖子 
  */
		$scope.addNewCommentToTopic = function (ev) {
			$scope.isPostingNewComment = true;
			$http.post(BaseUrl + '/comment/' + $scope.user._id + '/' + topic_id, {
				Comment: $scope.newCommentContent,
				ContextID: "",
				TargetUserID: "",
				Author: $scope.user.DisplayName,
				TargetAuthor: ""
			}).then(function (response) {
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
			}).then(function (data) {
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
			}).then(function (data) {}, function () {
				// canceled
			});
		};

		/*
  	收藏这个话题
  */
		$scope.goAddTopicToFav = function (ev) {
			$http.put(BaseUrl + '/user-topic-fav/' + $scope.user._id + '/' + topic_id).then(function (response) {
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
			}).then(function (data) {
				postNewReportMessage(data, 'Topic', ev);
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
			}).then(function (data) {
				postNewReportMessage(data, 'Comment', ev);
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
			};
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
			}).then(function (data) {}, function () {
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
			$http.post(BaseUrl + '/complaint-message/' + $scope.user._id, body).then(function (response) {
				alertService.showAlert('举报成功，请耐心等待处理结果', ev);
			}, function (error) {
				alertService.showAlert('举报失败，请重试', ev);
			});
		}

		/*
  	点赞帖子
  */
		$scope.likeTheTopic = function (ev) {
			$scope.isChangingTopicLikeStauts = true;
			$http.put(BaseUrl + '/topic/' + $scope.user._id + '/' + $scope.topic._id + '/up').then(function (response) {
				$scope.isChangingTopicLikeStauts = false;
				var index = $scope.topic.LikeUser.indexOf($scope.user._id);
				var indexDis = $scope.topic.DislikeUser.indexOf($scope.user._id);
				if (indexDis >= 0) {
					$scope.topic.DislikeUser.splice(index, 1);
				}
				if (index < 0) {
					$scope.topic.LikeUser.push($scope.user._id);
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
			$http.put(BaseUrl + '/topic/' + $scope.user._id + '/' + $scope.topic._id + '/down').then(function (response) {
				$scope.isChangingTopicLikeStauts = false;
				var index = $scope.topic.LikeUser.indexOf($scope.user._id);
				var indexDis = $scope.topic.DislikeUser.indexOf($scope.user._id);
				if (index >= 0) {
					$scope.topic.LikeUser.splice(index, 1);
				}
				if (indexDis < 0) {
					$scope.topic.DislikeUser.push($scope.user._id);
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
			var confirm = $mdDialog.confirm().title('提示').textContent('确定删除这条帖子？').ariaLabel('').targetEvent(ev).ok('确定').cancel('取消');

			$mdDialog.show(confirm).then(function () {
				$scope.isDeleting = true;
				$http.delete(BaseUrl + '/topic/' + $scope.topic._id).then(function (data) {
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
			var confirm = $mdDialog.confirm().title('提示').textContent('确定删除这条评论？').ariaLabel('').targetEvent(ev).ok('确定').cancel('取消');

			$mdDialog.show(confirm).then(function () {
				$http.delete(BaseUrl + '/comment/' + comment._id).then(function (response) {
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
			$http.put(BaseUrl + '/comment/' + $scope.user._id + '/' + comment._id + '/up').then(function (response) {
				var index = comment.LikeUser.indexOf($scope.user._id);
				var indexDis = comment.DislikeUser.indexOf($scope.user._id);
				if (indexDis >= 0) {
					comment.DislikeUser.splice(index, 1);
				}
				if (index < 0) {
					comment.LikeUser.push($scope.user._id);
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
			$http.put(BaseUrl + '/comment/' + $scope.user._id + '/' + comment._id + '/down').then(function (response) {
				var index = comment.LikeUser.indexOf($scope.user._id);
				var indexDis = comment.DislikeUser.indexOf($scope.user._id);
				if (index >= 0) {
					comment.LikeUser.splice(index, 1);
				}
				if (indexDis < 0) {
					comment.DislikeUser.push($scope.user._id);
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

		function loadTopicDetail() {
			$scope.isLoading = true;
			return $http.get(BaseUrl + '/topic/' + $scope.user._id + '/' + topic_id).then(function (response) {
				$scope.isLoading = false;
				angular.extend($scope.topic, response.data);
				getTopicAuthorInfo();
			}, function (error) {
				$scope.isLoading = false;
				$scope.isLoadingHasError = true;
			});
		}

		/*
  	回复评论
  */
		function sendCommentReply(comment, newComment, ev) {
			$http.post(BaseUrl + '/comment/' + $scope.user._id + '/' + topic_id, {
				Comment: newComment,
				ContextID: comment.TargetContextID,
				TargetUserID: comment.UserID,
				Author: $scope.user.DisplayName,
				TargetAuthor: comment.Author
			}).then(function (response) {
				$scope.commentList.push(response.data);
			}, function (error) {
				alertService.showAlert('回复评论失败，请重试', ev);
			});
		}

		function getTopicAuthorInfo() {
			$scope.isLoadingUserInfo = true;
			return $http.get(BaseUrl + '/get-publish-number/' + $scope.topic.UserID).then(function (response) {
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
			$http.get(BaseUrl + '/user-detail/' + $scope.user._id + '/' + $scope.topic.UserID).then(function (response) {
				$scope.isLoading = false;
				$scope.isFollowing = response.data.IsFollowing;
				$scope.followButtonText = $scope.isFollowing ? "取消关注" : '关注';
			}, function (error) {
				$scope.isLoading = false;
				$scope.isLoadingHasError = true;
			});
		}

		$scope.followOperation = function (ev) {
			$scope.isOperating = true;
			if ($scope.isFollowing) {
				$http.put(BaseUrl + '/user-unfollow/' + $scope.user._id + '/' + $scope.topic.UserID).then(function (response) {
					$scope.followButtonText = "关注";
					$scope.isOperating = false;
					$scope.isFollowing = false;
				}, function (error) {
					alertService.showAlert('取消关注失败', ev);
					$scope.isOperating = false;
				});
			} else {
				$http.put(BaseUrl + '/user-follow/' + $scope.user._id + '/' + $scope.topic.UserID).then(function (response) {
					$scope.followButtonText = "取消关注";
					$scope.isOperating = false;
					$scope.isFollowing = true;
				}, function (error) {
					alertService.showAlert('关注失败', ev);
					$scope.isOperating = false;
				});
			}
		};

		function loadTopicComments(pageNum, isLoadingMore) {
			$scope.isLoadingComments = true;
			var body = {
				PageNum: pageNum
			};
			$http.post(BaseUrl + '/comment/' + topic_id, body).then(function (response) {
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
				$scope.isLoadingCommentsHasError = true;
			});
		}

		loadTopicDetail().then(loadTopicComments(1, false));
	}]);
})();
(function () {
    'use strict';

    angular.module('The.Power.Soul.UserDetail', ['ngMaterial']).controller('sendSpecificMessageCtrl', ['$scope', '$mdDialog', '$http', 'targetUser', 'user', 'BaseUrl', 'alertService', function ($scope, $mdDialog, $http, targetUser, user, BaseUrl, alertService) {
        $scope.targetUserInfo = null;
        $scope.newMessage = "";
        var user = user;
        $scope.targetUserInfo = targetUser;

        $scope.submit = function (ev) {
            var body = {
                Content: $scope.newMessage,
                UserName: user.DisplayName,
                TargetUserName: $scope.targetUserInfo.DisplayName
            };
            $http.post(BaseUrl + '/private-message/' + user._id + '/' + $scope.targetUserInfo._id, body).then(function (data) {
                alertService.showAlert('发送私信成功', ev);
                $mdDialog.cancel();
            }, function (error) {
                alertService.showAlert('发送私信失败', ev);
                $mdDialog.cancel();
            });
        };

        $scope.closeDialog = function () {
            $mdDialog.cancel();
        };
    }]).controller('userDetailCtrl', ['$scope', '$http', '$stateParams', 'localStorageService', 'BaseUrl', 'alertService', '$mdDialog', function ($scope, $http, $stateParams, localStorageService, BaseUrl, alertService, $mdDialog) {
        var user_id = $stateParams.id;
        var accessid = 'LTAILjmmB1fnhHlx';
        var host = "http://thepowersoul2018.oss-cn-qingdao.aliyuncs.com";
        var loggedUser = localStorageService.get('userInfo');
        var imageTypes = ['image/jpg', 'image/jpeg', 'image/png'];
        $scope.isLoading = false;
        $scope.isLoadingHasError = false;
        $scope.user = null;
        $scope.showActionButton = false;
        $scope.isFollowing = false;
        $scope.followButtonText = "";
        $scope.profilePictureSrc = "";
        $scope.progressBarProgress = 0;
        $scope.showProgress = false;
        $scope.profilePictureSrc = loggedUser.AvatarID;

        if (loggedUser._id === user_id) {
            // 进入当前页面的是登录用户本人
            $scope.user = loggedUser;
        } else {
            // 查看其它人的页面
            $scope.isLoading = true;
            $http.get(BaseUrl + '/user-detail/' + loggedUser._id + '/' + user_id).then(function (response) {
                $scope.showActionButton = true;
                $scope.isFollowing = response.data.IsFollowing;
                $scope.followButtonText = $scope.isFollowing ? "取消关注" : '关注';
                $scope.user = response.data.Data;
                $scope.isLoading = false;
            }, function (error) {
                $scope.isLoading = false;
                $scope.isLoadingHasError = true;
            });
        }

        function set_upload_param(up, data) {
            up.setOption({
                'multipart_params': {
                    'Filename': '${filename}',
                    'key': loggedUser._id + '${filename}',
                    'policy': data.PolicyText,
                    'OSSAccessKeyId': accessid,
                    'success_action_status': '200', //让服务端返回200，不然，默认会返回204
                    'signature': data.Signature
                }
            });
            up.start();
            $scope.showProgress = true;
        }

        function saveImgSrcToUserProfile(src) {
            var body = {
                Src: src
            };
            $http.put(BaseUrl + '/user-update-picture/' + loggedUser._id, body).then(function (response) {
                // 更换localStorage中的头像信息
                loggedUser.AvatarID = src;
                localStorageService.remove('userInfo');
                localStorageService.set('userInfo', loggedUser);
                alertService.showAlert('更换头像成功');
            }, function (error) {
                alertService.showAlert('更换用户头像失败，请重试');
            });
        }

        var uploader = new plupload.Uploader({
            runtimes: 'html5,flash,silverlight,html4',
            browse_button: 'selectPicture',
            container: document.getElementById('profilePictureContainer'),
            flash_swf_url: 'lib/plupload-2.1.2/js/Moxie.swf',
            silverlight_xap_url: 'lib/plupload-2.1.2/js/Moxie.xap',
            url: host,
            init: {
                PostInit: function () {
                    //
                },
                FilesAdded: function (up, files) {
                    var fileType = files[0].type;
                    var fileSize = files[0].size;
                    $scope.progressBarProgress = 0;
                    if (imageTypes.indexOf(fileType) < 0) {
                        alertService.showAlert('目前只支持png, jpg, jpeg格式的图片');
                        uploader.stop();
                        return;
                    } else if (fileSize > 1048576) {
                        alertService.showAlert('请传输小于1Mb的图片');
                        uploader.stop();
                        return;
                    } else {
                        $http.get(BaseUrl + '/get-upload-policy').then(function (response) {
                            set_upload_param(uploader, response.data);
                        }, function (error) {});
                    }
                },
                BeforeUpload: function (up, file) {},
                UploadProgress: function (up, file) {
                    $scope.progressBarProgress = file.percent;
                },
                FileUploaded: function (up, file, info) {
                    if (info.status == 200) {
                        var body = {
                            Key: loggedUser._id + file.name
                        };
                        $http.put(BaseUrl + '/set-picture-public', body).then(function (response) {
                            $scope.profilePictureSrc = response.data.Src;
                            saveImgSrcToUserProfile(response.data.Src);
                        }, function (error) {
                            alertService.showAlert('更换头像失败，请联系管理员');
                        });
                    } else {}
                    $scope.showProgress = false;
                },
                Error: function (up, err) {
                    console.log(err);
                }
            }
        });
        uploader.init();

        $scope.sendPrivateMessage = function (ev) {
            $mdDialog.show({
                controller: 'sendSpecificMessageCtrl',
                templateUrl: 'dist/pages/send-specific-message.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: false,
                locals: {
                    targetUser: $scope.user,
                    user: loggedUser
                }
            }).then(function (data) {}, function () {
                // canceled mdDialog
            });
        };

        $scope.followOperation = function (ev) {
            $scope.isOperating = true;
            if ($scope.isFollowing) {
                $http.put(BaseUrl + '/user-unfollow/' + loggedUser._id + '/' + user_id).then(function (response) {
                    $scope.followButtonText = "关注";
                    $scope.isOperating = false;
                    $scope.isFollowing = false;
                }, function (error) {
                    alertService.showAlert('取消关注失败', ev);
                    $scope.isOperating = false;
                });
            } else {
                $http.put(BaseUrl + '/user-follow/' + loggedUser._id + '/' + user_id).then(function (response) {
                    $scope.followButtonText = "取消关注";
                    $scope.isOperating = false;
                    $scope.isFollowing = true;
                }, function (error) {
                    alertService.showAlert('关注失败', ev);
                    $scope.isOperating = false;
                });
            }
        };
    }]);
})();
(function () {
    'use strict';

    angular.module('The.Power.Soul.Tools', []).constant('categoryItems', [{
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
    }]).filter('categoryFilter', function () {
        return function (str) {
            var result = "";
            switch (str) {
                case 'STRENGTH':
                    result = "力量训练";
                    break;
                case 'YOGA':
                    result = "瑜伽训练";
                    break;
                case 'FITNESS':
                    result = "形体训练";
                    break;
                case 'RUNNING':
                    result = "跑步训练";
                    break;
            }
            return result;
        };
    }).service('alertService', ['$mdDialog', function ($mdDialog) {
        return {
            showAlert: function (text, ev) {
                $mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).title('提示').textContent(text).ariaLabel('Alert Dialog Demo').ok('好的').targetEvent());
            }
        };
    }]).service('randomString', function () {
        return {
            getRandomString: function (len) {
                len = len || 32;
                var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
                var maxPos = chars.length;
                var result = '';
                for (var i = 0; i < len; i++) {
                    result += chars.charAt(Math.floor(Math.random() * maxPos));
                }
                return result;
            }
        };
    });
})();