---
title: webpack-day1
date: 2016-12-24 19:09:51
categories:
- workflow
tags:
- webpack
---
# webpack day1
## webpack流程

Give webpack the entry point (app.js) and specify an output file (app.bundle.js):

`webpack ./app.js app.bundle.js`

webpack will read and analyze the entry point and its dependencies (including transitive dependencies).   
Then it will bundle them all into app.bundle.js.
<!--more-->

![how webpack works](https://dtinth.github.io/webpack-docs-images/usage/how-it-works.png?imageView/0/w/720)

> 打包后的bundle文件分析  
> [http://www.jianshu.com/p/0e5247f9975f](http://www.jianshu.com/p/0e5247f9975f)  
> [http://www.w2bc.com/Article/50764](http://www.w2bc.com/Article/50764)

---

### 关于[使用CommonsChunkPlugin插件](https://segmentfault.com/a/1190000006814420#articleHeader5)的debug总结

#### CommonsChunkPlugin提前公共模块分析:

 1. `__webpack_require__(2)`的1和2是installedModules[moduleId]里面的1,2

 2. 只是installedModules[每次都会被替换掉,用webpack第二个数组参数]. webpackJsonp([2],[function() /这个function是0/ 后面省略

 3. webpackJsonp([2]这个2是installedChunks的2, installedChunks的0是common模块 (不同场景会有不同情况,通常是起始模块或公用模块)

#### CommonsChunkPlugin按需加载分析

 1. `初始化__webpack_require__(0)`调用
 ```js
 function(module, exports, __webpack_require__) {

	__webpack_require__.e/* nsure */(1, function(require) {
	  var content = __webpack_require__(2);
	  document.open();
	  document.write('<h1>' + content.chunk2 + '</h1>');
	  document.close();
	});
 }
 ```

 2. `__webpack_require__.e`将第二个参数设为异步加载文件后installedChunks[1]的值.

 3. 等待1.bundle.js加载后执行
 ```js
 webpackJsonp([1],[
    /* 0 */,
    /* 1 */
    /***/ function(module, exports) {

        module.exports = 'Hello World';


    /***/ }
]);
```
4. installedChunks[1]的值被设为0, 执行installedChunks[1]里面的回调

#### draw conclusion
 1. CommonsChunkPlugin中只是installedModules是用于加载webpackJsonp,每个installedChunks的临时变量.
 2. jsonp加载的chunk,会把installedModules[0]设为chunk的入口模块,chunk的依赖会缓存到installedModules数组的其他元素上,
 多个chunk公用的模块,会通过设置空index如:`,,`来跳过覆盖.
 3. 按需加载,通过往installedModules[需要加载的模块编号]设置文件加载后的回调,来实现异步加载.

## webpack参数

```js
$ webpack --config XXX.js   //使用另一份配置文件（比如webpack.config2.js）来打包
 
$ webpack --watch   //监听变动并自动打包
 
$ webpack -p    //压缩混淆脚本，这个非常非常重要！
 
$ webpack -d    //生成map映射文件，告知哪些模块被最终打包到哪里了
```