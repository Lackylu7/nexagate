# 管理员后台入口

当前本地开发环境里，后台分成两个页面：

- NexaGate 用户控制台：`http://127.0.0.1:8088/console.html`
- New API 管理后台：`http://localhost:3000`

普通用户以后只看 NexaGate 官网和 NexaGate 用户控制台。New API 管理后台只给站长使用，用来管理渠道、模型、倍率、用户、额度、日志和支付配置。

## 本地管理员登录

地址：

```text
http://localhost:3000
```

当前初始化账号：

```text
用户名：admin
密码：以你本机后台首次启动后显示或已修改的管理员密码为准
```

首次登录后建议马上修改密码。

## 本地内部跳转页

我也放了一个内部跳转页，方便你区分用户控制台和管理员后台：

```text
http://127.0.0.1:8088/internal-admin.html
```

这个页面不会挂在公开导航里，只作为本地开发阶段的管理员快捷入口。

## 上线后的建议结构

```text
https://nexagate.yourdomain.com
NexaGate 官网

https://nexagate.yourdomain.com/console.html
NexaGate 用户控制台

https://nexagate.yourdomain.com/v1
用户 API 调用入口

https://admin.nexagate.yourdomain.com
New API 管理后台，仅管理员访问
```

上线时建议给 `admin.nexagate.yourdomain.com` 加访问限制，例如强密码、二次验证、IP 白名单或反向代理鉴权。
