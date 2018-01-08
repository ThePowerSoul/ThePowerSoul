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
                var user_id = $stateParams.id;
                var accessid = 'LTAILjmmB1fnhHlx';
                var host = "http://thepowersoul2018.oss-cn-qingdao-internal.aliyuncs.com";
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
                
                if (loggedUser._id === user_id) { // 进入当前页面的是登录用户本人
                    $scope.user = loggedUser;
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
                            'key': loggedUser._id + '${filename}',
                            'policy': data.PolicyText,
                            'OSSAccessKeyId': accessid,
                            'success_action_status': '200', //让服务端返回200，不然，默认会返回204
                            'signature': data.Signature,
                        }
                    });
                    up.start();
                    $scope.showProgress = true;
                }

                function saveImgSrcToUserProfile(src) {
                    var body = {
                        Src: src
                    }
                    $http.put(BaseUrl + '/user-update-picture/' + loggedUser._id, body)
                        .then(function (response) {
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
                            // 上传初始化操作
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
                                $http.get(BaseUrl + '/get-upload-policy')
                                    .then(function (response) {
                                        set_upload_param(uploader, response.data);
                                    }, function (error) {

                                    });
                            }
                        },
                        BeforeUpload: function (up, file) {
                            // 上传之前的操作
                        },
                        UploadProgress: function (up, file) {
                            $scope.progressBarProgress = file.percent;
                        },
                        FileUploaded: function (up, file, info) {
                            if (info.status == 200) {
                                var body = {
                                    Key: loggedUser._id + file.name
                                }
                                $http.put(BaseUrl + '/set-picture-public', body)
                                    .then(function (response) {
                                        $scope.profilePictureSrc = response.data.Src;
                                        saveImgSrcToUserProfile(response.data.Src);
                                    }, function (error) {
                                        alertService.showAlert('更换头像失败，请重试');
                                    });
                            }
                            else {
                                // 上传失败
                                alertService.showAlert('更换头像失败，请重试');
                            }
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