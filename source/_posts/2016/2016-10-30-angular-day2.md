---
title: angular day2
date: 2016-10-30 09:58:42
tags:
  - angular
  - js framework
categories: 
  - fe-framework 
  - angular
---
## Angular指令

## 指令
- ng-app和data-ng-app一样效果
- angular 默认只获取页面上一个app指令, 多个模块要设置或组合使用s
    + 1.手动的让第二个div被myApp2管理  
    ```javaScript
        angular.bootstrap(document.querySelector('[ng-app="myApp2"]'),['myApp2']);
    ```

    + 2.设置多个app组成一个app    
    ```javaScript
        angular.module('myApp', ['myApp1', 'myApp2']);
    ```
<!--more-->
### 内置指令
###  1.ng-bind
  + 用法`<strong ng-bind="username"></strong>` ,
    这样就不会闪一下,因为要等angular准备好了才执行.
     - ng-bind指令在绑定的值包含HTML时会转义，为了安全（跨站脚本攻击）

  + 绑定的内容不转义需要引入ngSanitize模块,可以实现但是不安全
       ```html
    <body ng-app="myApp" ng-init="username='<h1>aaaaa</h1>'">
      <strong ng-bind-html="username"></strong>
      <script src="bower_components/angular/angular.js"></script>
      <script src="bower_components/angular-sanitize/angular-sanitize.js"></script>
      <script>
        // 使用自定义的模块才可以依赖别的包里面定义模块，angular定义的默认模块没有依赖任何
        angular.module('myApp', ['ngSanitize']);
      </script>
    </body>
    ```
###  2.ng-repeat
  + usage:
    + `item in items` is equivalent to `item in items track by $id(item)`
  ```html
<ul class="messages">
    <li ng-repeat="item in messages track by $index">
        {{item}}
    </li>
</ul>
  ```
  + ng-class指令可以设置一个键值对，用于决定是否添加一个特定的类名，键为class名，值为bool类型表示是否添加该类名.
  eg: `ng-class="{red:lastname!=''&&name.startsWith(lastname)}"`
```html
<ul class="messages">
    <li ng-repeat="item in messages track by $index" ng-class="{red:item.read}">
        {{item.content}}
    </li>
</ul>

```
  ```html
  <select ng-model="style">
    <option value="red">红色</option>
    <option value="green">绿色</option>
  </select>
  <!-- <div id="box" ng-class="style"></div> -->
  <div id="box" ng-class="{red:style=='red', green:style=='green'}"></div>
```
###  3.ng-cloak
  + 实现方式
    - angular在header位置引入
    - 加样式屏蔽
    ```css
    [ng\:cloak],[ng-cloak],[data-ng-cloak],[x-ng-cloak],
    .ng-cloak,.x-ng-cloak,.ng-hide:not(.ng-hide-animate)
    {display:none !important;}
    ng\:form{display:block;}.ng-animate-shim{visibility:hidden;}
    .ng-anchor{position:absolute;}
    ```
###  4.ng-show, ng-hide, ng-if
  + ng-show 决定是否显示 ng-hide 是否隐藏 ng-if 是否存在(元素增删)
  + usage
  ```html
      <div class="tips" ng-if="isShow">
      <div class="tips" ng-show="isShow">
  ```
###  5.ng-href, ng-src
  + ng-link/ng-src指令用于解决当链接类型的数据绑定时造成的加载BUG
  ```html
    浏览器在解析HTML时会去请求{{item.url}}文件
    <img src="{{item.url}}">
    可以使用ng-src解决该问题
    <img ng-src="{{item.url}}">
    a标签也是一样处理
    <a ng-href="{{item.url}}">跳转到图片</a>
  ```
###  5.ng-switch
  + 用法:
  ```html
	<select ng-model="case">
		<option value="1">1</option>
		<option value="2">2</option>
		<option value="3">3</option>
	</select>
	<div ng-switch="case">
		<div ng-switch-when="1">
			111111111
		</div>
		<div ng-switch-when="2">
			222222222
		</div>
		<div ng-switch-default>
			333333333
		</div>
	</div>
  ```
###  6.ng-checked,ng-disabled,ng-readonly,ng-selected
  + Sets the `checked` attribute on the element, if the expression inside `ngChecked` is truthy.
    + ng-model是双向绑定,ng-checked/selected是单向,可用于做全选反选
  ```html
    <label>Check me to check both: <input type="checkbox" ng-model="master"></label><br/>
    <input id="checkSlave" type="checkbox" ng-checked="master" aria-label="Slave input">
  ```

### 自定义指令
  + 参考 [Angular Bootstrap UI](https://angular-ui.github.io/bootstrap/)  [Angular material](https://material.angularjs.org/)
  + 封装常用的dom操作
  ```javaScript
    app.directive('myBtn',[function () {
    		return{
    			template:'<input type="button" value="my button" class="btn btn-lg btn-primary btn-block">'
    		}
    	}]);
    	app.directive('btn2',[function () {
    		return{
    			scope:{
    				primary: '@',//获取指令属性primary ,相当于@primary
    				lg:'@',
    				block:'@',
    			},
    			transclude:true,
    			template:'<button class="btn {{' +
    			'primary==\'\'? \'btn-primary\':\'\'' +
    			'}}" ng-transclude>button</button>'  //primary空标签class就设置 btn-primary
    		}
    	}]);

    	app.directive('btn',[function () {
    		return {
    			// transclude建指令的内容放到标签内容中
    			// 指令对象的transclude必须设置为true才可以在模版中使用ng-transclude指令
          //如  <btn>xxx<btn> => <button ...>xxx</button>
    			transclude:true,
    			replace:true, //指令外壳被替换调
    			template: '<button class="btn btn-primary btn-sm" ng-transclude>button</button>'

    		}
    		}]);


    	app.directive('breadcrumb', [function() {
    		// Runs during compile
    		return {
    			// 指定当前指令的类型什么样的
    			// restrict: 'EA',
    			// E = Element, A = Attribute, C = Class, M = Comment
    			// template: '', // 模版字符串
    			templateUrl: 'temp.html',
    			replace: true,
    		};
    	}]);
  ```
  temp.html
  ```html
    <ol class="breadcrumb">
    	<li><a href="#">Home</a></li>
    	<li><a href="#">Library</a></li>
    	<li class="active">Data</li>
    </ol>
  ```

  + 通过控制器定制指令内容
  ```javaScript
  	var app = angular.module('myApp', []);

  	app.controller('cotroller',['$scope' ,function ($scope) {
  		$scope.data = ['home','cat','dog'];
  		$scope.data2 = ['home2','cat2','dog2'];
  	}]);

  	app.directive('breadcrumb', [function() {
  		// Runs during compile
  		return {
  			scope:{
  				data: '=info'
  			},
  			// 指定当前指令的类型什么样的
  			 restrict: 'EA',
  			templateUrl: 'temp2.html',
  			replace: true,
  		};
  	}]);
  ```
  temp2.html
  ```html
    <ol class="breadcrumb">
    	<li ng-repeat="item in data track by $index" ng-class="{active:$last}">
    		<a href="#" ng-if="!$last">{{item}}</a>
    		<span ng-if="$last">{{item}}</span>
    	</li>
    </ol>
  ```
  - 以下是通过返回link函数来操作dom的指令
  ```javaScript
  angular.module('todomvc')
  	.directive('todoFocus', function todoFocus($timeout) {
  		'use strict';

  		return function (scope, elem, attrs) {
  			scope.$watch(attrs.todoFocus, function (newVal) {
  				if (newVal) {
  					$timeout(function () {
  						elem[0].focus();
  					}, 0, false);
  				}
  			});
  		};
  	});
  ```
## TODOLIST案例
  - 参考[todomvc](http://todomvc.com/)
  - [练习](https://github.com/haoaa/todomvc_ng.git)
    - todomvc_ng/js/app.js
    - todomvc_ng/index.html
