---
title: jason-web-tokens-day1
date: 2016-12-31 10:48:21
categories:
- security
tags:
- jwt
---
# jwt简单应用
## jwt应用图示

用来校验请求者是最初认证的.

<!--more-->

### jwt-structure
![](/assets/2016/jwt-progress.png) 

![](/assets/2016/jwt-structure.png) 

---

## jwt实例

```
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE0ODMxNTY0MzAsImV4cCI6MTUxNDY5MjQzMCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIlByb2plY3QgQWRtaW5pc3RyYXRvciIsInNkZnNlZiJdfQ.qAUnQS3NMqMnO38nBfyrK1E2mWgs3Jh63GF8E3O9C1o
```

` . `建jwt分为三段,前两端是header和payload的base64编码(可解码),

header解码后是:
```JSON
{
  "typ": "JWT",
  "alg": "HS256"
}
```

payload解码后是:
```JSON
{
  "iss": "Online JWT Builder",
  "iat": 1483156430,
  "exp": 1514692430,
  "aud": "www.example.com",
  "sub": "jrocket@example.com",
  "GivenName": "Johnny",
  "Surname": "Rocket",
  "Email": "jrocket@example.com",
  "Role": [
    "Project Administrator",
    "sdfsef"
  ]
}
```

最后的signature是将header和payload, 进过key按照加密算法(可选的hs256,hs384,hs512)生成的数字签名.

校验如下:
```JS
//VERIFY SIGNATURE
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  abc /*key*/
) 

```
---

## deomo

```
npm install crypto-js
```

```js
var CryptoJS = require("crypto-js");
var header = '{"typ":"JWT","alg":"HS256"}';
var payload = "{'iss':'Online JWT Builder','iat':1483156430,'exp':1514692430,'aud':'www.example.com','sub':'jrocket@example.com','GivenName':'Johnny','Surname':'Rocket','Email':'jrocket@example.com','Role':['Project Administrator','sdfsef']}";
 
var headerArray = CryptoJS.enc.Utf8.parse(header)
var header64 = CryptoJS.enc.Base64.stringify(headerArray)

var payloadArray = CryptoJS.enc.Utf8.parse(payload)
var payload64 = CryptoJS.enc.Base64.stringify(payloadArray)

console.log(header64 + '.' + payload64 + 'end')

var headerDecodeArray = CryptoJS.enc.Base64.parse('eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE0ODMxNTY0MzAsImV4cCI6MTUxNDY5MjQzMCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIlByb2plY3QgQWRtaW5pc3RyYXRvciIsInNkZnNlZiJdfQ');
var headerDecode = headerDecodeArray.toString(CryptoJS.enc.Utf8);

console.log(headerDecode);


var signature = CryptoJS.HmacSHA256(header64 + '.' + payload64, 'abc');
console.log(CryptoJS.enc.Base64.stringify(signature));
```


---
## 参考
- [create jwt](http://jwtbuilder.jamiekurtz.com)
- [verify jwt](https://jwt.io/)
- [JSON Web Token - 在Web应用间安全地传递信息](http://blog.leapoahead.com/2015/09/06/understanding-jwt/)
- [youtube tutorial](https://youtu.be/oXxbB5kv9OA?list=PLvZkOAgBYrsStrH9bCq6Jsx7CZJoOoDaH)

{% youtube oXxbB5kv9OA %}
