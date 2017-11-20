(function() {   
    'use strict';
    angular.module('The.Power.Soul.Tools', [])
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