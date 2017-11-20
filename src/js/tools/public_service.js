(function() {   
    'use strict';
    angular.module('The.Power.Soul.Tools', [])
    	.factory('userInfoService', function() {
    		var userInfoStorage = {};
    		return {
    			get: function() {
    				return userInfoStorage;
    			},
    			set: function(data) {
    				angular.extend(userInfoStorage, data);
    				return userInfoStorage;
    			}
    		}
    	})
            .service('alertService', ['$mdDialog', function($mdDialog) {
                return {
                        showAlert: function(text, ev) {
                        $mdDialog.show(
                                $mdDialog.alert()
                                            .parent(angular.element(document.querySelector('#popupContainer')))
                                            .clickOutsideToClose(true)
                                            .title('提示')
                                            .textContent(text)
                                            .ariaLabel('Alert Dialog Demo')
                                            .ok('好的')
                                            .targetEvent(ev)
                    );
                }
            }
        }])
}());