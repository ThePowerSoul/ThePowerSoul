(function () {
	'use strict';
	angular.module('The.Power.Soul.NewArticle', ['ngMaterial'])
		.controller('addNewArticleCtrl', ['$scope', '$http', '$mdToast', '$state', 'BaseUrl', 'localStorageService', 'categoryItems',
			'$stateParams', 'randomString', '$mdDialog', 'alertService',
			function ($scope, $http, $mdToast, $state, BaseUrl, localStorageService, categoryItems, $stateParams, randomString,
				$mdDialog, alertService) {
				var accessid = 'LTAILjmmB1fnhHlx';
				var host = "http://thepowersoul-richtexteditor.oss-cn-beijing.aliyuncs.com";
				var params = {}
				// init simditor
				// var editor = new Simditor({
				// 	textarea: $('#editor'),
				// 	upload: {
				// 		url : host, //文件上传的接口地址
				// 		params: params, //键值对,指定文件上传接口的额外参数,上传的时候随文件一起提交
				// 		fileKey: params.Filename, //服务器端获取文件数据的参数名
				// 		connectionCount: 3,
				// 		leaveConfirm: '正在上传图片，确定离开？'
				// 	},
				// 	success: function(data) {
				// 		console.log(data);
				// 	}
				// });

				var editor = new Simditor({
					textarea: $('#editor'),
					upload: {
						url: BaseUrl + '/upload-picture-rich-text', //文件上传的接口地址
						params: null, //键值对,指定文件上传接口的额外参数,上传的时候随文件一起提交
						fileKey: 'upload_file', //服务器端获取文件数据的参数名
						connectionCount: 3,
						leaveConfirm: '正在上传图片，确定离开？'
					},
					success: function (data) {
						console.log(data);
					}
				});

				$scope.simditorContent = $('.simditor-body')[0].innerHTML;

				var article_id = $stateParams.id;
				$scope.videoSrc = "";
				$scope.categories = categoryItems;
				$scope.user = localStorageService.get('userInfo');
				$scope.article = {
					Title: "",
					Author: $scope.user.DisplayName,
					Content: "",
					Category: ""
				};
				$scope.publishArticle = function (ev) {
					removeBlankSpace();
					$scope.article.Content = $('.simditor-body')[0].innerHTML;
					$scope.isPublishing = true;
					$http.post(BaseUrl + '/article/' + $scope.user._id, $scope.article)
						.then(function (response) {
							$scope.isPublishing = false;
							removeFromDraftList();
						}, function (error) {
							$scope.isPublishing = false;
							alertService.showAlert('发布失败，请重试', ev);
						});
				};

				$scope.saveAsDraft = function () {
					saveDraft();
				};

				function removeBlankSpace() {
					// 将文本中没有内容的标签去除
				}

				function removeFromDraftList() {
					$http.delete(BaseUrl + '/article-draft/' + $scope.article._id)
						.then(function (response) {
							$state.go('article-list');
						}, function (error) {
							alertService.showAlert('删除草稿失败，请重试', ev);
						});
				}

				function saveDraft() {
					$scope.article.Content = $('.simditor-body')[0].innerHTML;
					$http.put(BaseUrl + '/article-draft/' + article_id, $scope.article)
						.then(function (response) {
							alertSuccessMsg('保存草稿成功');
						}, function (error) {

						});
				}

				function setUploadParams(data) {
					var randomFileName = randomString.getRandomString(10);
					params = {
						'Filename': '${filename}',
						'key': '${filename}',
						'policy': data.PolicyText,
						'OSSAccessKeyId': accessid,
						'success_action_status': '200', //让服务端返回200，不然，默认会返回204
						'signature': data.Signature,
					}
				}

				function getUploadPolicy() {
					$http.get(BaseUrl + '/get-upload-policy')
						.then(function (response) {
							setUploadParams(response.data);
						}, function (error) {
							alertService.showAlert('获取上传文件信息失败，请重试');
						});
				}

				function loadArticleDraft() {
					return $http.get(BaseUrl + '/article-draft/' + article_id)
						.then(function (response) {
							$scope.isLoading = false;
							$scope.article = response.data;
							$('.simditor-body')[0].innerHTML = $scope.article.Content;
						}, function (error) {
							$scope.isLoading = false;
							$scope.isLoadingHasError = true;
						});
				}
				// loadArticleDraft().then(getUploadPolicy());
				loadArticleDraft();

				function alertSuccessMsg(content) {
					$mdToast.show(
						$mdToast.simple()
							.textContent(content)
							.highlightClass('md-primary')
							.position('top right')
					);
				}

				var randomKey;
				function set_upload_param(up, data, name) {
					randomKey = randomString.getRandomString(10) + '_' + $scope.user._id;
					up.setOption({
						'multipart_params': {
							'Filename': '${filename}',
							'key': randomKey + '${filename}',
							'policy': data.PolicyText,
							'OSSAccessKeyId': accessid,
							'success_action_status': '200', //让服务端返回200，不然，默认会返回204
							'signature': data.Signature,
						}
					});
					up.start();
					$scope.showProgress = true;
				}

				// 记录光标上次的位置、
				var cursorPosition = -1;
				$(document).ready(function() {
					var contentBox = document.getElementsByClassName('simditor-body');
					contentBox[0].addEventListener('blur', function() {
						var selection = window.getSelection();
						var range = selection.getRangeAt(0).cloneRange();
						// range为鼠标离开时所属的元素，可以直接根据元素的内容性质，判断是按照位置插入还是直接append到后面
						console.log(range); 
					});
				});

				var videoTypes = ['video/mp4', 'video/ogg', 'video/webm', 'video/mpeg4'];

				var videoUploader = new plupload.Uploader({
					runtimes: 'html5,flash,silverlight,html4',
					browse_button: 'videoUploader',
					flash_swf_url: 'lib/plupload-2.1.2/js/Moxie.swf',
					silverlight_xap_url: 'lib/plupload-2.1.2/js/Moxie.xap',
					url: host,
					init: {
						PostInit: function () {
							//
						},
						FilesAdded: function (up, files) {
							var fileType = files[0].type;
							var fileSize = files[0].size;
							$scope.progressBarProgress = 0;
							if (videoTypes.indexOf(fileType) < 0) {
								alertService.showAlert('目前只支持ogg, webm, mpeg4格式的视频');
								videoUploader.stop();
								return;
							} else if (fileSize > 15728640) {
								alertService.showAlert('请传输小于15Mb的视频');
								videoUploader.stop();
								return;
							} else {
								$http.get(BaseUrl + '/get-upload-policy')
									.then(function (response) {
										set_upload_param(videoUploader, response.data, files[0].name);
									}, function (error) {

									});
							}

						},
						BeforeUpload: function (up, file) {

						},
						UploadProgress: function (up, file) {
							$scope.progressBarProgress = file.percent;
						},
						FileUploaded: function (up, file, info) {
							if (info.status == 200) {
								var body = {
									Key: randomKey + file.name
								}
								$http.put(BaseUrl + '/set-video-public', body)
									.then(function (response) {
										$scope.videoSrc = response.data.Src;
									}, function (error) {
										alertService.showAlert('更换头像失败，请联系管理员');
									});
							}
							else {

							}
							$scope.showProgress = false;
						},
						Error: function (up, err) {
							console.log(err);
						}
					}
				});
				videoUploader.init();
			}])
}());