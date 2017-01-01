---
title: angular-day3
date: 2016-11-02 15:06:39
tags:
  - angular
  - js framework
categories:
  - fe-framework 
  - angular
---


## TODOMVC案例

- 根据界面原型抽象数据成员（有哪些数据，每个数据的类型和结构）
- 设计模块，控制器
- 完成数据绑定
- 编写交互逻辑


## 过滤器
  - 一般用于服务端存储的数据转换为用户界面可以理解的数据
  ```html
    时间过滤器:
    <span>{{'1288323623006' | date:"MM/dd/yyyy 'at' h:mma"}}</span>
    货币:
    <p>{{1000000.1242222222| currency : '￡':2}}</p>
    json文本格式化输出
    <pre>{{p1 | json:8}}</pre>
  ```
  - 在js中使用
  ```javaScript
    // 如果在控制器中需要用到一个不存在的对象，都尝试使用注入的方式
    $scope.text = $filter('limitTo')('hahahahahahah', '10', 5);
  ```
<!--more-->
  - limitTo 过滤器,限制数量，限制字符串或者遍历长度(个数,开始位置)

  - orderBy 按照特定字段排序，默认是正序，倒序则加上`-`号

  - filter 过滤器(看文档)
    - 检索特定内容，默认模糊匹配
    - 如果传入对象则匹配特定属性，如传入`{name:'张三'}`，则匹配那么属性中包含张三
    ```
        {{ filter_expression | filter : expression : comparator : anyPropertyKey}}
    ```
    - 表达式可以是字符串,或对象或函数. 任意属性($)和字符串不限层级.
    - expression是function时,参数名依赖注入,value是每个被过滤的元素. function返回true则加入结果集合
    ```javaScript
    $scope.predicate =function (value, index, array) {
    		    console.log(array);
    			return index%2==0;
    		}
    ```
    - comparator 设置是否严格匹配(默认否),comparator是functions的例子:
    ```javaScript
    $scope.comparator = function (actual, expected) {
       return angular.equals(actual, expected);
    }
    ```
### 自定义过滤器

- 使用switch判断不同输入来输出不同数据
  ```javaScript
    angular.module('app', [])
    		  .filter('checkmark', function() {
    			  return function(input, style) {
    				  style = style || 1; // 短路运算符
    				  switch (style) {
    					  case 1:
    						  return input ? '\u2713' : '\u2718';
    					  case 2:
    						  return input ? '\u2720' : '\u2729';
    				  }
    			  };
    		  })
    		  .filter('weight', function() {
    			  return function(input) {
    				  if (input > 100) {
    					  return '太胖了';
    				  } else {
    					  return '太瘦了';
    				  }
    			  };
    		  });

  ```
  对应html
  ```html
   <h1>{{ true | checkmark }}</h1>
   <h1>{{ false | checkmark }}</h1>
   <h1>{{ false | checkmark : 2 }}</h1>
   <h1>{{ true | checkmark : 2 }}</h1>

  <div>
  	<input type="text" placeholder="请输入你的体重" ng-model="weight">
  	<p>你的体重：{{weight}} kg</p>
  	<p>你{{weight|weight}}</p>
  </div>
  ```


---
## 路由

### NG 中路由是单独提供的功能模块 ngRoute, 也是一个单独发型的文件
> 注: 地址栏对象$location. $location.path()获取/xxx. 原始锚点:index.html#zhutou

- 安装或者下载angular-route的包
- 引入这个包
- 在自己的模块中添加 ngRoute 依赖
- 路由配置（配置路由规则）
  + 规则指的就是 什么样的请求 找什么控制器
  + [{url:'/sdf',controller:'MainController'}]
- 编写对应的控制器和视图ng-view

`/students/zhangsan`

`/:role/:name?`  以上路径符合这个规则, 其中`?`表示可空, 即`/students`也能匹配规则

$routeParams可取得数据: `{role:students,name:zhangsan}`

#### 如果连入第三方文件时不写协议的话：
在链接cdn文件如:`http://apps.bdimg.com/libs/angular.js/1.4.7/angular.min.js`
写成: `<script src="//apps.bdimg.com/libs/angular.js/1.4.7/angular.min.js"></script>`

如果当前你的网站是HTTP的方式部署的话，请求对应为
`http://apps.bdimg.com/libs/angular.js/1.4.7/angular.min.js`
如果是HTTPS的话，请求对应为
`https://apps.bdimg.com/libs/angular.js/1.4.7/angular.min.js`

- Demo
```HTML
  <ul>
    <li><a href="#/a">A</a></li>
    <li><a href="#/b">B</a></li>
  </ul>
  <div ng-view></div> 路由视图
  <script src="//cdn.bootcss.com/angular.js/1.5.8/angular.js"></script>
  <script src="//cdn.bootcss.com/angular.js/1.5.8/angular-route.js"></script>
  <script id="a_tmpl" type="text/ng-template">
    <!-- 只有type="text/javascript"的script节点才会被当做JS执行 -->
    <!-- 写在HTML里减少请求数 -->
    <h1>{{title}}</h1>
  </script>
  <script>
    var app = angular.module('app', ['ngRoute']);
    app.config(['$routeProvider', function($routeProvider) {
      $routeProvider
      // 某一类特定地址
        .when('/students/:name?', {
          controller: 'StudentsController',
          templateUrl: 'a_tmpl'
        })
        .when('/a', {
          controller: 'AController',
          templateUrl: 'a_tmpl'
        })
        .when('/b', {
          controller: 'BController',
          templateUrl: 'a_tmpl'
        })
        // 别的请求
        .otherwise({
          // 跳转到上面的a
          redirectTo: '/a'
        });
    }]);

    app.controller('StudentsController', ['$scope', '$routeParams', function($scope, $routeParams) {
      $scope.title = '你好' + $routeParams['name'] + '这是A控制器';
    }]);

    app.controller('AController', ['$scope', function($scope) {
      $scope.title = '这是A控制器';
    }]);

    app.controller('BController', ['$scope', function($scope) {
      $scope.title = '这是B控制器';
    }]);
  </script>
</body>
```
  - 在控制器注入$routeParams['name']用来获取匹配路径的参数
  - redirectTo : '/a' 重定向到其他规则


---
## 服务
  - todomvc案例文件划分和数据持久化
    1. 为一个控制器创建一个模块,为服务创建一个模块
    2. 主app引入控制器模块, 控制器引入服务的模块
    3. 服务里保存数据和操作数据的方法
    4. 在控制器里调用服务的方法
### 内置服务
#### $log服务

- 打印控制台日志
- 启用或者关闭

#### $timeout

### 自定义服务
