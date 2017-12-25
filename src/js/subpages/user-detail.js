(function () {
    'use strict';
    angular.module('The.Power.Soul.UserDetail', ['ngMaterial'])
        .controller('sendSpecificMessageCtrl', ['$scope', '$mdDialog', '$http', 'targetUser', 'user', 'BaseUrl', 'alertService',
            function ($scope, $mdDialog, $http, targetUser, user, BaseUrl, alertService) {
                $scope.targetUserInfo = null;
                $scope.newMessage = "";
                var user = user;
                $scope.targetUserInfo = targetUser;

                $scope.submit = function (ev) {
                    var body = {
                        Content: $scope.newMessage,
                        UserName: user.DisplayName,
                        TargetUserName: $scope.targetUserInfo.DisplayName
                    }
                    $http.post(BaseUrl + '/private-message/' + user._id + '/' + $scope.targetUserInfo._id, body)
                        .then(function (data) {
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

            }])

        .controller('userDetailCtrl', ['$scope', '$http', '$stateParams', 'localStorageService', 'BaseUrl', 'alertService', '$mdDialog',
            function ($scope, $http, $stateParams, localStorageService, BaseUrl, alertService, $mdDialog) {
                $scope.isLoading = false;
                $scope.isLoadingHasError = false;
                $scope.user = null;
                $scope.showActionButton = false;
                $scope.isFollowing = false;
                $scope.followButtonText = "";
                $scope.profilePictureSrc = "";
                var user_id = $stateParams.id;
                var accessid = 'LTAILjmmB1fnhHlx';
                var host = "http://thepowersoul2018.oss-cn-qingdao.aliyuncs.com";
                var loggedUser = localStorageService.get('userInfo');
                if (loggedUser._id === user_id) { // 进入当前页面的是登录用户本人
                    $scope.user = localStorageService.get('userInfo');
                } else { // 查看其它人的页面
                    $scope.isLoading = true;
                    $http.get(BaseUrl + '/user-detail/' + loggedUser._id + '/' + user_id)
                        .then(function (response) {
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
                            'key': '${filename}',
                            'policy': data.PolicyText,
                            'OSSAccessKeyId': accessid,
                            'success_action_status': '200', //让服务端返回200，不然，默认会返回204
                            'signature': data.Signature,
                        }
                    });
                    up.start();
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
                            $http.get(BaseUrl + '/get-upload-policy')
                                .then(function (response) {
                                    set_upload_param(uploader, response.data);
                                }, function (error) {

                                });
                        },
                        BeforeUpload: function (up, file) {

                        },

                        UploadProgress: function (up, file) {

                        },

                        FileUploaded: function (up, file, info) {
                            if (info.status == 200) {
                                var body = {
                                    Key: file.name
                                }
                                $http.put(BaseUrl + '/set-picture-public', body)
                                    .then(function (response) {
                                        $scope.profilePictureSrc = response.data.Src;
                                    }, function (error) {
                                        alertService.showAlert('获取头像失败，请联系管理员');
                                    });
                            }
                            else {
                            }
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
                    })
                        .then(function (data) {

                        }, function () {
                            // canceled mdDialog
                        });
                };

                $scope.followOperation = function (ev) {
                    $scope.isOperating = true;
                    if ($scope.isFollowing) {
                        $http.put(BaseUrl + '/user-unfollow/' + loggedUser._id + '/' + user_id)
                            .then(function (response) {
                                $scope.followButtonText = "关注";
                                $scope.isOperating = false;
                                $scope.isFollowing = false;
                            }, function (error) {
                                alertService.showAlert('取消关注失败', ev);
                                $scope.isOperating = false;
                            });
                    } else {
                        $http.put(BaseUrl + '/user-follow/' + loggedUser._id + '/' + user_id)
                            .then(function (response) {
                                $scope.followButtonText = "取消关注";
                                $scope.isOperating = false;
                                $scope.isFollowing = true;
                            }, function (error) {
                                alertService.showAlert('关注失败', ev);
                                $scope.isOperating = false;
                            });
                    }
                };
            }])
}());