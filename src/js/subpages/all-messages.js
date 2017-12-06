(function() {   
    'use strict';
    angular.module('The.Power.Soul.All.Messages', ['ngMaterial'])
        .controller('allMessagesCtrl', ['$scope', '$stateParams', '$http', '$state', '$mdDialog', 'BaseUrl',
        'alertService',
        function($scope, $stateParams, $http, $state, $mdDialog, BaseUrl, alertService) {
            var user_id = $stateParams.id;
            $scope.messages = [];

            $scope.postNewMessage = function(ev) {
                $mdDialog.show({ 
                    controller: 'sendNewPrivateMessageCtrl',
                    templateUrl: 'dist/pages/send-private-message.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: false,
                    fullscreen: false
                })
                .then(function(data) {
                    
                }, function(){
                    // canceled mdDialog
                });
            };  

            $scope.deleteWholeConversation = function(message, ev) {
                var target_user_id = "";
                if (message.SenderID === user_id) {
                    target_user_id = message.TargetID;
                } else if (message.TargetID === user_id) {
                    target_user_id = message.SenderID;
                }
                var confirm = $mdDialog.confirm()
                    .title('提示')
                    .textContent('确定删除和这位用户的全部私信？')
                    .ariaLabel('')
                    .targetEvent(ev)
                    .ok('确定')
                    .cancel('取消');
            
                $mdDialog.show(confirm).then(function() {
                    $scope.isDeleting = true;
                    $http.put(BaseUrl + '/delete-conversation/' + user_id + '/' + target_user_id)
                        .then(function(response) {
                            location.reload();
                        }, function(error) {
                            alertService.showAlert('删除对话失败，请重试', ev);
                        });
                }, function() {
                    // canceled
                });
            };

            $scope.checkConversation = function(message) {
                if (message.SenderID === user_id) {
                    $state.go('message-detail', {id: message.TargetID});
                } else if (message.TargetID === user_id) {
                    $state.go('message-detail', {id: message.SenderID});
                }
            };

            function init() {
                $scope.isLoading = true;
                $http.get(BaseUrl + '/user/' + user_id)
                    .then(function(response) {
                        $scope.isLoading = false;
                        $scope.messages = response.data.MostRecentConversation;
                    }, function(error) {
                        $scope.isLoadingHasError = true;
                        $scope.isLoading = false;
                    });
            }
            init();
    	}])
}());