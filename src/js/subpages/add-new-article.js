(function() {   
    'use strict';
    angular.module('The.Power.Soul.NewArticle', ['ngMaterial', 'textAngular'])
    	.config(['$provide', function($provide){
			// this demonstrates how to register a new tool and add it to the default toolbar
			$provide.decorator('taOptions', ['$delegate', function(taOptions){
			// $delegate is the taOptions we are decorating
			// here we override the default toolbars and classes specified in taOptions.
			taOptions.forceTextAngularSanitize = true; // set false to allow the textAngular-sanitize provider to be replaced
			taOptions.keyMappings = []; // allow customizable keyMappings for specialized key boards or languages
			taOptions.toolbar = [
				['bold', 'italics','underline', 
				'ul', 'ol'],
				// ['wordcount', 'charcount']
				// [ 'redo', 'undo', 'clear'],
				// ['justifyLeft','justifyCenter','justifyRight', 'justifyFull'],
				// ['html', 'insertImage', 'insertLink', 'wordcount', 'charcount']
				// pre quote
				//'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'
			];
			taOptions.classes = {
				focussed: 'focussed',
				toolbar: 'btn-toolbar',
				toolbarGroup: 'btn-group',
				toolbarButton: 'btn btn-default',
				toolbarButtonActive: 'active',
				disabled: 'disabled',
				textEditor: 'form-control',
				htmlEditor: 'form-control'
			};
			return taOptions; // whatever you return will be the taOptions
			}]);
			// this demonstrates changing the classes of the icons for the tools for font-awesome v3.x
			$provide.decorator('taTools', ['$delegate', function(taTools){
				taTools.bold.iconclass = 'fa fa-bold';
				taTools.italics.iconclass = 'fa fa-italic';
				taTools.underline.iconclass = 'fa fa-underline';
				taTools.ul.iconclass = 'fa fa-list-ul';
				taTools.ol.iconclass = 'fa fa-list-ol';
				taTools.undo.iconclass = 'icon-undo';
				taTools.redo.iconclass = 'icon-repeat';
				taTools.justifyLeft.iconclass = 'icon-align-left';
				taTools.justifyRight.iconclass = 'icon-align-right';
				taTools.justifyCenter.iconclass = 'icon-align-center';
				taTools.clear.iconclass = 'icon-ban-circle';
				taTools.insertLink.iconclass = 'icon-link';
				taTools.insertImage.iconclass = 'icon-picture';
				// there is no quote icon in old font-awesome so we change to text as follows
				delete taTools.quote.iconclass;
				taTools.quote.buttontext = 'quote';
				return taTools;
			}])
		}])
		.controller('addNewArticleCtrl', ['$scope', '$http', '$mdToast', '$state', 'BaseUrl', 'localStorageService', 'categoryItems',
		'$stateParams',
		function($scope, $http, $mdToast, $state, BaseUrl, localStorageService, categoryItems, $stateParams) {
			var article_id = $stateParams.id;
			$scope.categories = categoryItems;
			$scope.user = localStorageService.get('userInfo');
			$scope.article = {
				Title: "",
				Author: $scope.user.DisplayName,
				Content: "",
				Category: ""
			};
    		$scope.publishArticle = function(ev) {
				removeBlankSpace();
				$scope.isPublishing = true;
				$http.post(BaseUrl + '/article/' + $scope.user._id, $scope.article)
					.then(function(response) {
						$scope.isPublishing = false;
						removeFromDraftList();
					}, function(error) {
						$scope.isPublishing = false;
						alertService.showAlert('发布失败，请重试', ev);
					});
    		};	

    		$scope.saveAsDraft = function() {
				saveDraft();
			};

			function removeBlankSpace() {
				// 将文本中没有内容的标签去除
			}
			
			function removeFromDraftList() {
				$http.delete(BaseUrl + '/article-draft/' + $scope.article._id)
					.then(function(response) {
						$state.go('article-list');
					}, function(error) {
						alertService.showAlert('删除草稿失败，请重试', ev);
					});
			}

    		function saveDraft() {
				$http.put(BaseUrl + '/article-draft/' + article_id, $scope.article)
					.then(function(response) {
						alertSuccessMsg('保存草稿成功');
					}, function(error) {

					});
			}

			// 等待添加定时保存草稿的代码
			function autoSendSaveRequest() {
				
			}

			function alertSuccessMsg(content) {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent(content)
                    .highlightClass('md-primary')
                    .position('top right')
                );
            }
			
			function loadArticleDraft() {
				$http.get(BaseUrl + '/article-draft/' + article_id)
					.then(function(response) {
						$scope.isLoading = false;
						$scope.article = response.data;
					}, function(error) {	
						$scope.isLoading = false;
						$scope.isLoadingHasError = true;
					});
			}
			loadArticleDraft();

    	}])
}());