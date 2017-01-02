---
title: angular-day7
date: 2017-01-01 12:07:34
tags:
  - angular
  - js framework
categories:
  - fe-framework 
  - angular
---
## ng progress

1. angular.js included and executed
2. angular module get created 
3. find `templates-dom`:
 - `ng-*` attributes (directives)
 - evaluating expression
 - data-binding markup
4. process templates
 - compile & link
 - transform templates 
5. renders to view

<!--more-->
![angular-process](/hexo/assets/2017/angular-process.png)

## controller
- controller is js object which contain application logic.
  * defined as part of angular module
- send/receive data between dom and application logic.
- usually attached to a dom element using `ng-controller` attribute (instantiated)

## scope is a context. 

When controller instantiate scope is created to glue module and template dom.

### inspect ng-ctrl tag and type `angular.element($0).scope()`在控制台查看$scope内容

```js
Object.keys(angular.element($0).scope())
["$$childTail", "$$childHead", "$$nextSibling", "$$watchers", "$$listeners", "$$listenerCount", "$$watchersCount", "$id", "$$ChildScope", "$parent", "$$prevSibling", "tom", "pai"]

console.log(this=== $scope.tom); //true controller实例是$scope一个属性?
```

修改模型的数据
```js
angular.element($0).scope().name = 'Nick'
angular.element($0).scope().$digest()
```

## scope nest

- inner scope shadow the outer same name member.
- inner scope .__proto__ == outer scope
![](/hexo/assets/2017/scope-nest.jpg)

## 最外层的$rootScope(run只会在模型创建时执行)

```js
var app1 = angular.module('app1', [])
		.run(['$rootScope',function ($rootScope) {
			$rootScope.haha = 'dyjamgo';
		}])
		.run(['$rootScope',function ($rootScope) {
			// do other thing
		}]);
```
![](/hexo/assets/2017/rootScope.jpg)

## data binding

### 3种绑定方式

- one way ng-bind
- two way ng-model
- three way `\{\{::scopemember}}`

![](/hexo/assets/2017/one-way-bind.jpg)
![](/hexo/assets/2017/two-way-bind.jpg)
![](/hexo/assets/2017/one-time-bind.jpg)

