const http = require("http");
const https = require("https");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.NEXAGATE_PORT || 8088);
const DEV_UPSTREAM_HOST = [127, 0, 0, 1].join(".");
const UPSTREAM = process.env.NEW_API_ORIGIN || `http://${DEV_UPSTREAM_HOST}:3000`;
const PUBLIC_SITE_URL = process.env.PUBLIC_SITE_URL || "";
const PUBLIC_API_BASE_URL = process.env.PUBLIC_API_BASE_URL || "";
const ADMIN_BACKEND_URL = process.env.ADMIN_BACKEND_URL || UPSTREAM;
const SUPPORT_CONTACT = process.env.SUPPORT_CONTACT || "support@nexagate.local";
const ROOT = __dirname;
const NEXAGATE_SESSION_SECRET =
  process.env.NEXAGATE_SESSION_SECRET ||
  process.env.SESSION_SECRET ||
  crypto.createHash("sha256").update(`${UPSTREAM}|${ROOT}|nexagate-session`).digest("hex");
const DATA_DIR = path.join(ROOT, "data");
const MANUAL_TOPUPS_FILE = path.join(DATA_DIR, "manual-topups.json");
const AUDIT_LOG_FILE = path.join(DATA_DIR, "audit-log.json");
const MAX_JSON_BODY = Number(process.env.NEXAGATE_MAX_JSON_BODY || 1024 * 1024);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "SAMEORIGIN",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; form-action 'self' https: http:; frame-ancestors 'self'; base-uri 'self'",
    ...headers,
  });
  res.end(body);
}

function sendJson(res, status, payload) {
  send(res, status, JSON.stringify(payload), { "Content-Type": "application/json; charset=utf-8" });
}

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
}

function requestOrigin(req) {
  const proto = req.headers["x-forwarded-proto"] || (req.socket.encrypted ? "https" : "http");
  return `${proto}://${req.headers.host || `nexagate.local:${PORT}`}`;
}

function siteUrl(req) {
  return (PUBLIC_SITE_URL || requestOrigin(req)).replace(/\/+$/, "");
}

function apiBaseUrl(req) {
  return (PUBLIC_API_BASE_URL || `${siteUrl(req)}/v1`).replace(/\/+$/, "");
}

function publicConfig(req) {
  return {
    PUBLIC_SITE_URL: siteUrl(req),
    PUBLIC_API_BASE_URL: apiBaseUrl(req),
    ADMIN_BACKEND_URL: "",
    SUPPORT_CONTACT,
  };
}

function parseCookies(header) {
  return String(header || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const index = part.indexOf("=");
      if (index === -1) return cookies;
      cookies[decodeURIComponent(part.slice(0, index))] = decodeURIComponent(part.slice(index + 1));
      return cookies;
    }, {});
}

function secureCookieSuffix(req) {
  const proto = req.headers["x-forwarded-proto"] || "";
  return req.socket.encrypted || proto === "https" ? "; Secure" : "";
}

function signNexaSession(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", NEXAGATE_SESSION_SECRET).update(data).digest("base64url");
  return `${data}.${signature}`;
}

function readNexaSession(req) {
  const value = parseCookies(req.headers.cookie).nexa_user;
  if (!value) return null;
  const [data, signature] = String(value).split(".");
  if (!data || !signature) return null;
  const expected = crypto.createHmac("sha256", NEXAGATE_SESSION_SECRET).update(data).digest("base64url");
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (!payload?.id || Number(payload.exp || 0) < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function nexaUserCookie(user, req) {
  if (!user?.id) return null;
  const maxAge = 60 * 60 * 24 * 30;
  const payload = {
    id: Number(user.id),
    username: String(user.username || user.display_name || ""),
    role: Number(user.role || 0),
    exp: Math.floor(Date.now() / 1000) + maxAge,
  };
  return `nexa_user=${encodeURIComponent(signNexaSession(payload))}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secureCookieSuffix(req)}`;
}

function clearNexaUserCookie(req) {
  return `nexa_user=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secureCookieSuffix(req)}`;
}

function mergeSetCookies(existing, extra = []) {
  const cookies = [];
  if (Array.isArray(existing)) cookies.push(...existing);
  else if (existing) cookies.push(existing);
  extra.filter(Boolean).forEach((cookie) => cookies.push(cookie));
  return cookies;
}

function injectUpstreamUserHeader(req, headers) {
  delete headers["new-api-user"];
  delete headers["New-Api-User"];
  const user = readNexaSession(req);
  if (user?.id) headers["New-Api-User"] = String(user.id);
  return headers;
}

function appendAudit(req, action, detail = {}, user = null) {
  const records = readJson(AUDIT_LOG_FILE, []);
  records.push({
    id: crypto.randomUUID(),
    action,
    user_id: user?.id ? String(user.id) : "",
    username: user?.username || user?.display_name || "",
    detail,
    ip: String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0],
    created_at: new Date().toISOString(),
  });
  writeJson(AUDIT_LOG_FILE, records.slice(-1000));
}

function isMutatingMethod(method) {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(String(method || "").toUpperCase());
}

function requireCsrf(req, res) {
  if (!isMutatingMethod(req.method)) return true;
  const cookies = parseCookies(req.headers.cookie);
  if (
    req.headers["x-requested-with"] === "NexaGate" &&
    cookies.nexa_csrf &&
    req.headers["x-nexa-csrf"] === cookies.nexa_csrf
  ) {
    return true;
  }
  sendJson(res, 403, { success: false, message: "请求已被安全策略拦截，请刷新页面后重试" });
  return false;
}

function upstreamRequest(req, upstreamPath, options = {}) {
  return new Promise((resolve, reject) => {
    const upstreamUrl = new URL(upstreamPath, UPSTREAM);
    const body = options.body ? Buffer.from(options.body) : null;
    const headers = {
      accept: "application/json",
      cookie: req.headers.cookie || "",
      ...(options.headers || {}),
      host: upstreamUrl.host,
    };
    if (!options.skipUserHeader) injectUpstreamUserHeader(req, headers);
    if (body) {
      headers["content-type"] = headers["content-type"] || "application/json";
      headers["content-length"] = body.length;
    }
    const transport = upstreamUrl.protocol === "https:" ? https : http;
    const upstreamReq = transport.request(
      upstreamUrl,
      {
        method: options.method || "GET",
        headers,
      },
      (upstreamRes) => {
        const chunks = [];
        upstreamRes.on("data", (chunk) => chunks.push(chunk));
        upstreamRes.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          const contentType = upstreamRes.headers["content-type"] || "";
          let payload = raw;
          if (contentType.includes("application/json")) {
            try {
              payload = raw ? JSON.parse(raw) : {};
            } catch {
              payload = {};
            }
          }
          resolve({ status: upstreamRes.statusCode || 502, headers: upstreamRes.headers, payload });
        });
      },
    );
    upstreamReq.on("error", reject);
    if (body) upstreamReq.write(body);
    upstreamReq.end();
  });
}

async function getUpstreamSelf(req) {
  const result = await upstreamRequest(req, "/api/user/self");
  if (result.status < 200 || result.status >= 300) return null;
  if (!result.payload || typeof result.payload !== "object" || result.payload.success === false) return null;
  return result.payload.data || null;
}

async function requireUser(req, res) {
  const user = await getUpstreamSelf(req);
  if (!user?.id) {
    sendJson(res, 401, { success: false, message: "请先登录" });
    return null;
  }
  return user;
}

async function requireAdmin(req, res) {
  const user = await requireUser(req, res);
  if (!user) return null;
  if (Number(user.role || 0) < 10) {
    sendJson(res, 403, { success: false, message: "需要管理员权限" });
    return null;
  }
  return user;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_JSON_BODY) {
        reject(new Error("请求内容过大"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_JSON_BODY) {
        reject(new Error("Request body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || `nexagate.local:${PORT}`}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";
  const rootPath = path.resolve(ROOT);
  const filePath = path.resolve(path.join(ROOT, pathname));

  if (!filePath.startsWith(`${rootPath}${path.sep}`) && filePath !== rootPath) {
    send(res, 403, "Forbidden");
    return;
  }

  if (filePath.startsWith(`${DATA_DIR}${path.sep}`) || filePath.includes(`${path.sep}screenshots${path.sep}`)) {
    send(res, 403, "Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      fs.readFile(path.join(ROOT, "404.html"), (notFoundError, notFoundData) => {
        if (notFoundError) {
          send(res, 404, "Not found", { "Content-Type": "text/plain; charset=utf-8" });
          return;
        }
        send(res, 404, notFoundData, {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        });
      });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const noStore = [".html", ".js", ".css", ".webmanifest", ""].includes(ext);
    const cacheControl = noStore ? "no-store" : "public, max-age=3600";
    send(res, 200, data, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": cacheControl,
    });
  });
}

async function serveAdminStatic(req, res) {
  const user = await getUpstreamSelf(req);
  if (!user?.id) {
    send(res, 302, "", { Location: `./auth.html?next=${encodeURIComponent(req.url.replace(/^\//, ""))}` });
    return;
  }
  if (Number(user.role || 0) < 10) {
    send(res, 302, "", { Location: "./console.html" });
    return;
  }
  serveStatic(req, res);
}

function proxy(req, res) {
  const upstreamUrl = new URL(req.url, UPSTREAM);
  const headers = { ...req.headers, host: upstreamUrl.host };
  delete headers["accept-encoding"];
  injectUpstreamUserHeader(req, headers);

  const transport = upstreamUrl.protocol === "https:" ? https : http;
  const proxyReq = transport.request(
    upstreamUrl,
    {
      method: req.method,
      headers,
    },
    (proxyRes) => {
      const responseHeaders = { ...proxyRes.headers };
      delete responseHeaders["transfer-encoding"];
      responseHeaders["cache-control"] = "no-store";
      res.writeHead(proxyRes.statusCode || 502, responseHeaders);
      proxyRes.pipe(res);
    },
  );

  proxyReq.on("error", (error) => {
    send(
      res,
      502,
      JSON.stringify({
        success: false,
        message: `无法连接后端服务：${error.message}`,
      }),
      { "Content-Type": "application/json; charset=utf-8" },
    );
  });

  req.pipe(proxyReq);
}

async function handleAuthSessionProxy(req, res) {
  try {
    const body = await readRawBody(req);
    const result = await upstreamRequest(req, req.url, {
      method: req.method,
      body,
      headers: { "content-type": req.headers["content-type"] || "application/json" },
      skipUserHeader: true,
    });
    const responseHeaders = {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    };
    const loginCookie =
      result.payload?.success === true && result.payload?.data?.id ? nexaUserCookie(result.payload.data, req) : null;
    const cookies = mergeSetCookies(result.headers["set-cookie"], [loginCookie]);
    if (cookies.length) responseHeaders["Set-Cookie"] = cookies;
    send(res, result.status, JSON.stringify(result.payload || {}), responseHeaders);
  } catch (error) {
    sendJson(res, 502, { success: false, message: `登录请求转发失败：${error.message}` });
  }
}

async function handleLogoutProxy(req, res) {
  try {
    const result = await upstreamRequest(req, req.url, {
      method: req.method,
      skipUserHeader: true,
    });
    const responseHeaders = {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Set-Cookie": mergeSetCookies(result.headers["set-cookie"], [clearNexaUserCookie(req)]),
    };
    send(res, result.status, JSON.stringify(result.payload || {}), responseHeaders);
  } catch (error) {
    send(res, 200, JSON.stringify({ success: true, message: "" }), {
      "Content-Type": "application/json; charset=utf-8",
      "Set-Cookie": clearNexaUserCookie(req),
    });
  }
}

function handleConfig(req, res) {
  const config = publicConfig(req);
  send(
    res,
    200,
    `window.NEXAGATE_CONFIG=${JSON.stringify(config)};\n`,
    {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store",
    },
  );
}

async function handleAdminConfig(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  sendJson(res, 200, { success: true, data: { ADMIN_BACKEND_URL } });
}

function handleRobots(req, res) {
  send(
    res,
    200,
    `User-agent: *\nAllow: /\nDisallow: /console.html\nDisallow: /profit.html\nDisallow: /internal-admin.html\nSitemap: ${siteUrl(req)}/sitemap.xml\n`,
    { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  );
}

function handleSitemap(req, res) {
  const base = siteUrl(req);
  const pages = ["", "/pricing.html", "/docs.html", "/models.html", "/support.html", "/security.html", "/status.html"];
  const urls = pages
    .map((page) => `  <url><loc>${base}${page || "/index.html"}</loc></url>`)
    .join("\n");
  send(
    res,
    200,
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "no-store" },
  );
}

function handleManifest(req, res) {
  const base = siteUrl(req);
  send(
    res,
    200,
    JSON.stringify({
    name: "NexaGate",
    short_name: "NexaGate",
    description: "面向开发者的 AI API 网关",
    start_url: `${base}/index.html`,
    scope: `${base}/`,
    display: "standalone",
    background_color: "#0f1110",
    theme_color: "#0f1110",
    icons: [
      { src: "/assets/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/assets/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
      { src: "/assets/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
    ],
    }),
    { "Content-Type": "application/manifest+json; charset=utf-8", "Cache-Control": "no-store" },
  );
}

function handleCsrf(req, res) {
  const token = crypto.randomBytes(24).toString("hex");
  send(res, 200, JSON.stringify({ success: true, data: { token } }), {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Set-Cookie": `nexa_csrf=${encodeURIComponent(token)}; Path=/; SameSite=Lax${secureCookieSuffix(req)}`,
  });
}

async function handleManualTopups(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || `nexagate.local:${PORT}`}`);
  const records = readJson(MANUAL_TOPUPS_FILE, []);

  if (req.method === "GET" && url.pathname === "/nexa/manual-topups") {
    const all = url.searchParams.get("all") === "1";
    const user = all ? await requireAdmin(req, res) : await requireUser(req, res);
    if (!user) return;
    const userId = String(user.id || "");
    const data = all ? records : records.filter((item) => String(item.user_id || "") === userId);
    sendJson(res, 200, { success: true, data: data.slice().reverse() });
    return;
  }

  if (req.method === "POST" && url.pathname === "/nexa/manual-topups") {
    try {
      const user = await requireUser(req, res);
      if (!user) return;
      const body = await readBody(req);
      const amount = Number(body.amount || 0);
      if (!Number.isFinite(amount) || amount <= 0) {
        sendJson(res, 400, { success: false, message: "请输入有效充值金额" });
        return;
      }
      const contact = String(body.contact || "").trim();
      if (!contact) {
        sendJson(res, 400, { success: false, message: "请填写联系方式，方便管理员核对入账" });
        return;
      }
      const now = new Date();
      const orderNo = `NG${now.getTime()}${Math.floor(Math.random() * 900 + 100)}`;
      const record = {
        id: orderNo,
        order_no: orderNo,
        user_id: String(user.id || ""),
        username: String(user.username || user.display_name || body.username || "").slice(0, 80),
        amount: Math.round(amount * 100) / 100,
        payment_method: String(body.payment_method || "manual").slice(0, 40),
        contact: contact.slice(0, 120),
        note: String(body.note || "").slice(0, 500),
        status: "pending",
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };
      records.push(record);
      writeJson(MANUAL_TOPUPS_FILE, records);
      appendAudit(req, "manual_topup_submitted", { order_no: orderNo, amount: record.amount }, user);
      sendJson(res, 200, { success: true, data: record });
    } catch (error) {
      sendJson(res, 400, { success: false, message: `充值信息格式不正确：${error.message}` });
    }
    return;
  }

  const statusMatch = url.pathname.match(/^\/nexa\/manual-topups\/([^/]+)$/);
  if (req.method === "PATCH" && statusMatch) {
    try {
      const admin = await requireAdmin(req, res);
      if (!admin) return;
      const body = await readBody(req);
      const nextStatus = String(body.status || "").trim();
      if (!["pending", "credited", "rejected"].includes(nextStatus)) {
        sendJson(res, 400, { success: false, message: "状态不正确" });
        return;
      }
      const id = decodeURIComponent(statusMatch[1]);
      const record = records.find((item) => item.id === id);
      if (!record) {
        sendJson(res, 404, { success: false, message: "订单不存在" });
        return;
      }
      record.status = nextStatus;
      record.updated_at = new Date().toISOString();
      writeJson(MANUAL_TOPUPS_FILE, records);
      appendAudit(req, "manual_topup_reviewed", { order_no: record.order_no, status: nextStatus }, admin);
      sendJson(res, 200, { success: true, data: record });
    } catch (error) {
      sendJson(res, 400, { success: false, message: `状态更新失败：${error.message}` });
    }
    return;
  }

  sendJson(res, 404, { success: false, message: "Not found" });
}

function isBrowserKeyRead(req) {
  const url = new URL(req.url, `http://${req.headers.host || `nexagate.local:${PORT}`}`);
  return (
    req.method === "POST" &&
    (/^\/api\/token\/[^/]+\/key$/.test(url.pathname) || url.pathname === "/api/token/batch/keys")
  );
}

async function handleAudit(req, res) {
  if (req.method !== "POST" || req.url !== "/nexa/audit") {
    sendJson(res, 404, { success: false, message: "Not found" });
    return;
  }
  try {
    const user = await requireUser(req, res);
    if (!user) return;
    const body = await readBody(req);
    const action = String(body.action || "").trim().slice(0, 80);
    if (!action) {
      sendJson(res, 400, { success: false, message: "缺少审计动作" });
      return;
    }
    appendAudit(req, action, body.detail && typeof body.detail === "object" ? body.detail : {}, user);
    sendJson(res, 200, { success: true });
  } catch (error) {
    sendJson(res, 400, { success: false, message: `审计记录失败：${error.message}` });
  }
}

async function handlePlayground(req, res) {
  if (req.method !== "POST" || req.url !== "/nexa/playground") {
    sendJson(res, 404, { success: false, message: "Not found" });
    return;
  }
  try {
    const user = await requireUser(req, res);
    if (!user) return;
    const body = await readBody(req);
    const tokenId = Number(body.token_id || 0);
    const model = String(body.model || "").trim();
    const prompt = String(body.prompt || "").trim();
    if (!tokenId || !model || !prompt) {
      sendJson(res, 400, { success: false, message: "请填写 API Key、模型和提示词" });
      return;
    }
    const keyResult = await upstreamRequest(req, `/api/token/${tokenId}/key`, { method: "POST" });
    const apiKey = keyResult.payload?.data?.key;
    if (keyResult.status >= 400 || !apiKey) {
      sendJson(res, 400, { success: false, message: "无法读取测试所需的 Key，请重新创建 API Key" });
      return;
    }
    const completion = await upstreamRequest(req, "/v1/chat/completions", {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    appendAudit(req, "playground_request", { token_id: tokenId, model }, user);
    send(
      res,
      completion.status,
      JSON.stringify(completion.payload),
      { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    );
  } catch (error) {
    sendJson(res, 500, { success: false, message: `Playground 请求失败：${error.message}` });
  }
}

http
  .createServer(async (req, res) => {
    try {
    if (req.url === "/nexa/config.js") {
      handleConfig(req, res);
      return;
    }
    if (req.url === "/nexa/admin-config") {
      await handleAdminConfig(req, res);
      return;
    }
    if (req.url === "/nexa/csrf") {
      handleCsrf(req, res);
      return;
    }
    if (req.url === "/robots.txt") {
      handleRobots(req, res);
      return;
    }
    if (req.url === "/sitemap.xml") {
      handleSitemap(req, res);
      return;
    }
    if (req.url === "/manifest.webmanifest") {
      handleManifest(req, res);
      return;
    }
    if (req.url === "/healthz" || req.url === "/nexa/health") {
      sendJson(res, 200, {
        success: true,
        service: "nexagate-site",
        upstream: UPSTREAM,
        time: new Date().toISOString(),
      });
      return;
    }
    if (req.url === "/nexa/audit") {
      if (!requireCsrf(req, res)) return;
      await handleAudit(req, res);
      return;
    }
    if (req.url === "/nexa/playground") {
      if (!requireCsrf(req, res)) return;
      await handlePlayground(req, res);
      return;
    }
    if (req.url.startsWith("/nexa/manual-topups")) {
      if (!requireCsrf(req, res)) return;
      await handleManualTopups(req, res);
      return;
    }
    if (req.url === "/api/user/login" || req.url === "/api/user/login/2fa" || req.url === "/api/user/passkey/login/finish") {
      if (!requireCsrf(req, res)) return;
      await handleAuthSessionProxy(req, res);
      return;
    }
    if (req.url === "/api/user/logout") {
      await handleLogoutProxy(req, res);
      return;
    }
    if (req.url.startsWith("/api/")) {
      if (!requireCsrf(req, res)) return;
      if (isBrowserKeyRead(req)) {
        sendJson(res, 403, {
          success: false,
          message: "完整 API Key 只在创建时显示一次；请重新创建 Key 后保存。",
        });
        return;
      }
      proxy(req, res);
      return;
    }
    if (req.url.startsWith("/v1/")) {
      proxy(req, res);
      return;
    }
    if (req.url === "/profit.html" || req.url === "/internal-admin.html") {
      await serveAdminStatic(req, res);
      return;
    }
    serveStatic(req, res);
    } catch (error) {
      if (!res.headersSent) {
        sendJson(res, 500, { success: false, message: `NexaGate 请求处理失败：${error.message}` });
      } else {
        res.end();
      }
    }
  })
  .listen(PORT, () => {
    console.log(`NexaGate shell listening on port ${PORT}`);
    console.log(`Proxying API to: ${UPSTREAM}`);
  });
