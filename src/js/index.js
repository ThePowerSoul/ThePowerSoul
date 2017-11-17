(function() {   
    'use strict';
    var subModules = [
    	'The.Power.Soul.Introduction',
    	'The.Power.Soul.BBS', 
    	'The.Power.Soul.Caculator',
        'The.Power.Soul.Tools',
        'The.Power.Soul.Topic.Detail'
    ];
    angular.module('The.Power.Soul', ['ngMaterial', 'ui.router'].concat(subModules))
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
                    templateUrl: 'dist/pages/topicDetail.html',
                    controller: 'topicDetailCtrl',
                });
	    }])
        .controller('loginOrSignupCtrl', ['$scope', '$mdDialog', function($scope, $mdDialog) {
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

            $scope.changePanel = function(signal) {
                if (signal === "signup") {
                    $scope.flag = true;
                } else if(signal === "login") {
                    $scope.flag = false;
                }
            };  

            $scope.login = function() {
                $mdDialog.hide();
            };

            $scope.signup = function() {
                $mdDialog.hide();
            };

            $scope.disableSignupButtonOrNot = function() {
                if ($scope.newUser.Name === "" || $scope.newUser.DisplayName === "" ||
                    $scope.newUser.Email === "" || $scope.newUser.Password === "" || 
                    $scope.newUser.ConfirmPassword === "") {
                    $scope.signupButtonText = "请输入正确的注册信息";
                    return true;
                } else {
                    $scope.signupButtonText = "注册";
                    return false;
                }
            };

            $scope.disableLoginButtonOrNot = function() {
                if ($scope.user.Email === "" || $scope.user.Password === "") {
                    $scope.loginButtonText = "请输入正确的邮箱和密码";
                    return true;
                } else {
                    $scope.loginButtonText = "登录";
                    return false;
                }
            };  
        }])
    	.controller('mainCtrl', ['$scope', '$state', 'userInfoService', '$mdDialog',
    		function($scope, $state, userInfoService, $mdDialog) {
                $scope.loggedIn = false;
                if (userInfoService.get()) {
                    $scope.loggedIn = true;
                }

                $scope.openLoginOrSignupPanel = function(ev) {
                    $mdDialog.show({ 
                        controller: 'loginOrSignupCtrl',
                        templateUrl: 'dist/pages/loginAndSignup.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose:true,
                        fullscreen: $scope.customFullscreen// Only for -xs, -sm breakpoints.
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
    	}])
}());