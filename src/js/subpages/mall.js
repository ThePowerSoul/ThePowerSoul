(function () {
    'use strict';
    angular.module('The.Power.Soul.Mall', ['ngMaterial'])
        .controller('mallCtrl', ['$scope', function ($scope) {
            $scope.goToAppleBlosom = function () {
                window.open('https://shop108569186.taobao.com/shop/view_shop.htm?spm=a313o.201708ban.favorite.d53.2ee350661KwgjM&mytmenu=mdianpu&user_number_id=152433083');
            };
        }])
}());