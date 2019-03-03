---
title: webpack under-the-hood
date: 2019-02-27 15:54:32
categories: webpack optimization
tags: webpack
---

## webpack优化

### compiler初始化和注册插件
```js
// `lib/webpack(options, (err, stats) => {})` 在node后面执行, 没有cb就只是创建compiler.  有cb就会顺带执行compiler.run

function webpack(options, callback) {
  compiler = new Compiler();
  compiler.context = options.context;
  compiler.options = options;
  new NodeEnvironmentPlugin().apply(compiler);
  if(options.plugins && Array.isArray(options.plugins)) {
    compiler.apply.apply(compiler, options.plugins);
  }
	if(callback) {
		if(options.watch === true) {
			return compiler.watch(watchOptions, callback);
		}
		compiler.run(callback);
	}
	return compiler;
}
```
<!--more-->

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