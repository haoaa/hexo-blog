---
title: vue-mechanism
date: 2018-02-05 11:37:09
categories: vue
tags: vue reactivity
---
## vue reactivity
### How Changes Are Tracked
- Walk through data properties and convert them to getter/setter using Object.defineProperty. 
- Every component instance has a corresponding watcher instance, which records any properties “touched” during the component’s render as dependencies. Later on when a dependency’s setter is triggered, it notifies the watcher, which in turn causes the component to re-render.
<img src='https://vuejs.org/images/data.png' />
### Add properties to an already created instance.
1. `Vue.set(vm.someObject, 'b', 2)` or `this.$set(this.someObject, 'b', 2)`
2. this.someObject = Object.assign({}, this.someObject, { a: 1, b: 2 })

<!--more-->
### list rendering caveats
#### Array Mutation Methods
```js
push
pop
shift
unshift
splice
sort
reverse
```
#### deal with  caveats
1. set an item
```js 
// Vue.set
Vue.set(example1.items, indexOfItem, newValue)
// Array.prototype.splice
example1.items.splice(indexOfItem, 1, newValue)
```
2. modify the length of an array
```js
example1.items.splice(newLength)
```
### view updated callback Vue.nextTick
- Vue performs DOM updates asynchronously
 + push data changes to **Async Update Queue**
 + in the next event loop “tick” performs the actual work asynchronously  with promise/setTimeout
- this.$nextTick & Vue.nextTick
 + this.$nextTick doesn’t need global Vue and its callback’s this context will be automatically bound to the current Vue instance 