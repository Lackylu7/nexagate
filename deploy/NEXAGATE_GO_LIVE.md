# NexaGate 上线步骤

这份配置用于第一版上线：NexaGate 对外提供网站和 `/v1` 接口，New API 只作为服务器内的后台服务使用。当前本地已经配置好的渠道、模型、倍率和用户数据会继续放在 `data/new-api.db` 里，先保证上线快、迁移风险低。

## 1. 服务器准备

建议先用 2 核 4G、40G SSD 起步，区域优先选香港、新加坡或日本。服务器需要开放 80 和 443 端口，并安装 Docker 与 Docker Compose。

## 2. 域名解析

把你的域名 A 记录解析到服务器公网 IP，例如：

```text
nexagate.yourdomain.com -> 服务器公网 IP
```

Caddy 会自动申请 HTTPS 证书。DNS 生效前启动服务，证书可能会申请失败，等解析生效后重新启动即可。

## 3. 上传项目

把整个项目目录上传到服务器。必须包含：

- `nexagate-site/`
- `deploy/`
- `docker-compose.nexagate.prod.yml`
- `data/new-api.db`
- `logs/` 可以不存在，启动时会自动创建

`data/new-api.db` 里包含你的渠道配置和上游密钥，上传服务器时要保护好文件权限，不要发给无关的人。

## 4. 配置环境变量

在服务器项目目录执行：

```bash
cp env.nexagate.prod.example .env
```

然后编辑 `.env`：

- 把 `nexagate.yourdomain.com` 改成真实域名。
- 把三个 secret 改成不同的强随机值。
- `ADMIN_BACKEND_URL` 第一版建议保留 `http://127.0.0.1:3000`，管理员通过 SSH 隧道访问后台。

生成随机密钥可以用：

```bash
openssl rand -hex 32
```

## 5. 启动

```bash
docker compose -f docker-compose.nexagate.prod.yml --env-file .env up -d
```

查看状态：

```bash
docker compose -f docker-compose.nexagate.prod.yml --env-file .env ps
docker compose -f docker-compose.nexagate.prod.yml --env-file .env logs -f caddy nexagate-site new-api
```

## 6. 验证

确认这些地址正常：

```bash
curl https://nexagate.yourdomain.com/healthz
curl https://nexagate.yourdomain.com/nexa/health
curl https://nexagate.yourdomain.com/v1/models
```

然后用一个测试 API Key 调用：

```bash
curl https://nexagate.yourdomain.com/v1/chat/completions \
  -H "Authorization: Bearer 你的测试 API Key" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"hello"}]}'
```

## 7. 管理后台访问

New API 后台默认只绑定服务器本机 `127.0.0.1:3000`，公网用户打不开。管理员需要从自己电脑开 SSH 隧道：

```bash
ssh -L 3000:127.0.0.1:3000 root@服务器公网IP
```

然后本机浏览器打开：

```text
http://127.0.0.1:3000
```

后续如果要做后台域名，可以单独加 `admin.yourdomain.com`，并加 Basic Auth、IP 白名单或 VPN。

## 8. 上线前确认

- 首页、登录、控制台、模型广场、文档、价格页都能打开。
- `/v1/chat/completions` 能走到 New API。
- DeepSeek 和 Xiaomi 渠道在 New API 后台显示可用。
- 普通用户看不到 New API 标识和后台入口。
- 支付宝、微信收款码已经替换成你自己的真实图片。
- 手动充值流程可以从用户提交走到管理员确认。
- 服务条款、隐私政策、联系方式和域名都已替换成真实信息。
