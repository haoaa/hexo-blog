---
title: html-css-review
date: 2017-01-12 15:43:48
categories:
 - html
 - css
tags:
 - html
 - css
---

## Meta标签介绍

### meta 的属性有两种：name和http-equiv。 name属性主要用于描述网页，对应于content（网页内容）

1. <meta name="Generator" contect="">用以说明生成工具（如Microsoft FrontPage 4.0）等； 
2. <meta name="KEYWords" contect="">向搜索引擎说明你的网页的关键词； 
3. <meta name="DEscription" contect="">告诉搜索引擎你的站点的主要内容； 
4. <meta  name="Author"  contect="你的姓名">告诉搜索引擎你的站点的制作的作者； 
5. <meta   name="Robots" contect= "all|none|index|noindex|follow|nofollow"> 

#### 其中的属性说明如下： 

- 设定为all：文件将被检索，且页面上的链接可以被查询； 
- 设定为none：文件将不被检索，且页面上的链接不可以被查询； 
- 设定为index：文件将被检索； 
- 设定为follow：页面上的链接可以被查询； 
- 设定为noindex：文件将不被检索，但页面上的链接可以被查询； 
- 设定为nofollow：文件将不被检索，页面上的链接可以被查询。 

### http-equiv属性 

```html
<meta http-equiv="Content-Type"   contect="text/html";     charset=gb_2312"> 
<meta http-equiv="Refresh" content="5;url=http://www.w3school.com.cn" />
```