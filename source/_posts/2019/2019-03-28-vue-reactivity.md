---
title: vue reactivity
date: 2019-03-28 21:11:55
categories: vue源码 响应式
tags: vue源码 响应式
---

### anchors
- [定义响应式]
  + [定义响应式流程](#定义响应式流程)
  + [user-watcher响应式流程](#user-watcher响应式流程)
- [依赖收集](#依赖收集)
- [派发更新](#派发更新)
- [其他watcher](#其他watcher)
- [组件update流程](#组件update流程)

### 题外
- watcher定义后会立即执行一次getter(不是cb) `this.value = this.lazy ? undefined : this.get();`
- Observe里面有dep, defineReactivity里也有dep.
- defineReactive为在模型上的每个属性, 创建dep. 谁get那个属性就把target watcher添加到dep.subs里去. 
- render watcher执行一次get后, 让不再引用的的属性的dep取消订阅自己.
### 定义响应式
#### 定义响应式流程
- 遍历属性对象, 通过getter定义代理到vm上
- 为属性对象添加observer, `data.__ob__ = new Observer(data)`
- 关系为data有dep, dep里有watcher, watcher里有dep.循环依赖?
- defineReactive内部又new dep去notify和depend, 那observer里的dep有什么用?
  - `childOb.dep.depend();`

```js
initState(vm);

function initState (vm) {
  vm._watchers = [];
  var opts = vm.$options;
  if (opts.props) { initProps(vm, opts.props); }
  if (opts.data) {
    initData(vm);
  } else {
    observe(vm._data = {}, true /* asRootData */);
  }
  if (opts.computed) { initComputed(vm, opts.computed); }
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch);
  }
}

function initData (vm) {
  var data = vm._data = vm.$options.data

  var keys = Object.keys(data);
  var i = keys.length;
  while (i--) {
    var key = keys[i]; 
    proxy(vm, "_data", key);
  }
  // observe data 定义响应式
  observe(data, true /* asRootData */);
}
 
function observe (value, asRootData) {
  var ob;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value);
  }
  if (asRootData && ob) {
    ob.vmCount++;
  }
  return ob
}

var Observer = function Observer (value) {
  this.value = value;
  this.dep = new Dep(); // dep.subs收集watcher
  this.vmCount = 0;
  def(value, '__ob__', this); // 不可枚举属性
  if (Array.isArray(value)) {
    var augment = hasProto
      ? protoAugment
      : copyAugment;
    augment(value, arrayMethods, arrayKeys);
    this.observeArray(value);
  } else {
    this.walk(value);
  }
};


/**
 * Walk through each property and convert them into
 * getter/setters. This method should only be called when
 * value type is Object.
 */
Observer.prototype.walk = function walk (obj) {
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    defineReactive(obj, keys[i]);
  }
};

/**
 * Observe a list of Array items.
 */
Observer.prototype.observeArray = function observeArray (items) {
  for (var i = 0, l = items.length; i < l; i++) {
    observe(items[i]);
  }
};

function defineReactive (
  obj,
  key,
  val,
  customSetter,
  shallow
) {
  var dep = new Dep();

  var property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  var getter = property && property.get;
  if (!getter && arguments.length === 2) {
    val = obj[key];
  }
  var setter = property && property.set;

  var childOb = !shallow && observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      var value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
          if (Array.isArray(value)) {
            dependArray(value);
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      var value = getter ? getter.call(obj) : val;
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter();
      }
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      childOb = !shallow && observe(newVal);
      dep.notify();
    }
  });
}
```

```js
// 属性proxy
var sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
};

function proxy (target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  };
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val;
  };
  Object.defineProperty(target, key, sharedPropertyDefinition);
}
```

#### user-watcher响应式流程
- user定义的watch在initState时通过$watch创建并放入`vm._watchers`,  renderWatcher在`vm.$mount`创建, watcher创建晚于defineReactivity这样, 在get属性的时候就能访问属性的getters收集依赖
```js
function initState (vm) {
  // props data computed reactivity
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch); // => createWatcher(vm, key, handler); => vm.$watch(expOrFn, handler, options) => var watcher = new Watcher(vm, expOrFn, cb, options);
  }
}
```
- user watcher在创建后访问getter, 此时Dep.target是user watcher, expOrFun
```js
get: function reactiveGetter () {
  var value = getter ? getter.call(obj) : val;
  if (Dep.target) {
    dep.depend();
    if (childOb) {
      childOb.dep.depend();
      if (Array.isArray(value)) {
        dependArray(value);
      }
    }
  }
  return value
}

Dep.prototype.depend = function depend () {
  if (Dep.target) {
    Dep.target.addDep(this);
  }
};

Watcher.prototype.addDep = function addDep (dep) {
  var id = dep.id;
  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id);
    this.newDeps.push(dep);
    if (!this.depIds.has(id)) {
      dep.addSub(this);
    }
  }
};
// depend过后, user watcher会有如下数据, 的确是循环引用
Dep.target.deps = [
  dep : {
    sub : `user watcher`
  },
  dep : { // "defineReactive person.name dep"
    sub : `user watcher`
  },
  dep : { // "defineReactive person dep"
    sub : `user watcher`
  },
  dep : { // "person.data observer dep"
    sub : `user watcher`
  }
]
```


### 依赖收集

```js
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }

  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

Dep.target = null;
var targetStack = [];

function pushTarget (_target) {
  if (Dep.target) { targetStack.push(Dep.target); }
  Dep.target = _target;
}

function popTarget () {
  Dep.target = targetStack.pop();
}


```

- Watcher的get 收集依赖后, 取消视图上不再依赖的dep.subs注册.

```js

Watcher.prototype.get = function get () {
  pushTarget(this);
  var value;
  var vm = this.vm;
  try {
    value = this.getter.call(vm, vm);
  } catch (e) {
    if (this.user) {
      handleError(e, vm, ("getter for watcher \"" + (this.expression) + "\""));
    } else {
      throw e
    }
  } finally {
    // "touch" every property so they are all tracked as
    // dependencies for deep watching
    if (this.deep) {
      traverse(value);
    }
    popTarget();
    this.cleanupDeps();
  }
  return value
};

Watcher.prototype.cleanupDeps = function cleanupDeps () {
    var this$1 = this;

  var i = this.deps.length;
  while (i--) {
    var dep = this$1.deps[i];
    if (!this$1.newDepIds.has(dep.id)) {
      dep.removeSub(this$1);
    }
  }
  var tmp = this.depIds;
  this.depIds = this.newDepIds;
  this.newDepIds = tmp;
  this.newDepIds.clear();
  tmp = this.deps;
  this.deps = this.newDeps;
  this.newDeps = tmp;
  this.newDeps.length = 0;
};
```