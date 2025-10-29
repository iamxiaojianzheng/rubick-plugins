# MavenSearch

## 介绍

> 基于：https://mvn.coderead.cn/ 开发

最快捷的Maven搜索
- 不依赖于国外网络，每周自动去Maven仓库同步索引到国内。
- 自研搜索算法，无论单词多长，输入你记得的前几个字母即可。
- 热度排序，使用的人数越多，结果越智能。

## 使用

输入依赖关键词

![搜索依赖](https://picx.zhimg.com/v2-4f3287153c9f8fa9cfa2c017c8cec562.png)

点击对应版本号

![选择版本点击](https://pic1.zhimg.com/v2-659b8cb904e3a49368cef6271084a3cb.png)

自动复制依赖信息到剪切板

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot</artifactId>
    <version>4.0.0-M3</version>
</dependency>
```

