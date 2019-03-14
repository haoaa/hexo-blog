---
title: webpack under-the-hood
date: 2019-02-27 15:54:32
categories: webpack optimization webpack3
tags: webpack optimization
---

## webpack优化

### webpack构建流程
- 初始化：启动构建，读取与合并配置参数，加载 Plugin，实例化 Compiler。
- 编译：从 Entry 发出，针对每个 Module 串行调用对应的 Loader 去翻译文件内容，再找到该 Module 依赖的 Module，递归地进行编译处理。
- 输出：对编译后的 Module 组合成 Chunk，把 Chunk 转换成文件，输出到本地。

- _addModuleChain，其完成的第二件事构建模块又可以分为三部分：
  - 调用loader处理模块之间的依赖
  - 将loader处理后的文件通过[acorn](https://github.com/ternjs/acorn)抽象成抽象语法树AST
  - 遍历AST，构建该模块的所有依赖

<img src="/assets/2019/webpack-flow.png" />

### 流程细节

#### 1. 参数处理
```js
// bin/webpack.js入口
require("./config-yargs")(yargs);

yargs.parse(process.argv.slice(2), (err, argv, output) => {
  // ....
  var options = require("./convert-argv")(yargs, argv);  
  var webpack = require("../lib/webpack.js"); // node_modules/webpack/bin/webpack.js:329
  compiler = webpack(options);
  if(firstOptions.watch || options.watch) {
    compiler.watch(watchOptions, compilerCallback);
  } else {
    compiler.run(compilerCallback);
  }
})
```

```js
// lib/webpack.js入口
// `lib/webpack(options, (err, stats) => {})` 在node后面执行, 没有cb就只是创建compiler.  有cb就会顺带执行compiler.run

function webpack(options, callback) {
  new WebpackOptionsDefaulter().process(options);
  compiler = new Compiler();
  compiler.context = options.context;
  compiler.options = options;
  new NodeEnvironmentPlugin().apply(compiler);
  if(options.plugins && Array.isArray(options.plugins)) {
    compiler.apply.apply(compiler, options.plugins);
  }
  compiler.applyPlugins("environment");
  // node_modules/webpack/lib/webpack.js:36
  compiler.applyPlugins("after-environment");
  compiler.options = new WebpackOptionsApply().process(options, compiler);
  
  // ...
  if(callback) {
    if(options.watch === true) {
      return compiler.watch(watchOptions, callback);
    }
    compiler.run(callback);
  }
  return compiler;
}

```
- WebpackOptionsApply.process根据选项apply对应的插件,如library/externals/devtool, 包括entry-option, 后面会调用addEntry
```js
// webpack3写法
//node_modules/webpack/lib/WebpackOptionsApply.js:234
compiler.apply(new EntryOptionPlugin());
compiler.applyPluginsBailResult("entry-option", options.context, options.entry);

// webpack4写法
//node_modules/webpack/lib/WebpackOptionsApply.js:306
new EntryOptionPlugin().apply(compiler);
compiler.hooks.entryOption.call(options.context, options.entry);
```

#### 2. run 触发compile
- 在run的过程中，会触发了一些钩子：`beforeRun->run->beforeCompile->compile->make->seal`

```js
// node_modules/webpack/lib/Compiler.js:270
// 方法继承自Tapable.prototype.applyPluginsAsync
this.applyPluginsAsync("before-run", this, err => {
  if(err) return callback(err);

  this.applyPluginsAsync("run", this, err => {
    if(err) return callback(err);

    this.readRecords(err => {
      if(err) return callback(err);

      this.compile(onCompiled);
    });
  });
});
```

- 当 Webpack 以开发模式运行时，每当检测到文件变化，一次新的 Compilation 将被创建。 
  + compiler.watch监视依赖文件的修改

```js
// node_modules/webpack/lib/Compiler.js:490
compile(callback) {
  const params = this.newCompilationParams();
  this.applyPluginsAsync("before-compile", params, err => {
    if(err) return callback(err);

    this.applyPlugins("compile", params);

    const compilation = this.newCompilation(params);

    this.applyPluginsParallel("make", compilation, err => {
      if(err) return callback(err);

      compilation.finish();

      compilation.seal(err => {
        if(err) return callback(err);

        this.applyPluginsAsync("after-compile", compilation, err => {
          if(err) return callback(err);

          return callback(null, compilation);
        });
      });
    });
  });
}

```
#### 3. 参数处理
#### 4. 参数处理
#### 5. 参数处理
#### 6. 参数处理

<!--more-->
## 插件问题

### 日志屏蔽copy-webpack-plugin

- 这个插件每移动一个静态文件打一条日志, static下所有图片遮挡了module输出了.
- options.logLevel 提供以下选项
  + warn (default)
  + error
  + silent
- options.debug 提供以下选项
  + warning (default)
  + info
  + debug

> note: debug option was renamed to logLevel in version 5.0, it only accepts string values: trace, debug, info, warn, error and silent

```js
module.exports = {
  plugins: [new CopyPlugin(patterns, options)],
};
// logLevel:silent全屏蔽
module.exports = {
  plugins: [new CopyPlugin(patterns, {logLevel: 'error'})],
};
```

#### 事实是:
这个插件的option配置只是显示插件打印的信息. 默认是没打印的, 所以不需要改动.  
然后看到webpack有个配置是关于控制bundle打印的. `stats: {assets: true}`. 但配置了不起作用. 因为那个默认是通过package.json的scripts配置去执行webpack调用的.
而通过node调用的要自己打印日志信息, 而这个stats的选项要另外传入.   

然后发现只能配置assets不能配置excludeAssets, 看源码发现2.7版本不支持这选项.折腾了一天索然没解决问题, 但对webpack有更深入的理解.

```js
webpack(webpackConfig, function (err, stats) {
  process.stdout.write(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }) + '\n\n')
})
```

### 耗时查看`speed-measure-webpack-plugin`

#### usage
```js
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const smp = new SpeedMeasurePlugin();
const webpackConfig = smp.wrap(webpackConfig);
```


### 其他webpack优化
- 合理配置resolve.extensions，减少文件查找
- module.noParse字段告诉Webpack不必解析哪些文件，可以用来排除对非模块化库文件的解析
- 使用DllPlugin减少基础模块编译次数
- DevServer刷新浏览器有两种方式：
  + 向网页中注入代理客户端代码，通过客户端发起刷新
  + 向网页装入一个iframe，通过刷新iframe实现刷新效果
- Tree Shaking启用要关闭babel模块转换功能            
- 首屏按需加载提高首屏交互速度
  - `import(/* webpackChunkName:show */ './show').then()`
- 多个页面依赖的公共代码提取到common.js中
  ```
    plugins:[
    new CommonsChunkPlugin({
        chunks:['base','common'],
        name:'base',
        //minChunks:2, 表示文件要被提取出来需要在指定的chunks中出现的最小次数，防止common.js中没有代码的情况
    })  
  ```
  - 得到基础库代码base.js，不含基础库的公共代码common.js，和页面各自的代码文件xx.js。
    - 页面引用顺序如下：base.js--> common.js--> xx.js

#### HtmlWebpackPlugin优化, 
#### bundleanalyze拆分公用模块
- 路由异步加载, 公用模块提到common里
#### vendor->dll提高打包速度
- vue全家桶打dll插件打成库

#### 其他优化
- 使用Scope Hoisting,需要源码采用了ES6模块化的，否则Webpack会降级处理不采用Scope Hoisting。
- 配置babel-loader时，use: [‘babel-loader?cacheDirectory’] cacheDirectory用于缓存babel的编译结果，加快重新编译的速度。另外注意排除node_modules文件夹，因为文件都使用了ES5的语法，没必要再使用Babel转换。
- 配置externals，排除因为已使用`<script>`标签引入而不用打包的代码，noParse是排除没使用模块化语句的代码。
- 配置performance参数可以输出文件的性能检查配置。
- 配置profile：true，是否捕捉Webpack构建的性能信息，用于分析是什么原因导致构建性能不佳。
- 配置cache：true，是否启用缓存来提升构建速度。
- 可以使用url-loader把小图片转换成base64嵌入到JS或CSS中，减少加载次数。
- 通过imagemin-webpack-plugin压缩图片，通过webpack-spritesmith制作雪碧图。
- 开发环境下将devtool设置为cheap-module-eval-source-map，因为生成这种source map的速度最快，能加速构建。在生产环境下将devtool设置为hidden-source-map


### 参考
[webpack源码之运行流程](https://segmentfault.com/a/1190000014221014)
[Webpack-源码一，使用require加载并打包模块 webpack2~3](https://blog.csdn.net/qiqingjin/article/details/60579258)
[Webpack-源码二，整体调用流程与Tapable事件流](https://blog.csdn.net/qiqingjin/article/details/71092660)
[深入Webpack-编写Loader](https://juejin.im/post/5a4f3791f265da3e3f4c7ee6)
[干货！撸一个webpack插件(内含tapable详解+webpack流程)](https://juejin.im/post/5beb8875e51d455e5c4dd83f?utm_source=gold_browser_extension#heading-9)
[compiler-hooks](https://webpack.js.org/api/compiler-hooks/)
[Writing a Plugin](https://webpack.js.org/contribute/writing-a-plugin/#creating-a-plugin)
[三十分钟掌握Webpack性能优化](https://juejin.im/post/5b652b036fb9a04fa01d616b)
[理解webpack4.splitChunks之其余要点](https://www.cnblogs.com/kwzm/p/10333554.html)