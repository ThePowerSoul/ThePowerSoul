(function() {   
    'use strict';
    angular.module('The.Power.Soul.Tools', [])
        .constant('categoryItems', [
    		{
				Title: "力量训练",
				Value: "STRENGTH"
			},
			{
				Title: "瑜伽训练",
				Value: "YOGA"
			},
			{
				Title: "形体训练",
				Value: "FITNESS"
			},
			{
				Title: "跑步训练",
				Value: "RUNNING"
			}
		])
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
                        .targetEvent()
                );
            }
        }
    }])
}());