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
    	.controller('addNewArticleCtrl', ['$scope', function($scope) {
    		$scope.richTextContent = "";
    		$scope.publishArticle = function() {

    		};

    		$scope.saveAsDraft = function() {

    		};

    		function autoSaveDraft() {

    		}
    	}])
}());