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

## 禁右键,复制,选择等

```js
//屏蔽右键菜单
document.oncontextmenu = function (event){
    if(window.event){
        event = window.event;
    }try{
        var the = event.srcElement;
        if (!((the.tagName == "INPUT" && the.type.toLowerCase() == "text") || the.tagName == "TEXTAREA")){
            return false;
        }
        return true;
    }catch (e){
        return false;
    }
}


//屏蔽粘贴
document.onpaste = function (event){
    if(window.event){
        event = window.event;
    }try{
        var the = event.srcElement;
        if (!((the.tagName == "INPUT" && the.type.toLowerCase() == "text") || the.tagName == "TEXTAREA")){
            return false;
        }
        return true;
    }catch (e){
        return false;
    }
}


//屏蔽复制
document.oncopy = function (event){
    if(window.event){
        event = window.event;
    }try{
        var the = event.srcElement;
        if(!((the.tagName == "INPUT" && the.type.toLowerCase() == "text") || the.tagName == "TEXTAREA")){
            return false;
        }
        return true;
    }catch (e){
        return false;
    }
}


//屏蔽剪切
document.oncut = function (event){
    if(window.event){
        event = window.event;
    }try{
        var the = event.srcElement;
        if(!((the.tagName == "INPUT" && the.type.toLowerCase() == "text") || the.tagName == "TEXTAREA")){
            return false;
        }
        return true;
    }catch (e){
        return false;
    }
}


//屏蔽选中
document.onselectstart = function (event){
    if(window.event){
        event = window.event;
    }try{
        var the = event.srcElement;
        if (!((the.tagName == "INPUT" && the.type.toLowerCase() == "text") || the.tagName == "TEXTAREA")){
            return false;
        }
        return true;
    } catch (e) {
        return false;
    }
}
```

## 修正jq/zepto移动端事件

```js
(function($) {  
    var options, Events, Touch;  
    options = {  
        x: 20,  
        y: 20  
    };  
    Events = ['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'tap', 'longTap', 'drag'];  
    Events.forEach(function(eventName) {  
        $.fn[eventName] = function() {  
            var touch = new Touch($(this), eventName);  
            touch.start();  
            if (arguments[1]) {  
                options = arguments[1]  
            }  
            return this.on(eventName, arguments[0])  
        }  
    });  
    Touch = function() {  
        var status, ts, tm, te;  
        this.target = arguments[0];  
        this.e = arguments[1]  
    };  
    Touch.prototype.framework = function(e) {  
        e.preventDefault();  
        var events;  
        if (e.changedTouches) events = e.changedTouches[0];  
        else events = e.originalEvent.touches[0];  
        return events  
    };  
    Touch.prototype.start = function() {  
        var self = this;  
        self.target.on("touchstart",  
        function(event) {  
            event.preventDefault();  
            var temp = self.framework(event);  
            var d = new Date();  
            self.ts = {  
                x: temp.pageX,  
                y: temp.pageY,  
                d: d.getTime()  
            }  
        });  
        self.target.on("touchmove",  
        function(event) {  
            event.preventDefault();  
            var temp = self.framework(event);  
            var d = new Date();  
            self.tm = {  
                x: temp.pageX,  
                y: temp.pageY  
            };  
            if (self.e == "drag") {  
                self.target.trigger(self.e, self.tm);  
                return  
            }  
        });  
        self.target.on("touchend",  
        function(event) {  
            event.preventDefault();  
            var d = new Date();  
            if (!self.tm) {  
                self.tm = self.ts  
            }  
            self.te = {  
                x: self.tm.x - self.ts.x,  
                y: self.tm.y - self.ts.y,  
                d: (d - self.ts.d)  
            };  
            self.tm = undefined;  
            self.factory()  
        })  
    };  
    Touch.prototype.factory = function() {  
        var x = Math.abs(this.te.x);  
        var y = Math.abs(this.te.y);  
        var t = this.te.d;  
        var s = this.status;  
        if (x < 5 && y < 5) {  
            if (t < 300) {  
                s = "tap"  
            } else {  
                s = "longTap"  
            }  
        } else if (x < options.x && y > options.y) {  
            if (t < 250) {  
                if (this.te.y > 0) {  
                    s = "swipeDown"  
                } else {  
                    s = "swipeUp"  
                }  
            } else {  
                s = "swipe"  
            }  
        } else if (y < options.y && x > options.x) {  
            if (t < 250) {  
                if (this.te.x > 0) {  
                    s = "swipeLeft"  
                } else {  
                    s = "swipeRight"  
                }  
            } else {  
                s = "swipe"  
            }  
        }  
        if (s == this.e) {  
            this.target.trigger(this.e);  
            return  
        }  
    }  
})(window.jQuery || window.Zepto);  

```

## 瀑布流逻辑

1. 根据屏幕宽度和图片宽度计算列数(`column`)
2. 遍历等宽盒子  
  2.1 头4列加入到arrHeight里  
  2.2 将之后的图接到高度最低的一列  
  2.3 累加每个人列的高度  
3. scroll到最低的列后,追加dom并重复步骤2

### waterfall demo code

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title></title>
    <style>
        * {
            margin: 0;
            padding: 0;
        }

        .box {
            float: left;
            border: 1px solid #ccc;
            padding: 5px;
        }
    </style>
</head>
<body>
<div class="container" id="container">
    <div class="box"><img src="images/P_000.jpg" alt=""/></div>
    <div class="box"><img src="images/P_001.jpg" alt=""/></div>
    <div class="box"><img src="images/P_002.jpg" alt=""/></div>
    <div class="box"><img src="images/P_003.jpg" alt=""/></div>
    <div class="box"><img src="images/P_004.jpg" alt=""/></div>
    <div class="box"><img src="images/P_005.jpg" alt=""/></div>
    <div class="box"><img src="images/P_006.jpg" alt=""/></div>
    <div class="box"><img src="images/P_007.jpg" alt=""/></div>
    <div class="box"><img src="images/P_008.jpg" alt=""/></div>
    <div class="box"><img src="images/P_009.jpg" alt=""/></div>
</div>
</body>
</html>
<script>
    window.onload = function () {
        var container = document.getElementById("container");
        var boxs = container.children;
        var pageWidth = window.innerWidth;
        var boxWidth = boxs[0].offsetWidth;
        var column = Math.floor(pageWidth / boxWidth);
        var arrHeight = [];
        function waterfall() {
            for (var i = 0; i < boxs.length; i++) {
                if (i < column) {
                    arrHeight[i] = boxs[i].offsetHeight;
                } else {
                    var minHeight = getMin(arrHeight).value;
                    var minHeightIndex = getMin(arrHeight).index;
                    boxs[i].style.position = "absolute";
                    boxs[i].style.left = boxs[minHeightIndex].offsetLeft + "px";
                    boxs[i].style.top =                                                                                                                   + "px";
                    arrHeight[minHeightIndex] = minHeight + boxs[i].offsetHeight;
                }
            }
        }
        waterfall();
        function bottomed() {
            var scrollTop = window.pageYOffset;
            var clientHeight = window.innerHeight;
            var lastBoxTop = boxs[boxs.length - 1].offsetTop;
            if ((scrollTop + clientHeight) > lastBoxTop) {
                return true;
            }
        }
        window.onscroll = function () {
            if (bottomed()) {
                var json = [
                    {"src": "images/P_000.jpg"},
                    {"src": "images/P_001.jpg"},
                    {"src": "images/P_002.jpg"},
                    {"src": "images/P_003.jpg"},
                    {"src": "images/P_004.jpg"},
                    {"src": "images/P_005.jpg"},
                    {"src": "images/P_006.jpg"},
                    {"src": "images/P_007.jpg"},
                    {"src": "images/P_008.jpg"},
                    {"src": "images/P_009.jpg"},
                ]
                for (var i = 0; i < json.length; i++) {
                    var div = document.createElement("div");
                    div.className = "box";
                    var img = document.createElement("img");
                    img.src = json[i].src;
                    div.appendChild(img);
                    container.appendChild(div);
                }
                waterfall();
            }
        }
    }

    function getMin(arr) {
        var min = {};
        min.index = 0;
        min.value = arr[min.index];
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] < min.value) {
                min.value = arr[i];
                min.index = i;
            }
        }
        return min;
    }


</script>
```