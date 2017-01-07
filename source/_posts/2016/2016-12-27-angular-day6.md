---
title: angular-day6
date: 2016-12-27 09:03:34
tags:
  - angular
  - js framework
  - compile link
  - scope
categories:
  - fe-framework 
  - angular
---
# angular directive
## concept of compiler

Compiler is an Angular service which traverses the DOM looking for attributes. The compilation process happens in two phases.

1. Compile: traverse the DOM and collect all of the directives. The result is a linking function.

1. Link: combine the directives with a scope and produce a live view. Any changes in the scope model are reflected in the view, and any user interactions with the view are reflected in the scope model. This makes the scope model the single source of truth.

Some directives such as ng-repeat clone DOM elements once for each item in a collection. Having a compile and link phase improves  
 performance since the cloned template only needs to be compiled once, and then linked once for each clone instance.

---

<!--more-->
## directive two way binding

![https://docs.angularjs.org/img/Two_Way_Data_Binding.png](https://docs.angularjs.org/img/Two_Way_Data_Binding.png)

The Angular approach produces a stable DOM. The DOM element instance bound to a model item instance does not change for the lifetime of the binding.   
This means that the code can get hold of the elements and register event handlers and know that the reference will not be destroyed by template data merge.

## How directives are compiled

1. `$compile` traverses the DOM (children directives)and matches directives.

2. Once all directives matching a DOM element have been identified, the compiler sorts the directives by their priority.

   Each directive's compile functions are executed. Each compile function has a chance to modify the DOM. Each compile function returns a link function. These functions are composed into a "combined" link function, which invokes each directive's returned link function.

3. `$compile` links the template with the scope by calling the combined linking function from the previous step. This in turn will call the linking function of the individual directives, registering listeners on the elements and setting up $watchs with the scope as each directive is configured to do.

```js
var $compile = ...; // injected into your code
var scope = ...;
var parent = ...; // DOM element where the compiled template can be appended

var html = '<div ng-bind="exp"></div>';

// Step 1: parse HTML into DOM element
var template = angular.element(html);

// Step 2: compile the template
var linkFn = $compile(template);

// Step 3: link the compiled template with the scope.
var element = linkFn(scope);

// Step 4: Append to DOM (optional)
parent.appendChild(element);
```

[angularjs指令中的compile与link函数详解](http://www.jb51.net/article/58229.htm)

## angular component 

[check out origin](https://plnkr.co/edit/tpl:8rFfZljYNl3z1A4LKSL2)

```js
angular.module('hello').component('hello', {
  template:  '<h3>{{$ctrl.greeting}} galaxy!</h3>' +
             '<button ng-click="$ctrl.toggleGreeting()">toggle greeting</button>',
             
  controller: function() {
    this.greeting = 'hello';
    
    this.toggleGreeting = function() {
      this.greeting = (this.greeting == 'hello') ? 'whats up' : 'hello'
    }
  }
})
```

### compile&link四阶段

![](/assets/2016/compile&link_process.png)

---
#### [youtube tutorial] 

- compile  
  scope还没创建, instance dom没创建, 可以操作template DOM
- controller  
  scope创建, 不推荐操作instance dom,因为child not ready.可以操作data for instance dom.
- pre(link)  
  template instance, child elements/directives not ready, instance is not linked to scope yet, safe to set child data.
- post(link)  
  scope and instance linked, child elements/directives ready, template available to manipulate and attach event. Not safe to set child data.(its already done)
  * if transclude is true, the inner content is replaced in this phase rather than prelink

### directive直接return的是link的post function

### 嵌套指令的执行顺序:　

  p->compile c->compile p->controller p->pre c->controller c->pre c->post p->post    

  (p:parent, c:child recursive call pre function)

---
## transclude refer outer scope
  Its value (=info) tells $compile to bind to the info attribute.  

  & bindings are ideal for binding callback functions to directive behaviors.

### scope to inspect

- false (default): No scope will be created for the directive. The directive will use its parent's scope.

- true: A new child scope that prototypically inherits from its parent will be created for the directive's element. If multiple directives on the same element request a new scope, only one new scope is created.

- {...} (an object hash): A new "isolate" scope is created for the directive's element. The 'isolate' scope differs from normal scope in that it does not prototypically inherit from its parent scope.   
  This is useful when creating reusable components, which should not accidentally read or modify data in the parent scope.  
---
## [directive scope inspect](https://plnkr.co/edit/?p=preview)

```js
  .directive('myDialog', function() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {}, //声明了scope,下面link就使用directive的isolate scope,否则就inherite parent's scope.???
      templateUrl: 'my-dialog.html',
      link: function(scope) {
        scope.name = 'Jeff';
      }
    };
  });
```

---
## directive require 属性
- ^^ :查找parent controller
- ^ : 查找注入,parent 或 it's own controller
- without any prefix, the directive would look on its own element's controller only.

---

## 创建指令就是返回Directive Definition Object或postlink函数

```js
var myModule = angular.module(...);

myModule.directive('directiveName', function factory(injectables) {
  var directiveDefinitionObject = {
    priority: 0,
    template: '<div></div>', // or // function(tElement, tAttrs) { ... },
    // or
    // templateUrl: 'directive.html', // or // function(tElement, tAttrs) { ... },
    transclude: false,
    restrict: 'A',
    templateNamespace: 'html',
    scope: false,
    controller: function($scope, $element, $attrs, $transclude, otherInjectables) { ... },
    controllerAs: 'stringIdentifier',
    bindToController: false,
    require: 'siblingDirectiveName', // or // ['^parentDirectiveName', '?optionalDirectiveName', '?^optionalParent'],
    multiElement: false,
    compile: function compile(tElement, tAttrs, transclude) {
      return {
         pre: function preLink(scope, iElement, iAttrs, controller) { ... },
         post: function postLink(scope, iElement, iAttrs, controller) { ... }
      }
      // or
      // return function postLink( ... ) { ... }
    },
    // or
    // link: {
    //  pre: function preLink(scope, iElement, iAttrs, controller) { ... },
    //  post: function postLink(scope, iElement, iAttrs, controller) { ... }
    // }
    // or
    // link: function postLink( ... ) { ... }
  };
  return directiveDefinitionObject;
});
```
Therefore the above can be simplified as:

var myModule = angular.module(...);

```js
myModule.directive('directiveName', function factory(injectables) {
  var directiveDefinitionObject = {
    link: function postLink(scope, iElement, iAttrs) { ... }
  };
  return directiveDefinitionObject;
  // or
  // return function postLink(scope, iElement, iAttrs) { ... }
});
```

---

## 指令life-cycle  
 [https://docs.angularjs.org/api/ng/service/$compile#Life-cycle%20hooks](https://docs.angularjs.org/api/ng/service/$compile#Life-cycle%20hooks) 