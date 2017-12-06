(function () {
    'use strict';

    var subModules = ['The.Power.Soul.Introduction', 'The.Power.Soul.BBS', 'The.Power.Soul.Caculator', 'The.Power.Soul.Tools', 'The.Power.Soul.Topic.Detail', 'The.Power.Soul.NewArticle', 'The.Power.Soul.UserDetail', 'The.Power.Soul.Mall', 'The.Power.Soul.Search.For.Users', 'The.Power.Soul.Article.List', 'The.Power.Soul.Article.Detail', 'The.Power.Soul.Fav.List', 'The.Power.Soul.Message.Detail', 'The.Power.Soul.All.Messages', 'LocalStorageModule'];
    angular.module('The.Power.Soul', ['ngMaterial', 'ui.router'].concat(subModules)).constant('BaseUrl', "http://localhost:3030").config(function (localStorageServiceProvider) {
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
            url: '/new-article/{id}',
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
        }).state('article-list', {
            url: '/article-list',
            templateUrl: 'dist/pages/article-list.html',
            controller: 'articleListCtrl'
        }).state('article-detail', {
            url: '/article-detail/{id}',
            templateUrl: 'dist/pages/article-detail.html',
            controller: 'articleDetailCtrl'
        }).state('fav-list', {
            url: '/fav-list',
            templateUrl: 'dist/pages/fav-list.html',
            controller: 'favListCtrl'
        }).state('message-detail', {
            url: '/message-detail/{id}',
            templateUrl: 'dist/pages/message-detail.html',
            controller: 'messageDetailCtrl'
        }).state('all-messages', {
            url: '/all-messages/{id}',
            templateUrl: 'dist/pages/all-messages.html',
            controller: 'allMessagesCtrl'
        });
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
                $state.go('bbs');
                // location.reload();
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
                $mdDialog.cancel();
            }
        };
    }]).controller('mainCtrl', ['$scope', '$state', '$http', '$rootScope', '$mdDialog', 'localStorageService', 'BaseUrl', function ($scope, $state, $http, $rootScope, $mdDialog, localStorageService, BaseUrl) {
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
            $scope.loggedIn = false;
            localStorageService.remove('userInfo');
            $state.go('bbs');
            // location.reload();
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

        $scope.goToCaculator = function () {
            $state.go('caculator');
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
	}]).controller('addNewArticleCtrl', ['$scope', '$http', '$mdToast', '$state', 'BaseUrl', 'localStorageService', 'categoryItems', '$stateParams', function ($scope, $http, $mdToast, $state, BaseUrl, localStorageService, categoryItems, $stateParams) {
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
			$http.put(BaseUrl + '/article-draft/' + article_id, $scope.article).then(function (response) {
				alertSuccessMsg('保存草稿成功');
			}, function (error) {});
		}

		// 等待添加定时保存草稿的代码
		function autoSendSaveRequest() {}

		function alertSuccessMsg(content) {
			$mdToast.show($mdToast.simple().textContent(content).highlightClass('md-primary').position('top right'));
		}

		function loadArticleDraft() {
			$http.get(BaseUrl + '/article-draft/' + article_id).then(function (response) {
				$scope.isLoading = false;
				$scope.article = response.data;
			}, function (error) {
				$scope.isLoading = false;
				$scope.isLoadingHasError = true;
			});
		}
		loadArticleDraft();
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
        $scope.article = {};
        $scope.comments = [];
        $scope.newComment = "";
        $scope.isChangingLikeStauts = false;
        var user = localStorageService.get('userInfo');
        var article_id = $stateParams.id;

        $scope.goAddArticleToFav = function (ev) {
            $http.put(BaseUrl + '/user-article-fav/' + user._id + '/' + $scope.article._id).then(function (response) {
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
                $scope.comments.push(response.data);
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
            $http.put(BaseUrl + '/article/' + user._id + '/' + $scope.article._id).then(function (response) {
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

        function getComments() {
            $scope.isLoadingComments = true;
            $http.get(BaseUrl + '/comment/' + article_id).then(function (response) {
                $scope.isLoadingComments = false;
                $scope.comments = response.data;
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
        getArticle().then(getComments());
    }]);
})();
(function () {
    'use strict';

    angular.module('The.Power.Soul.Article.List', ['ngMaterial']).controller('articleListCtrl', ['$scope', '$http', '$state', 'BaseUrl', 'localStorageService', 'alertService', function ($scope, $http, $state, BaseUrl, localStorageService, alertService) {
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

        // 生成新草稿，内容为正文内容，成功后删除正文内容
        $scope.editArticle = function (article, ev) {
            $http.post(BaseUrl + '/article-draft/' + $scope.user._id, article).then(function (response) {
                removeFromArticleList(article, response.data, ev);
            }, function (error) {
                alertService.showAlert('生成编辑内容失败，请重试', ev);
            });
        };

        function removeFromArticleList(article, data, ev) {
            $http.delete(BaseUrl + '/article/' + article._id).then(function (response) {
                $state.go('new-article', { id: data._id });
            }, function (error) {
                alertService.showAlert('清除文章失败', ev);
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

	angular.module('The.Power.Soul.BBS', ['ngMaterial', 'The.Power.Soul.Tools', 'ngResource']).constant('selectorItems', [{
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
	}]).controller('addNewTopicCtrl', ['$scope', '$mdDialog', 'categoryItems', function ($scope, $mdDialog, categoryItems) {
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
		$scope.selectedItem = "STRENGTH";
		$scope.selectorItems = selectorItems;
		$scope.searchContext = "";
		$rootScope.$broadcast('$SHOWMESSAGEENTRANCE');
		$scope.isLoadingTopic = false;
		$scope.isSubmittingTopic = false;
		$scope.isChangingCategory = false;
		$scope.isLoadingTopicHasError = false;

		var user = localStorageService.get('userInfo');

		$scope.listMyFollowing = function (ev) {};

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

    angular.module('The.Power.Soul.Fav.List', ['ngMaterial']).controller('favListCtrl', ['$scope', '$http', 'localStorageService', 'BaseUrl', function ($scope, $http, localStorageService, BaseUrl) {
        $scope.isLoading = false;
        $scope.isLoadingHasError = false;
        $scope.isLoadingArticlesHasError = false;
        $scope.isLoadingArticles = false;
        $scope.favTopics = [];
        $scope.favArticles = [];
        var user = localStorageService.get('userInfo');

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

    angular.module('The.Power.Soul.Mall', ['ngMaterial']).controller('mallCtrl', ['$scope', function ($scope) {}]);
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
        $rootScope.$broadcast('$HIDEMESSAGEENTRANCE');
        var sender_id = $stateParams.id;
        var targetUser = null;
        $scope.messages = [];

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

        function setReadStatus() {
            return $http.put(BaseUrl + '/private-message/' + $scope.user._id + '/' + sender_id).then(function (response) {}, function (error) {
                $scope.isSettingStatusHasError = true;
            });
        }

        function getConversation() {
            $scope.isLoading = true;
            return $http.get(BaseUrl + '/private-message/' + $scope.user._id + '/' + sender_id).then(function (response) {
                $scope.isLoading = false;
                $scope.messages = response.data;
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

        setReadStatus().then(getConversation().then(getTargetUserName()));
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

	angular.module('The.Power.Soul.Topic.Detail', ['ngMaterial']).controller('addNewCommentCtrl', ['$scope', '$mdDialog', function ($scope, $mdDialog) {
		$scope.comment = "";
		$scope.submit = function () {
			$mdDialog.hide($scope.comment);
		};
		$scope.closeDialog = function () {
			$mdDialog.cancel();
		};
	}]).controller('seeCommentConversationCtrl', ['$scope', '$mdDialog', 'Comment', 'BaseUrl', 'alertService', '$http', function ($scope, $mdDialog, Comment, BaseUrl, alertService, $http) {
		$scope.isLoading = false;
		$scope.isLoadingHasError = false;
		$scope.commentList = [];
		$http.get(BaseUrl + '/comment/' + Comment.UserID + '/' + Comment.TargetUserID + '/' + Comment.TargetContextID).then(function (response) {
			$scope.isLoading = false;
			$scope.commentList = response.data;
		}, function (error) {
			$scope.isLoading = false;
			$scope.isLoadingHasError = false;
		});
		$scope.closeDialog = function () {
			$mdDialog.cancel();
		};
	}]).controller('topicDetailCtrl', ['$scope', '$stateParams', '$mdDialog', '$http', 'BaseUrl', 'localStorageService', 'alertService', function ($scope, $stateParams, $mdDialog, $http, BaseUrl, localStorageService, alertService) {
		$scope.user = localStorageService.get('userInfo');
		var topic_id = $stateParams.id;

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
		$scope.commentList = [];
		$scope.newCommentContent = "";

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
				$scope.commentList.push(response.data);
				$scope.isPostingNewComment = false;
			}, function (error) {
				$scope.isPostingNewComment = false;
				alertService.showAlert('发布评论失败，请重试', ev);
			});
		};

		/*
  	评论帖子
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

		$scope.changeExpandState = function () {
			$scope.topic.Expand = !$scope.topic.Expand;
		};

		$scope.loadMore = function () {
			loadTopicComments();
		};

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

		function loadTopicDetail() {
			$scope.isLoading = true;
			return $http.get(BaseUrl + '/topic/' + $scope.user._id + '/' + topic_id).then(function (response) {
				$scope.isLoading = false;
				angular.extend($scope.topic, response.data);
			}, function (error) {
				$scope.isLoading = false;
				$scope.isLoadingHasError = true;
			});
		}

		function loadTopicComments(loadMoreSignal) {
			$scope.isLoadingComments = true;
			$http.get(BaseUrl + '/comment/' + topic_id).then(function (response) {
				$scope.isLoadingComments = false;
				if (loadMoreSignal === 'load-more') {} else {
					$scope.commentList = response.data;
				}
			}, function (error) {
				$scope.isLoadingComments = false;
				$scope.isLoadingCommentsHasError = true;
			});
		}

		loadTopicDetail().then(loadTopicComments());
	}]);
})();
(function () {
    'use strict';

    angular.module('The.Power.Soul.UserDetail', ['ngMaterial']).controller('userDetailCtrl', ['$scope', '$http', '$stateParams', 'localStorageService', 'BaseUrl', 'alertService', function ($scope, $http, $stateParams, localStorageService, BaseUrl, alertService) {
        $scope.isLoading = false;
        $scope.isLoadingHasError = false;
        $scope.user = null;
        $scope.showActionButton = false;
        $scope.isFollowing = false;
        $scope.followButtonText = "";
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
                $scope.isFollowing = response.data.IsFollowing;
                $scope.followButtonText = $scope.isFollowing ? "取消关注" : '关注';
                $scope.user = response.data.Data;
                $scope.isLoading = false;
            }, function (error) {
                $scope.isLoading = false;
                $scope.isLoadingHasError = true;
            });
        }

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
    }]).service('alertService', ['$mdDialog', function ($mdDialog) {
        return {
            showAlert: function (text, ev) {
                $mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).title('提示').textContent(text).ariaLabel('Alert Dialog Demo').ok('好的').targetEvent(ev));
            }
        };
    }]);
})();