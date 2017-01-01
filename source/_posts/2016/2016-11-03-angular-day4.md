---
title: angular-day4
date: 2016-11-03 18:20:11
tags:
  - angular
  - js framework
categories:
  - fe-framework 
  - angular
---
## demo-link
[https://haoaa.github.io/moviecat_ng](https://haoaa.github.io/moviecat_ng)

## step-01 构建moviecat项目

  - 克隆项目骨架

  ```bash
    $ git clone --depth=1 https://github.com/Micua/angular-boilerplate.git moviecat
    $ cd moviecat
  ```
<!--more-->

- 安装项目依赖

  ```bash
  $ bower install bootstrap --save
  ```
- npm 在 package.json中的script节点中可以定义脚本任务，
  可以使用`npm run start`命令安装, package.json中有如下配置

  ```bash
  "scripts": {
      "postinstall": "bower install",
      "prestart": "npm install",
      "start": "./node_modules/.bin/hs -a 127.1 -p 9000 -o"
    },
  ```
  ```bash
  .editorconfig -- 统一不同开发者的不同开发工具的不同开发配置
  在Sublime中使用需要安装一个EditorConfig的插件
  ```
- `angular-seed`为NG做一个项目骨架的目的是为了快速开始一个新的项目


  - WebAPI 通过WEB方式提供结构叫做 WEBAPI

  - 测试WebAPI的工具： POSTMAN


### step-02 抽象数据成员，以假数据的方式设计控制器和视图
  - code
  ```html
    <div class="list-group">
    	<a ng-repeat="item in subjects" href="#" class="list-group-item ">
    		<span class="badge">{{item.rating.average}}</span>

    		<div class="media">
    			<div class="media-left">
    				<img class="media-object" src="{{item.images.small}}" alt="{{item.images.title}}">
    			</div>
    			<div class="media-body">
    				<h3 class="media-heading">{{item.title}}</h3>
    				<p>导演: <span ng-repeat="dy in item.directors ">{{dy.name}}<span ng-hide="$last">、</span></span></p>
    				<p>类型: <span>{{item.genres.join("、")}}</span></p>
    			</div>
    		</div>

    	</a>
    </div>
  ```
  ```javaScript
  (function (angular) {
  	angular.module('moviecat.in_theaters', ['ngRoute'])

  		.config(['$routeProvider', function ($routeProvider) {
  			$routeProvider.when('/in_theaters', {
  				templateUrl: 'in_theaters/view.html',
  				controller: 'InTheatersController'
  			});
  		}])

  		.controller('InTheatersController', ['$scope','$http',function ($scope,$http) {
  			// 控制器 分为两步： 1. 设计暴露数据，2. 设计暴露的行为

  			var url = 'https://api.douban.com/v2/movie/in_theaters?count=2';

  			$http.get('data.json').then(function (res) {
  				if (res.status == 200){
  					$scope.subjects = res.data;
  				}
  			    $scope.msg = '获取数据错误，错误信息：' + res.statusText;
  			},function (err) {
  			    $scope.msg = '获取数据错误，错误信息：' + err.statusText;
  			});
  		}]);

  })(angular);
  ```
### step-03 图片链接数据绑定BUG
  `<img class="media-object" ng-src="{{item.images.small}}" alt="{{item.images.title}}">`

### step-04 豆瓣API介绍，加入$http服务对象完成AJAX请求数据
  - [https://developers.douban.com/wiki/?title=api_v2](https://developers.douban.com/wiki/?title=api_v2)
  - https://api.douban.com/v2/movie/in_theaters?count=2

##### jsonp
  - 实现jsonp的候选标签
  ```html
     img :统计链接, 支持跨域但是无法实现获取服务端返回的数据
     iframe : 支持，可以接收服务端数据，但是过程复杂
     link :会在CSS处理阶段报错
  ```
  - 在Angular中使用JSONP的方式做跨域请求，就必须给当前地址加上一个参数 callback=JSON_CALLBACK
    `$http.jsonp(url+'?callback=JSON_CALLBACK').`
  - 实现jsonp Service
  ```javaScript
    (function (angular) {
    	"use strict";

        var http = angular.module('moviecat.services.http', []);

    	http.service('HttpService', ['$document','$window', function ($document,$window) {
    		this.jsonp = function (url, params, callback) {
    			var callbackName = 'my_json_cb_' + Math.random().toString().replace('.', '');
    			// 设置回调函数
    			$window[callbackName] = callback;

    			// 转换请求参数
    			var query = url.indexOf('?') == -1 ? '?' :'&';
    			for (var key in params) {
    				query += key + '=' + params[key] + '&';
    			}
                query += 'callback=' + callbackName;

    			var script = $document[0].createElement('script');

    			script.src = url + query;
    			// 请求数据
    			$document[0].body.appendChild(script);

    			$document[0].body.removeChild(script);

    		}
    	}]);
    })(angular);

  ```
### step-05 加载提示，Loading状态设计
  - 在控制器里设置londing模型
  ```javaScript
    $scope.loading = true;
    HttpService.jsonp(url, para, function (data) {
        $scope.subjects = data;
        $scope.loading = false;
        // update non-angular context change
        $scope.$apply();
    });
  ```
  ```html
  <div ng-if="loading" class="mask">
  	<div class="loadEffect">
  		<span></span> <span></span>
  	</div>
  </div>
  ```
  ```css
  .mask{
  	position: fixed;
  	z-index: 9999;
  	top: 0;
  	left: 0;
  	right: 0;
  	bottom: 0;
  	background-color: rgba(0,0,0,.6);
  }
  ```

### step-06 修改字符数组的展示形式
  ```html
    <p>主演: <span ng-repeat="c in item.casts ">{{c.name}}{{$last? '' : '、'}}</span></p>
  ```

### step-07 实现分页功能
### step-07 抽象公共的列表页
