---
title: vue-transition
date: 2019-06-22 11:04:16
categories: vue transition
tags: vue transition
---

## digest
- transition是抽象组件, 提供动画运行过程的各种回调. 

### render函数做了什么
- 获取包裹的vnode child, 给vnode添加key属性用于后续节点操作
- 获取非keep-alive子节点
- 获取transition指令上所有的props到child上
- compile完 render, 创建子组件vnode后, 开始渲染子组件
- `oldRawChild, oldChild`状态改变时纪录上个状态
```js
// props提供以下props
var transitionProps = {
  name: String,
  appear: Boolean,
  css: Boolean,
  mode: String,
  type: String,
  enterClass: String,
  leaveClass: String,
  enterToClass: String,
  leaveToClass: String,
  enterActiveClass: String,
  leaveActiveClass: String,
  appearClass: String,
  appearActiveClass: String,
  appearToClass: String,
  duration: [Number, String, Object]
};

// in case the child is also an abstract component, e.g. <keep-alive>
// we want to recursively retrieve the real component to be rendered
function getRealChild (vnode) {
  var compOptions = vnode && vnode.componentOptions;
  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(getFirstComponentChild(compOptions.children))
  } else {
    return vnode
  }
}

function extractTransitionData (comp) {
  var data = {};
  var options = comp.$options;
  // props
  for (var key in options.propsData) {
    data[key] = comp[key];
  }
  // events.
  // extract listeners and pass them directly to the transition methods
  var listeners = options._parentListeners;
  for (var key$1 in listeners) {
    data[camelize(key$1)] = listeners[key$1];
  }
  return data
}

function render (h) {
  var this$1 = this;

  var children = this.$slots.default;
  if (!children) {
    return
  }

  // filter out text nodes (possible whitespaces)
  children = children.filter(function (c) { return c.tag || isAsyncPlaceholder(c); });
  /* istanbul ignore if */
  if (!children.length) {
    return
  }
  var mode = this.mode;
  var rawChild = children[0];

  // if this is a component root node and the component's
  // parent container node also has transition, skip.
  if (hasParentTransition(this.$vnode)) {
    return rawChild
  }

  // apply transition data to child
  // use getRealChild() to ignore abstract components e.g. keep-alive
  var child = getRealChild(rawChild);
  /* istanbul ignore if */
  if (!child) {
    return rawChild
  }

  if (this._leaving) {
    return placeholder(h, rawChild)
  }

  // ensure a key that is unique to the vnode type and to this transition
  // component instance. This key will be used to remove pending leaving nodes
  // during entering.
  var id = "__transition-" + (this._uid) + "-";
  child.key = child.key == null
    ? child.isComment
      ? id + 'comment'
      : id + child.tag
    : isPrimitive(child.key)
      ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
      : child.key;

  var data = (child.data || (child.data = {})).transition = extractTransitionData(this);
  var oldRawChild = this._vnode;
  var oldChild = getRealChild(oldRawChild);

  // mark v-show
  // so that the transition module can hand over the control to the directive
  if (child.data.directives && child.data.directives.some(function (d) { return d.name === 'show'; })) {
    child.data.show = true;
  }

  if (
    oldChild &&
    oldChild.data &&
    !isSameChild(child, oldChild) &&
    !isAsyncPlaceholder(oldChild) &&
    // #6687 component root is a comment node
    !(oldChild.componentInstance && oldChild.componentInstance._vnode.isComment)
  ) {
    // replace old child transition data with fresh one
    // important for dynamic transitions!
    var oldData = oldChild.data.transition = extend({}, data);
    // handle transition mode
    if (mode === 'out-in') {
      // return placeholder node and queue update when leave finishes
      this._leaving = true;
      mergeVNodeHook(oldData, 'afterLeave', function () {
        this$1._leaving = false;
        this$1.$forceUpdate();
      });
      return placeholder(h, rawChild)
    } else if (mode === 'in-out') {
      if (isAsyncPlaceholder(child)) {
        return oldRawChild
      }
      var delayedLeave;
      var performLeave = function () { delayedLeave(); };
      mergeVNodeHook(data, 'afterEnter', performLeave);
      mergeVNodeHook(data, 'enterCancelled', performLeave);
      mergeVNodeHook(oldData, 'delayLeave', function (leave) { delayedLeave = leave; });
    }
  }

  return rawChild
}
```

### transition module

- enter回调
```js
function _enter (_, vnode) {
  if (vnode.data.show !== true) {
    enter(vnode);
  }
}

var transition = inBrowser ? {
  create: _enter,
  activate: _enter,
  remove: function remove$$1 (vnode, rm) {
    /* istanbul ignore else */
    if (vnode.data.show !== true) {
      leave(vnode, rm);
    } else {
      rm();
    }
  }
} : {};
```
```js
```
```js
```
<!--more-->
