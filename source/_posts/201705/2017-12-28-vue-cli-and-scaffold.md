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
