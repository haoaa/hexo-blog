---
title: angular-day9
date: 2017-01-03 22:31:16
categories:
  - fe-framework 
  - angular
tags:
  - angular
  - js framework ng-if ng-repeat 
  - scope 
  - directive
---

## ng-directive & scope & compile & link
### ng-if
- if false template will not render to dom
- create a scope for itself
- evaluation expression based on the scope

### ng-show/hide
- it won't create scope for this directive
- evaluation expression based on parent's scope
<!--more-->
### ng-repeat
- creates a scope for each instantiated template(item)

---
## scope 
### scope spec 

> __The scope property can be false, true, or an object:__

* `false` (default): No scope will be created for the directive. The directive will use its parent's scope.

* `true` : A new child scope that prototypically inherits from its parent will be created for the directive's element. 
If multiple directives on the same element request a new scope, only one new scope is created.

* `{...}` (an object hash): A new "isolate" scope is created for the directive's element. 
The 'isolate' scope differs from normal scope in that it does not prototypically inherit from its parent scope. 
This is useful when creating reusable components, which should not accidentally read or modify data in the parent scope.

### scope bind
- 获取的值是设置在指令属性上的,而非模板上的.

 ```js
 <g-list tag='list-directive' reftoparent="items[0]">dattass111111</g-list> // here 
 template: '<div ><span>aaaaa</span></div>' // not here
 ```

* `@` or `@attr` :　获取属性的值, 从attr上也可获取
* `=` or `=?attr` or `=*?attr` :　和parent scope的值双向绑定
* `<` or `<?attr` :　单向绑定, 依据$watch来判断, 如果绑定的是对象会出现`双向绑定的结果`
* `&` or `&attr` : 绑定parent scope context的express 引用, usually function reference.

### scope mix result
`no scope + no scope`  => Two directives which don't require their own scope will use their parent's scope  
`child scope + no scope`  => Both directives will share one single child scope  
`child scope + child scope`  => Both directives will share one single child scope  
`isolated scope + no scope`  => The isolated directive will use it's own created isolated scope. The other directive will use its parent's scope  
`isolated scope + child scope`  => Won't work! Only one scope can be related to one element. Therefore these directives cannot be applied to the same element.  
`isolated scope + isolated scope`  => Won't work! Only one scope can be related to one element. Therefore these directives cannot be applied to the same element.  

### demo code 
demo.html

```js
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
	<title>Document</title>
	<script src="angular.js"></script>
</head>
<body ng-app='myApp'>
	<div ng-controller="listController">
		<g-list tag='list-directive' reftoparent="items[0]">items belong outter controller</g-list>
		<g-list tag='list-directive-els'  reftoparent="items[2]">dattass222222</g-list>

	</div>
</body>
<script src="list.js"></script>
</html>
```

list.js

```js
(function(angular) {
	var module = angular.module('myApp', []);
	var jq = angular.element;
	module.controller('listController', ['$window', '$scope', function($w, $scope) {
		console.log($w.offsetHeight);
		$scope.items = [{
			"id": 1
		}, {
			"id": 2
		}, {
			"id": 3
		}, {
			"id": 4
		}];
	}]);

	module.directive('gList', function() {
		return {
			template: '<div ><span>aaaaa</span></div>', // or // function(tElement, tAttrs) { ... },
			// or
			// templateUrl: 'directive.html', // or // function(tElement, tAttrs) { ... },
			transclude: false, 
			scope: {
				reftoparent : '<reftoparent'
			},
			controller: function($scope, $element, $attrs, $transclude) { 
				console.log("controller: " + $element[0].innerHTML);

			},
			// controllerAs: 'ctlas',
			require: '?^listController', // or // ['^parentDirectiveName', '?optionalDirectiveName', '?^optionalParent'],
			compile: function compile(tElement, tAttrs, transclude) {
				tElement.append(jq('<i>{{myattr}}italic{{reftoparent.id}}</i>').append(tElement.contents()));
				// tElement[0].append('<i>italic</i>');
				console.log("compile: " + tElement[0].innerHTML);
				return {
					pre: function preLink(scope, iElement, iAttrs, controller) {
						console.log('prelink: ' + iElement[0].innerHTML);
						scope.$parent.items[0].id ='9587' + iAttrs.tag;
						scope.myattr = iAttrs.tag;
					},
					post: function postLink(scope, iElement, iAttrs, controller) {
						console.log('postlink: ' + iElement[0].innerHTML);
					}
				} 
				// 1.transclude means template with ng-transclude directives . it's content 
				// will replace with tag's content.
				// or
				// return function postLink(  ) { ... }
			},
			// or
			// link: {
			//  pre: function preLink(scope, iElement, iAttrs, controller) { ... },
			//  post: function postLink(scope, iElement, iAttrs, controller) { ... }
			// }
			// or
			// link: function postLink( ... ) { ... }
		};
	});
})(angular);
```