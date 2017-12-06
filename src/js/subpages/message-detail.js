(function() {   
    'use strict';
    angular.module('The.Power.Soul.Message.Detail', ['ngMaterial'])
        .controller('messageDetailCtrl', ['$scope', '$http', '$rootScope', '$stateParams', '$mdDialog', 'alertService', 'BaseUrl', 'localStorageService', 
        function($scope, $http, $rootScope, $stateParams, $mdDialog, alertService, BaseUrl, localStorageService) {
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

            $scope.postNewMessage = function(ev) {
                $scope.isPosting = true;
                var body = {
                    Content: $scope.newMessageContent,
                    UserName: $scope.user.DisplayName,
                    TargetUserName: targetUser.DisplayName
                }
                $http.post(BaseUrl + '/private-message/' + $scope.user._id + '/' + sender_id, body)
                    .then(function(response) {
                        $scope.isPosting = false;
                        alertService.showAlert('发送私信成功', ev);
                        $scope.newMessageContent = "";
                        location.reload();
                    }, function(error) {
                        $scope.isPosting = false;
                        alertService.showAlert('发送私信失败，请重试', ev);
                    });
            };

            $scope.showMessageOrNot = function(message) {
                if (message.UserID === $scope.user._id) {
                    return message.UserDelStatus;
                } else if (message.TargetUserID === $scope.user._id) {
                    return message.TargetUserDelStatus;
                }
            };

            $scope.deleteMessage = function(message, ev) {
                var confirm = $mdDialog.confirm()
                    .title('提示')
                    .textContent('确定删除这条私信？')
                    .ariaLabel('')
                    .targetEvent(ev)
                    .ok('确定')
                    .cancel('取消');
            
                $mdDialog.show(confirm).then(function() {
                    $scope.isDeleting = true;
                    $http.delete(BaseUrl + '/private-message/' + $scope.user._id + '/' + message._id)
                        .then(function(response) {
                            $scope.isDeleting = false;
                            $scope.messages.splice($scope.messages.indexOf(message), 1);
                            alertService.showAlert('删除私信成功', ev);
                        }, function(error) {
                            $scope.isDeleting = false;
                            alertService.showAlert('删除私信失败，请重试', ev);
                        });
                }, function() {
                    // canceled
                });                
            };

            function setReadStatus() {
                return $http.put(BaseUrl + '/private-message/' + $scope.user._id + '/' + sender_id)
                    .then(function(response) {

                    }, function(error) {
                        $scope.isSettingStatusHasError = true;
                    });
            }

            function getConversation() {
                $scope.isLoading = true;
                return $http.get(BaseUrl + '/private-message/' + $scope.user._id + '/' + sender_id)
                    .then(function(response) {
                        $scope.isLoading = false;
                        $scope.messages = response.data;
                    }, function(error) {
                        $scope.isLoading = false;
                        $scope.isLoadingHasError = true;
                    });
            }

            function getTargetUserName() {
                $http.get(BaseUrl + '/user/' + sender_id)
                    .then(function(response) {
                        targetUser = response.data;
                    }, function(error) {
                        // 加载用户信息失败
                    });
            } 

            setReadStatus()
                .then(getConversation()
                    .then(getTargetUserName()));
    	}])
}());