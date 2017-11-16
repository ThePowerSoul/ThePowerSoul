(function () {
    'use strict';

    var subModules = ['The.Power.Soul.Introduction', 'The.Power.Soul.BBS', 'The.Power.Soul.Caculator', 'The.Power.Soul.Tools'];
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
        });
    }]).controller('mainCtrl', ['$scope', '$state', function ($scope, $state) {
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

    angular.module('The.Power.Soul.Tools', []).factory('userInfoService', function () {
        var userInfoStorage = null;
        return {
            get: function () {
                return userInfoStorage;
            },
            set: function (data) {
                angular.extend(userInfoStorage, data);
                return userInfoStorage;
            }
        };
    });
})();
(function () {
	'use strict';

	angular.module('The.Power.Soul.BBS', ['ngMaterial', 'The.Power.Soul.Tools']).controller('bbsCtrl', ['$scope', '$mdDialog', 'userInfoService', function ($scope, $mdDialog, userInfoService) {
		$scope.customFullscreen = false;
		$scope.addNewTopic = function (ev) {
			if (userInfoService.get()) {
				// ... 
			} else {
				$mdDialog.show({
					controller: DialogController,
					templateUrl: 'dist/pages/loginAndSignup.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose: true,
					fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
				});
			}
		};

		function DialogController($scope, $mdDialog) {
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
		}
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