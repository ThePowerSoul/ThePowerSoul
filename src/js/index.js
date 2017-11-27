(function() {   
    'use strict';
    var subModules = [
    	'The.Power.Soul.Introduction',
    	'The.Power.Soul.BBS', 
    	'The.Power.Soul.Caculator',
        'The.Power.Soul.Tools',
        'The.Power.Soul.Topic.Detail',
        'The.Power.Soul.NewArticle',
        'The.Power.Soul.UserDetail',
        'The.Power.Soul.Mall',
        'The.Power.Soul.Search.For.Users',
        'The.Power.Soul.Article.List',
        'LocalStorageModule'
    ];
    angular.module('The.Power.Soul', ['ngMaterial', 'ui.router'].concat(subModules))
        .constant('BaseUrl', "http://localhost:3030")
        .config(function (localStorageServiceProvider) {
            localStorageServiceProvider
            .setPrefix('thepowersoul');
        })
    	.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	        $urlRouterProvider.when('', 'introduction');
	        $stateProvider
	            .state('introduction', {
	                url: '/introduction',
	                templateUrl: 'dist/pages/introduction.html',
	                controller: 'introductionCtrl',
	            })
	            .state('caculator', {
	                url: '/caculator',
	                templateUrl: 'dist/pages/caculator.html',
	                controller: 'caculatorCtrl',
	            })
	            .state('bbs', {
	                url: '/bbs',
	                templateUrl: 'dist/pages/bbs.html',
	                controller: 'bbsCtrl',
	            })
                .state('topic-detail', {
                    url: '/topic-detail/{id}',
                    templateUrl: 'dist/pages/topic-detail.html',
                    controller: 'topicDetailCtrl',
                })
                .state('new-article', {
                    url: '/new-article/{id}',
                    templateUrl: 'dist/pages/add-new-article.html',
                    controller: 'addNewArticleCtrl',
                })
                .state('user-detail', {
                    url: '/user-detail/{id}',
                    templateUrl: 'dist/pages/user-detail.html',
                    controller: 'userDetailCtrl',
                })
                .state('mall', {
                    url: '/mall',
                    templateUrl: 'dist/pages/mall.html',
                    controller: 'mallCtrl',
                })
                .state('article-list', {
                    url: '/article-list',
                    templateUrl: 'dist/pages/article-list.html',
                    controller: 'articleListCtrl',
                });
	    }])
        .controller('loginOrSignupCtrl', ['$scope', '$http', '$mdDialog', '$state', 'BaseUrl', 'localStorageService', 'alertService',
        function($scope, $http, $mdDialog, $state, BaseUrl, localStorageService, alertService) {
            var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/; 
            $scope.flag = true;
            $scope.signupButtonText = "";
            $scope.loginButtonText = "";
            $scope.isLogining = false;
            $scope.isSigningup = false;
            $scope.loginErrorText = ""
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

            $scope.changePanel = function(signal) {
                if (signal === "signup") {
                    $scope.flag = true;
                } else if(signal === "login") {
                    $scope.flag = false;
                }
            };  

            $scope.login = function(ev) {
                $scope.isLogining = true;
                $http.post(BaseUrl + '/login', $scope.user)
                    .then(function(response) {
                        $scope.isLogining = false;
                        localStorageService.set('userInfo', response.data);
                        $mdDialog.hide();
                        alertService.showAlert('登录成功', ev);
                    }, function(error) {
                        $scope.isLogining = false;
                        if (error.status === 400) {
                            $scope.loginErrorText = error.data;
                        } else {
                            alertService.showAlert('登录失败，请重试', ev);
                        }
                    });
            };

            $scope.signup = function(ev) {
                $scope.isSigningup = true;
                $http.post(BaseUrl + '/signup', $scope.newUser)
                    .then(function(response) {
                        // 注册成功，直接进行登录后的流程。
                        $scope.isSigningup = false;
                        localStorageService.set('userInfo', response.data);
                        $mdDialog.hide();
                        alertService.showAlert('注册成功，已自动登录', ev);
                    }, function(error) {
                        $scope.isSigningup = false;
                        if (error.status === 400 && error.data === "邮箱已存在") {
                            $scope.newUser.Email = "邮箱已存在，请重新输入";
                        } else if (error.status === 400 && error.data === "显示名已被占用"){
                            $scope.newUser.DisplayName = "显示名已被占用，请重新输入";
                        } else {
                            alertService.showAlert('注册发生错误，请重试', ev);
                        }
                    });
            };

            $scope.disableSignupButtonOrNot = function() {
                if ( 
                    ($scope.newUser.Name.length === 0 || $scope.newUser.Name.length > 5) || 
                    !reg.test($scope.newUser.Email) || 
                    ($scope.newUser.Password === ""  || $scope.newUser.ConfirmPassword === "" || $scope.newUser.Password !== $scope.newUser.ConfirmPassword || $scope.newUser.Password.length < 6 || $scope.newUser.ConfirmPassword.length < 6)
                 ) {
                    $scope.signupButtonText = "请输入正确的注册信息";
                    return true;
                } else {
                    $scope.signupButtonText = "注册";
                    return false;
                }
            };

            $scope.disableLoginButtonOrNot = function() {
                if ($scope.user.Email === "" || $scope.user.Password === "" || !reg.test($scope.user.Email) || $scope.user.Password.length < 6 || !reg.test($scope.user.Email)) {
                    $scope.loginButtonText = "请输入正确的邮箱和密码";
                    return true;
                } else {
                    $scope.loginButtonText = "登录";
                    return false;
                }
            };  

            $scope.closeDialog = function(ev) {
                if ($scope.isLogining || $scope.isSigningup) {
                    alertService.showAlert('正在进行操作，请勿关闭弹窗', ev);
                } else {
                    $mdDialog.cancel();
                }
            };
        }])
    	.controller('mainCtrl', ['$scope', '$state', '$http', '$rootScope', '$mdDialog', 'localStorageService',
    		function($scope, $state, $http, $rootScope, $mdDialog, localStorageService) {
                $scope.loggedIn = false;                
                // localstorage check
                if (localStorageService.get('userInfo')) {
                    updateUserLoginState();
                }

                $rootScope.$on('$USERLOGGEDIN', function() {
                    updateUserLoginState();
                });
                
                // 登录或注册成功，更新页面状态
                function updateUserLoginState() {
                    $scope.loggedIn = true;
                    $scope.loggedInUser = localStorageService.get('userInfo');
                }

                $scope.logOut = function() {
                    $scope.loggedIn = false;
                    localStorageService.remove('userInfo');
                    $state.go('bbs');
                };

                $scope.searchForUsers = function(ev) {
                    $mdDialog.show({ 
                        controller: 'searchForUsersCtrl',
                        templateUrl: 'dist/pages/search-for-users.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: false,
                        fullscreen: false
                    })
                    .then(function(data) {
                        updateUserLoginState();
                    }, function(){
                        // canceled mdDialog
                    });
                };

                $scope.listArticles = function() {
                    $state.go('article-list');
                };

                $scope.goToUserDetail = function() {
                    $state.go('user-detail', {id: $scope.loggedInUser._id});
                };

                $scope.openLoginOrSignupPanel = function(ev) {
                    $mdDialog.show({ 
                        controller: 'loginOrSignupCtrl',
                        templateUrl: 'dist/pages/login-and-signup.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: false,
                        fullscreen: false
                    })
                    .then(function(data) {
                        updateUserLoginState();
                    }, function(){
                        // canceled mdDialog
                    });
                };

    			$scope.goToIntroduction = function() {
    				$state.go('introduction');
    			};

    			$scope.goToCaculator = function() {
    				$state.go('caculator');
    			};

    			$scope.goToBBS = function() {
    				$state.go('bbs');
                };
                
                $scope.goToMall = function() {
                    $state.go('mall');
                };  
    	}])
}());