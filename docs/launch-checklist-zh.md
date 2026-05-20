# 上线检查清单

## 1. 基础设施

- 域名已经解析到服务器，例如 `nexagate.yourdomain.com`。
- 服务器开放 80、443 端口。
- Docker 和 Docker Compose 已安装。
- 项目目录已上传到服务器。
- `data/new-api.db` 已随项目上传，并确认文件没有泄露给无关人员。
- 已复制 `env.nexagate.prod.example` 为 `.env`。
- `.env` 中域名、联系方式和所有密钥都已替换。

## 2. 启动服务

```bash
docker compose -f docker-compose.nexagate.prod.yml --env-file .env up -d
docker compose -f docker-compose.nexagate.prod.yml --env-file .env ps
```

确认：

- `nexagate-caddy`、`nexagate-site`、`nexagate-new-api` 都在运行。
- `https://你的域名/healthz` 返回正常。
- `https://你的域名/nexa/health` 返回正常。
- `https://你的域名/v1/models` 能返回模型列表。

## 3. 后台访问

New API 默认只绑定服务器本机，公网用户不能直接打开。管理员通过 SSH 隧道访问：

```bash
ssh -L 3000:127.0.0.1:3000 root@服务器公网IP
```

然后在自己电脑打开：

```text
http://127.0.0.1:3000
```

## 4. 用户侧流程

- 首页打开正常，主语言为中文。
- 注册、登录、退出登录正常。
- 控制台可以看到 Base URL。
- 复制 Base URL、复制 API Key 正常。
- 未创建 Key 时有明确提示。
- 创建 API Key 会校验余额和额度。
- 模型广场能显示 DeepSeek 和 Xiaomi 模型。
- 文档页能指导用户替换 Base URL、填入 API Key、选择模型。

## 5. 计费与支付

- New API 后台倍率已设置。
- NexaGate 价格页展示价与后台倍率策略一致。
- 支付宝、微信收款码已替换为你的真实收款码。
- 用户点击充值后再看到收款码。
- 用户提交充值信息后，管理员能看到待核对记录。
- 管理员确认到账后，余额能正确入账。

## 6. 风控

- 关闭大额免费试用。
- 普通用户不能创建不限额 Key。
- 每个 API Key 都建议设置额度。
- 余额不足时请求会停止。
- 观察失败率、异常高频请求、批量注册和大额消耗。
- 不宣传绕过限制、共享密钥、无限套餐或免费代理。

## 7. 上线后第一周目标

- 找 3 到 10 个真实用户试用。
- 每天看调用量、失败率、余额扣费和毛利。
- 优先修复支付、充值、Key 创建、模型调用这些真实路径问题。
- 稳定后再考虑接自动支付、后台独立域名、Postgres 迁移和更多渠道。
