# NexaGate

NexaGate 是一个面向用户的 AI API 网关前台。它把公开官网、用户控制台、模型广场、文档、价格页和 `/v1` API 入口放在 NexaGate 品牌下；New API 作为内部网关引擎运行在后端，用来管理渠道、模型、倍率、用户额度和调用日志。

## 目录

- `nexagate-site/`：NexaGate 前台和 Node 反向代理。
- `deploy/`：Caddy / Nginx 部署配置。
- `docs/`：上线、后台访问和用户接入文档。
- `tools/`：上线后的冒烟测试脚本。
- `docker-compose.nexagate.prod.yml`：第一版生产部署编排。
- `env.nexagate.prod.example`：生产环境变量模板。

## 本地预览

NexaGate 前台默认监听 `8088`，New API 后端默认监听 `3000`。

```bash
cd nexagate-site
node server.js
```

然后打开：

```text
http://127.0.0.1:8088/index.html
```

## 生产部署

第一版上线推荐使用：

```bash
cp env.nexagate.prod.example .env
docker compose -f docker-compose.nexagate.prod.yml --env-file .env up -d
```

详细步骤见：

- `deploy/NEXAGATE_GO_LIVE.md`
- `docs/launch-checklist-zh.md`

## 安全提醒

不要把这些文件提交到 GitHub：

- `.env`
- `data/new-api.db`
- 上游 API Key
- 支付宝 / 微信真实收款码
- 浏览器缓存、截图、上线压缩包
