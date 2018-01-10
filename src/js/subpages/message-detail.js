(function () {
    'use strict';
    angular.module('The.Power.Soul.Message.Detail', ['ngMaterial'])
        .controller('messageDetailCtrl', ['$scope', '$http', '$rootScope', '$stateParams', '$mdDialog', 'alertService', 'BaseUrl', 'localStorageService',
            function ($scope, $http, $rootScope, $stateParams, $mdDialog, alertService, BaseUrl, localStorageService) {
                $scope.isLoading = false;
                $scope.isOperating = false;
                $scope.isSettingStatusHasError = false;
                $scope.newMessageContent = "";
                $scope.user = localStorageService.get('userInfo');
                $scope.disableLoadingMore = false;
                $scope.messages = [];
                $rootScope.$broadcast('$HIDEMESSAGEENTRANCE');
                var sender_id = $stateParams.id;
                var targetUser = null;
                var pageNum = 1;

                $scope.postNewMessage = function (ev) {
                    $scope.isOperating = true;
                    var body = {
                        Content: $scope.newMessageContent,
                        UserName: $scope.user.DisplayName,
                        TargetUserName: targetUser.DisplayName
                    }
                    $http.post(BaseUrl + '/private-message/' + $scope.user._id + '/' + sender_id, body)
                        .then(function (response) {
                            $scope.isOperating = false;
                            alertService.showAlert('发送私信成功', ev);
                            $scope.newMessageContent = "";
                            location.reload();
                        }, function (error) {
                            $scope.isOperating = false;
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
                    var confirm = $mdDialog.confirm()
                        .title('提示')
                        .textContent('确定删除这条私信？')
                        .ariaLabel('')
                        .targetEvent(ev)
                        .ok('确定')
                        .cancel('取消');

                    $mdDialog.show(confirm).then(function () {
                        $scope.isOperating = true;
                        $http.delete(BaseUrl + '/private-message/' + $scope.user._id + '/' + message._id)
                            .then(function (response) {
                                $scope.isOperating = false;
                                $scope.messages.splice($scope.messages.indexOf(message), 1);
                                alertService.showAlert('删除私信成功', ev);
                            }, function (error) {
                                $scope.isOperating = false;
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
                    return $http.put(BaseUrl + '/private-message/' + $scope.user._id + '/' + sender_id)
                        .then(function (response) {

                        }, function (error) {
                            $scope.isSettingStatusHasError = true;
                        });
                }

                function getConversation(pageNum, isLoadingMore) {
                    var body = {
                        PageNum: pageNum
                    }
                    $scope.isLoading = true;
                    return $http.post(BaseUrl + '/private-messages/' + $scope.user._id + '/' + sender_id, body)
                        .then(function (response) {
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
                            alertService.showAlert('加载失败，请刷新重试');
                        });
                }

                function getTargetUserName() {
                    $http.get(BaseUrl + '/user/' + sender_id)
                        .then(function (response) {
                            targetUser = response.data;
                        }, function (error) {
                            // 加载用户信息失败
                        });
                }

                setReadStatus()
                    .then(getConversation(1, false)
                        .then(getTargetUserName()));
            }])
}());