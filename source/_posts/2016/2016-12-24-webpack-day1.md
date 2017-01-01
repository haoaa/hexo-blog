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

## webpack参数

```js
$ webpack --config XXX.js   //使用另一份配置文件（比如webpack.config2.js）来打包
 
$ webpack --watch   //监听变动并自动打包
 
$ webpack -p    //压缩混淆脚本，这个非常非常重要！
 
$ webpack -d    //生成map映射文件，告知哪些模块被最终打包到哪里了
```