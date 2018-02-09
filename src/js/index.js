(function () {
    'use strict';
    var subModules = [
        'The.Power.Soul.Introduction',
        'The.Power.Soul.BBS',
        'The.Power.Soul.Square',
        'The.Power.Soul.Tools',
        'The.Power.Soul.Topic.Detail',
        'The.Power.Soul.NewArticle',
        'The.Power.Soul.UserDetail',
        'The.Power.Soul.Mall',
        'The.Power.Soul.Search.For.Users',
        'The.Power.Soul.Article.List',
        'The.Power.Soul.Article.Detail',
        'The.Power.Soul.Fav.List',
        'The.Power.Soul.Message.Detail',
        'The.Power.Soul.All.Messages',
        'The.Power.Soul.Report',
        'The.Power.Soul.Search.Results',
        'LocalStorageModule'
    ];
    angular.module('The.Power.Soul', ['ngMaterial', 'ui.router', 'ngSanitize'].concat(subModules))
        .constant('BaseUrl', "http://47.104.23.80:3030")
        .config(function (localStorageServiceProvider, $locationProvider) {
            localStorageServiceProvider
                .setPrefix('thepowersoul');
        })
        .filter('to_trusted_html', ['$sce', function ($sce) {
            return function (text) {
                return $sce.trustAsHtml(text);
            };
        }])
        .filter('to_trusted_video', ['$sce', function ($sce) {
            return function (text) {
                return $sce.trustAsResourceUrl(text);
            }
        }])
        .factory('authorizationService', function ($http, $q, $rootScope, BaseUrl, localStorageService, $state, alertService) {
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
                        })
                            .then(function (response) {
                                pointer.permissionModel.permission = response;
                                pointer.permissionModel.isPermissionLoaded = true;
                                pointer.getPermission(pointer.permissionModel, defer);
                                $rootScope.$broadcast('$ONSESSIONAUTHED');
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
            }
        })
        .config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
            function ($stateProvider, $urlRouterProvider, $locationProvider) {
                $urlRouterProvider
                    .when('/', 'introduction')
                    .otherwise(function ($injector) {
                        var state = $injector.get('$state');
                        state.go('404');
                    });
                // $locationProvider.html5Mode(true);
                $stateProvider
                    .state('404', {
                        url: '/error',
                        templateUrl: 'dist/pages/not-found.html',
                        controller: 'notFoundCtrl'
                    })
                    .state('introduction', {
                        url: '/introduction',
                        templateUrl: 'dist/pages/introduction.html',
                        controller: 'introductionCtrl',
                    })
                    .state('square', {
                        url: '/square',
                        templateUrl: 'dist/pages/square.html',
                        controller: 'squareCtrl',
                        reload: true,
                        resolve: {
                            permission: function (authorizationService) {
                                return authorizationService.permissionCheck();
                            }
                        }
                    })
                    .state('bbs', {
                        url: '/bbs',
                        templateUrl: 'dist/pages/bbs.html',
                        controller: 'bbsCtrl',
                        reload: true,
                        resolve: {
                            permission: function (authorizationService) {
                                return authorizationService.permissionCheck();
                            }
                        }
                    })
                    .state('topic-detail', {
                        url: '/topic-detail/{id}',
                        templateUrl: 'dist/pages/topic-detail.html',
                        controller: 'topicDetailCtrl',
                        reload: true,
                        resolve: {
                            permission: function (authorizationService) {
                                return authorizationService.permissionCheck();
                            }
                        }
                    })
                    .state('new-article', {
                        url: '/new-article/{id}',
                        templateUrl: 'dist/pages/add-new-article.html',
                        controller: 'addNewArticleCtrl',
                        reload: true,
                        resolve: {
                            permission: function (authorizationService) {
                                return authorizationService.permissionCheck();
                            }
                        }
                    })
                    .state('user-detail', {
                        url: '/user-detail/{id}',
                        templateUrl: 'dist/pages/user-detail.html',
                        controller: 'userDetailCtrl',
                        reload: true,
                        resolve: {
                            permission: function (authorizationService) {
                                return authorizationService.permissionCheck();
                            }
                        }
                    })
                    .state('mall', {
                        url: '/mall',
                        templateUrl: 'dist/pages/mall.html',
                        controller: 'mallCtrl',
                        reload: true,
                        resolve: {
                            permission: function (authorizationService) {
                                return authorizationService.permissionCheck();
                            }
                        }
                    })
                    .state('article-list', {
                        url: '/article-list',
                        templateUrl: 'dist/pages/article-list.html',
                        controller: 'articleListCtrl',
                        reload: true,
                        resolve: {
                            permission: function (authorizationService) {
                                return authorizationService.permissionCheck();
                            }
                        }
                    })
                    .state('article-detail', {
                        url: '/article-detail/{id}',
                        templateUrl: 'dist/pages/article-detail.html',
                        controller: 'articleDetailCtrl',
                        reload: true,
                        resolve: {
                            permission: function (authorizationService) {
                                return authorizationService.permissionCheck();
                            }
                        }
                    })
                    .state('fav-list', {
                        url: '/fav-list',
                        templateUrl: 'dist/pages/fav-list.html',
                        controller: 'favListCtrl',
                        reload: true,
                        resolve: {
                            permission: function (authorizationService) {
                                return authorizationService.permissionCheck();
                            }
                        }
                    })
                    .state('message-detail', {
                        url: '/message-detail/{id}',
                        templateUrl: 'dist/pages/message-detail.html',
                        controller: 'messageDetailCtrl',
                        reload: true,
                        resolve: {
                            permission: function (authorizationService) {
                                return authorizationService.permissionCheck();
                            }
                        }
                    })
                    .state('all-messages', {
                        url: '/all-messages/{id}',
                        templateUrl: 'dist/pages/all-messages.html',
                        controller: 'allMessagesCtrl',
                        reload: true,
                        resolve: {
                            permission: function (authorizationService) {
                                return authorizationService.permissionCheck();
                            }
                        }
                    })
                    .state('search-results', {
                        url: '/search-results/{keyword}',
                        templateUrl: 'dist/pages/search-results.html',
                        controller: 'searchResultsCtrl',
                        reload: true,
                        resolve: {
                            permission: function (authorizationService) {
                                return authorizationService.permissionCheck();
                            }
                        }
                    });
            }])
        .controller('notFoundCtrl', ['$scope', '$state', function ($scope, $state) {
            $scope.goBackToIntroduction = function () {
                $state.go('introduction');
            };
        }])
        .controller('sendNewPrivateMessageCtrl', ['$scope', '$mdDialog', '$http', 'BaseUrl', 'localStorageService',
            'alertService',
            function ($scope, $mdDialog, $http, BaseUrl, localStorageService, alertService) {
                $scope.newMessage = "";
                $scope.emailKeyword = "";
                $scope.users = [];
                $scope.targetUser = null;
                $scope.isSearching = false;
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
                        $scope.isSearching = true;
                        $scope.users = [];
                        var body = {
                            EmailKeyword: $scope.emailKeyword
                        }
                        $http.post(BaseUrl + '/users', body)
                            .then(function (response) {
                                $scope.isSearching = false;
                                $scope.users = filterDataToRemoveCurrentUser(response.data);
                            }, function (error) {
                                $scope.isSearching = false;
                            });
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
                    $scope.isOperating = true;
                    var body = {
                        Content: $scope.newMessage,
                        UserName: user.DisplayName,
                        TargetUserName: $scope.targetUser.DisplayName
                    }
                    $http.post(BaseUrl + '/private-message/' + user._id + '/' + $scope.targetUser._id, body)
                        .then(function (data) {
                            $scope.isOperating = false;
                            alertService.showAlert('发送私信成功');
                            $mdDialog.cancel();
                        }, function (error) {
                            $scope.isOperating = false;
                            alertService.showAlert('发送私信失败');
                            $mdDialog.cancel();
                        });
                };
            }])

        .controller('listPrivateMessageCtrl', ['$scope', '$mdDialog', '$http', '$state', 'BaseUrl', 'localStorageService',
            '$rootScope',
            function ($scope, $mdDialog, $http, $state, BaseUrl, localStorageService, $rootScope) {
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
                    })
                        .then(function (data) {

                        }, function () {
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
                }

                function loadMessages() {
                    $scope.isLoading = true;
                    $http.get(BaseUrl + '/private-message/' + $scope.user._id)
                        .then(function (response) {
                            $scope.messages = response.data;
                        }, function (error) {
                            $scope.isLoadingHasError = true;
                            $scope.isLoading = false;
                        });
                }

                function loadRecentMessages() {
                    $scope.isLoading = true;
                    $http.get(BaseUrl + '/user/' + $scope.user._id)
                        .then(function (response) {
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
            }])

        .controller('loginOrSignupCtrl', ['$scope', '$http', '$mdDialog', '$state', 'BaseUrl', 'localStorageService', 'alertService',
            '$timeout',
            function ($scope, $http, $mdDialog, $state, BaseUrl, localStorageService, alertService, $timeout) {
                var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
                var waitSeconds = 120;
                $scope.sendButtonText = "发送验证码";
                $scope.isCountingDown = false;
                $scope.flag = false;
                $scope.signupButtonText = "";
                $scope.loginButtonText = "";
                $scope.loginErrorText = ""
                $scope.isLogining = false;
                $scope.isSigningup = false;
                $scope.isSendingEmail = false;
                $scope.isSendingEmailHasError = false;
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
                        waitSeconds = 120;
                    } else {
                        $scope.isCountingDown = true;
                        $scope.sendButtonText = "重新发送(" + waitSeconds + ")";
                        waitSeconds--;
                        $timeout(function () {
                            time();
                        }, 1000);
                    }
                }

                document.onkeyup = function (e) {
                    if (e.keyCode == 13) {
                        $scope.login(e);
                    }
                }

                $scope.disableVerifyEmailButtonOrNot = function () {
                    return $scope.isSendingEmail || $scope.isCountingDown;
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
                    }
                    $http.post(BaseUrl + '/verify-email', body)
                        .then(function (response) {
                            $scope.isSendingEmail = false;
                            if (response.status === 200) {
                                $scope.newUser.EmailVerifyCode = body.Code;
                                time();
                            }
                        }, function (error) { // 短时间内重复发送验证码
                            if (error.status === 400) {
                                $scope.sendButtonText = error.data.Message;
                                $scope.newUser.EmailVerifyCode = error.data.Code;
                            } else {
                                $scope.isSendingEmail = false;
                                $scope.isSendingEmailHasError = true;
                            }
                        })
                };

                $scope.login = function (ev) {
                    $scope.isLogining = true;
                    $http.post(BaseUrl + '/login', $scope.user)
                        .then(function (response) {
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
                    $http.post(BaseUrl + '/signup', $scope.newUser)
                        .then(function (response) {
                            // 注册成功，直接进行登录后的流程。
                            $scope.isSigningup = false;
                            localStorageService.set('userInfo', response.data);
                            $mdDialog.hide();
                            alertService.showAlert('注册成功，已自动登录', ev);
                        }, function (error) {
                            $scope.isSigningup = false;
                            if (error.status === 400 && error.data === "邮箱已存在") {
                                $scope.newUser.Email = "邮箱已存在，请重新输入";
                                $scope.isCountingDown = false;
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
                    if (
                        ($scope.newUser.Name.length === 0 || $scope.newUser.Name.length > 5) ||
                        !reg.test($scope.newUser.Email) ||
                        ($scope.newUser.Password === "" || $scope.newUser.ConfirmPassword === "" || $scope.newUser.Password !== $scope.newUser.ConfirmPassword || $scope.newUser.Password.length < 6 || $scope.newUser.ConfirmPassword.length < 6)
                    ) {
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
            }])
        .controller('mainCtrl', ['$scope', '$state', '$http', '$rootScope', '$mdDialog', 'localStorageService', 'BaseUrl',
            'authorizationService', 'alertService',
            function ($scope, $state, $http, $rootScope, $mdDialog, localStorageService, BaseUrl, authorizationService
                , alertService) {
                $scope.loggedIn = false;
                $scope.loggedInUser = null;
                $scope.hasNewMessage = false;
                $scope.isLoadingMessageHasError = false;
                $scope.showMessageEntrance = true;
                $scope.searchKeyword = "";
                $scope.topicSearchResults = [];
                $scope.articleSearchResults = [];
                $scope.showSearchPanel = false;

                if (authorizationService.permissionModel.isPermissionLoaded) {
                    $scope.loggedIn = true;
                    updateUserLoginState();
                    loadMessages();
                    return;
                } else {
                    authorizationService.permissionCheck();
                }

                // // 检查当前是否有用户登录
                // if (localStorageService.get('userInfo')) {
                //     updateUserLoginState();
                //     loadMessages();
                // } else {
                //     $scope.loggedIn = false;
                //     $state.go('introduction');
                // }

                /** 
                 * 处理浏览器类型问题，当前只支持chrome
                 */
                function myBrowser() {
                    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
                    var isOpera = userAgent.indexOf("Opera") > -1;
                    if (isOpera) {
                        return "Opera"
                    }; //判断是否Opera浏览器
                    if (userAgent.indexOf("Firefox") > -1) {
                        return "FF";
                    } //判断是否Firefox浏览器
                    if (userAgent.indexOf("Chrome") > -1) {
                        return "Chrome";
                    }
                    if (userAgent.indexOf("Safari") > -1) {
                        return "Safari";
                    } //判断是否Safari浏览器
                    if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera) {
                        return "IE";
                    }; //判断是否IE浏览器
                }
                var mb = myBrowser();
                if ("Chrome" === mb) {
                    // alert("我是 Chrome");
                } else {
                    alert("请使用chrome浏览器访问本站");
                    window.location.href = "http://rj.baidu.com/soft/detail/14744.html?ald";
                }

                var sessionAuthef = $rootScope.$on('$ONSESSIONAUTHED', function () {
                    $scope.loggedIn = true;
                    $scope.loggedInUser = localStorageService.get('userInfo');
                });

                var sessionExpired = $rootScope.$on('$ONSESSIONEXPIRED', function () {
                    $scope.loggedIn = false;
                });

                var hideMessageEntrance = $rootScope.$on('$HIDEMESSAGEENTRANCE', function () {
                    $scope.showMessageEntrance = false;
                });

                var showMessageEntrance = $rootScope.$on('$SHOWMESSAGEENTRANCE', function () {
                    $scope.showMessageEntrance = true;
                });

                $(document).click(function (e) {
                    $scope.showSearchPanel = false;
                    $scope.searchKeyword = "";
                    $scope.$apply();
                });

                $('.search-result').click(function (e) {
                    e.stopPropagation();
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
                    $http.get(BaseUrl + '/private-message/' + $scope.loggedInUser._id)
                        .then(function (response) {
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
                    })
                        .then(function (response) {
                            $scope.loggedIn = false;
                            localStorageService.remove('userInfo');
                            localStorageService.remove('token');
                            $state.go('introduction');
                        }, function (error) {
                            $scope.loggedIn = false;
                            localStorageService.remove('userInfo');
                            localStorageService.remove('token');
                            $state.go('introduction');
                        })
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
                    })
                        .then(function (data) {
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
                    })
                        .then(function (data) {
                            updateUserLoginState();
                        }, function () {
                            // canceled mdDialog
                        });
                };

                $scope.searchKeyboard = function (ev) {
                    if (ev.keyCode === 13) {
                        if (!authorizationService.permissionModel.isPermissionLoaded) {
                            alertService.showAlert('请先登录');
                            return;
                        }
                        if ($scope.searchKeyword === '') {
                            $scope.topicSearchResults = [];
                            $scope.articleSearchResults = [];
                            return;
                        }
                        $scope.showSearchPanel = true;
                        var body = {
                            Page: 1,
                            Category: 'ALL',
                            Keyword: $scope.searchKeyword,
                            LoadAll: true
                        }
                        $http.post(BaseUrl + "/topic", body)
                            .then(function (response) {
                                $scope.topicSearchResults = response.data;
                            }, function (error) {

                            });
                        $http.post(BaseUrl + "/articles", body)
                            .then(function (response) {
                                $scope.articleSearchResults = response.data;
                            }, function (error) {

                            });
                    }
                };

                $scope.search = function () {
                    if (!authorizationService.permissionModel.isPermissionLoaded) {
                        alertService.showAlert('请先登录');
                        return;
                    }
                    if ($scope.searchKeyword === '') {
                        $scope.topicSearchResults = [];
                        $scope.articleSearchResults = [];
                        return;
                    }
                    $scope.showSearchPanel = true;
                    var body = {
                        Page: 1,
                        Category: 'ALL',
                        Keyword: $scope.searchKeyword,
                        LoadAll: true
                    }
                    $http.post(BaseUrl + "/topic", body)
                        .then(function (response) {
                            $scope.topicSearchResults = response.data;
                        }, function (error) {

                        });
                    $http.post(BaseUrl + "/articles", body)
                        .then(function (response) {
                            $scope.articleSearchResults = response.data;
                        }, function (error) {

                        });
                };

                $scope.closeSearch = function () {
                    $scope.showSearchPanel = false;
                };

                $scope.seeAllResults = function () {
                    var url = $state.href('search-results', { keyword: $scope.searchKeyword });
                    window.open(url, '_blank');
                };

                $scope.goToTopic = function (topic) {
                    var url = $state.href('topic-detail', { id: topic._id });
                    window.open(url, '_blank');
                };

                $scope.goToArticle = function (article) {
                    var url = $state.href('article-detail', { id: article._id });
                    window.open(url, '_blank');
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

                $scope.reload = function () {
                    location.reload();
                };

                $scope.$on('destroy', function () {
                    userLoggedInListener();
                    userLoggedInListener = null;
                    hideMessageEntrance();
                    hideMessageEntrance = null;
                    showMessageEntrance();
                    showMessageEntrance = null;
                });

            }])
}());