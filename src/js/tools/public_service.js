(function() {   
    'use strict';
    angular.module('The.Power.Soul.Tools', [])
    	.factory('userInfoService', function() {
    		var userInfoStorage = null;
    		return {
    			get: function() {
    				return userInfoStorage;
    			},
    			set: function(data) {
    				angular.extend(userInfoStorage, data);
    				return userInfoStorage;
    			}
    		}
    	});
}());