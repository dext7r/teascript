# teaScript

## 介绍

teaScript 是一个基于 Node.js 的puppeteer脚本，用于自动化撸空投tea任务。


## 使用

### 安装

```bash
git clone https://github.com/h7ml/teaScript.git
```

### 依赖

```bash
pnpm i
```

## 配置

### .env

在根目录新建`.env`文件
写入`SEARCH_TARGETS=xxx`
xxx为`npm scope`的包前缀，例如包名`@dext7r/hooks`,则`SEARCH_TARGETS=dext7r`,支持多个包前缀`SEARCH_TARGETS=dext7r,h7ml`，使用`,`分割 

### localstore.json

在`config`目录下新建`localstore.json`文件，写入内容为[https://app.tea.xyz/my-projects](https://app.tea.xyz/my-projects)的`localstore`。可以通过打开控制台输入以下代码获取

```js
let store = {};

for (let i = 0; i < localStorage.length; i++) {
    let key = localStorage.key(i);
    let value = localStorage.getItem(key);

    try {
        value = JSON.parse(value);
    } catch (e) {
    }
    store[key] = value;
}
console.log(store)
window.copy(store)
```

## 运行

### 获取所有的npm包

```bash
pnpm getpkg
```

### 自动化申请

```bash
pnpm start
```
