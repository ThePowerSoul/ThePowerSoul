(function() {   
    'use strict';
    angular.module('The.Power.Soul.Report', ['ngMaterial'])
        .directive('unitTree', function() {
            function link($scope, $element, $attrs) {
                function addParent(arr, parentNode) {
                    for (var i = 0; i < arr.length; i++) {
                        if (parentNode === undefined) {
                            arr[i].ParentNode = null;
                        } else {
                            arr[i].ParentNode = parentNode;
                        }
                        arr[i].Belonging = arr;
                        arr[i].Selected = false;
                        if (arr[i].Children.length !== 0) {
                            addParent(arr[i].Children, arr[i]);
                        }
                    }
                };   

                addParent($scope.unitTreeItems); 

                $scope.getNodePath = function(node) {
                    var arr = [];
                    while(node.ParentNode !== null) {
                        arr.unshift(node.ParentNode.Title);
                        node = node.ParentNode;
                    }
                    return arr.join('/');
                };

                $scope.backToLastLayer = function(node) {
                    if (node.ParentNode) {
                        $scope.unitTreeItems = node.ParentNode.Belonging;
                    }
                    if ($scope.currentSelectedNode.ParentNode !== null) {
                        $scope.currentSelectedNode.Selected = false;
                        $scope.currentSelectedNode = $scope.currentSelectedNode.ParentNode;
                        angular.forEach($scope.unitTreeItems, function(item) {
                            if (item.ID === $scope.currentSelectedNode.ID) {
                                item.Selected = true;
                            }
                        });
                    }
                    // $scope.currentSelectedNode = null;
                };

                $scope.showBackButton = function() {
                    var flag = true;
                    if ($scope.currentSelectedNode) {
                        angular.forEach($scope.unitTreeItems, function(item) {
                            if ($scope.currentSelectedNode.ID === item.ID && $scope.currentSelectedNode.ParentNode === null) {
                                flag = false;
                            }
                        });
                    } else {
                        flag = false;
                    }
                    return flag;
                };

                $scope.expandUnit = function(node) {
                    if ($scope.currentSelectedNode !== null) {
                        $scope.currentSelectedNode.Selected = false;
                        $scope.currentSelectedNode = null;
                    }
                    if (node.Children.length !== 0) {
                        $scope.unitTreeItems = node.Children;
                    } else {
                        
                    }
                    node.Selected = true;
                    $scope.currentSelectedNode = node;
                };
            }
            return {
                priority: 1,
                restrict: 'EA',
                replace: false,
                scope: false,
                templateUrl: "dist/pages/unit-tree-template.html",
                link: link
            }
        })
        .constant('Identities', [
            {
                ID: '01',
                Title: '侵犯我的权益',
                Children: [
                    {
                        ID: '01-1',
                        Title: '骚扰我',
                        Children: []
                    },
                    {
                        ID: '01-2',
                        Title: '辱骂我，歧视我，挑衅等（不友善）',
                        Children: []
                    },
                    {
                        ID: '01-3',
                        Title: '抄袭了我的内容',
                        Children: []
                    },
                    {
                        ID: '01-4',
                        Title: '侵犯了我企业的权益',
                        Children: []
                    },
                    {
                        ID: '01-5',
                        Title: '侵犯了我个人的权益',
                        Children: []
                    }
                ]
            },
            {
                ID: '02',
                Title: '对社区有害的内容',
                Children: [
                    {
                        ID: '02-1',
                        Title: '垃圾广告信息',
                        Children: []
                    },
                    {
                        ID: '02-2',
                        Title: '色情，暴力，血腥等违反法律法规的内容',
                        Children: []
                    },
                    {
                        ID: '02-3',
                        Title: '不规范转载',
                        Children: []
                    },
                    {
                        ID: '02-4',
                        Title: '政治敏感',
                        Children: []
                    },
                    {
                        ID: '02-5',
                        Title: '辱骂，歧视，挑衅',
                        Children: []
                    }
                ]
            }
        ])
        .controller('addReportCtrl', ['$scope', '$mdDialog', 'localStorageService', 'Identities', 'target',
        function($scope, $mdDialog, localStorageService, Identities, target) {
            var user = localStorageService.get('userInfo');
            $scope.reportObj = {
                Content: '',
                Author: user.DisplayName,
                TargetID: target._id,
                TargetLink: window.location.href,
                Category: null,
                TargetUserID: target.UserID
            };
            $scope.currentSelectedNode = null;
            $scope.unitTreeItems = addChildrenAttribute(Identities, null);

            function addChildrenAttribute(data, parentNode) {
                for (var i = 0; i < data.length; i++) {
                    data[i].ParentNode = parentNode;
                    if (data[i].Children.length > 0) {
                        addChildrenAttribute(data[i].Children, data[i]);
                    }
                }
                return data;
            }

            $scope.getNewestPath = function() {
                var flag = false;
                var node = $scope.currentSelectedNode;
                if (!node) {
                    return "--";
                } else {
                    angular.forEach($scope.unitTreeItems, function(item) {
                        if (item.ID === $scope.currentSelectedNode.ID) {
                            flag = true;
                        } 
                    });
                    var arr = [];
                    if (node) {
                        arr.push(node.Title);
                        while(node && node.ParentNode !== null && node.ParentNode !== undefined) {
                            arr.unshift(node.ParentNode.Title);
                            node = node.ParentNode;
                        }
                    }
                }
                if (flag) {
                    return arr.join(' / ');
                } else {
                    return arr.join(' / ') + " / -- ";
                }        
            };

            $scope.disableSubmitButtonOrNot = function() {
                $scope.reportObj.Category = $scope.currentSelectedNode;
                return $scope.reportObj.Content === '' || $scope.reportObj.Category.ParentNode === null;
            };

            $scope.closeDialog = function(ev) {
                $mdDialog.cancel();
            };

            $scope.submit = function() {
                $scope.reportObj.Category = $scope.currentSelectedNode;
                $mdDialog.hide($scope.reportObj);
            };

    	}])
}());