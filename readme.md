# This a hexo blog repo

## quick catch up
### **Step1:** Clone project
```
$ git clone -b master https://github.com/haoaa/hexo.git .
```

### **Step2:** npm install
```
$ npm install
```

### **Step3:** write new md post under the `source/_posts`, the engine will add date automatically
```
$ hexo new something-about-sass
``` 
### **Step4:** commit and deploy

- commit source and deploy
 ```sh
 npm run pd  "your commit comments goes here"
 ```
- local serve 
 ```sh
 npm run x 
 ```
 
### update theme
```sh
git remote add next https://github.com/iissnan/hexo-theme-next.git
git subtree add --prefix themes/next next master
git subtree pull --prefix themes/next next master
```

### read more tag
```html
<!--more-->
```
---
[Markdown-Cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)