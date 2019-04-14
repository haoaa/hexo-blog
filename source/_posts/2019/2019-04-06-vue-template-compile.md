---
title: vue-template-compile
date: 2019-04-06 08:35:17
categories: vue模板编译
tags: vue模板编译
---

### anchors
- [入口](#入口)
- [parse](#parse)
  - [parse流程](#parse流程)
  - [parseHTML](#parseHTML)
    + [startElement](#startElement)
    + [endElement](#endElement)
    + [text](#text)
  - [conerCases](#conerCases)
- [optimize](#optimize)
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
<!--more-->
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
- 通过正则表达式读取标签,属性, 文本注释等信息
- 开始/结束标签通过栈配对.

```js
function parse ( template, options ): ASTElement | void {
  // 选项处理
  warn$2 = options.warn || baseWarn;
  platformIsPreTag = options.isPreTag || no;
  platformMustUseProp = options.mustUseProp || no;
  platformGetTagNamespace = options.getTagNamespace || no;

  transforms = pluckModuleFunction(options.modules, 'transformNode');
  preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
  postTransforms = pluckModuleFunction(options.modules, 'postTransformNode');

  delimiters = options.delimiters;
  var stack = []; // 保存节点层级关系
  var currentParent; // 父子关联
  parseHTML(template, {
    warn: warn$2,
    expectHTML: options.expectHTML,
    isUnaryTag: options.isUnaryTag,
    canBeLeftOpenTag: options.canBeLeftOpenTag,
    shouldDecodeNewlines: options.shouldDecodeNewlines,
    shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,
    shouldKeepComment: options.comments,
    // 对应字符处理的方法从option传入
    start (tag, attrs, unary) {
      let element = createASTElement(tag, attrs, currentParent)
      // 处理 for/if等指令逻辑
      if (!element.processed) {
        // structural directives
        processFor(element);
        processIf(element);
        processOnce(element);
        // element-scope stuff
        processElement(element, options);
      }
      // 处理父子关联 element.parent = currentParent; 
    },

    end () {
      var element = stack[stack.length - 1];
      // pop stack
      stack.length -= 1;
      currentParent = stack[stack.length - 1];
      closeElement()
    },

    chars (text: string) {
      // 添加文本ast 节点
    },
    comment (text: string) {
      currentParent.children.push({
        type: 3,
        text: text,
        isComment: true
      });
    }
  })
  return astRootElement
}

<img src="/assets/2019/vue-template-parse.png" />
```

#### parseHTML
- 从头到尾按正则匹配出开始,结束标签, 文本注释等 
- ast node type: 1:元素节点 2:expression text node 3:plain text node
- parse->stack用ast node层级关系缓存, parseHTML->stack用ast node层级关系缓存
  + 一个读数标签属性, 一个构建ast. 都是类似层级结构
  + handleStartTag `stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs });`
  + start `stack.push(element);`

```js
var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 属性xx=yy
var ncname = '[a-zA-Z_][\\w\\-\\.]*';
var qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")";
var startTagOpen = new RegExp(("^<" + qnameCapture));
var startTagClose = /^\s*(\/?)>/;
var endTag = new RegExp(("^<\\/" + qnameCapture + "[^>]*>"));
var doctype = /^<!DOCTYPE [^>]+>/i;
var comment = /^<!\--/;
var conditionalComment = /^<!\[/;
```  
```js
export function parseHTML (html, options) {
  var stack = [];
  let lastTag
  while (html) {
    if (!lastTag || !isPlainTextElement(lastTag)){
      let textEnd = html.indexOf('<')
      if (textEnd === 0) {
         if(matchComment) { // 匹配到各类型的节点进行相应的处理
           advance(commentLength) 
           continue
         }
         if(matchDoctype) {
           advance(doctypeLength)
           continue
         }
         if(matchEndTag) {
           advance(endTagLength)
           parseEndTag()
           continue
         }
         parseStartTag()
         if(matchStartTag) {
           handleStartTag()
           continue
         }
      }
      handleText()
      advance(textLength)
    } else {
       handlePlainTextElement()
       parseEndTag()
    }
  }
  // Clean up any remaining tags
  parseEndTag();
}
```
##### startElement
- `parseStartTag`通过正则获取属性,标签等信息, 开始标签的结尾index.
- `handleStartTag`处理自闭合标签, attrs转为`{name, value}`格式, 记录lastTag, 调用`options.start`
- `options.start`创建ast节点, 往ast上添加所有属性的, 处理层级关系
  + preTransforms处理`src/platforms/web/compiler/modules`里module的`preTransforms`、` transforms`处理在`processElement`里
  + 处理for,if,once指令
  + 处理层级关系
    ```js
      currentParent = element
      stack.push(element)
      currentParent = element
      stack.push(element)
    ```
```js
// Start tag:
var startTagMatch = parseStartTag();
if (startTagMatch) {
  handleStartTag(startTagMatch);
  continue
}

function parseStartTag () {
    var start = html.match(startTagOpen);
    if (start) {
      var match = {
        tagName: start[1],
        attrs: [],
        start: index
      };
      advance(start[0].length);
      var end, attr;
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        advance(attr[0].length);
        match.attrs.push(attr);
      }
      if (end) {
        match.unarySlash = end[1];
        advance(end[0].length);
        match.end = index;
        return match
      }
    }
  }

  function handleStartTag (match) {
    var tagName = match.tagName;
    var unarySlash = match.unarySlash;

    var unary = isUnaryTag$$1(tagName) || !!unarySlash;

    var l = match.attrs.length;
    var attrs = new Array(l);
    for (var i = 0; i < l; i++) {
      var args = match.attrs[i];
      var value = args[3] || args[4] || args[5] || '';
      attrs[i] = {
        name: args[1],
        value: value
      };
    }
    if (!unary) {
      // parseHTML的stack
      stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs });
      lastTag = tagName;
    }

    if (options.start) {
      options.start(tagName, attrs, unary, match.start, match.end);
    }
  }

```
```js
function start (tag, attrs, unary) {
  var element = createASTElement(tag, attrs, currentParent);

  // apply pre-transforms
  for (var i = 0; i < preTransforms.length; i++) {
    element = preTransforms[i](element, options) || element;
  }

  if (!element.processed) {
    // structural directives
    processFor(element);
    processIf(element);
    processOnce(element);
    // element-scope stuff
    processElement(element, options);
  }

  // tree management
}

```
```js
// v-if处理
function processIf (el) {
  var exp = getAndRemoveAttr(el, 'v-if'); // 留attrsMap的映射关系
  if (exp) {
    el.if = exp;
    addIfCondition(el, {
      exp: exp,
      block: el
    });
  } else {
    if (getAndRemoveAttr(el, 'v-else') != null) {
      el.else = true;
    }
    var elseif = getAndRemoveAttr(el, 'v-else-if');
    if (elseif) {
      el.elseif = elseif;
    }
  }
}

function addIfCondition (el, condition) {
  if (!el.ifConditions) {
    el.ifConditions = [];
  }
  el.ifConditions.push(condition);
}

// 其他属性的处理
function processElement (element, options) {
  processKey(element);

  // determine whether this is a plain element after
  // removing structural attributes
  element.plain = !element.key && !element.attrsList.length;

  processRef(element);
  processSlot(element);
  processComponent(element);
  for (var i = 0; i < transforms.length; i++) {
    element = transforms[i](element, options) || element; // static class/style处理
  }
  processAttrs(element); // 剩余属性处理(modifier等)
}
```
```js
// tree management
if (!root) {
  root = element;
} else if (!stack.length) {
  // allow root elements with v-if, v-else-if and v-else
}
if (currentParent && !element.forbidden) {
  if (element.elseif || element.else) {
  } else if (element.slotScope) { // scoped slot
  } else {
    currentParent.children.push(element);
    element.parent = currentParent;
  }
}
if (!unary) {
  currentParent = element;
  stack.push(element);
} else {
  closeElement(element);
}
```

##### endElement
- 通过stack找到闭合标签对应的开始标签的ast节点, 调用`options.end`
```js
// 匹配后调用parseEndTag处理
const endTagMatch = html.match(endTag)
if (endTagMatch) {
  const curIndex = index
  advance(endTagMatch[0].length)
  parseEndTag(endTagMatch[1], curIndex, index)
  continue
}


function parseEndTag (tagName, start, end) {
  let pos, lowerCasedTagName
  if (start == null) start = index
  if (end == null) end = index
  // 找到最近的开始标签
  if (tagName) {
    for (pos = stack.length - 1; pos >= 0; pos--) {
      if (stack[pos].lowerCasedTag === lowerCasedTagName) {
        break
      }
    }
  } else {
    pos = 0
  }
  
  if (pos >= 0) {
    for (let i = stack.length - 1; i >= pos; i--) {
      if (options.end) {
        options.end(stack[i].tag, start, end)
      }
    }
    stack.length = pos
    lastTag = pos && stack[pos - 1].tag
  } 
  // br p标签处理
}
```

```js
function end () {
  // remove trailing whitespace
  var element = stack[stack.length - 1];
  var lastNode = element.children[element.children.length - 1];
  if (lastNode && lastNode.type === 3 && lastNode.text === ' ' && !inPre) {
    element.children.pop();
  }
  // pop stack
  stack.length -= 1;
  currentParent = stack[stack.length - 1];
  closeElement(element); //没干啥
}
```

##### text
- 截取文本, 创建(表达式/普通)文本节点

```js
let text, rest, next
if (textEnd >= 0) {
  rest = html.slice(textEnd)
  while (
    !endTag.test(rest) && // 剩下的字符有没有结束标签, 不是注释, 就追加文本到text
    !startTagOpen.test(rest) &&
    !comment.test(rest) &&
    !conditionalComment.test(rest)
  ) {
    next = rest.indexOf('<', 1)
    if (next < 0) break
    textEnd += next
    rest = html.slice(textEnd)
  }
  text = html.substring(0, textEnd)
  advance(textEnd)
}

if (textEnd < 0) {  //template 解析完毕
  text = html
  html = ''
}

if (options.chars && text) {
  options.chars(text)
}
```

```js
function chars (text) {
  if (!currentParent) {
    // template不能是纯文本, 开头不能有文本
    return
  }  
  var children = currentParent.children;
  text = inPre || text.trim()
    ? isTextTag(currentParent) ? text : decodeHTMLCached(text)
    // only preserve whitespace if its not right after a starting tag
    : preserveWhitespace && children.length ? ' ' : '';
  if (text) {
    var res;
    if (!inVPre && text !== ' ' && (res = parseText(text, delimiters))) {
      children.push({
        type: 2,
        expression: res.expression,
        tokens: res.tokens,
        text: text
      });
    } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
      children.push({
        type: 3,
        text: text
      });
    }
  }
}

// 处理expression text node, 分文本token和标签token, 返回拼接的vnode创建表达式和绑定标签
function parseText (
  text,
  delimiters
) {
  var tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;
  if (!tagRE.test(text)) {
    return
  }
  var tokens = [];
  var rawTokens = [];
  var lastIndex = tagRE.lastIndex = 0;
  var match, index, tokenValue;
  while ((match = tagRE.exec(text))) {
    index = match.index;
    // push text token
    if (index > lastIndex) {
      rawTokens.push(tokenValue = text.slice(lastIndex, index));
      tokens.push(JSON.stringify(tokenValue));
    }
    // tag token
    var exp = parseFilters(match[1].trim());
    tokens.push(("_s(" + exp + ")"));
    rawTokens.push({ '@binding': exp });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    rawTokens.push(tokenValue = text.slice(lastIndex));
    tokens.push(JSON.stringify(tokenValue));
  }
  return {
    expression: tokens.join('+'), // '_s(item)+":"+_s(index)', _s创建文本vnode
    tokens: rawTokens  // [{'@binding':'item'},':',{'@binding':'index'}]
  }
}

```


#### conerCases
- [h5元素嵌套规则](http://www.5icool.org/a/201308/a2081.html)
- 块级元素不能放在<p>里面, `<p><div></div></p>` => `<p></p><div></div><p></p>`
  - lastTag是p, div不是phrasing tag, 就插入结束标签, 调用`parseEndTag(lastTag);`把p从stack移除
```js
 function handleStartTag (match) {
    var tagName = match.tagName;
    var unarySlash = match.unarySlash;

    if (expectHTML) {
      if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
        parseEndTag(lastTag);
      }
      if (canBeLeftOpenTag$$1(tagName) && lastTag === tagName) {
        parseEndTag(tagName); // p里嵌套p也是一样的处理
      }
    }

    var unary = isUnaryTag$$1(tagName) || !!unarySlash;

    if (!unary) {
      stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs });
      lastTag = tagName;
    }

    if (options.start) {
      options.start(tagName, attrs, unary, match.start, match.end);
      //  if (!unary) {
      //   currentParent = element;
      //   stack.push(element);
      // }
    }
  }
```

```js
 function parseEndTag (tagName, start, end) {
    var pos, lowerCasedTagName;

    // Find the closest opened tag of the same type
    if (tagName) {
    } else {
      // If no tag name is provided, clean shop
      pos = 0;
    }

    if (pos >= 0) {
      // Close all the open elements, up the stack
      for (var i = stack.length - 1; i >= pos; i--) {
        if (options.end) {
          options.end(stack[i].tag, start, end); // <p> 闭合p开始标签
        }
      }

      // Remove the open elements from the stack
      stack.length = pos;
      lastTag = pos && stack[pos - 1].tag;
    } else if (lowerCasedTagName === 'br') {
      if (options.start) {
        options.start(tagName, [], true, start, end);
      }
    } else if (lowerCasedTagName === 'p') { // </p> 闭合p结束标签
      if (options.start) {
        options.start(tagName, [], false, start, end);
      }
      if (options.end) {
        options.end(tagName, start, end);
      }
    }
  }
  ```

### optimize
- ast优化, 标记静态节点, 静态子树. 避免不会变化的节点重新渲染. 
  - 提取未常量
  - 跳过patch
- 静态节点, 有一个子节点不是静态, 这个节点也就不是静态. 此节点有ifCondition也需要所有的判断是静态的
  - 判断规则`isStatic`: 如果是表达式，就是非静态；如果是纯文本，就是静态；...
- 静态子树  
  - 至少一个非文本静态节点
  - 所有子节点和当前节点标记了静态
  - 深度遍历
```js
/**
 * Goal of the optimizer: walk the generated template AST tree
 * and detect sub-trees that are purely static, i.e. parts of
 * the DOM that never needs to change.
 *
 * Once we detect these sub-trees, we can:
 *
 * 1. Hoist them into constants, so that we no longer need to
 *    create fresh nodes for them on each re-render;
 * 2. Completely skip them in the patching process.
 */
function optimize (root, options) {
  if (!root) { return }
  isStaticKey = genStaticKeysCached(options.staticKeys || '');
  isPlatformReservedTag = options.isReservedTag || no;
  // first pass: mark all non-static nodes.
  markStatic$1(root);
  // second pass: mark static roots.
  markStaticRoots(root, false);
}

function genStaticKeys$1 (keys) {
  return makeMap(
    'type,tag,attrsList,attrsMap,plain,parent,children,attrs' +
    (keys ? ',' + keys : '')
  )
}
```

```js
function markStatic$1 (node) {
  node.static = isStatic(node);
  if (node.type === 1) {
    // do not make component slot content static. this avoids
    // 1. components not able to mutate slot nodes
    // 2. static slot content fails for hot-reloading
    if (
      !isPlatformReservedTag(node.tag) &&
      node.tag !== 'slot' &&
      node.attrsMap['inline-template'] == null
    ) {
      return
    }
    for (var i = 0, l = node.children.length; i < l; i++) {
      var child = node.children[i];
      markStatic$1(child);
      if (!child.static) {
        node.static = false;
      }
    }
    if (node.ifConditions) {
      for (var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
        var block = node.ifConditions[i$1].block;
        markStatic$1(block);
        if (!block.static) {
          node.static = false;
        }
      }
    }
  }
}


function isStatic (node) {
  if (node.type === 2) { // expression
    return false
  }
  if (node.type === 3) { // text
    return true
  }
  return !!(node.pre || (
    !node.hasBindings && // no dynamic bindings
    !node.if && !node.for && // not v-if or v-for or v-else
    !isBuiltInTag(node.tag) && // not a built-in
    isPlatformReservedTag(node.tag) && // not a component
    !isDirectChildOfTemplateFor(node) &&
    Object.keys(node).every(isStaticKey)
  ))
}

```
```js
function markStaticRoots (node, isInFor) {
  if (node.type === 1) {
    if (node.static || node.once) {
      node.staticInFor = isInFor;
    }
    // For a node to qualify as a static root, it should have children that
    // are not just static text. Otherwise the cost of hoisting out will
    // outweigh the benefits and it's better off to just always render it fresh.
    if (node.static && node.children.length && !(
      node.children.length === 1 &&
      node.children[0].type === 3
    )) {
      node.staticRoot = true;
      return
    } else {
      node.staticRoot = false;
    }
    if (node.children) {
      for (var i = 0, l = node.children.length; i < l; i++) {
        markStaticRoots(node.children[i], isInFor || !!node.for);
      }
    }
    if (node.ifConditions) {
      for (var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
        markStaticRoots(node.ifConditions[i$1].block, isInFor);
      }
    }
  }
}
```
### codegen
- gencode创建vnode相关的util方法在`function installRenderHelpers (target){}`
- 通过深度遍历VST创建render函数字符串.
```js
function generate (
  ast,
  options
) {
  var state = new CodegenState(options);
  var code = ast ? genElement(ast, state) : '_c("div")';
  return {
    render: ("with(this){return " + code + "}"),
    staticRenderFns: state.staticRenderFns
  }
}

function genElement (el, state) {
  if (el.parent) {
    el.pre = el.pre || el.parent.pre;
  }

  if (el.staticRoot && !el.staticProcessed) {
    return genStatic(el, state)
  } else if (el.once && !el.onceProcessed) {
    return genOnce(el, state)
  } else if (el.for && !el.forProcessed) {
    return genFor(el, state)
  } else if (el.if && !el.ifProcessed) {
    return genIf(el, state)
  } else if (el.tag === 'template' && !el.slotTarget && !state.pre) {
    return genChildren(el, state) || 'void 0'
  } else if (el.tag === 'slot') {
    return genSlot(el, state)
  } else {
    // component or element
    var code;
    if (el.component) {
      code = genComponent(el.component, el, state);
    } else {
      var data;
      if (!el.plain || (el.pre && state.maybeComponent(el))) {
        data = genData$2(el, state);
      }

      var children = el.inlineTemplate ? null : genChildren(el, state, true);
      code = "_c('" + (el.tag) + "'" + (data ? ("," + data) : '') + (children ? ("," + children) : '') + ")";
    }
    // module transforms
    for (var i = 0; i < state.transforms.length; i++) {
      code = state.transforms[i](el, code);
    }
    return code
  }
}
```
#### v-if/v-for generate code
- v-if 创建的模式就是`(condition) ? genElement(condition.block) : genIfConditions(剩余的condition)'

```js
function genIf (
  el,
  state,
  altGen,
  altEmpty
) {
  el.ifProcessed = true; // avoid recursion
  return genIfConditions(el.ifConditions.slice(), state, altGen, altEmpty)
}


function genIfConditions (
  conditions,
  state,
  altGen,
  altEmpty
) {
  if (!conditions.length) {
    return altEmpty || '_e()'
  }
 return ("(" + (condition.exp) + ")?" + (genElement(condition.block)) + ":" + (genIfConditions(conditions, state, altGen, altEmpty)))
}
```
- `genElement(condition.block)`部分代码执行如下:

```js
{
  var data;
  if (!el.plain || (el.pre && state.maybeComponent(el))) {
    data = genData$2(el, state); // genData处理所有的属性
  }
  var children = el.inlineTemplate ? null : genChildren(el, state, true);
  code = "_c('" + (el.tag) + "'" + (data ? ("," + data) : '') + (children ? ("," + children) : '') + ")";
}
```

- genData处理if部分代码

```js
  // module data generation functions
  for (var i = 0; i < state.dataGenFns.length; i++) {
    data += state.dataGenFns[i](el); // class style处理 如"{staticClass:"list",class:bindClass,"
  }
  data = data.replace(/,$/, '') + '}';
  return data
```
- 处理子节点, 处理v-for和其他子节点
```js

function genChildren (
  el,
  state,
  checkSkip,
  altGenElement,
  altGenNode
) {
  var children = el.children;
  if (children.length) {
    var el$1 = children[0];
    // optimize single v-for
    if (children.length === 1 &&
      el$1.for &&
      el$1.tag !== 'template' &&
      el$1.tag !== 'slot'
    ) {
      var normalizationType = checkSkip
        ? state.maybeComponent(el$1) ? ",1" : ",0"
        : "";
      return ("" + ((altGenElement || genElement)(el$1, state)) + normalizationType)
    }
    var normalizationType$1 = checkSkip
      ? getNormalizationType(children, state.maybeComponent)
      : 0;
    var gen = altGenNode || genNode;
    return ("[" + (children.map(function (c) { return gen(c, state); }).join(',')) + "]" + (normalizationType$1 ? ("," + normalizationType$1) : ''))
  }
}
```

- v-for 创建的模式就是`_l(data, function(item, index){return genElement)(el,state) })? `, 之后又是`genData, genChildren`
  - genChildren会调用`genNode`

```js

function genFor (
  el,
  state,
  altGen,
  altHelper
) {
  var exp = el.for;
  var alias = el.alias;
  var iterator1 = el.iterator1 ? ("," + (el.iterator1)) : '';
  var iterator2 = el.iterator2 ? ("," + (el.iterator2)) : '';

  el.forProcessed = true; // avoid recursion
  return (altHelper || '_l') + "((" + exp + ")," +
    "function(" + alias + iterator1 + iterator2 + "){" +
      "return " + ((altGen || genElement)(el, state)) +
    '})'
}

function genNode (node, state) {
  if (node.type === 1) {
    return genElement(node, state)
  } else if (node.type === 3 && node.isComment) {
    return genComment(node)
  } else {
    return genText(node)
  }
}

function genText (text) {
  return ("_v(" + (text.type === 2
    ? text.expression // no need for () because already wrapped in _s()
    : transformSpecialNewlines(JSON.stringify(text.text))) + ")")
}

function genComment (comment) {
  return ("_e(" + (JSON.stringify(comment.text)) + ")")
}
```