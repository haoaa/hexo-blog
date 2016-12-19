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
### Sass的变量以$开头
```css
$mainColor: #0982c1;
```
### Sass嵌套
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
### Sass Mixins
```css
/* Sass mixin error with (optional) argument $borderWidth which defaults to 2px if not specified */
@mixin error($borderWidth: 2px) {
  border: $borderWidth solid #F00;
  color: #F00;
}
  
.generic-error {
  padding: 20px;
  margin: 4px;
  @ include error(); /* Applies styles from mixin error, with no parameters call will apply the default value 2px. */
}
```

### Sass inheritant
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

### Sass import
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
> md 两空格换行,两回车换段落

### Sass vedio tutorial

[![IMAGE ALT TEXT HERE](https://i.ytimg.com/vi/wz3kElLbEHE/hqdefault.jpg?custom=true&w=246&h=138&stc=true&jpg444=true&jpgq=90&sp=68&sigh=Y0kBJRz4j1x6OcRl3-jtIKAJHhU)
     ](https://youtu.be/wz3kElLbEHE)