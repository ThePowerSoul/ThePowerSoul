(function() {   
    'use strict';
    angular.module('The.Power.Soul.Square', ['ngMaterial'])
        .constant('selectorItems', [
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
            },
            {
                Title: "全部",
                Value: "ALL"
            }
        ])
        .controller('squareCtrl', ['$scope', '$http', '$stateParams', 'BaseUrl', 'selectorItems', 
        function($scope, $http, $stateParams, BaseUrl, selectorItems) {
            $scope.selectedItem = "ALL";
            $scope.selectorItems = selectorItems;
            $scope.topicList = [];
            $scope.isLoadingTopic = false;
            $scope.isLoadingHasError = true;

            

            /********************** 初始化加载帖子信息 ********************/
            function loadTopics(pageNum, category, keyword, loadMoreSignal) {
                var body = {
                    Page: pageNum,
                    Category: category,
                    Keyword: keyword,
                    LoadAll: false
                }
                if (category === 'ALL') {
                    body.LoadAll = true;
                }
                $scope.isLoadingTopic = true;
                $http.post(BaseUrl + "/topic", body)
                    .then(function(response) {
                        if (loadMoreSignal) {
                            $scope.topicList = $scope.topicList.concat(response.data);
                        } else {
                            $scope.topicList = response.data;
                        }
                }, function(error) {
                    $scope.isLoadingHasError = true;
                });
            }
            loadTopics(1, 'ALL', '', false); // 数据初始化，第一次加载

    	}])
}());