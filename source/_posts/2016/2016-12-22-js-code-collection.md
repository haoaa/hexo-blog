---
title: js-code-collection
date: 2016-12-22 19:12:38
categories:
- js snippet
tags:
- code collection
- js
---
# js可分析性片段代码
## 1. 深度比较

- mobx.umd.js:1558
## 对象的深比较
<!--more-->
 ```js
function deepEquals(a, b) {
    if (a === null && b === null)
        return true;
    if (a === undefined && b === undefined)
        return true;
    var aIsArray = Array.isArray(a) || isObservableArray(a);
    if (aIsArray !== (Array.isArray(b) || isObservableArray(b))) {
        return false;
    }

    else if (aIsArray) {
        if (a.length !== b.length)
            return false;
        for (var i = a.length; i >= 0; i--)
            if (!deepEquals(a[i], b[i]))
                return false;
        return true;
    }
    else if (typeof a === "object" && typeof b === "object") {
        if (a === null || b === null)
            return false;
        if (Object.keys(a).length !== Object.keys(b).length)
            return false;
        for (var prop in a) {
            if (!b.hasOwnProperty(prop))
                return false;
            if (!deepEquals(a[prop], b[prop]))
                return false;
        }
        return true;
    }
    return a === b;
}
```

---
### 通过create继承

```js
// Shape - superclass
function Shape() {
  this.x = 0;
  this.y = 0;
}

// superclass method
Shape.prototype.move = function(x, y) {
  this.x += x;
  this.y += y;
  console.info('Shape moved.');
};

// Rectangle - subclass
function Rectangle() {
  Shape.call(this); // call super constructor.
}

// subclass extends superclass
Rectangle.prototype = Object.create(Shape.prototype);
Rectangle.prototype.constructor = Rectangle;

var rect = new Rectangle();
```

![](/assets/2016/prototype-chain.png)
---