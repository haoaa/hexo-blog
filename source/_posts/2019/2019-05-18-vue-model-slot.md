---
title: vue-model&slot
date: 2019-05-18 11:04:16
categories: vue model
tags: vue model
---

## 表单model
- parse的时候添加属性, generate的时候处理属性

### parse 阶段
- `v-model` 被当做普通的指令解析到 el.directives 中， 
```js
function processAttrs (el) {
  var list = el.attrsList;
  var i, l, name, rawName, value, modifiers, syncGen, isDynamic;
  for (i = 0, l = list.length; i < l; i++) {
    name = rawName = list[i].name;
    value = list[i].value;
    if (dirRE.test(name)) {
      // mark element as dynamic
      el.hasBindings = true;
      // modifiers
      modifiers = parseModifiers(name.replace(dirRE, ''));
      // support .foo shorthand syntax for the .prop modifier
      if (modifiers) {
        name = name.replace(modifierRE, '');
      }
      // v-bind v-on
      { // normal directives
        name = name.replace(dirRE, '');  
        addDirective(el, name, rawName, value, arg, isDynamic, modifiers, list[i]); 
      }
    } else {// 文本
    }
  }
}

function addDirective (
// dom, name,       属性值
  el, name, rawName, value, arg, isDynamicArg, modifiers, range
) {
  (el.directives || (el.directives = [])).push(rangeSetItem({
    name: name,
    rawName: rawName,
    value: value,
    arg: arg,
    isDynamicArg: isDynamicArg,
    modifiers: modifiers
  }, range));
  el.plain = false;
}
```



### generate 阶段
- generate->genElement->genData$2->genDirectives , 添加回调对应的函数字符串
- `const dirs = genDirectives(el, state)`
- state ` var state = new CodegenState(options);`, options在`createCompiler`中合并baseOption得来
- 最终genData返回
```js
{
  "directives": [
    {
      "name": "model",
      "rawName": "v-model",
      "value": message,
      "expression": "message"
    }
  ],
  "attrs": { "placeholder": "edit me" },
  "domProps": { "value": message },
  "on": {
    "input": function($event) {
      if ($event.target.composing) return;
      message = $event.target.value;
    }
  }
}
```

```js
// 可能对属性修改,优先其他属性处理
function genDirectives (el, state) {
  var dirs = el.directives;
  if (!dirs) { return }
  var res = 'directives:[';
  var hasRuntime = false;
  var i, l, dir, needRuntime;
  for (i = 0, l = dirs.length; i < l; i++) {
    dir = dirs[i];
    needRuntime = true;
    var gen = state.directives[dir.name]; // 这里处理
    if (gen) {
      // compile-time directive that manipulates AST.
      // returns true if it also needs a runtime counterpart.
      needRuntime = !!gen(el, dir, state.warn);
    }
    if (needRuntime) {
      hasRuntime = true;
      res += "{name:\"" + (dir.name) + "\",rawName:\"" + (dir.rawName) + "\"" + (dir.value ? (",value:(" + (dir.value) + "),expression:" + (JSON.stringify(dir.value))) : '') + (dir.arg ? (",arg:" + (dir.isDynamicArg ? dir.arg : ("\"" + (dir.arg) + "\""))) : '') + (dir.modifiers ? (",modifiers:" + (JSON.stringify(dir.modifiers))) : '') + "},";
    }
  }
  if (hasRuntime) {
    return res.slice(0, -1) + ']'
  }
}

```

```js
function model (
  el,
  dir,
  _warn
) {
  warn$1 = _warn;
  var value = dir.value;
  var modifiers = dir.modifiers;
  var tag = el.tag;
  var type = el.attrsMap.type; 

  if (el.component) {
    genComponentModel(el, value, modifiers);
    // component v-model doesn't need extra runtime
    return false
  } else if (tag === 'select') {
    genSelect(el, value, modifiers);
  } else if (tag === 'input' && type === 'checkbox') {
    genCheckboxModel(el, value, modifiers);
  } else if (tag === 'input' && type === 'radio') {
    genRadioModel(el, value, modifiers);
  } else if (tag === 'input' || tag === 'textarea') {
    genDefaultModel(el, value, modifiers);
  } else if (!config.isReservedTag(tag)) {
    genComponentModel(el, value, modifiers);
    // component v-model doesn't need extra runtime
    return false
  } else if (process.env.NODE_ENV !== 'production') {
    warn$1(
      "<" + (el.tag) + " v-model=\"" + value + "\">: " +
      "v-model is not supported on this element type. " +
      'If you are working with contenteditable, it\'s recommended to ' +
      'wrap a library dedicated for that purpose inside a custom component.',
      el.rawAttrsMap['v-model']
    );
  }

  // ensure runtime directive metadata
  return true
}
```
```js
function genDefaultModel (
  el,
  value,
  modifiers
) {
  var type = el.attrsMap.type; 
  var ref = modifiers || {};
  var lazy = ref.lazy;
  var number = ref.number;
  var trim = ref.trim;
  var needCompositionGuard = !lazy && type !== 'range';
  var event = lazy
    ? 'change'
    : type === 'range'
      ? RANGE_TOKEN
      : 'input';

  var valueExpression = '$event.target.value';
  if (trim) {
    valueExpression = "$event.target.value.trim()";
  }
  if (number) {
    valueExpression = "_n(" + valueExpression + ")";
  }

  var code = genAssignmentCode(value, valueExpression);
  if (needCompositionGuard) {
    code = "if($event.target.composing)return;" + code;
  }

  addProp(el, 'value', ("(" + value + ")")); // el上添加props
  addHandler(el, event, code, null, true); // 
  if (trim || number) {
    addHandler(el, 'blur', '$forceUpdate()');
  }
}
```

### 运行时run-time

```js


``
```js


```