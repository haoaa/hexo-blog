---
title: something-about-sass
date: 2016-12-19 20:20:35
categories:
 - sass
tags:
 - sass
 - css
---
## sass
### 1 Sass的变量以$开头
```css
$mainColor: #0982c1;
```
<!--more-->
### 2 Sass嵌套
```css
nav {
  ul {
    list-style: none;
  }
  li { display: inline-block; 
   a {
     display: block;
     padding: 6px 12px;
     text-decoration: none;
   }
  }
}
```
### 3 Sass Mixins
```css
/* Sass mixin error with (optional) argument $borderWidth which defaults to 2px if not specified */
@mixin error($borderWidth: 2px) {
  border: $borderWidth solid #F00;
  color: #F00;
}
  
.generic-error {
  padding: 20px;
  margin: 4px;
  @include error(); /* Applies styles from mixin error, with no parameters call will apply the default value 2px. */
}
```

### 4 Sass 继承(包含)
```css
.block {
  margin: 10px 5px;
  padding: 2px;
}
  
p {
  @extend .block; /* Inherit styles from '.block' */
  border: 1px solid #EEE;
}
ul, ol {
  @extend .block; /* Inherit styles from '.block' */
  color: #333;
  text-transform: uppercase;
}
```
after compile =>
```css
.block, p, ul, ol {
  margin: 10px 5px;
  padding: 2px;
}
p {
  border: 1px solid #EEE;
}
ul, ol {
  color: #333;
  text-transform: uppercase;
}
```

### 5 Sass import
导入scss文件会在编译后合并
所有的sass导入文件都可以忽略后缀名.scss。一般来说基础的文件命名方法以_开头，  
如_mixin.scss。这种文件在导入的时候可以不写下划线，可写成@import "mixin"。
reset.css:
```css
/* file.{type} */
body {
  background: #EEE;
}
```

main.xxx:
```css
@ import "reset.css";
@ import "file.{type}";
  
p {
  background: #0982C1;
}
```

最终生成的 CSS：
```css
@ import "reset.css";
body {
  background: #EEE;
}
p {
  background: #0982C1;
```
### 6 Sass颜色函数
```css
lighten($color, 10%); /* returns a color 10% lighter than $color */
darken($color, 10%);  /* returns a color 10% darker than $color */
  
saturate($color, 10%);   /* returns a color 10% more saturated than $color */
desaturate($color, 10%); /* returns a color 10% less saturated than $color */
  
grayscale($color);  /* returns grayscale of $color */
complement($color); /* returns complement color of $color */
invert($color);     /* returns inverted color of $color */
  
mix($color1, $color2, 50%); /* mix $color1 with $color2 with a weight of 50% */
```
### md 两空格换行,两回车换段落

### 7 compass/css3 include css3属性会自动增加各个浏览器的兼容属性:
边框圆角
```css
@mixin border-radius($values) {
  -webkit-border-radius: $values;
     -moz-border-radius: $values;
          border-radius: $values;
}
```
==
```css
#riddle-answer {
  @include border-radius(5px);
}
```
背景渐变
```css
%main-green-gradient{
 
  @include background-image(linear-gradient(left, $main-green 80%, $white));
}
 
footer {
  @extend %main-green-gradient;
}
```
### 8 指令if/for/each/while etc.
```css
$riddle-color: gray;
 
@if $riddle-color == blue {
  #riddle {
    background-color: $alice-blue;
  }
} @else {
  #riddle {
    background-color: $ash-gray;
  }
}
 
// We can use for loops to change as we iterate
 
$prct-yellow: 5%;
 
@for $i from 1 through 14 {
  #vert-nav ul li:nth-child(#{$i}){
    background-color: mix($yellow, $white, $prct-yellow);
  }
 
  $prct-yellow: $prct-yellow + 5%
 
}
```
### npm install gulp-sass --save安装失败
```
https://github.com/sass/node-sass/releases/download/v3.4.2/win32-x64-46_binding.node
参考: http://www.th7.cn/web/js/201511/135415.shtml
1. https://github.com/sass/node-sass下载Zip到node_module下
2. 修改 node-sass/lib/extensions.js 的getBinaryUrl方法返回
   return 'http://127.0.0.1:8080/win32-x64-48_binding.node';
3. 进入node-sass 项目根目录执行 install 命令node-sass$ npm install 
```
### 更多资料
 - [sass语法](http://www.w3cplus.com/sassguide/syntax.html)
 
### Sass vedio tutorial

[![IMAGE ALT TEXT HERE](https://i.ytimg.com/vi/wz3kElLbEHE/hqdefault.jpg?custom=true&w=246&h=138&stc=true&jpg444=true&jpgq=90&sp=68&sigh=Y0kBJRz4j1x6OcRl3-jtIKAJHhU)
     ](https://youtu.be/wz3kElLbEHE)