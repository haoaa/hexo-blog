---
title: vue computed watch
date: 2019-04-01 08:35:17
categories: vue计算属性
tags: vue计算属性
---

### anchors
- [定义computedwatcher](#定义computedwatcher)
  + [computedwatcher定义流程](#computedwatcher定义流程)
  + [computedwatcher更新流程](#computedwatcher更新流程)
- [userwatcher](#userwatcher)
  + [watcher创建](#watcher创建)
  + [watcher四个options](#watcher四个options)

### 题外
- watcher定义后会立即执行一次getter(不是cb) `this.value = this.lazy ? undefined : this.get();`

- defineReactive为在模型上的每个属性, 创建dep. 谁get那个属性就把target watcher添加到dep.subs里去. 
- `render watcher`执行一次get后, 让不再引用的的属性的dep取消订阅自己.

### 定义computedwatcher

#### computedwatcher定义流程

- vm实例上定义`_computedWatchers`-
- 创建watcher(传入选项`{ lazy: true }`), 创建watcher 时不调用get
- 非组件实例getter将通过defineProperty挂在vm上, 组件的defineComputed, extend构造函数的时候就执行了, computed的get被挂到了vm.prototypes上进行复用
- computed watcher的get在render vnode的时候通过get属性触发.
  - 先调用`watcher.evaluate`, 调用定义的computed.xx.getter, 让相关属性的dep添加这个computed watcher
  - 再调用`watcher.depend`, 让相关属性的dep添加`render watcher`
  - watcher在内部依赖的属性更新时触发, watcher在调用get后会触发`render watcher`的的get执行.
- `v2.5.17`中的值不变不重新渲染,也只是昙花一现

```js
var computedWatcherOptions = { lazy: true };

function initComputed (vm, computed) {
  // $flow-disable-line
  var watchers = vm._computedWatchers = Object.create(null);
  // computed properties are just getters during SSR
  var isSSR = isServerRendering();

  for (var key in computed) {
    var userDef = computed[key];
    var getter = typeof userDef === 'function' ? userDef : userDef.get; 

    if (!isSSR) {
      // create internal watcher for the computed property.
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions
      );
    }

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.    
    // new vue上的computed初始化
    if (!(key in vm)) {
      defineComputed(vm, key, userDef);
    }
  }
}
```
```js
  // 组件的defineComputed, 在vue.extend上调用
  if (Sub.options.computed) {
    initComputed$1(Sub);
  }
  function initComputed$1 (Comp) {
    var computed = Comp.options.computed;
    for (var key in computed) {
      defineComputed(Comp.prototype, key, computed[key]);
    }
  }
```
```js
function defineComputed (
  target,
  key,
  userDef
) {
  var shouldCache = !isServerRendering();
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key)
      : userDef;
    sharedPropertyDefinition.set = noop;
  } else {
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        ? createComputedGetter(key)
        : userDef.get
      : noop;
    sharedPropertyDefinition.set = userDef.set
      ? userDef.set
      : noop;
  } 
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

function createComputedGetter (key) {
  // 返回的这个函数就是vm.computedProperty的getter
  return function computedGetter () {
    var watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate();
      }
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value
    }
  }
}

/**
 * Evaluate the value of the watcher.
 * This only gets called for lazy watchers.
 */
Watcher.prototype.evaluate = function evaluate () {
  this.value = this.get(); // 调用定义的computed.xx.getter,
  this.dirty = false;
};

/**
 * Depend on all deps collected by this watcher.
 */
Watcher.prototype.depend = function depend () {
    var this$1 = this;

  var i = this.deps.length;
  while (i--) {
    this$1.deps[i].depend();
  }
};
```

- Watcher computed部分

```js
var Watcher = function Watcher (
  vm,
  expOrFn, // user defined getter
  cb, // noop in computed watcher
  options //  { lazy: true }
) {
  this.vm = vm;
  vm._watchers.push(this);
  // options
  if (options) {
    this.lazy = !!options.lazy;
  }
  this.cb = cb;
  this.id = ++uid$1; // uid for batching
  this.active = true;
  this.dirty = this.lazy; // for lazy watchers
  this.deps = [];
  this.newDeps = [];
  this.depIds = new _Set();
  this.newDepIds = new _Set();
  this.expression = process.env.NODE_ENV !== 'production'
    ? expOrFn.toString()
    : '';
  // parse expression for getter
  if (typeof expOrFn === 'function') {
    this.getter = expOrFn;
  }
  this.value = this.lazy // 创建watcher 时不调用get
    ? undefined
    : this.get();
};

```

#### computedwatcher更新流程
- setter触发update, 不加入队列, `this.dirty = true;`
- 把`render watcher`加入队列, `render watcher`生成vnode时再去调用vm.xx的getter => `computed watcher`的get
- 重新收集`computed watcher`依赖, 更新视图
```js

Watcher.prototype.update = function update () {
  /* istanbul ignore else */
  if (this.lazy) {
    this.dirty = true;
  } else if (this.sync) {
    this.run();
  } else {
    queueWatcher(this);
  }
};

// 调用vm.xx的getter, dirty=true执行evaluate
function computedGetter () {
  var watcher = this._computedWatchers && this._computedWatchers[key];
  if (watcher) {
    if (watcher.dirty) {
      watcher.evaluate();
    }
    if (Dep.target) {
      watcher.depend();
    }
    return watcher.value
  }
}
```
```js
Watcher.prototype.evaluate = function evaluate () {
  this.value = this.get();
  this.dirty = false;
};

Watcher.prototype.get = function get () {
  pushTarget(this);
  value = this.getter.call(vm, vm); // 调用定义的computed.get, 重新收集`computed watcher`的依赖
  if (this.deep) {
    traverse(value);
  }
  popTarget();
  this.cleanupDeps();
  return value
};
```
### userwatcher

#### watcher创建

watcher可以是数组

```js
function initWatch (vm: Component, watch: Object) {
  for (const key in watch) {
    const handler = watch[key]
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
} 

function createWatcher (
  vm: Component,
  expOrFn: string | Function,
  handler: any,
  options?: Object
) {
  if (isPlainObject(handler)) {
    options = handler
    handler = handler.handler
  }
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  return vm.$watch(expOrFn, handler, options)
}

Vue.prototype.$watch = function (
  expOrFn,
  cb,
  options
) {
  var vm = this;
  if (isPlainObject(cb)) {
    return createWatcher(vm, expOrFn, cb, options)
  }
  options = options || {};
  options.user = true;  // 用户定义watcher
  var watcher = new Watcher(vm, expOrFn, cb, options);
  if (options.immediate) { // 立即执行回调
    cb.call(vm, watcher.value);
  }
  return function unwatchFn () {
    watcher.teardown();
  }
};

```

#### watcher四个options

```js
var Watcher = function Watcher (
  vm,
  expOrFn,
  cb,
  options,
  isRenderWatcher
) {
  if (options) {
    this.deep = !!options.deep;
    this.user = !!options.user;
    this.lazy = !!options.lazy;
    this.sync = !!options.sync;
    this.before = options.before;
  } else {
    this.deep = this.user = this.lazy = this.sync = false;
  }
  this.cb = cb;
  this.id = ++uid$1; // uid for batching
  this.active = true;
  this.dirty = this.lazy; // for lazy watchers
  this.deps = [];
  this.newDeps = [];
  this.depIds = new _Set();
  this.newDepIds = new _Set();
  this.expression = process.env.NODE_ENV !== 'production'
    ? expOrFn.toString()
    : '';
  // parse expression for getter
  if (typeof expOrFn === 'function') {
    this.getter = expOrFn;
  } else {
    this.getter = parsePath(expOrFn);
    if (!this.getter) {
      this.getter = noop;
      process.env.NODE_ENV !== 'production' && warn(
        "Failed watching path: \"" + expOrFn + "\" " +
        'Watcher only accepts simple dot-delimited paths. ' +
        'For full control, use a function instead.',
        vm
      );
    }
  }
  this.value = this.lazy
    ? undefined
    : this.get();
};
```

- deep watch

```js
Watcher.prototype.get = function get () {
  pushTarget(this);
  var value;
  var vm = this.vm;
  try {
    value = this.getter.call(vm, vm);
  } catch (e) {
  } finally {
    if (this.deep) {
      traverse(value);
    }
    popTarget();
    this.cleanupDeps();
  }
  return value
}
const seenObjects = new Set()
function traverse (val) {
  _traverse(val, seenObjects);
  seenObjects.clear();
}

// 遍历对象, 收集依赖
function _traverse (val, seen) {
  var i, keys;
  if (val.__ob__) {
    var depId = val.__ob__.dep.id;
    if (seen.has(depId)) {
      return
    }
    seen.add(depId);
  }
  if (isA) {
    i = val.length;
    while (i--) { _traverse(val[i], seen); }
  } else {
    keys = Object.keys(val);
    i = keys.length;
    while (i--) { _traverse(val[keys[i]], seen); }
  }
}

```

- immediate 创建watch后执行一次cb

```js
  Vue.prototype.$watch = function (
    expOrFn,
    cb,
    options
  ) {
    var vm = this;
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options)
    }
    options = options || {};
    options.user = true;
    var watcher = new Watcher(vm, expOrFn, cb, options);
    if (options.immediate) {
      cb.call(vm, watcher.value);
    }
    return function unwatchFn () {
      watcher.teardown();
    }
  };
```

- sync watcher setter检测到变化后, 在当前tick中同步执行watcher的回调函数。

```js
Watcher.prototype.update = function update () {
  /* istanbul ignore else */
  if (this.lazy) {
    this.dirty = true;
  } else if (this.sync) {
    this.run();
  } else {
    queueWatcher(this);
  }
};
```