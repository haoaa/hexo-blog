---
title: vue-keep-alive
date: 2019-05-26 11:04:16
categories: vue keep-alive
tags: vue keep-alive
---

##  keep-alive


### keep-alive组件
- abstract组件不渲染,只处理内部的$slot

```js
var KeepAlive = {
  name: 'keep-alive',
  abstract: true,

  props: {
    include: patternTypes,
    exclude: patternTypes,
    max: [String, Number]
  },

  created: function created () {
    this.cache = Object.create(null);
    this.keys = [];
  },

  destroyed: function destroyed () {
    for (var key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys);
    }
  },

  mounted: function mounted () {
    var this$1 = this;

    this.$watch('include', function (val) {
      pruneCache(this$1, function (name) { return matches(val, name); });
    });
    this.$watch('exclude', function (val) {
      pruneCache(this$1, function (name) { return !matches(val, name); });
    });
  },

  render: function render () {
    // ...
  }
};
```
### 
- 建立父子关系. 对keep-alive而言,parent的children没有自己, 但自己的parent还是parent.

```js
function initLifecycle (vm) {
  var options = vm.$options;

  // locate first non-abstract parent
  var parent = options.parent;
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent;
    }
    parent.$children.push(vm);
  }
  vm.$parent = parent;
  vm.$root = parent ? parent.$root : vm;
}
    // keep-alive渲染时的调用栈
    at initLifecycle (vue.esm.js?efeb:3916) vm._uid === 1
    at VueComponent.Vue._init (vue.esm.js?efeb:5005)
    at new VueComponent (vue.esm.js?efeb:5158)
    at createComponentInstanceForVnode (vue.esm.js?efeb:3292)
    at init (vue.esm.js?efeb:3123)
    at createComponent (vue.esm.js?efeb:5984)
    at createElm (vue.esm.js?efeb:5931)
    at createChildren (vue.esm.js?efeb:6059)
    at createElm (vue.esm.js?efeb:5960)
    at Vue.patch [as __patch__] (vue.esm.js?efeb:6522)
```

### 首次渲染
- patch根节点到keep-alive组件,init的时候createComponentInstanceForVnode->new VueComponent 
- keep-alive $mount $render接入render函数, 返回包裹的内容的vnode, update该vnode
- 内容vnode的vm实例的parent是keep-alive的父元素(如上面代码)
- 根节点patch结束之前调用`invokeInsertHook`,  会调用`activateChildComponent`触发activated回调
```js
function init (vnode, hydrating) {
  if (
    vnode.componentInstance &&
    !vnode.componentInstance._isDestroyed &&
    vnode.data.keepAlive
  ) {
    // kept-alive components, treat as a patch
    var mountedNode = vnode; // work around flow
    componentVNodeHooks.prepatch(mountedNode, mountedNode);
  } else {
    var child = vnode.componentInstance = createComponentInstanceForVnode(
      vnode,
      activeInstance
    );
    child.$mount(hydrating ? vnode.elm : undefined, hydrating);
  }
}

function render(){
    var slot = this.$slots.default;
    var vnode = getFirstComponentChild(slot);
    var componentOptions = vnode && vnode.componentOptions;
    if (componentOptions) {
      var ref = this;
      if (cache[key]) {
        vnode.componentInstance = cache[key].componentInstance;
        // make current key freshest
        remove(keys, key);
        keys.push(key);
      } else {
        cache[key] = vnode;
        keys.push(key);
      }

      vnode.data.keepAlive = true;
    }
    return vnode || (slot && slot[0])
  }

  function insert (vnode) {
    var context = vnode.context;
    var componentInstance = vnode.componentInstance;
    if (!componentInstance._isMounted) {
      componentInstance._isMounted = true;
      callHook(componentInstance, 'mounted');
    }
    if (vnode.data.keepAlive) {
      if (context._isMounted) {
        // vue-router#1212
        // During updates, a kept-alive component's child components may
        // change, so directly walking the tree here may call activated hooks
        // on incorrect children. Instead we push them into a queue which will
        // be processed after the whole patch process ended.
        queueActivatedComponent(componentInstance);
      } else {
        activateChildComponent(componentInstance, true /* direct */);
      }
    }

function activateChildComponent (vm, direct) {
  if (vm._inactive || vm._inactive === null) {
    vm._inactive = false;
    for (var i = 0; i < vm.$children.length; i++) {
      activateChildComponent(vm.$children[i]);
    }
    callHook(vm, 'activated');
  }
}
```

### 二次渲染
- prepatch
```js
 function patchVnode (){
    var i;
    var data = vnode.data;
    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      i(oldVnode, vnode);
    }
 }

 function prepatch (oldVnode, vnode) {
    var options = vnode.componentOptions;
    var child = vnode.componentInstance = oldVnode.componentInstance;
    updateChildComponent(
      child,
      options.propsData, // updated props
      options.listeners, // updated listeners
      vnode, // new parent vnode
      options.children // new children
    );
  }

function updateChildComponent (
  vm,
  propsData,
  listeners,
  parentVnode,
  renderChildren
) {
    // resolve slots + force update if has children
  if (needsForceUpdate) {
    vm.$slots = resolveSlots(renderChildren, parentVnode.context);
    vm.$forceUpdate();
  }
}
```
```js
function render(){
    var slot = this.$slots.default;
    var vnode = getFirstComponentChild(slot);
    var componentOptions = vnode && vnode.componentOptions;
    if (componentOptions) {
     if (cache[key]) {
        vnode.componentInstance = cache[key].componentInstance;
        // make current key freshest
        remove(keys, key);
        keys.push(key);
      }
      vnode.data.keepAlive = true;
    }
    return vnode || (slot && slot[0])
  }

    init: function init (vnode, hydrating) {
    if (
      vnode.componentInstance &&
      !vnode.componentInstance._isDestroyed &&
      vnode.data.keepAlive
    ) {
      // kept-alive components, treat as a patch
      var mountedNode = vnode; // work around flow
      componentVNodeHooks.prepatch(mountedNode, mountedNode);
    } else {
      var child = vnode.componentInstance = createComponentInstanceForVnode(
        vnode,
        activeInstance
      );
      child.$mount(hydrating ? vnode.elm : undefined, hydrating);
    }
  },

  ```

  ```js
  function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    var i = vnode.data;
    if (isDef(i)) {
      var isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
      if (isDef(i = i.hook) && isDef(i = i.init)) {
        i(vnode, false /* hydrating */);
      }
      // after calling the init hook, if the vnode is a child component
      // it should've created a child instance and mounted it. the child
      // component also has set the placeholder vnode's elm.
      // in that case we can just return the element and be done.
      if (isDef(vnode.componentInstance)) {
        initComponent(vnode, insertedVnodeQueue);
        insert(parentElm, vnode.elm, refElm);
        if (isTrue(isReactivated)) {
          reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
        }
        return true
      }
    }
  }
  ```