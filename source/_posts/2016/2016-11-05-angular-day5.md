---
title: angular-day5
date: 2016-11-05 8:20:11
tags:
  - angular
  - js framework
  - commonjs
  - script.js
categories:
  - fe-framework 
  - angular
---
## moviecat-link
[https://haoaa.github.io/moviecat_ng](https://haoaa.github.io/moviecat_ng)

### 异步加载库
 - ```html
  	load.js script.js head.js 都可以帮助我们异步的方式加载JS文件
  	<script src="bower_components/script.js/dist/script.js"></script>
  	angular-loader的作用就是在使用一些异步加载脚本的库的时候，自动控制依赖顺序,不用重复的$script回调
  	<script src="bower_components/angular-loader/angular-loader.js"></script>
 ```
- script.js的用法
<!--more-->

 ```javaScript
  $script([
 	 './bower_components/angular/angular.js',
   './bower_components/angular-route/angular-route.js',
 	 './movie_list/controller.js',
 	 './components/http.js',
   './components/auto-focus.js',
   './app.js' // 由于这个包比较小，下载完成过后就直接执行
 	], function() {
 		console.log(angular);
  	angular.bootstrap(document, ['moviecat']);
  	// console.log(jQuery);
 	});
  ```

  - 手动加载一个模块 `angular.bootstrap(document, ['moviecat']);`
### jsonp回调后移除标签
  - 原先设置回调函数 `$window[callbackName] = callback;`
  - 优化回调函数
  ```javaScript
    var script = $document[0].createElement('script');
    script.src = url + query;

    // 设置回调函数$window[callbackName] = callback换成
    $window[callbackName] = function (data) {
        callback(data);
        $document[0].body.removeChild(script);
    } ;
    // 请求数据
    $document[0].body.appendChild(script);
  ```

## moviecat剩下部分
### step-08 搜索功能模块
  - $routeParams 的数据来源：1. 路由匹配出来的， 2. `?`参数
    - 在MovieListController里增加查询参数 `q: $routeParams.q`
  - 将搜索功能做成指令
  ```javaScript
  angular.module('moviecat.directives.searchMovie', [])
  	.directive('searchMovie', [
  		'$route',
  		'$location',
  		function ($route, $location) {

  	    return {
  			restrict: 'A',
  			template: '<form class="navbar-form navbar-right" ng-submit="search()">' +
  					  '  <input type="text" ng-model="searchText" class="form-control" placeholder="Search...">' +
  					  '</form>' ,
  			link :function ($scope, ele, attr) {
  				//var q =$location.url().replace(/.*?q\=(.*?)/,'$1');
  				// 回显关键字
  				//$scope.searchText = q ? decodeURI(q) : '';
  				$scope.searchText ='';
  				$scope.search =function () {

                    $location.path('/search/1');
                    $location.search('q', $scope.searchText);

                    //$route.updateParams({category: 'search', q: $scope.searchText})
  				}
  			}
  		}
  	}]);
  ```
  - 注: 指令不能访问另一个控制器的路由`$routeProvider.when('/detail/:id',`也就是`$routeParams`
  ,所以在detail视图下搜索会变成/index.html#/detail/1835038?category=search&q=abc

### step-09 详细页模块设计展示
  - 略
  - 全局变量配置
    - 在主模块上定义配置常量
    ```javaScript
    module.constant('SysConfig',{
    		pageSize:15,
    		moiveListUrl : 'https://api.douban.com/v2/movie/',
    		moiveDetailUrl: 'https://api.douban.com/v2/movie/subject/'
    	})
    ```
    - 在子模块上注入并使用
    ```javaScript
    modile.controller('MovieDetailController', [
        '$scope',
        'SysConfig',
        function ($scope, SysConfig) {
            var url = SysConfig.moiveDetailUrl + $routeParams.id;
        }]);
    ```
 ---
## 模块化开发

- 将软件产品看作为一系列功能模块的组合
- 通过特定的方式实现软件所需模块的划分、管理、加载

### 为什么使用模块化开发

- https://github.com/seajs/seajs/issues/547
- 协同
- 代码复用
- 解决问题
  + 大量的文件引入
  + 命名冲突
  + 文件依赖
    * 存在
    * 顺序


### 实现模块化的推演

#### step-01 全局函数
  - 早期的开发过程中就是将重复使用的代码封装到函数中
  - 再将一系列的函数放到一个文件中，称之为模块
  - 约定的形式定义的模块，存在命名冲突，可维护性也不高的问题
  - 仅仅从代码角度来说：没有任何模块的概念

#### step-02 封装对象
  - 分页算法
  ```javaScript
      var begin = current - region; // 可能小于 1
      begin = begin < 1 ? 1 : begin;
      var end = begin + show; // end必须小于total
      if (end > total) {
        end = total + 1;
        begin = end - show;
        begin = begin < 1 ? 1 : begin;
      }
     for (var i = begin; i < end; i++) {
     }
  ```


#### step-03 划分私有空间
  ```javaScript
  var calculator = (function() {
        // 这里形成一个单独的私有的空间
        // var name = '';

        // 私有成员的作用，
        // 将一个成员私有化，
        // 抽象公共方法（其他成员中都会用到的）

        // 私有的转换逻辑
        function divide(a, b) {
          return convert(a) / convert(b);
        }

        return {
          divide: divide
        }
      })();
  ```


#### step-04 模块的扩展与维护

  ```javaScript
     // calc_v2015.js
    (function(calculator) {

      function convert(input) {
        return parseInt(input);
      }
      calculator.add = function(a, b) {
        return convert(a) + convert(b);
      }
      window.calculator = calculator;

    })(window.calculator || {});

    // 新增需求
    // calc_v2016.js
    (function(calculator) {
      function convert(input) {
        return parseInt(input);
      }
      // calculator 如果存在的话，我就是扩展，不存在我就是新加
      calculator.remain = function(a, b) {
        return convert(a) % convert(b);
      }
      window.calculator = calculator;
    })(window.calculator || {});
    // 开闭原则，对新增开放，对修改关闭；
  ```

#### step-05 第三方依赖管理
  ```javaScript
  (function(calculator, $) {
        // 依赖函数的参数，是属于模块内部
        // console.log($);
        // $().
        function convert(input) {
          return parseInt(input);
        }
        // calculator 如果存在的话，我就是扩展，不存在我就是新加
        calculator.remain = function(a, b) {
          return convert(a) % convert(b);
        }
        window.calculator = calculator;
      })(window.calculator || {}, jQuery);
  ```

  - 在什么场景下使用模块化开发
    * 业务复杂
    * 重用逻辑非常多
    * 扩展性要求较高

*****

## 实现规范

### CommonJS规范

### AMD规范

### CMD规范


*****

## 实现

### Seajs

#### 使用步骤

1. 在页面中引入sea.js文件
2. 定义一个主模块文件，比如：main.js
3. 在主模块文件中通过define的方式定义一个模块，并导出公共成员
4. 在页面的行内脚本中通过seajs.use('path',fn)的方式使用模块
5. 回调函数的参数传过来的就是模块中导出的成员对象

#### 定义一个模块

  - define
  ```javascript
    define(function(require, exports, module) {
      exports.add = function(a, b) {
        return a + b;
      };
    });
  ```
#### 使用一个模块
  - use
  ```javascript
  seajs.use('./calc.js',function (cal) {
  })
  ```
- seajs.use
  + 一般用于入口模块
  + 一般只会使用一次
- require
  + 模块与模块之间
  + demo
  ```javascript
  define(function (require,exports,module) {
      var convert = require('./calc_convert.js').convert;
  })
  ```
#### 导出成员的方式

  - module.exports
  - exports.xxx
  - return
  - 三种方式的优先级 return > module.exports > exports.xxx
  ```javascript
      return {
          add : multiply //最终add是multiply
      };
      module.exports = {
          add : subtract
      };
      exports.add  = add;
  ```
#### 异步加载模块

  - 默认require的效果是同步的，会阻塞代码的执行，造成界面卡顿
  - require.async();
  ```javascript
    require.async('./calc_convert.js', function (cal) {
        console.log(cal);
    })
  ```

#### 使用第三方依赖（jQuery）

  - 由于CMD是国产货，jquery默认不支持

  ```javascript
  define(function(require, exports, module) {
    // 想用jquery怎么办
    var $ = require('./jquery.js');
    console.log($);
    $(document.body).css('backgroundColor', 'red');
  });
  ```
  - 需要改造jquery
  ```javascript
  // 适配CMD
  if (typeof define === "function" && !define.amd) {
    // 当前有define函数，并且不是AMD的情况
    // jquery在新版本中如果使用AMD或CMD方式，不会去往全局挂载jquery对象
    define(function() {
      return jQuery.noConflict(true);
    });
  }
  ```

#### Seajs配置

- [配置](https://github.com/seajs/seajs/issues/262)
- seajs.config
  + base
  + alias
  ```javascript
    seajs.config(
        {
            alias: {
                // 变化点封装
                calc: './03-calc-async.js',
            }
        });
    seajs.use('calc',function (cal) {});
  ```
#### 使用案例

- Tab标签页


### RequireJS
