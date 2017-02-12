---
title: angular-day9-directive-scope-compile&link
date: 2017-01-03 22:31:16
categories:
  - fe-framework 
  - angular
tags:
  - scope parameter
  - ng-if ng-repeat ng-show
  - directive scope
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
## directive scope 
### scope spec 

> __The scope property can be false, true, or an object:__

* `false` (default): No scope will be created for the directive. The directive will use its parent's scope.

* `true` : A new child scope that prototypically inherits from its parent will be created for the directive's element. 
If multiple directives on the same element request a new scope, only one new scope is created.

* `{...}` (an object hash): A new "isolate" scope is created for the directive's element. (still can access $parent, there'll nothing on `__proto__`)
The 'isolate' scope differs from normal scope in that it does not prototypically inherit from its parent scope. 
This is useful when creating reusable components, which should not accidentally read or modify data in the parent scope.

---

## directive scope bind(scope parameter)
- 获取的值是设置在指令属性上的,而非模板上的.
 * `reftoparent`是directive scope的, `item`是parent scope的

 ```js
 <g-list tag='list-directive' reftoparent="items[0]">dattass111111</g-list> // here 
 template: '<div ><span>aaaaa</span></div>' // not here
 ```

* `@` or `@attr` :　获取属性的值, 从attr上也可获取 __The result is always a string, bind object use `<` gesus__
 - string value to be passed to directive scope
 - on way bind
 - can be an interpolated string(ng-expression) eg. `{{b}}`
* `=` or `=?attr` or `=*?attr` :　和parent scope的值双向绑定
 - object to be passed to directive scope eg. `b`  `{{b}}` is unacceptable
 - two way bind(between parent and directive scope) 
* `<` or `<?attr` :　单向绑定, 依据$watch来判断, 如果绑定的是对象会出现`双向绑定的结果`
 - object to be passed to directive scope
 - one way bind(between parent and directive scope)
* `&` or `&attr` : 绑定parent scope context的express 引用, usually function reference.
 - function to be accessible from directive scope
 - and directive can execute it

### directive scope mix result
`no scope + no scope`  => Two directives which don't require their own scope will use their parent's scope  
`child scope + no scope`  => Both directives will share one single child scope  
`child scope + child scope`  => Both directives will share one single child scope  
`isolated scope + no scope`  => The isolated directive will use it's own created isolated scope. The other directive will use its parent's scope  
`isolated scope + child scope`  => Won't work! Only one scope can be related to one element. Therefore these directives cannot be applied to the same element.  
`isolated scope + isolated scope`  => Won't work! Only one scope can be related to one element. Therefore these directives cannot be applied to the same element.  

### demo code for scope parameter
```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Document</title>
    <script src="angular.js"></script>
</head>

<body ng-app='myapp'>
    <section ng-controller='ctrl'>
        a: {{a}} b: {{b}} emp.name {{emp.name}} <br>
        <button ng-click="change()">change</button>

        <msg aaa='{{a}}' b=b changeb=change(n,m)></msg>
        <msg  aaa='{{a}}' b=b emp=emp></msg>
    </section>
</body>
<script type="text/javascript">
    var module = angular.module('myapp', [ ]);

    module.controller('ctrl', ['$scope', '$parse', '$interpolate', function ($scope, $parse, $interpolate) {
        $scope.a = 1;
        $scope.b = 2;
        $scope.emp = {name:'tommy',age:'22'};
        $scope.change = function (n1, n2) {
            $scope.b = 30 * n1 * n2;
        };
    }]);

    module.directive('msg', function () {
        return {
            templateUrl: 'templateId.html',
            scope: {
                a : '@aaa',
                b : '=',
                change : '&changeb' ,
                employee : '<emp'            
            },
            controller: function ($scope, $element, $attrs) {
                // $scope.c = 100;
                $scope.changeObj = function () {
                    // $scope.employee.name = 'cccc'; //two way bind? 
                     $scope.employee = {name:'kong',age:30};
                }
            }
        }
    });

    module.run(function ($templateCache) {
        $templateCache.put('templateId.html', '<div>a = {{a}} b = {{b}}  </br> emp.name {{employee.name}} ' +
         '<button ng-click="change({n:2,m:3})">directive</button> <button ng-click="changeObj()">changeEmpname</button> </div>');
    });
</script>

</html>
```

---

## demo code FOR directives link&compile and scope
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