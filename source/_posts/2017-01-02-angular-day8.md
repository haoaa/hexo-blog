---
title: angular-day8
date: 2017-01-02 12:54:16
categories:
  - fe-framework 
  - angular
tags:
  - angular
  - js framework
---
## service

> `$compile`包含`directive`所有属性的说明 [传送门](https://docs.angularjs.org/api/ng/service/$compile)

### service basic

![](/hexo/assets/2017/ng-service.jpg)
<!--more-->
---

## service and factory比较 (provider behind the scene)
- factory create obj and return it
- service only create constructor and let angular do the rest of work



```js
var app = angular.module('app', []);
app.controller('emp', ['$scope','calcFactory', function ($scope, calcFactory) {
    $scope.a = 10;
    $scope.b = 20;

    $scope.dosum = function(){
    calcFactory.getSum($scope.a , $scope.b, function(r){
        $scope.sum = r;
    });
    };
}]);

app.factory('calcFactory',['$http','$log',function($http,$log){
    $log.log('instantiating calcFactory..');
    var oCalcFactory = {};

    oCalcFactory.getSum = function(a,b,cb){
        $http({
            url: 'http://localhost:2345/sum?a=' + a + '&b=' + b,
            method: 'GET'
        }).then(function(resp){
            $log.log(resp.data);
            cb(resp.data);
        },function(resp){
            $log.error('error happened.')
        });
    };
    return oCalcFactory;
}]);

```

```js 
app.service('calcService',['$http','$log',function($http,$log){
    $log.log('instantiating calcService..');

    this.getSum = function(a,b,cb){
        $http({
            url: 'http://localhost:2345/sum?a=' + a + '&b=' + b,
            method: 'GET'
        }).then(function(resp){
            $log.log(resp.data);
            cb(resp.data);
        },function(resp){
            $log.error('error happened.')
        });
    };

}]);
```
---

## provider

![](/hexo/assets/2017/provider.jpg)



```js
app.provider('calc',function(){
    var baseUrl = '';

    this.config = function(url){
        baseUrl = url;
    }
    // $get get called after config phase
    this.$get = ['$http','$log',function($http,$log){
    $log.log('instantiating calcProvider..');
    var oCalcProvider = {};

    oCalcProvider.getSum = function(a,b,cb){
        $http({
            url: baseUrl + '/sum?a=' + a + '&b=' + b,
            method: 'GET'
        }).then(function(resp){
            $log.log(resp.data);
            cb(resp.data);
        },function(resp){
            $log.error('error happened.')
        });
    };

    return oCalcProvider;
}];

})
app.config(['calcProvider', function(calcProvider){
    calcProvider.config('http://localhost:2345');
}]);
```

---
## nodejs/express demo

```js
var express = require('express');
var cors = require('cors');

var app = express();
app.use(cors());

var router = express.Router();

router.get('/sum',function (req, res) {
    var a = req.query.a;
    var b = req.query.b;
    var c =parseInt(a) + parseInt(b);

    res.status(200).json(c);

});

app.use('/',router);

app.listen('2345',function(){
    console.log('start listening on 2345')
});
```

## $templateCache - service in module ng

The first time a template is used, it is loaded in the template cache for quick retrieval.   
You can load templates directly into the cache in a script tag, or by consuming the $templateCache service directly.

* Adding via the $templateCache service:

 ```js
var myApp = angular.module('myApp', []);
myApp.run(function($templateCache) {
  $templateCache.put('templateId.html', 'This is the content of the template');
});
```

* To retrieve the template later, simply use it in your component:

 ```js
myApp.component('myComponent', {
   templateUrl: 'templateId.html'
});
```

- or get it via the $templateCache service:

 ```js
$templateCache.get('templateId.html')
```
