
---
title: ionic-day1
date: 2016-11-09 8:42:11
tags:
  - ionic
  - hybrid framework
categories:
  - fe-framework 
  - ionic
---
## ionic 的预定义 CSS 类主要分四个方面：

### 基本布局类
  1. ionic将手机页面的布局模式基本抽象为三块：头、内容、尾。
  2. 样式 `.bar` 将元素声明为屏幕上绝对定位的块状区域，具有固定的高度（44px）：
  3. ionic预定义了两个内容容器样式：
     - `content` - 流式定位，内容在文档流中按顺序定位
     - `scroll-content` - 绝对定位，内容元素占满整个屏幕

### 颜色和图标类
  - ionic定义了九种前景/背景/边框的色彩样式：
  - ionic 使用 ionicons [图标样式库](http://ionicons.com/)。
  - 使用图标很简单，在元素上声明以下两个 CSS 类即可：
    + `.icon` - 将元素声明为图标
    + `.ion-{icon-name}` - 声明要使用的具体图标
<!--more-->
### 界面组件类
  1. `.list`定义列表容器， 使用`.item`定义列表成员：
     - 对列表外观的定制化主要集中在.item元素上，.list元素仅有 少数的几个样式定义：
     - 要插入图标，需要满足两个条件：
       + 在.item元素上声明图标位置。图标可以位于列表的左侧或右侧， 分别使用 `.item-icon-left` 和 `.item-icon-right` 声明
       + 在.item元素内插入图标。 例如：`<i class="icon ion-location"></i>`
     - 在ionic中，头像被设置为40x40固定大小：
       + 在.item元素上声明头像位置。头像可以位于列表的左侧或右侧， 分别使用.item-avatar-left和.item-avatar-right声明
       + 在.item元素内使用img标签插入头像。
  2. `.button`
     - 一旦应用了 .button 样式，可以继续选用两类预定义样式来进一步声明元素及其内容的外观：
  同级样式 - 同级样式与.button应用在同一元素上，声明元素的位置、配色等。
     - 下级样式 - 下级样式只能应用在.button的子元素上，声明子元素的大小等特征。
     - button嵌入图标 `<a class="button icon-left ion-home">...</a>`

### 栅格系统类
  - ......

## ionic js

### 基本布局
  - ion-header-bar 属性
    + align-title - 设置标题文字的对齐方式。允许值：left | right | center，默认 center。
    + no-tap-scroll - 当点击标题时是否将内容区域自动滚动到最开始。允许值：true | false，默认为true。
  - ion-footer-bar
  - ion-content
    + ion-content占据header和footer以外的剩余区域。当内容超过可视区域时，ion-content 可以滚动以显示被隐藏的部分。
    + 默认 ionic 自定制的滚动视图，可以使用 overflow-scroll 属性设置使用系统内置的滚动条。

  - ion-tabs
  - ion-tab
    + 不要把ion-tabs指令放在ion-content之内
    + ion-tab的内容应当放入ion-view指令内，否则ionic在计算布局时可能出错
    + 加badge: `<ion-tab badge="1" badge-style="royal"`
  - $ionicTabsDelegate
     - select(index) - 选中指定的选项页。 index参数从0开始，第一个选项页的index为0，第二个为1，依次类推。
     - selectedIndex() - 返回当前选中选项页的索引号。如果当前没有选中的选项页，则返回 -1。

  - ion-list
    + type - 列表种类 list-inset | card。这两种列表 都产生内嵌的效果，区别在于card列表有边框的阴影效果。
    + show-delete - 是否显示成员内的delete（ion-delete-button）按钮
    + show-reorder - 是否显示成员内的reorder（ion-reorder-button）按钮
    + can-swipe - 是否支持滑动方式显示成员option（ion-option-button）按钮
    ```html
        <ion-delete-button class="button button-icon ion-android-delete">
        <ion-reorder-button class="button button-icon ion-navicon-round">
    ```
  - ion-item
  - 如果需要从脚本中控制列表元素，可以使用$ionicListDelegate服务：
    + showReorder([showReorder]) - 显示/关闭排序按钮
    + showDelete([showDelete]) - 显示/关闭删除按钮
    + canSwipeItems([canSwipeItems]) - 是否允许通过滑动方式来显示成员选项按钮
    + closeOptionButtons() - 关闭所有选项按钮


### 路由视图
  - ion-nav-view
    + 在ionic里，我们使用ion-nav-view指令代替AngularUI Route中的 ui-view指令，来进行模板的渲染
    + cache-view - 是否对这个模板视图进行缓存. 允许值为：true | false，默认为true
  - ion-nav-bar
  - ion-nav-back-button

### 表单输入
  - ion-checkbox
  - ion-radio
  ```javascript
    $scope.rank = [1,2,3,4];
    $scope.rankSelected = {
      selected : '3'
    };
  ```
  ```html
    <h5>{{rankSelected.selected}}</h5>
    <ion-radio ng-repeat="item in rank" ng-value="item"  ng-model="rankSelected.selected">{{item}}</ion-radio>
  ```
  - ion-toggle

  - ion-slide-box container
  - ion-slide

  - ion-side-menus container
  - ion-side-menu-content
  - ion-side-menu
## shopping-mall-1

### ionic project stucture
  ```
  ├── bower.json     // bower dependencies
  ├── config.xml     // cordova configuration
  ├── gulpfile.js    // gulp tasks
  ├── hooks          // custom cordova hooks to execute on specific commands
  ├── ionic.project  // ionic configuration
  ├── package.json   // node dependencies
  ├── platforms      // iOS/Android specific builds will reside here
  ├── plugins        // where your cordova/ionic plugins will be installed
  ├── scss           // scss code, which will output to www/css/
  └── www            // application - JS code and libs, CSS, images, etc.
  ```
  - config.xml   `<content src="index.html"/>`配置启动页面
  - index.html的ion-nav-view只能有一个.
  - 项目流程
    1. 在index.html启动页面中引入js文件，引入顺序要注意，因为需要angular中的ng-route的东西，所以要在引入angular.js文件之后引入。
    2. 需要引入ui-router模块
    3. 在html中的某个标签加上ui-view标签，作用就是在页面中挖了一个坑，之后的模板页面就往这里面填。
    4. 在js文件中编写我们的路由。
    5. 根据浏览器地址栏的变化，匹配不同的路由，然后进行模板页面的渲染和控制器的加载。

#### 项目文件管理

  - 控制项目启动的app.js
  - 控制路由跳转的route.js
  - 控制全局变量的global.js
  - 控制不同平台兼容性的config.js

  - 功能模块划分
    - Controller：业务逻辑
    - Factory:数据请求访问，和服务器进行操作。
    - Html页面：功能界面
    - Route:子功能路由js，控制我们的页面跳转。
  - 把js文件在html中引入
  - 在模块js文件中注入需要的服务和模块
#### ui-route
  - 1、抽象路由是不会被单独匹配渲染的，只有配合子路由的实现才能渲染虚拟路由中的模板
  - 2、子路由中的路由名称中的点是有实际意义的，是为了配合虚拟路由，实现父子路由的层级关系。
---
  - 1、在index页面中加入<ion-nav-view></ion-nav-view>标签，
  在ionic中ui-router的ui-view已经被<ion-nav-view>组件封装了，所以不会出现在页面中。
  - 2、要写路由模块的配置信息，通过angular.module.config配置路由信息（设置路由名称，url地址，模板页面，controller）
  -	3、在index.html页面把路由js引进来，在app.js中注入路由模块的功能
  -	4、把页面的功能包裹在ion-view或者是ion-tab标签中
  - 5、根据浏览器中url地址的变化，匹配不同的路由
  -	6、渲染我们的模板页面到相应的<ion-nav-view></ion-nav-view>组件中

#### service的子级概念
  - factory: 返回匿名对象,对象中多是方法(post,get,del)
  - service: 模块返回多个服务,适合用service创建
  - provider: service的底层实现

### Tab模板改造
  - 1.对ion-tabs里面变为四个ion-tab组件
  - 2.对四个ion-tab组件的名称，图标，跳转地址进行了修改，ion-nav-view组件的name属性改掉
  - 3.把tabs的抽象路由给抽取了出来，变为一个功能模块
  - 4.在index页面中引入tabs的相关文件
  - 5.在总路由中注入tabs.route模块

### 动态生成swiper
  - 1、在controller中模拟请求后台数据，把请求回来的数据放到$scope上
  - 2、在html页面中通过ng-repeat指令循环生成slider滑动页
  - 3、初始化swiper对象，注意最好把observeParents，observer这两个属性设置为true.
  - 4、要注意初始化swiper的时间，最好放在$ionicView.afterEnter
中
  - swiper显示bug(最后下一页是第二页)解决:
  ```javascript
  $scope.$on('$ionicView.afterEnter', function(e) {
        initHeaderSlide();
  });
  ```
  - 让swiper不能拖动`<div class="swiper-slide swiper-no-swiping">`

### 延迟加载插件使用步骤
  - 1、用bower进行下载`bower install ion-image-lazy-load --save`
  - 2、在index页面中引入ion-image-lazy-load.js文件
  - 3、在app.js中注入ionicLazyLoad服务
  - 4、在ion-content组件上加上lazy-scroll指令，注意lazy-scroll指令只能作用于Ioni-content组件上。
  - 5、把滚动容器中所有img标签的src属性替换为image-lazy-src
#### 清除缓存
  - `<ion-view id="category" view-title="商品分类" hide-back-button="true" cache-view="false">
`
### Ionic中的路由跳转方式

#### 1、通过代码的方式进行跳转
  - 1.在controller里面注入$state服务
  - 2.在页面中给单击按钮增加单击事件
  - 3.在事件方法里面调用$state.go(“路由名称”)
  ```javascript
    $scope.func_goHome = function ($satate) {
        $state.go('tab.home')
    }
  ```
#### 2、通过href属性进行跳转
  - 注意：写我们跳转的锚记，url地址进行跳转
  - `<ion-tab  href="#/tab/cart">`
#### 3、通过ui-sref属性进行跳转
  - goodsList是`$stateProvider.state('goodsList', {`的名称
  ```html
  <div >
    <li ng-repeat="item in categoryDetailData"
    ui-sref="goodsList({typeNumber:{{item.typeNumber}}})">
      {{item.xxx}}
    </li>
  </div>
  ```

### Ionic中的参数传递
  - 1、先修改路由，在路由中加上参数 `url: '/goodsList/:typeNumber'`
  - 2、将参数进行传递
    - （1）ui-sref：ui-sref="goodsList({typeNumber:1})”
    - （2）`<a href="#/goodsList/34">跳转到商品详细页面</a>`
    - （3）代码跳转 `$state.go('goodsList',{typeNumber:666})`
  - 3、在controller里面注入$stateParams服务，是一个参数对象


### Promise/A+ wtf
  - 1、可以通过链式编程的方式对异步操作进行同步处理
  - 2、上一个操作的输出值是下一个操作的输入值

#### 规范的内容是什么
  - 1、不管进行什么操作都返回一个promise对象，这个对象里面会有一些属性和方法（这个效果类似于jquery中的链式编程，返回自己本身）
  - 2、这个promise有三种状态:Unfulfilled（未完成，初始状态）,Fulfilled（已完成）,Failed（失败、拒绝）
  - 3、这个promise对象的使用时通过then方法进行的调用

#### Promise的实现
  - 因为他只是一个规范，所以在不同的框架或者平台下有不同的实现
  ```
      Angular：$q服务
      Node：q模块，co，then
      Es6:Promise,  yield
      Es7：async  await
  ```
  - 例如
  ```javascript
    return {
      p1 : function () {
        var defer = $q.defer();
        defer.notify({'a':22});
        return defer.promise
      }
    };
  ```

  ```javascript
   var p1 = homeFty.p1();
      p1.then(function (data) {
          console.log(data); //can do the first async request
          return data;//send data to the next then call.
      },
      function (err) {
          console.log('err : ' + err);
      }).then(function (data) {
        //can do the second async request
        console.log('second then : ' + data);
      })
      .finally(function (e) {
          console.log('final '+e);
      })
  ```
---
  - 应用
  ```javascript
 loadMoreGoodsList: function (message) {
    var obj_goodsListData = [1,2,3]
    var deferred = $q.defer();
    deferred.resolve(obj_goodsListData);
    return deferred.promise;
  }
  ```
  - jsonp应用
  ```javascript
   loadMoreGoodsList: function (message) {
      var deferred = $q.defer();
      $http.jsonp(url).success(function (data,status,config,header) {
          deferred.resolve(data);
      }).error(function (data,status,config,header) {
         deferred.resolve(data);
      });
      return deferred.promise;
    }
  ```

### 下拉刷新
  - 刷新动画组件
  ```html
 <ion-refresher
    pulling-text="获取最新数据..."
    refreshing-text="刷新完毕"
    on-refresh="func_refreshGoodsList()">
  </ion-refresher>
   ```

  - 事件监听,页面初始化刷新
  ```javascript
    $scope.$on('$ionicView.beforeEnter', function (e) {
      $scope.func_refreshGoodsList();
    });
  ```
  - 刷新代码
  ```javascript
  // 获取最新数据方法
  $scope.func_refreshGoodsList=function(){
    $scope.pms_isMoreItemsAvailable=true;
    $scope.obj_pagingInfo.pageNum=1;
    $scope.obj_pagingInfo.typeNumber=$stateParams.typeNumber;
    var message=JSON.stringify($scope.obj_pagingInfo);
    // 通过方法获取promise对象
    var promise=GoodsListFty.refreshGoodsList(message);
    // 通过then方法触发状态监听
    promise.then(
      function(data){
        if(data==null){
          $scope.pms_isMoreItemsAvailable=false;
        }else {
          $scope.obj_goodsListData=data;
        }
      },
      function(reason){
      }
    ).finally(function(){
      // 停止广播ion-refresher
      $scope.$broadcast('scroll.refreshComplete');
    });
  }
  ```

### 上拉加载更多
  - 组件(位置要挨着`ion-content`结束标签),ng-if管distance是否有用
  ```html
  <ion-infinite-scroll ng-if="pms_isMoreItemsAvailable"
                       on-infinite="func_loadMoreGoodsList()" distance="1%">
  </ion-infinite-scroll>
  ```
  - code
  ```javascript
      // 加载更多数据方法
      $scope.func_loadMoreGoodsList=function(){
        $ionicLoading.show({
          template: "正在载入数据，请稍后..."
        });


        $scope.obj_pagingInfo.pageNum=$scope.obj_pagingInfo.pageNum+1;
        $scope.obj_pagingInfo.typeNumber=$stateParams.typeNumber;
        var message=JSON.stringify($scope.obj_pagingInfo);
        console.log(message);
        // 通过方法获取promise对象
        var promise=GoodsListFty.refreshGoodsList();
        // 通过then方法触发状态监听
        promise.then(
          function(data){
            console.log(            $scope.pms_isMoreItemsAvailable);
            if($scope.obj_pagingInfo.pageNum==4){
              $scope.pms_isMoreItemsAvailable=false;
            }
            if(data==null){
              $scope.pms_isMoreItemsAvailable=false;
            }else {
              Array.prototype.push.apply($scope.obj_goodsListData, data);
              //$.each(data,function(i,item){
              //  $scope.obj_goodsListData.push(item);
              //})
            }
          },
          function(reason){
          }
        ).finally(function(){
          $scope.$broadcast('scroll.infiniteScrollComplete');
          setTimeout(function(){
            $ionicLoading.hide();
          },1000)
        });
    }
  ```

### indexdb
  -  1、获取浏览器关于indexDB的一些对象，为了浏览器兼容性
  ```javascript
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
    window.IDBCursor = window.IDBCursor || window.webkitIDBCursor || window.msIDBCursor;
  ```
  -  2、定义一些数据库配置信息
  ```javascript
    var dbInfo = {
      dbName:"IndexDB",  // 数据库的名称
      dbVersion:'20111'     // 数据库的版本号
    };
  ```
  -  3、创建数据库连接
  ```javascript
    var dbContent = window.indexedDB.open(dbInfo.dbName, dbInfo.dbVersion);
    //  3.1控制数据库版本升级的方法，创建新store（表），或者是修改，都在这里面执行
    dbContent.onupgradeneeded = function (e) {
      console.log("数据库版本发生变化");
    }
    //  3.2当数据库连接成功的时候执行的方法，我们一般的增删改查都在这里面进行操作
    dbContent.onsuccess = function (e) {
      console.log(e);
      console.log("数据库连接成功");
    }
    dbContent.onerror  = function (e) {

    }
  ```

### ng-cordova
  - 在 cordova插件的sucess和error js回调方法中，
  是无法使用 angularjs的$scope对象和注入的方法的，
  只能访问全局的方法和变量