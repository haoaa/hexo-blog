---
title: vue-template-compile1
date: 2019-04-06 08:35:17
categories: vue模板编译
tags: vue模板编译
---

### anchors
- [入口](#入口)
- [parse](#parse)
  - 
- [optimize](#optimize)
  - 
- [codegen](#codegen)
  - 

### 入口
- 通过loader加载的vue文件都是已经编译过得.
- createCompilerCreator, 缓存了baseCompile(主要编译过程)
- createCompiler, 缓存了baseOptions(平台差异选项); 内部compile方法在处理options(module,directive)后调用baseCompile
- createCompileToFunctionFn对传入option做处理, (缓存编译的render function), 调用createCompiler的内部compile方法, 为ast创建function, 处理编译错误信息等.
```js
var ref$1 = createCompiler(baseOptions);
var compile = ref$1.compile;
var compileToFunctions = ref$1.compileToFunctions;

var ref = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines: shouldDecodeNewlines,
        shouldDecodeNewlinesForHref: shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this);
var render = ref.render;
```

```js
var createCompiler = createCompilerCreator(function baseCompile (
  template,
  options
) {
  // ... parse gencode
});

function createCompilerCreator (baseCompile) {
  return function createCompiler (baseOptions) {
    function compile (
      template,
      options
    ) {
      var finalOptions = Object.create(baseOptions);
      var errors = [];
      var tips = [];
      if (options) {
        // option处理
      }

      finalOptions.warn = warn;

      var compiled = baseCompile(template.trim(), finalOptions);
      if (process.env.NODE_ENV !== 'production') {
        detectErrors(compiled.ast, warn);
      }
      compiled.errors = errors;
      compiled.tips = tips;
      return compiled
    }

    return {
      compile: compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}
```

```js
function createCompileToFunctionFn (compile) {
  var cache = Object.create(null);

  return function compileToFunctions (
    template,
    options,
    vm
  ) {
    options = extend({}, options);
    var warn$$1 = options.warn || warn;
    delete options.warn;

    // detect possible CSP restriction

    // check cache
    var key = options.delimiters
      ? String(options.delimiters) + template
      : template;
    if (cache[key]) {
      return cache[key]
    }

    // compile
    var compiled = compile(template, options);

    // check compilation errors/tips
    if (process.env.NODE_ENV !== 'production') {
    }

    // turn code into functions
    var res = {};
    var fnGenErrors = [];
    res.render = createFunction(compiled.render, fnGenErrors);
    res.staticRenderFns = compiled.staticRenderFns.map(function (code) {
      return createFunction(code, fnGenErrors)
    });

    return (cache[key] = res)
  }
}
```

### parse

#### parse流程
- 通过正则表达式读取标签,属性, 文本等信息
- 开始/结束标签通过栈配对.

```js
export function parse (
  template: string,
  options: CompilerOptions
): ASTElement | void {
  getFnsAndConfigFromOptions(options)

  parseHTML(template, {
    // options ...
    start (tag, attrs, unary) {
      let element = createASTElement(tag, attrs)
      processElement(element)
      treeManagement()
    },

    end () {
      treeManagement()
      closeElement()
    },

    chars (text: string) {
      handleText()
      createChildrenASTOfText()
    },
    comment (text: string) {
      createChildrenASTOfComment()
    }
  })
  return astRootElement
}
```

#### ast创建流程

### optimize


### codegen

