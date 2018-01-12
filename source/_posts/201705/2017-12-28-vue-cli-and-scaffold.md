---
title: vue-cli-and-scaffold
date: 2017-12-28 19:51:27
categories: 
tags: vue-cli babel
---
### babel [preset](http://2ality.com/2017/02/babel-preset-env.html)

- Presets are sharable .babelrc configs or simply an array of babel plugins.
- `Babel-preset-env` replaces es2015, es2016, es2017, latest
- With most of the new feature covered usually will use "stage-2"(Stage 2 - Draft: initial spec.)
```js
{
  "presets": [
    ["env", {
      "modules": false,
      "targets": {
        "browsers": ["> 1%", "last 2 versions", "not ie <= 8"]
      }
    }],
    "stage-2" // why ???
  ]
}
```

### e2e test
- `npm i`的时候chromedriver下载失败, 可通过配置解决
```sh
npm confit set  chromedriver_cdnurl  "https://npm.taobao.org/mirrors/chromedriver"
```
### Fixing Linting Errors
`npm run lint -- --fix`
(The -- in the middle is necessary to ensure the --fix option is passdd to eslint, not to npm)

### Asset Resolving Rules
Root-relative URLs, e.g. `/assets/logo.png` are not processed at all.

### "Real" Static Assets
In comparison, files in static/ are not processed by Webpack at all: they are directly copied to their final destination as-is, with the same filename.

Any file placed in static/ should be referenced using the absolute URL /static/[filename].