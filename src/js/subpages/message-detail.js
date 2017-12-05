(function() {   
    'use strict';
    angular.module('The.Power.Soul.Message.Detail', ['ngMaterial'])
        .controller('messageDetailCtrl', ['$scope', '$http', '$rootScope', '$stateParams', 'alertService', 'BaseUrl', 'localStorageService', 
        function($scope, $http, $rootScope, $stateParams, alertService, BaseUrl, localStorageService) {
            $scope.isLoading = false;
            $scope.isLoadingHasError = false;
            $scope.isPosting = false;
            $scope.isDeleting = false;
            $scope.isSettingStatusHasError = false;
            $scope.user = localStorageService.get('userInfo');
            $rootScope.$broadcast('$HIDEMESSAGEENTRANCE');
            var sender_id = $stateParams.id;
            $scope.messages = [];

            $scope.postNewMessage = function(ev) {
                $scope.isPosting = true;
                // $http.post(BaseUrl + '/private-message/' + )
            };

            $scope.deleteMessage = function(message, ev) {
                var confirm = $mdDialog.confirm()
                    .title('提示')
                    .textContent('All of the banks have agreed to forgive you your debts.')
                    .ariaLabel('Lucky day')
                    .targetEvent(ev)
                    .ok('Please do it!')
                    .cancel('Sounds like a scam');
            
                $mdDialog.show(confirm).then(function() {
                    $scope.status = 'You decided to get rid of your debt.';
                }, function() {
                    $scope.status = 'You decided to keep your debt.';
                });

                $scope.isDeleting = true;
                $http.delete(BaseUrl + '/private-message/' + $scope.user._id + '/' + message._id)
                    .then(function(response) {
                        $scope.isDeleting = false;
                        alertService.showAlert('删除私信成功', ev);
                    }, function(error) {
                        $scope.isDeleting = false;
                        alertService.showAlert('删除私信失败，请重试', ev);
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
                $http.get(BaseUrl + '/private-message/' + $scope.user._id + '/' + sender_id)
                    .then(function(response) {
                        $scope.isLoading = false;
                        $scope.messages = response.data;
                    }, function(error) {
                        $scope.isLoading = false;
                        $scope.isLoadingHasError = true;
                    });
            }

            setReadStatus().then(getConversation());
    	}])
}());