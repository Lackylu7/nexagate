(function () {
  const LANGUAGE_KEY = "nexagate-language";
  const THEME_KEY = "nexagate-theme";
  const USER_ID_KEY = "nexagate-user-id";
  const SESSION_EXPIRES_AT_KEY = "nexagate-session-expires-at";
  const SESSION_TTL = 1000 * 60 * 60 * 24;
  const QUOTA_PER_UNIT = 500000;
  const LOG_PAGE_SIZE = 20;
  const config = window.NEXAGATE_CONFIG || {};

  const dictionary = {
    zh: {
      copied: "已复制",
      copyFailed: "复制失败",
      missingLogin: "请输入用户名和密码",
      passwordTooShort: "密码至少 8 位",
      passwordWeak: "注册密码需包含大小写字母、数字和特殊符号",
      signedIn: "已登录",
      registered: "账号已创建",
      sessionExpired: "登录已过期，请重新登录",
      requestFailed: "请求失败",
      keyCreated: "API Key 已创建",
      keyCreatedCopied: "API Key 已创建，完整密钥已复制，请立即保存",
      keyDeleted: "API Key 已删除",
      keyLoaded: "完整 Key 只在创建时显示一次",
      redeemSuccess: "兑换成功",
      paymentStarted: "支付页已打开",
      modelAdded: "已打开接入文档",
      noToken: "请先创建 API Key",
      noPrompt: "请输入提示词",
      running: "正在请求模型...",
      active: "已启用",
      disabled: "已禁用",
      unlimited: "不限额",
      emptyLogs: "暂无调用日志",
      emptyKeys: "暂无 API Key",
      emptyModels: "暂无可用模型，请联系管理员开通",
      available: "已可用",
      unavailable: "未开通",
      refreshDone: "已刷新",
      profileSaved: "资料已保存",
      keySaved: "API Key 已保存",
      selectKeysFirst: "请先选择 API Key",
      batchCopied: "已复制选中 Key 的标识信息",
      batchDeleted: "已删除选中的 API Key",
      accessTokenGenerated: "Access Token 已生成并复制",
      affTransferred: "返利额度已转入余额",
      enterRedeem: "请输入兑换码",
      choosePayment: "请选择支付渠道",
      invalidAmount: "请输入有效充值金额",
      paymentNotReady: "当前支付方式还未配置完成",
      onlinePayDisabled: "暂未配置在线支付，可先使用兑换码",
      noSearchResult: "没有找到匹配的模型",
      insufficientBalanceForKey: "余额不足，API Key 额度不能超过当前可用余额",
      unlimitedKeyAdminOnly: "普通用户不能创建不限额 API Key",
      manualTopupSubmitted: "充值信息已提交，管理员核对后会入账",
      manualTopupUpdated: "充值订单状态已更新",
      noIntegrationKey: "当前没有创建 Key，请先创建 API Key",
      keySecretUnavailable: "完整 Key 只在创建时显示一次；如果忘记保存，请重新创建一个 Key",
      maskedKeyCopied: "已复制 Key 标识",
      confirmDeleteKey: "确认删除这个 API Key？删除后无法继续使用。",
      confirmBatchDeleteKeys: "确认删除选中的 API Key？删除后无法恢复。",
      csrfMissing: "请求已被安全策略拦截，请刷新页面后重试",
      lightMode: "浅色模式",
      darkMode: "深色模式",
      focusSearch: "已定位到搜索框",
      offline: "网络已断开，部分操作可能失败",
      online: "网络已恢复",
      confirmTitle: "确认操作",
      cancel: "取消",
      confirm: "确认",
      prevPage: "上一页",
      nextPage: "下一页",
    },
    en: {
      copied: "Copied",
      copyFailed: "Copy failed",
      missingLogin: "Enter username and password",
      passwordTooShort: "Password must be at least 8 characters",
      passwordWeak: "Use upper/lowercase letters, numbers, and a symbol.",
      signedIn: "Signed in",
      registered: "Account created",
      sessionExpired: "Session expired. Please sign in again.",
      requestFailed: "Request failed",
      keyCreated: "API key created",
      keyCreatedCopied: "API key created and copied. Save it now.",
      keyDeleted: "API key deleted",
      keyLoaded: "Full keys are shown only once at creation",
      redeemSuccess: "Redeemed",
      paymentStarted: "Payment page opened",
      modelAdded: "Integration docs opened",
      noToken: "Create an API key first",
      noPrompt: "Enter a prompt",
      running: "Requesting model...",
      active: "Active",
      disabled: "Disabled",
      unlimited: "Unlimited",
      emptyLogs: "No usage logs yet",
      emptyKeys: "No API keys yet",
      emptyModels: "No enabled models. Contact an admin.",
      available: "Available",
      unavailable: "Not enabled",
      refreshDone: "Refreshed",
      profileSaved: "Profile saved",
      keySaved: "API key saved",
      selectKeysFirst: "Select API keys first",
      batchCopied: "Selected key references copied",
      batchDeleted: "Selected API keys deleted",
      accessTokenGenerated: "Access token generated and copied",
      affTransferred: "Referral balance transferred",
      enterRedeem: "Enter redemption code",
      choosePayment: "Choose a payment method",
      invalidAmount: "Enter a valid amount",
      paymentNotReady: "This payment method is not configured yet",
      onlinePayDisabled: "Online payment is not configured. Use redemption code.",
      noSearchResult: "No matching models",
      insufficientBalanceForKey: "Insufficient balance. API key cap cannot exceed current balance.",
      unlimitedKeyAdminOnly: "Regular users cannot create unlimited API keys.",
      manualTopupSubmitted: "Top-up request submitted. An admin will credit it after review.",
      manualTopupUpdated: "Top-up status updated.",
      noIntegrationKey: "No API key yet. Create one first.",
      keySecretUnavailable: "Full keys are shown only once at creation. Create a new key if you did not save it.",
      maskedKeyCopied: "Key reference copied",
      confirmDeleteKey: "Delete this API key? It will stop working immediately.",
      confirmBatchDeleteKeys: "Delete the selected API keys? This cannot be undone.",
      csrfMissing: "Blocked by security policy. Refresh and try again.",
      lightMode: "Light mode",
      darkMode: "Dark mode",
      focusSearch: "Search focused",
      offline: "You are offline. Some actions may fail.",
      online: "Back online",
      confirmTitle: "Confirm action",
      cancel: "Cancel",
      confirm: "Confirm",
      prevPage: "Previous",
      nextPage: "Next",
    },
  };

  let currentUser = null;
  let currentTokens = [];
  let currentModels = [];
  let currentTopupInfo = {};
  let currentProfitLogs = [];
  let currentManualTopups = [];
  let currentLogPage = 1;
  let toastTimer = 0;
  let lastDialogTrigger = null;
  let currentCsrfToken = "";

  const modelCatalog = {
    "deepseek-chat": {
      zhType: "通用对话",
      enType: "General chat",
      zhDescription: "适合对话、摘要、翻译、代码辅助、客服回复和内容草稿。",
      enDescription: "For chat, summaries, translation, coding help, support replies, and drafts.",
      price: "输入 $0.80 / 输出 $3.20 每 1M tokens",
      enPrice: "Input $0.80 / output $3.20 per 1M tokens",
      inputPrice: 0.8,
      outputPrice: 3.2,
      tags: ["OpenAI compatible", "low latency"],
    },
    "deepseek-v4-flash": {
      zhType: "通用对话",
      enType: "General chat",
      zhDescription: "DeepSeek 当前推荐的高速通用模型，适合多数聊天、代码辅助和文本处理场景。",
      enDescription: "DeepSeek's current fast general model for chat, coding help, and text processing.",
      price: "输入 $0.80 / 输出 $3.20 每 1M tokens",
      enPrice: "Input $0.80 / output $3.20 per 1M tokens",
      inputPrice: 0.8,
      outputPrice: 3.2,
      tags: ["current", "OpenAI compatible"],
    },
    "deepseek-reasoner": {
      zhType: "深度推理",
      enType: "Reasoning",
      zhDescription: "适合复杂分析、代码推理、方案规划和需要更强思考链路的任务。",
      enDescription: "For complex analysis, code reasoning, planning, and stronger reasoning tasks.",
      price: "输入 $1.60 / 输出 $6.40 每 1M tokens",
      enPrice: "Input $1.60 / output $6.40 per 1M tokens",
      inputPrice: 1.6,
      outputPrice: 6.4,
      tags: ["reasoning", "premium"],
    },
    "mimo-v2-flash": {
      zhType: "高速对话",
      enType: "Fast chat",
      zhDescription: "小米 MiMo 高速模型，适合日常问答、摘要、轻量代码辅助和低延迟场景。",
      enDescription: "Xiaomi MiMo fast model for daily chat, summaries, light coding help, and low-latency use.",
      price: "输入 $0.80 / 输出 $3.20 每 1M tokens",
      enPrice: "Input $0.80 / output $3.20 per 1M tokens",
      inputPrice: 0.8,
      outputPrice: 3.2,
      tags: ["Xiaomi MiMo", "fast"],
    },
    "mimo-v2.5": {
      zhType: "通用增强",
      enType: "General plus",
      zhDescription: "小米 MiMo V2.5 通用模型，适合对话、文本处理、结构化输出和应用集成。",
      enDescription: "Xiaomi MiMo V2.5 general model for chat, text processing, structured output, and app integration.",
      price: "输入 $0.80 / 输出 $3.20 每 1M tokens",
      enPrice: "Input $0.80 / output $3.20 per 1M tokens",
      inputPrice: 0.8,
      outputPrice: 3.2,
      tags: ["Xiaomi MiMo", "current"],
    },
    "mimo-v2-pro": {
      zhType: "专业模型",
      enType: "Pro model",
      zhDescription: "适合更复杂的分析、代码、长文本处理和对质量要求更高的任务。",
      enDescription: "For more complex analysis, coding, long-form text, and higher-quality tasks.",
      price: "输入 $1.60 / 输出 $6.40 每 1M tokens",
      enPrice: "Input $1.60 / output $6.40 per 1M tokens",
      inputPrice: 1.6,
      outputPrice: 6.4,
      tags: ["Xiaomi MiMo", "pro"],
    },
    "mimo-v2.5-pro": {
      zhType: "专业增强",
      enType: "Pro plus",
      zhDescription: "小米 MiMo V2.5 Pro，适合复杂推理、严肃写作、代码生成和企业应用。",
      enDescription: "Xiaomi MiMo V2.5 Pro for complex reasoning, serious writing, code generation, and business apps.",
      price: "输入 $1.60 / 输出 $6.40 每 1M tokens",
      enPrice: "Input $1.60 / output $6.40 per 1M tokens",
      inputPrice: 1.6,
      outputPrice: 6.4,
      tags: ["Xiaomi MiMo", "premium"],
    },
    "mimo-v2-omni": {
      zhType: "多模态",
      enType: "Omni",
      zhDescription: "小米 MiMo 多模态模型，适合需要更丰富输入输出能力的应用场景。",
      enDescription: "Xiaomi MiMo omni model for applications that need richer input and output capabilities.",
      price: "输入 $1.60 / 输出 $6.40 每 1M tokens",
      enPrice: "Input $1.60 / output $6.40 per 1M tokens",
      inputPrice: 1.6,
      outputPrice: 6.4,
      tags: ["Xiaomi MiMo", "omni"],
    },
  };

  const upstreamCostCatalog = {
    "deepseek-v4-flash": { inputMiss: 0.14, inputHit: 0.0028, output: 0.28 },
    "deepseek-chat": { inputMiss: 0.14, inputHit: 0.0028, output: 0.28 },
    "deepseek-reasoner": { inputMiss: 0.14, inputHit: 0.0028, output: 0.28 },
    "mimo-v2-flash": { inputMiss: 0.10, inputHit: 0.02, output: 0.30 },
    "mimo-v2.5": { inputMiss: 0.42, inputHit: 0.08, output: 2.10 },
    "mimo-v2-pro": { inputMiss: 1.05, inputHit: 0.21, output: 3.15 },
    "mimo-v2.5-pro": { inputMiss: 1.05, inputHit: 0.21, output: 3.15 },
  };

  const toast = document.createElement("div");
  toast.className = "toast";
  document.body.appendChild(toast);

  function currentLanguage() {
    return localStorage.getItem(LANGUAGE_KEY) || "zh";
  }

  function t(key) {
    const language = currentLanguage();
    return dictionary[language][key] || dictionary.zh[key] || key;
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2400);
  }

  function generateToken() {
    const values = new Uint8Array(16);
    if (window.crypto && typeof window.crypto.getRandomValues === "function") {
      window.crypto.getRandomValues(values);
      return Array.from(values, (value) => value.toString(16).padStart(2, "0")).join("");
    }
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  }

  async function csrfToken() {
    if (currentCsrfToken) return currentCsrfToken;
    const response = await fetch("/nexa/csrf", { credentials: "include", cache: "no-store" });
    const payload = await response.json();
    currentCsrfToken = payload?.data?.token || "";
    if (!currentCsrfToken) throw new Error(t("csrfMissing"));
    return currentCsrfToken;
  }

  function setSession(userId) {
    localStorage.setItem(USER_ID_KEY, String(userId));
    localStorage.setItem(SESSION_EXPIRES_AT_KEY, String(Date.now() + SESSION_TTL));
    csrfToken().catch(() => {});
  }

  function clearSession() {
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(SESSION_EXPIRES_AT_KEY);
    currentCsrfToken = "";
  }

  function sessionUserId() {
    const uid = localStorage.getItem(USER_ID_KEY);
    const expiresAt = Number(localStorage.getItem(SESSION_EXPIRES_AT_KEY) || 0);
    if (!uid) return "";
    if (!expiresAt) {
      localStorage.setItem(SESSION_EXPIRES_AT_KEY, String(Date.now() + SESSION_TTL));
      return uid;
    }
    if (Date.now() > expiresAt) {
      clearSession();
      return "";
    }
    localStorage.setItem(SESSION_EXPIRES_AT_KEY, String(Date.now() + SESSION_TTL));
    return uid;
  }

  function isPasswordStrong(password) {
    return /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
  }

  function ensureConfirmDialog() {
    let dialog = document.getElementById("confirmDialog");
    if (dialog) return dialog;
    dialog = document.createElement("dialog");
    dialog.id = "confirmDialog";
    dialog.innerHTML = `
      <form class="dialog-card confirm-card" method="dialog">
        <div class="dialog-head">
          <h2 data-confirm-title>${escapeHtml(t("confirmTitle"))}</h2>
          <button class="icon-button" type="button" data-confirm-cancel aria-label="Close">x</button>
        </div>
        <p data-confirm-message></p>
        <div class="inline-actions confirm-actions">
          <button class="button-ghost" type="button" data-confirm-cancel data-confirm-cancel-label>${escapeHtml(t("cancel"))}</button>
          <button class="button-danger" type="button" data-confirm-ok>${escapeHtml(t("confirm"))}</button>
        </div>
      </form>
    `;
    document.body.appendChild(dialog);
    dialog.querySelectorAll("[data-confirm-cancel]").forEach((button) => {
      button.addEventListener("click", () => dialog.close("cancel"));
    });
    return dialog;
  }

  async function confirmAction(messageKey) {
    const dialog = ensureConfirmDialog();
    const title = dialog.querySelector("[data-confirm-title]");
    const message = dialog.querySelector("[data-confirm-message]");
    const confirmButton = dialog.querySelector("[data-confirm-ok]");
    const cancelButton = dialog.querySelector("[data-confirm-cancel-label]");
    if (!dialog.showModal) return window.confirm(t(messageKey));
    if (title) title.textContent = t("confirmTitle");
    if (message) message.textContent = t(messageKey);
    if (confirmButton) confirmButton.textContent = t("confirm");
    if (cancelButton) cancelButton.textContent = t("cancel");
    return new Promise((resolve) => {
      const cleanup = () => {
        confirmButton?.removeEventListener("click", onConfirm);
        dialog.removeEventListener("close", onClose);
      };
      const onConfirm = () => {
        cleanup();
        dialog.close("confirm");
        resolve(true);
      };
      const onClose = () => {
        cleanup();
        resolve(dialog.returnValue === "confirm");
      };
      confirmButton?.addEventListener("click", onConfirm);
      dialog.addEventListener("close", onClose, { once: true });
      openDialog(dialog);
    });
  }

  function showCreatedKeyDialog(key) {
    let dialog = document.getElementById("createdKeyDialog");
    if (!dialog) {
      dialog = document.createElement("dialog");
      dialog.id = "createdKeyDialog";
      dialog.innerHTML = `
        <form class="dialog-card auth-form" method="dialog">
          <div class="dialog-head">
            <h2>${currentLanguage() === "en" ? "Save this API key" : "保存这个 API Key"}</h2>
            <button class="icon-button" type="button" data-close-created-key aria-label="Close">x</button>
          </div>
          <p class="form-note">${currentLanguage() === "en" ? "This full key is shown only once. Save it before closing." : "完整密钥只显示这一次，关闭前请保存。"}</p>
          <code class="secret-output" data-created-key></code>
          <div class="inline-actions">
            <button class="button" type="button" data-copy-created-key>${currentLanguage() === "en" ? "Copy key" : "复制 Key"}</button>
            <button class="button-ghost" type="button" data-close-created-key>${currentLanguage() === "en" ? "Done" : "我已保存"}</button>
          </div>
        </form>
      `;
      document.body.appendChild(dialog);
      dialog.querySelectorAll("[data-close-created-key]").forEach((button) => {
        button.addEventListener("click", () => dialog.close());
      });
      dialog.querySelector("[data-copy-created-key]")?.addEventListener("click", async () => {
        const value = dialog.querySelector("[data-created-key]")?.textContent || "";
        try {
          await copyText(value);
          showToast(t("copied"));
        } catch (error) {
          showToast(error.message || t("copyFailed"));
        }
      });
    }
    const target = dialog.querySelector("[data-created-key]");
    if (target) target.textContent = key;
    openDialog(dialog);
  }

  function emptyRow(colspan, message, hint = "") {
    return `<tr><td colspan="${colspan}"><div class="empty-state"><strong>${escapeHtml(message)}</strong>${hint ? `<p>${escapeHtml(hint)}</p>` : ""}</div></td></tr>`;
  }

  function loadingRow(colspan, message) {
    return `<tr><td colspan="${colspan}"><div class="loading-state"><span></span>${escapeHtml(message)}</div></td></tr>`;
  }

  function maskApiKey(value) {
    const text = String(value || "").trim();
    if (!text) return "-";
    if (text.length <= 12) return `${text.slice(0, 3)}••••`;
    return `${text.slice(0, 6)}••••${text.slice(-4)}`;
  }

  function tokenLabel(token) {
    if (!token) return "-";
    const name = token.name || `#${token.id}`;
    const hint = token.key ? ` · ${maskApiKey(token.key)}` : ` · #${token.id}`;
    return `${name}${hint}`;
  }

  function extractCreatedKey(payload) {
    const data = payload?.data || payload;
    return (
      data?.key ||
      data?.token ||
      data?.token_key ||
      data?.access_token ||
      data?.data?.key ||
      ""
    );
  }

  function debounce(fn, delay = 180) {
    let timer = 0;
    return (...args) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fn(...args), delay);
    };
  }

  function setButtonBusy(button, busy) {
    if (!button) return;
    if (busy) {
      button.dataset.originalText = button.textContent;
      button.disabled = true;
      button.classList.add("is-loading");
      button.textContent = currentLanguage() === "en" ? "Working..." : "处理中...";
      return;
    }
    button.disabled = false;
    button.classList.remove("is-loading");
    if (button.dataset.originalText) button.textContent = button.dataset.originalText;
  }

  function openDialog(dialog, trigger = document.activeElement) {
    if (!dialog || typeof dialog.showModal !== "function") return;
    lastDialogTrigger = trigger instanceof HTMLElement ? trigger : null;
    dialog.showModal();
    window.setTimeout(() => {
      const focusTarget = dialog.querySelector("input, select, textarea, button:not([data-close-dialog]):not(.icon-button)");
      if (focusTarget) focusTarget.focus();
    }, 0);
  }

  function applyLanguage(language) {
    const next = language === "en" ? "en" : "zh";
    document.documentElement.lang = next === "en" ? "en" : "zh-CN";
    document.querySelectorAll("[data-zh][data-en]").forEach((element) => {
      element.textContent = element.dataset[next] || element.dataset.zh;
    });
    document.querySelectorAll("[data-placeholder-zh][data-placeholder-en]").forEach((element) => {
      element.setAttribute("placeholder", next === "en" ? element.dataset.placeholderEn : element.dataset.placeholderZh);
    });
    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.classList.toggle("active", button.dataset.lang === next);
    });
    const skipLink = document.querySelector(".skip-link");
    if (skipLink) skipLink.textContent = next === "en" ? "Skip to content" : "跳到主要内容";
    localStorage.setItem(LANGUAGE_KEY, next);
    hydrateBaseUrl();
    syncTopupMode();
    updateThemeToggle();
    updateConsoleTitle();
  }

  function preferredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
    return "light";
  }

  function applyTheme(theme) {
    const next = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    localStorage.setItem(THEME_KEY, next);
    updateThemeToggle();
  }

  function updateThemeToggle() {
    const theme = document.documentElement.dataset.theme || preferredTheme();
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      const nextLabel = theme === "dark" ? t("lightMode") : t("darkMode");
      button.setAttribute("aria-label", nextLabel);
      button.title = nextLabel;
      button.textContent = theme === "dark" ? "☀" : "◐";
    });
  }

  function mountThemeToggles() {
    document.querySelectorAll(".topbar-actions, .header-actions, .auth-panel .topbar-actions").forEach((container) => {
      if (container.querySelector("[data-theme-toggle]")) return;
      const button = document.createElement("button");
      button.className = "theme-toggle";
      button.type = "button";
      button.dataset.themeToggle = "true";
      const languageSwitch = container.querySelector(".language-switch");
      if (languageSwitch && languageSwitch.nextSibling) {
        container.insertBefore(button, languageSwitch.nextSibling);
      } else {
        container.appendChild(button);
      }
    });
    updateThemeToggle();
  }

  function mountSkipLink() {
    const main = document.querySelector("main");
    if (!main || document.querySelector(".skip-link")) return;
    if (!main.id) main.id = "main";
    const link = document.createElement("a");
    link.className = "skip-link";
    link.href = `#${main.id}`;
    link.textContent = currentLanguage() === "en" ? "Skip to content" : "跳到主要内容";
    document.body.prepend(link);
  }

  async function apiFetch(path, options = {}) {
    const headers = new Headers(options.headers || {});
    const hasBody = options.body !== undefined && options.body !== null;
    if (hasBody && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (!headers.has("X-Nexa-CSRF")) headers.set("X-Nexa-CSRF", await csrfToken());
    if (!headers.has("X-Requested-With")) headers.set("X-Requested-With", "NexaGate");

    const response = await fetch(path, {
      credentials: "include",
      cache: "no-store",
      ...options,
      headers,
    });

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json") ? await response.json() : await response.text();

    if (!response.ok) {
      if (response.status === 401) clearSession();
      const message = payload && typeof payload === "object" ? payload.message || payload.data : response.statusText;
      throw new Error(message || t("requestFailed"));
    }

    if (payload && typeof payload === "object") {
      if (payload.success === false) {
        throw new Error(payload.message || payload.data || t("requestFailed"));
      }
      if (payload.message === "error") {
        throw new Error(payload.data || t("requestFailed"));
      }
    }

    return payload;
  }

  function getItems(payload) {
    const data = payload && payload.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;
    return [];
  }

  function baseUrl() {
    return String(config.PUBLIC_API_BASE_URL || `${window.location.origin}/v1`).replace(/\/+$/, "");
  }

  function siteUrl() {
    return String(config.PUBLIC_SITE_URL || window.location.origin).replace(/\/+$/, "");
  }

  function adminBackendUrl() {
    return String(config.ADMIN_BACKEND_URL || "").replace(/\/+$/, "");
  }

  function hydrateAdminBackendUrl(href = adminBackendUrl()) {
    document.querySelectorAll("[data-admin-backend]").forEach((element) => {
      if (href) element.setAttribute("href", href);
      element.setAttribute("target", "_blank");
      element.setAttribute("rel", "noopener noreferrer");
    });
  }

  async function loadAdminConfig() {
    if (Number(currentUser?.role || 0) < 10) return;
    const payload = await apiFetch("/nexa/admin-config");
    hydrateAdminBackendUrl(payload?.data?.ADMIN_BACKEND_URL || "");
  }

  function hydrateBaseUrl() {
    const url = baseUrl();
    hydrateAdminBackendUrl();
    document.querySelectorAll("[data-support-contact]").forEach((element) => {
      element.textContent = config.SUPPORT_CONTACT || "support@nexagate.local";
    });
    document.querySelectorAll("link[rel='canonical']").forEach((element) => {
      element.setAttribute("href", `${siteUrl()}${window.location.pathname}`);
    });
    document.querySelectorAll("meta[property='og:url']").forEach((element) => {
      element.setAttribute("content", `${siteUrl()}${window.location.pathname}`);
    });
    document.querySelectorAll("meta[property='og:image'], meta[name='twitter:image']").forEach((element) => {
      element.setAttribute("content", `${siteUrl()}/assets/og-nexagate.png`);
    });
    document.querySelectorAll("[data-base-url]").forEach((element) => {
      element.textContent = url;
    });
    document.querySelectorAll("[data-js-example]").forEach((element) => {
      element.textContent = `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.NEXAGATE_API_KEY,
  baseURL: "${url}",
});

const completion = await client.chat.completions.create({
  model: "deepseek-chat",
  messages: [{ role: "user", content: "写一段商品描述。" }],
});`;
    });
    document.querySelectorAll("[data-python-example]").forEach((element) => {
      element.textContent = `from openai import OpenAI

client = OpenAI(
    api_key="sk-ng-your-key",
    base_url="${url}",
)

completion = client.chat.completions.create(
    model="deepseek-chat",
    messages=[{"role": "user", "content": "写一段商品描述。"}],
)

print(completion.choices[0].message.content)`;
    });
    document.querySelectorAll("[data-stream-example]").forEach((element) => {
      element.textContent = `const stream = await client.chat.completions.create({
  model: "deepseek-chat",
  stream: true,
  messages: [{ role: "user", content: "用三句话介绍 NexaGate" }],
});

for await (const part of stream) {
  process.stdout.write(part.choices?.[0]?.delta?.content || "");
}`;
    });
    hydrateCurlExample();
  }

  function hydrateCurlExample() {
    const model = currentModels[0] || "deepseek-v4-flash";
    document.querySelectorAll("[data-curl-example]").forEach((target) => {
      target.textContent = `curl ${baseUrl()}/chat/completions \\
  -H "Authorization: Bearer sk-ng-your-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${model}",
    "messages": [
      {"role": "user", "content": "写一段简洁的产品介绍"}
    ]
  }'`;
    });
  }

  function formatQuota(quota) {
    const value = Number(quota || 0) / QUOTA_PER_UNIT;
    return `$${value.toFixed(2)}`;
  }

  function formatMoney(value, digits = 4) {
    return `$${Number(value || 0).toFixed(digits)}`;
  }

  function formatTime(timestamp) {
    if (!timestamp) return "-";
    const numeric = Number(timestamp);
    const date = Number.isFinite(numeric) && String(timestamp).length <= 10 ? new Date(numeric * 1000) : new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString(currentLanguage() === "en" ? "en-US" : "zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function parseMoney(text) {
    return Math.max(0, Math.round(Number(String(text).replace(/[^0-9.]/g, "")) || 0));
  }

  async function copyText(text) {
    if (!text) throw new Error(t("copyFailed"));
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch {
        // Embedded browsers may expose clipboard but still reject the call.
      }
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    if (!ok) throw new Error(t("copyFailed"));
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function updateNavAuth() {
    const signedIn = Boolean(sessionUserId());
    document.querySelectorAll("[data-logged-in]").forEach((element) => {
      element.classList.toggle("hidden", !signedIn);
    });
    document.querySelectorAll("[data-logged-out]").forEach((element) => {
      element.classList.toggle("hidden", signedIn);
    });
  }

  function renderUser(user) {
    currentUser = user;
    document.querySelectorAll("[data-session-account]").forEach((element) => {
      element.textContent = user.username || user.display_name || "User";
    });
    setText("balanceValue", formatQuota(user.quota));
    setText("groupValue", user.group || "default");
    setText("requestCountValue", String(user.request_count || 0));
    setText("usedQuotaValue", formatQuota(user.used_quota || 0));
    setText("affQuotaValue", formatQuota(user.aff_quota || 0));
    setText("accountRoleValue", Number(user.role || 0) >= 10 ? (currentLanguage() === "en" ? "Admin" : "管理员") : (currentLanguage() === "en" ? "User" : "普通用户"));
    setText("accountGroupValue", user.group || "default");
    const accountUsername = document.getElementById("accountUsername");
    if (accountUsername) accountUsername.value = user.username || "";
    const accountDisplayName = document.getElementById("accountDisplayName");
    if (accountDisplayName) accountDisplayName.value = user.display_name || user.username || "";
    document.querySelectorAll("[data-admin-only]").forEach((element) => {
      element.classList.toggle("hidden", Number(user.role || 0) < 10);
    });
    if (Number(user.role || 0) >= 10) {
      loadAdminConfig().catch(() => {});
    }
    updateSetupChecklist();
  }

  function renderTokens(tokens) {
    currentTokens = tokens;
    const keyTable = document.getElementById("keyTable");
    const tokenSelect = document.getElementById("playgroundToken");
    if (tokenSelect) {
      tokenSelect.innerHTML = "";
      tokens.forEach((token) => {
        const option = document.createElement("option");
        option.value = token.id;
        option.textContent = tokenLabel(token);
        tokenSelect.appendChild(option);
      });
    }
    const integrationToken = document.getElementById("integrationToken");
    const integrationHint = document.getElementById("integrationKeyHint");
    const copyIntegrationKey = document.getElementById("copyIntegrationKey");
    if (integrationToken) {
      integrationToken.innerHTML = "";
      if (tokens.length === 0) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = t("noIntegrationKey");
        integrationToken.appendChild(option);
        integrationToken.disabled = true;
        if (integrationHint) integrationHint.textContent = t("noIntegrationKey");
        if (copyIntegrationKey) copyIntegrationKey.disabled = true;
      } else {
        integrationToken.disabled = false;
        if (integrationHint) {
          integrationHint.textContent = t("keySecretUnavailable");
        }
        if (copyIntegrationKey) copyIntegrationKey.disabled = false;
        tokens.forEach((token) => {
          const option = document.createElement("option");
          option.value = token.id;
          option.textContent = tokenLabel(token);
          integrationToken.appendChild(option);
        });
      }
    }
    setText("keyCountValue", String(tokens.length));
    if (!keyTable) return;
    keyTable.innerHTML = "";
    if (tokens.length === 0) {
      keyTable.innerHTML = emptyRow(
        10,
        t("emptyKeys"),
        currentLanguage() === "en" ? "Create a project key before sending requests." : "创建项目 Key 后，就可以复制到你的应用里发起请求。",
      );
      return;
    }
    tokens.forEach((token) => {
      const row = document.createElement("tr");
      const quota = token.unlimited_quota ? t("unlimited") : formatQuota(token.remain_quota);
      const status = token.status === 1 ? t("active") : t("disabled");
      const modelLimits = token.model_limits_enabled ? token.model_limits || "-" : (currentLanguage() === "en" ? "All" : "全部");
      row.innerHTML = `
        <td><input type="checkbox" data-key-select value="${token.id}" aria-label="Select API key" /></td>
        <td>${escapeHtml(token.name || "-")}</td>
        <td><code>${escapeHtml(maskApiKey(token.key || token.id))}</code></td>
        <td>${escapeHtml(token.group || currentUser?.group || "default")}</td>
        <td>${quota}</td>
        <td>${formatQuota(token.used_quota || 0)}</td>
        <td>${escapeHtml(modelLimits)}</td>
        <td>${formatTime(token.accessed_time)}</td>
        <td><span class="status-pill ${token.status === 1 ? "" : "muted"}">${status}</span></td>
        <td class="inline-actions">
          <button class="button-soft" type="button" data-copy-key-ref="${token.id}">${currentLanguage() === "en" ? "Copy ref" : "复制标识"}</button>
          <button class="button-soft" type="button" data-edit-key="${token.id}">${currentLanguage() === "en" ? "Edit" : "编辑"}</button>
          <button class="button-soft" type="button" data-toggle-key="${token.id}" data-next-status="${token.status === 1 ? 2 : 1}">${token.status === 1 ? (currentLanguage() === "en" ? "Disable" : "停用") : (currentLanguage() === "en" ? "Enable" : "启用")}</button>
          <button class="button-danger" type="button" data-delete-key="${token.id}">${currentLanguage() === "en" ? "Delete" : "删除"}</button>
        </td>
      `;
      keyTable.appendChild(row);
    });
    updateSetupChecklist();
  }

  function selectedKeyIds() {
    return Array.from(document.querySelectorAll("[data-key-select]:checked"))
      .map((input) => Number(input.value))
      .filter(Boolean);
  }

  function renderModels(models) {
    currentModels = models;
    setText("modelCountValue", String(models.length));

    const playgroundModel = document.getElementById("playgroundModel");
    if (playgroundModel) {
      playgroundModel.innerHTML = "";
      (models.length ? models : ["deepseek-chat", "deepseek-reasoner"]).forEach((model) => {
        const option = document.createElement("option");
        option.value = model;
        option.textContent = model;
        playgroundModel.appendChild(option);
      });
    }
    setText("integrationModel", models[0] || "deepseek-v4-flash");
    hydrateCurlExample();

    const enabledModels = document.getElementById("enabledModels");
    if (enabledModels) {
      enabledModels.innerHTML = "";
      if (models.length === 0) {
        enabledModels.innerHTML = `<article class="model-card empty-card"><span>${t("unavailable")}</span><strong>${currentLanguage() === "en" ? "No models" : "暂无模型"}</strong><p>${t("emptyModels")}</p></article>`;
      } else {
        models.slice(0, 12).forEach((model) => {
          const article = document.createElement("article");
          article.className = "model-card";
          article.innerHTML = `
            <div class="model-icon" aria-hidden="true">${modelIconSvg(model)}</div>
            <span>${t("available")}</span>
            <strong>${escapeHtml(model)}</strong>
            <p>${currentLanguage() === "en" ? "Enabled for this account." : "当前账号已开通，可直接调用。"}</p>
          `;
          enabledModels.appendChild(article);
        });
      }
    }

    const modelPlazaGrid = document.getElementById("modelPlazaGrid");
    if (modelPlazaGrid) {
      modelPlazaGrid.innerHTML = "";
      if (models.length === 0) {
        modelPlazaGrid.innerHTML = `<article class="model-card empty-card"><span>${t("unavailable")}</span><strong>${currentLanguage() === "en" ? "No models" : "暂无模型"}</strong><p>${t("emptyModels")}</p></article>`;
      } else {
        models.forEach((model) => {
          const meta = modelCatalog[model] || {
            zhType: "可用模型",
            enType: "Available model",
            zhDescription: "当前账号已开通，可通过 NexaGate 的 OpenAI 兼容接口调用。",
            enDescription: "Enabled for this account and callable through the OpenAI-compatible endpoint.",
            price: "按模型倍率计费",
            enPrice: "Billed by model ratio",
            inputPrice: 0,
            outputPrice: 0,
            tags: ["enabled"],
          };
          const language = currentLanguage();
          const publicCatalog = !document.body.dataset.protected && !currentUser;
          const article = document.createElement("article");
          article.className = "model-card is-enabled";
          article.dataset.modelName = model;
          article.innerHTML = `
            <div class="model-icon" aria-hidden="true">${modelIconSvg(model)}</div>
            <span data-model-status>${language === "en" ? meta.enType : meta.zhType}</span>
            <strong>${escapeHtml(model)}</strong>
            <p>${escapeHtml(language === "en" ? meta.enDescription : meta.zhDescription)}</p>
            <div class="model-meta">${meta.tags.map((tag) => `<em class="tag">${escapeHtml(tag)}</em>`).join("")}</div>
            <div class="price-compare">
              <div>
                <span>${language === "en" ? "Input" : "输入"}</span>
                <strong>$${Number(meta.inputPrice || 0).toFixed(2)}</strong>
              </div>
              <div>
                <span>${language === "en" ? "Output" : "输出"}</span>
                <strong>$${Number(meta.outputPrice || 0).toFixed(2)}</strong>
              </div>
            </div>
            <footer>
              <small>${escapeHtml(language === "en" ? meta.enPrice : meta.price)}</small>
              <button class="button-soft" type="button" data-add-model>${publicCatalog ? (language === "en" ? "Sign in" : "登录使用") : (language === "en" ? "Open docs" : "查看接入")}</button>
            </footer>
          `;
          modelPlazaGrid.appendChild(article);
        });
      }
    }

    document.querySelectorAll("[data-model-name]").forEach((card) => {
      const name = card.dataset.modelName;
      const enabled = models.includes(name);
      const badge = card.querySelector("[data-model-status]");
      const button = card.querySelector("[data-add-model]");
      if (badge) badge.textContent = enabled ? t("available") : t("unavailable");
      if (button) button.textContent = currentLanguage() === "en" ? "Open docs" : "查看接入";
      card.classList.toggle("is-enabled", enabled);
    });
    updateSetupChecklist();
  }

  function initializePublicModelPage() {
    if (document.body.dataset.protected || !document.getElementById("modelPlazaGrid")) return;
    renderModels(Object.keys(modelCatalog));
  }

  function modelIconSvg(model) {
    if (model.includes("reasoner")) {
      return `<svg viewBox="0 0 32 32" role="img"><path d="M16 4c5.2 0 9.3 3.9 9.3 8.8 0 3-1.5 5.7-3.9 7.3v3.2a1.7 1.7 0 0 1-1.7 1.7h-7.4a1.7 1.7 0 0 1-1.7-1.7v-3.2a8.6 8.6 0 0 1-3.9-7.3C6.7 7.9 10.8 4 16 4Z" fill="none" stroke="currentColor" stroke-width="2.1"/><path d="M12 28h8M12.5 12.8h7M16 9.2v7.2" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/></svg>`;
    }
    if (model.includes("flash")) {
      return `<svg viewBox="0 0 32 32" role="img"><path d="M18.7 3 8.5 17.1h7.2L13.3 29 23.8 13.8h-7.1L18.7 3Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg>`;
    }
    return `<svg viewBox="0 0 32 32" role="img"><path d="M7 9.5A5.5 5.5 0 0 1 12.5 4h7A5.5 5.5 0 0 1 25 9.5v5A5.5 5.5 0 0 1 19.5 20H15l-5.8 5.1V19.3A5.5 5.5 0 0 1 7 14.5v-5Z" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/><path d="M12 11.5h8M12 15h5" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/></svg>`;
  }

  function renderLogs(logs) {
    const logsTable = document.getElementById("logsTable");
    renderUsageChart(logs);
    if (!logsTable) return;
    logsTable.innerHTML = "";
    if (logs.length === 0) {
      logsTable.innerHTML = emptyRow(
        5,
        t("emptyLogs"),
        currentLanguage() === "en" ? "Usage will appear here after the first successful API call." : "第一次成功调用后，这里会显示模型、消耗和状态。",
      );
      return;
    }
    logs.forEach((log) => {
      const row = document.createElement("tr");
      const tokens = Number(log.prompt_tokens || 0) + Number(log.completion_tokens || 0);
      row.innerHTML = `
        <td>${formatTime(log.created_at)}</td>
        <td>${escapeHtml(log.model_name || "-")}</td>
        <td>${tokens || "-"}</td>
        <td>${formatQuota(log.quota)}</td>
        <td><span class="status-pill">OK</span></td>
      `;
      logsTable.appendChild(row);
    });
  }

  function renderLogPagination(count) {
    const pager = document.getElementById("logPagination");
    if (!pager) return;
    const info = document.getElementById("logPageInfo");
    const prev = pager.querySelector("[data-log-prev]");
    const next = pager.querySelector("[data-log-next]");
    pager.classList.toggle("hidden", currentLogPage === 1 && count < LOG_PAGE_SIZE);
    if (info) {
      info.textContent = currentLanguage() === "en" ? `Page ${currentLogPage}` : `第 ${currentLogPage} 页`;
    }
    if (prev) {
      prev.textContent = t("prevPage");
      prev.disabled = currentLogPage <= 1;
    }
    if (next) {
      next.textContent = t("nextPage");
      next.disabled = count < LOG_PAGE_SIZE;
    }
  }

  function renderUsageChart(logs) {
    const chart = document.getElementById("usageChart");
    if (!chart) return;
    chart.innerHTML = "";
    const samples = logs
      .slice(0, 7)
      .reverse()
      .map((log) => ({
        label: formatTime(log.created_at),
        value: Math.max(0, Number(log.quota || 0) / QUOTA_PER_UNIT),
        model: log.model_name || "-",
      }));
    if (samples.length === 0) {
      chart.innerHTML = `<div class="empty-state"><strong>${t("emptyLogs")}</strong><p>${currentLanguage() === "en" ? "Run your first request to see the trend." : "发起第一次请求后，这里会出现消耗趋势。"}</p></div>`;
      return;
    }
    const max = Math.max(...samples.map((item) => item.value), 0.0001);
    samples.forEach((sample) => {
      const bar = document.createElement("div");
      bar.className = "usage-bar";
      bar.style.setProperty("--height", `${Math.max(8, (sample.value / max) * 100)}%`);
      bar.innerHTML = `
        <span title="${escapeHtml(sample.model)}"></span>
        <small>${formatMoney(sample.value, 4)}</small>
      `;
      chart.appendChild(bar);
    });
  }

  function renderUsageStat(stat) {
    setText("usageSpendValue", formatQuota(stat.quota || 0));
    setText("usageRpmValue", String(stat.rpm || 0));
    setText("usageTpmValue", String(stat.tpm || 0));
  }

  function renderPricingTables() {
    const language = currentLanguage();
    const rows = Object.entries(modelCatalog);
    document.querySelectorAll("[data-pricing-rows]").forEach((tbody) => {
      const detailed = tbody.dataset.pricingRows === "detailed";
      tbody.innerHTML = rows
        .map(([name, meta]) => {
          const input = `$${Number(meta.inputPrice || 0).toFixed(2)} / 1M`;
          const output = `$${Number(meta.outputPrice || 0).toFixed(2)} / 1M`;
          if (!detailed) return `<tr><td>${escapeHtml(name)}</td><td>${input}</td><td>${output}</td></tr>`;
          const scene = language === "en" ? meta.enDescription : meta.zhDescription;
          return `<tr><td><strong>${escapeHtml(name)}</strong></td><td>${escapeHtml(scene)}</td><td>${input}</td><td>${output}</td></tr>`;
        })
        .join("");
    });
  }

  function renderTopups(topups) {
    const topupTable = document.getElementById("topupTable");
    if (!topupTable) return;
    topupTable.innerHTML = "";
    if (topups.length === 0) {
      topupTable.innerHTML = emptyRow(
        5,
        currentLanguage() === "en" ? "No top-up records yet" : "暂无充值记录",
        currentLanguage() === "en" ? "After payment, submit the amount and contact information for admin review." : "付款后提交金额和联系方式，管理员核对后会入账。",
      );
      return;
    }
    topups.forEach((topup) => {
      const row = document.createElement("tr");
      const isManual = topup.source === "manual";
      const code = isManual ? topup.status : Number(topup.status);
      const status = isManual
        ? manualTopupStatusText(topup.status)
        : code === 1
          ? (currentLanguage() === "en" ? "Success" : "成功")
          : code === 0
            ? (currentLanguage() === "en" ? "Pending" : "待支付")
            : (currentLanguage() === "en" ? "Failed" : "失败");
      row.innerHTML = `
        <td>${formatTime(topup.create_time || topup.created_at)}</td>
        <td>${escapeHtml(topup.order_no || topup.trade_no || "-")}</td>
        <td>${isManual ? formatMoney(topup.amount || 0, 2) : formatQuota(topup.amount || 0)}</td>
        <td>${escapeHtml(topup.payment_method || topup.payment_provider || "-")}</td>
        <td><span class="status-pill ${code === 1 || code === "credited" ? "" : "muted"}">${status}</span></td>
      `;
      topupTable.appendChild(row);
    });
  }

  function manualTopupStatusText(status) {
    const language = currentLanguage();
    if (status === "credited") return language === "en" ? "Credited" : "已入账";
    if (status === "rejected") return language === "en" ? "Rejected" : "已驳回";
    return language === "en" ? "Pending review" : "待核对";
  }

  function parseLogOther(log) {
    if (!log || !log.other) return {};
    try {
      return JSON.parse(log.other);
    } catch {
      return {};
    }
  }

  function estimateUpstreamCost(log) {
    const price = upstreamCostCatalog[log.model_name] || upstreamCostCatalog["deepseek-v4-flash"];
    const promptTokens = Math.max(0, Number(log.prompt_tokens || 0));
    const completionTokens = Math.max(0, Number(log.completion_tokens || 0));
    const other = parseLogOther(log);
    const cacheTokens = Math.min(promptTokens, Math.max(0, Number(other.cache_tokens || 0)));
    const inputMissTokens = Math.max(0, promptTokens - cacheTokens);
    return (inputMissTokens * price.inputMiss + cacheTokens * price.inputHit + completionTokens * price.output) / 1_000_000;
  }

  function renderProfit(logs) {
    const profitTable = document.getElementById("profitTable");
    if (!profitTable) return;
    const includeAdmin = Boolean(document.getElementById("includeAdminLogs")?.checked);
    const visibleLogs = includeAdmin ? logs : logs.filter((log) => log.username !== "admin");
    const rows = visibleLogs.map((log) => {
      const revenue = Number(log.quota || 0) / QUOTA_PER_UNIT;
      const upstreamCost = estimateUpstreamCost(log);
      const profit = revenue - upstreamCost;
      return { log, revenue, upstreamCost, profit };
    });
    const revenueTotal = rows.reduce((sum, row) => sum + row.revenue, 0);
    const costTotal = rows.reduce((sum, row) => sum + row.upstreamCost, 0);
    const profitTotal = rows.reduce((sum, row) => sum + row.profit, 0);
    const margin = revenueTotal > 0 ? (profitTotal / revenueTotal) * 100 : 0;

    setText("profitRevenue", formatMoney(revenueTotal, 4));
    setText("profitUpstreamCost", formatMoney(costTotal, 4));
    setText("profitGrossProfit", formatMoney(profitTotal, 4));
    setText("profitGrossMargin", `${margin.toFixed(1)}%`);

    profitTable.innerHTML = "";
    if (rows.length === 0) {
      profitTable.innerHTML = emptyRow(7, currentLanguage() === "en" ? "No customer usage logs yet" : "暂无真实用户调用日志");
      return;
    }
    rows.slice(0, 200).forEach(({ log, revenue, upstreamCost, profit }) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${formatTime(log.created_at)}</td>
        <td>${escapeHtml(log.username || "-")}</td>
        <td>${escapeHtml(log.model_name || "-")}</td>
        <td>${Number(log.prompt_tokens || 0)} / ${Number(log.completion_tokens || 0)}</td>
        <td>${formatMoney(revenue, 4)}</td>
        <td>${formatMoney(upstreamCost, 4)}</td>
        <td><span class="status-pill ${profit >= 0 ? "" : "muted"}">${formatMoney(profit, 4)}</span></td>
      `;
      profitTable.appendChild(row);
    });
  }

  function renderManualTopupAdmin(topups) {
    const table = document.getElementById("manualTopupTable");
    if (!table) return;
    table.innerHTML = "";
    if (topups.length === 0) {
      table.innerHTML = emptyRow(8, currentLanguage() === "en" ? "No manual top-up requests yet" : "暂无手动充值订单");
      return;
    }
    topups.forEach((topup) => {
      const row = document.createElement("tr");
      const note = [topup.contact, topup.note].filter(Boolean).join(" / ");
      row.innerHTML = `
        <td>${formatTime(topup.created_at)}</td>
        <td>${escapeHtml(topup.username || topup.user_id || "-")}</td>
        <td><code>${escapeHtml(topup.order_no || topup.id || "-")}</code></td>
        <td>${formatMoney(topup.amount || 0, 2)}</td>
        <td>${escapeHtml(topup.payment_method || "-")}</td>
        <td>${escapeHtml(note || "-")}</td>
        <td><span class="status-pill ${topup.status === "credited" ? "" : "muted"}">${manualTopupStatusText(topup.status)}</span></td>
        <td class="inline-actions">
          <button class="button-soft" type="button" data-manual-topup-status="${escapeHtml(topup.id)}" data-status="credited">${currentLanguage() === "en" ? "Credited" : "标记入账"}</button>
          <button class="button-danger" type="button" data-manual-topup-status="${escapeHtml(topup.id)}" data-status="rejected">${currentLanguage() === "en" ? "Reject" : "驳回"}</button>
        </td>
      `;
      table.appendChild(row);
    });
  }

  function updateSetupChecklist() {
    document.getElementById("setupBaseUrl")?.classList.add("is-complete");
    document.getElementById("setupKey")?.classList.toggle("is-complete", currentTokens.length > 0);
    document.getElementById("setupModel")?.classList.toggle("is-complete", currentModels.length > 0);
  }

  function openEditKeyDialog(token) {
    const dialog = document.getElementById("keyEditDialog");
    if (!dialog || !token) return;
    document.getElementById("editKeyId").value = token.id;
    document.getElementById("editKeyName").value = token.name || "";
    document.getElementById("editKeyStatus").value = String(token.status || 1);
    document.getElementById("editKeyQuota").value = token.unlimited_quota ? "0" : String(Math.round(Number(token.remain_quota || 0) / QUOTA_PER_UNIT));
    document.getElementById("editKeyUnlimited").checked = Boolean(token.unlimited_quota);
    document.getElementById("editKeyModelLimitEnabled").checked = Boolean(token.model_limits_enabled);
    document.getElementById("editKeyModelLimits").value = token.model_limits || "";
    document.getElementById("editKeyAllowIps").value = token.allow_ips || "";
    openDialog(dialog);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function loadSelf() {
    const payload = await apiFetch("/api/user/self");
    renderUser(payload.data);
    if (document.body.dataset.admin && Number(payload.data?.role || 0) < 10) {
      throw new Error(currentLanguage() === "en" ? "Admin account required" : "需要管理员账号");
    }
    return payload.data;
  }

  async function loadTokens() {
    const keyTable = document.getElementById("keyTable");
    if (keyTable) keyTable.innerHTML = loadingRow(10, currentLanguage() === "en" ? "Loading API keys..." : "正在读取 API Key...");
    const payload = await apiFetch("/api/token/?p=1&size=50");
    renderTokens(getItems(payload));
  }

  async function loadModels() {
    const payload = await apiFetch("/api/user/models");
    renderModels(Array.isArray(payload.data) ? payload.data : []);
  }

  async function loadLogs(page = currentLogPage) {
    currentLogPage = Math.max(1, Number(page) || 1);
    const logsTable = document.getElementById("logsTable");
    if (logsTable) logsTable.innerHTML = loadingRow(5, currentLanguage() === "en" ? "Loading usage logs..." : "正在读取调用日志...");
    const form = document.getElementById("logFilterForm");
    const params = new URLSearchParams({ p: String(currentLogPage), size: String(LOG_PAGE_SIZE), type: "2" });
    if (form) {
      const formData = new FormData(form);
      const modelName = String(formData.get("model_name") || "").trim();
      const tokenName = String(formData.get("token_name") || "").trim();
      if (modelName) params.set("model_name", modelName);
      if (tokenName) params.set("token_name", tokenName);
    }
    const payload = await apiFetch(`/api/log/self?${params.toString()}`);
    const rows = getItems(payload);
    renderLogs(rows);
    renderLogPagination(rows.length);
  }

  async function loadUsageStat() {
    const target = document.getElementById("usageSpendValue");
    if (!target) return;
    const payload = await apiFetch("/api/log/self/stat?type=2");
    renderUsageStat(payload.data || {});
  }

  async function loadTopups() {
    const topupTable = document.getElementById("topupTable");
    if (!topupTable) return;
    topupTable.innerHTML = loadingRow(5, currentLanguage() === "en" ? "Loading top-up records..." : "正在读取充值记录...");
    let nativeTopups = [];
    try {
      const payload = await apiFetch("/api/user/topup/self?p=1&size=10");
      nativeTopups = getItems(payload);
    } catch {
      nativeTopups = [];
    }
    try {
      const manualPayload = await apiFetch("/nexa/manual-topups");
      currentManualTopups = (manualPayload.data || []).map((item) => ({ ...item, source: "manual" }));
    } catch {
      currentManualTopups = [];
    }
    renderTopups([...currentManualTopups, ...nativeTopups]);
  }

  async function loadManualTopupsAdmin() {
    const table = document.getElementById("manualTopupTable");
    if (!table) return;
    table.innerHTML = loadingRow(8, currentLanguage() === "en" ? "Loading manual top-ups..." : "正在读取手动充值订单...");
    const payload = await apiFetch("/nexa/manual-topups?all=1");
    renderManualTopupAdmin((payload.data || []).map((item) => ({ ...item, source: "manual" })));
  }

  async function loadUserGroups() {
    const target = document.getElementById("groupList");
    if (!target) return;
    const payload = await apiFetch("/api/user/self/groups");
    const groups = payload.data || {};
    const entries = Object.entries(groups);
    target.textContent = entries.length
      ? entries.map(([name, info]) => `${name}${info?.desc ? `（${info.desc}）` : ""}`).join("，")
      : "-";
  }

  async function loadAffCode() {
    const target = document.getElementById("affCodeValue");
    if (!target) return;
    const payload = await apiFetch("/api/user/aff");
    target.textContent = payload.data || "-";
  }

  async function loadProfit() {
    const profitTable = document.getElementById("profitTable");
    if (!profitTable) return;
    const payload = await apiFetch("/api/log/?p=1&size=500&type=2");
    currentProfitLogs = getItems(payload);
    renderProfit(currentProfitLogs);
  }

  function normalizePayMethods(data) {
    const methods = Array.isArray(data.pay_methods) ? [...data.pay_methods] : [];
    if (data.enable_waffo_topup && Array.isArray(data.waffo_pay_methods)) {
      data.waffo_pay_methods.forEach((method, index) => {
        methods.push({
          ...method,
          name: method.name || `Waffo ${index + 1}`,
          type: `waffo:${index}`,
          min_topup: data.waffo_min_topup || method.min_topup,
        });
      });
    }
    return methods.filter((method) => method && method.type);
  }

  async function loadTopupInfo() {
    const infoTarget = document.getElementById("topupInfo");
    const paymentMethod = document.getElementById("paymentMethod");
    const topupAmount = document.getElementById("topupAmount");
    try {
      const payload = await apiFetch("/api/user/topup/info");
      const data = payload.data || {};
      currentTopupInfo = { ...data, normalizedPayMethods: normalizePayMethods(data) };

      if (paymentMethod) {
        paymentMethod.innerHTML = "";
        currentTopupInfo.normalizedPayMethods.forEach((method) => {
          const option = document.createElement("option");
          option.value = method.type;
          option.textContent = method.name || method.type;
          option.dataset.minTopup = method.min_topup || "";
          paymentMethod.appendChild(option);
        });
      }

      if (topupAmount) {
        const options = Array.isArray(data.amount_options) ? data.amount_options.map(Number).filter(Boolean) : [];
        topupAmount.value = String(options[0] || data.min_topup || 25);
        topupAmount.min = String(data.min_topup || 1);
      }

      if (infoTarget) {
        infoTarget.textContent =
          currentLanguage() === "en"
            ? "Scan an Alipay or WeChat collection code below, then contact an admin to credit your balance."
            : "请使用下方支付宝或微信收款码转账，付款后联系管理员核对入账。";
      }
      syncTopupMode();
    } catch (error) {
      if (infoTarget) infoTarget.textContent = error.message;
    }
  }

  async function refreshConsole(showMessage = false) {
    await loadSelf();
    await Promise.all([loadTokens(), loadModels(), loadLogs(), loadUsageStat(), loadTopupInfo(), loadTopups(), loadProfit(), loadManualTopupsAdmin(), loadUserGroups(), loadAffCode()]);
    if (showMessage) showToast(t("refreshDone"));
  }

  async function initializeProtectedPage() {
    if (!document.body.dataset.protected) return;
    try {
      await refreshConsole(false);
    } catch (error) {
      clearSession();
      showToast(error.message || t("sessionExpired"));
      const current = encodeURIComponent(window.location.pathname.split("/").pop() || "console.html");
      window.location.href = `./auth.html?next=${current}`;
    }
  }

  async function login(username, password) {
    const payload = await apiFetch("/api/user/login", {
      method: "POST",
      body: JSON.stringify({ username, email: username, password }),
    });
    if (payload.data && payload.data.id) {
      setSession(payload.data.id);
    }
    return payload.data || {};
  }

  async function register(username, password) {
    await apiFetch("/api/user/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  }

  function syncTopupMode() {
    const mode = document.getElementById("topupMode")?.value || "redeem";
    document.querySelectorAll("[data-topup-field]").forEach((element) => {
      element.classList.toggle("hidden", element.dataset.topupField !== mode);
    });
    const onlineDisabled = currentTopupInfo.normalizedPayMethods && currentTopupInfo.normalizedPayMethods.length === 0;
    const note = document.getElementById("balanceNote");
    if (note) {
      note.textContent = mode === "online" && onlineDisabled ? t("onlinePayDisabled") : note.dataset[currentLanguage()] || note.dataset.zh || note.textContent;
    }
  }

  function initializePaymentQr() {
    document.querySelectorAll("[data-payment-qr]").forEach((image) => {
      const showImage = () => {
        image.hidden = false;
        image.closest(".qr-box")?.classList.add("has-image");
      };
      image.addEventListener("load", showImage);
      image.addEventListener("error", () => {
        image.hidden = true;
        image.closest(".qr-box")?.classList.remove("has-image");
      });
      if (image.complete && image.naturalWidth > 0) showImage();
    });
  }

  function submitPaymentForm(url, params) {
    const form = document.createElement("form");
    form.action = url;
    form.method = "POST";
    form.target = "_blank";
    Object.entries(params || {}).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }

  async function requestOnlinePay(method, amount) {
    if (!method) throw new Error(t("choosePayment"));
    if (!amount || amount <= 0) throw new Error(t("invalidAmount"));

    if (method === "stripe") {
      const payload = await apiFetch("/api/user/stripe/pay", {
        method: "POST",
        body: JSON.stringify({ amount, payment_method: "stripe" }),
      });
      const link = payload.data && payload.data.pay_link;
      if (!link) throw new Error(t("paymentNotReady"));
      window.open(link, "_blank");
      return;
    }

    if (method === "creem") {
      let products = currentTopupInfo.creem_products || [];
      if (typeof products === "string") {
        try {
          products = JSON.parse(products);
        } catch {
          products = [];
        }
      }
      const product = Array.isArray(products) ? products[0] : null;
      const productId = product?.productId || product?.product_id;
      if (!productId) throw new Error(t("paymentNotReady"));
      const payload = await apiFetch("/api/user/creem/pay", {
        method: "POST",
        body: JSON.stringify({ product_id: productId, payment_method: "creem" }),
      });
      const link = payload.data && payload.data.checkout_url;
      if (!link) throw new Error(t("paymentNotReady"));
      window.open(link, "_blank");
      return;
    }

    if (method === "waffo_pancake") {
      const payload = await apiFetch("/api/user/waffo-pancake/pay", {
        method: "POST",
        body: JSON.stringify({ amount }),
      });
      const link = payload.data && payload.data.checkout_url;
      if (!link) throw new Error(t("paymentNotReady"));
      window.open(link, "_blank");
      return;
    }

    if (method.startsWith("waffo:")) {
      const index = Number(method.split(":")[1]);
      const payload = await apiFetch("/api/user/waffo/pay", {
        method: "POST",
        body: JSON.stringify({ amount, pay_method_index: Number.isFinite(index) ? index : 0 }),
      });
      const link = payload.data && payload.data.payment_url;
      if (!link) throw new Error(t("paymentNotReady"));
      window.open(link, "_blank");
      return;
    }

    const payload = await apiFetch("/api/user/pay", {
      method: "POST",
      body: JSON.stringify({ amount, payment_method: method }),
    });
    if (payload.message === "success" && payload.url) {
      submitPaymentForm(payload.url, payload.data);
      return;
    }
    throw new Error(payload.data || payload.message || t("paymentNotReady"));
  }

  function audit(action, detail = {}) {
    apiFetch("/nexa/audit", {
      method: "POST",
      body: JSON.stringify({ action, detail }),
    }).catch(() => {});
  }

  function filterModels(query) {
    const q = query.trim().toLowerCase();
    let visible = 0;
    document.querySelectorAll("[data-model-name]").forEach((card) => {
      const text = card.textContent.toLowerCase();
      const show = !q || text.includes(q) || card.dataset.modelName.toLowerCase().includes(q);
      card.classList.toggle("hidden", !show);
      if (show) visible += 1;
    });
    let empty = document.getElementById("modelSearchEmpty");
    const grid = document.querySelector(".model-grid");
    if (!empty && grid) {
      empty = document.createElement("article");
      empty.id = "modelSearchEmpty";
      empty.className = "card hidden";
      grid.appendChild(empty);
    }
    if (empty) {
      empty.textContent = t("noSearchResult");
      empty.classList.toggle("hidden", visible !== 0);
    }
  }

  async function initializeStatusPage() {
    const statusTarget = document.querySelector("[data-system-status]");
    if (!statusTarget) return;
    try {
      await apiFetch("/api/status");
      statusTarget.textContent = currentLanguage() === "en" ? "Online" : "在线";
    } catch {
      statusTarget.textContent = currentLanguage() === "en" ? "Offline" : "离线";
      statusTarget.classList.add("muted");
    }
  }

  function updateConsoleTitle() {
    if (!document.querySelector(".app-layout .sidebar")) return;
    const language = currentLanguage();
    const labels = {
      overview: language === "en" ? "Overview" : "总览",
      usage: language === "en" ? "Usage" : "用量统计",
      keys: language === "en" ? "API keys" : "API Key",
      balance: language === "en" ? "Balance" : "余额充值",
      models: language === "en" ? "Models" : "模型权限",
      integration: language === "en" ? "Integration" : "接入配置",
      logs: language === "en" ? "Logs" : "调用日志",
      account: language === "en" ? "Account" : "账号资料",
      playground: "Playground",
      settings: language === "en" ? "Settings" : "设置",
    };
    const id = (window.location.hash || "#overview").slice(1);
    const label = labels[id] || labels.overview;
    document.title = `${label} | NexaGate`;
    document.querySelectorAll(".sidebar a").forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
    });
  }

  mountThemeToggles();
  mountSkipLink();
  applyTheme(preferredTheme());
  applyLanguage(currentLanguage());
  updateNavAuth();
  hydrateBaseUrl();

  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => {
      applyLanguage(button.dataset.lang);
      renderModels(currentModels);
      renderTokens(currentTokens);
      renderLogs([]);
      renderLogPagination(0);
      renderPricingTables();
      loadLogs().catch(() => {});
      if (currentTopupInfo.normalizedPayMethods) loadTopupInfo().catch(() => {});
    });
  });

  renderPricingTables();

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(theme);
      showToast(theme === "dark" ? t("darkMode") : t("lightMode"));
    });
  });

  window.addEventListener("hashchange", updateConsoleTitle);
  updateConsoleTitle();
  window.addEventListener("offline", () => showToast(t("offline")));
  window.addEventListener("online", () => showToast(t("online")));

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isTyping = target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      const search = document.querySelector("[data-model-search]") || document.querySelector("#logFilterForm input");
      if (search) {
        search.focus();
        showToast(t("focusSearch"));
      }
    }
    if (!isTyping && event.key === "/") {
      const search = document.querySelector("[data-model-search]");
      if (search) {
        event.preventDefault();
        search.focus();
      }
    }
  });

  document.querySelectorAll("[data-copy-target]").forEach((button) => {
    button.addEventListener("click", async () => {
      const target = document.getElementById(button.dataset.copyTarget);
      const text = target ? target.textContent.trim() : "";
      try {
        await copyText(text);
        const original = button.textContent;
        button.textContent = t("copied");
        window.setTimeout(() => {
          button.textContent = original;
        }, 1200);
        showToast(t("copied"));
      } catch (error) {
        showToast(error.message || t("copyFailed"));
      }
    });
  });

  document.querySelectorAll("[data-open-dialog]").forEach((button) => {
    button.addEventListener("click", () => {
      const dialog = document.getElementById(button.dataset.openDialog);
      const mode = button.dataset.topupMode;
      const topupModeSelect = document.getElementById("topupMode");
      if (mode && topupModeSelect) topupModeSelect.value = mode;
      openDialog(dialog, button);
      syncTopupMode();
    });
  });

  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => {
      const dialog = button.closest("dialog");
      if (dialog) dialog.close();
    });
  });

  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.addEventListener("close", () => {
      if (lastDialogTrigger && typeof lastDialogTrigger.focus === "function") {
        lastDialogTrigger.focus();
      }
      lastDialogTrigger = null;
    });
  });

  const authTabs = document.querySelectorAll("[data-auth-tab]");
  const authModeInput = document.getElementById("authMode");
  authTabs.forEach((button) => {
    button.addEventListener("click", () => {
      authTabs.forEach((item) => item.classList.toggle("active", item === button));
      if (authModeInput) authModeInput.value = button.dataset.authTab;
    });
  });

  const authForm = document.getElementById("authForm");
  if (authForm) {
    authForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(authForm);
      const username = String(formData.get("account") || "").trim();
      const password = String(formData.get("password") || "").trim();
      const mode = String(formData.get("mode") || "login");
      const error = document.getElementById("authError");
      if (error) error.textContent = "";
      if (!username || !password) {
        if (error) error.textContent = t("missingLogin");
        return;
      }
      if (mode === "register" && password.length < 8) {
        if (error) error.textContent = t("passwordTooShort");
        return;
      }
      if (mode === "register" && !isPasswordStrong(password)) {
        if (error) error.textContent = t("passwordWeak");
        return;
      }
      setButtonBusy(authForm.querySelector('button[type="submit"]'), true);
      try {
        if (mode === "register") {
          await register(username, password);
          showToast(t("registered"));
        }
        const user = await login(username, password);
        const next = new URLSearchParams(window.location.search).get("next") || "console.html";
        showToast(t("signedIn"));
        window.location.href = `./${next}`;
      } catch (err) {
        if (error) error.textContent = err.message || t("requestFailed");
      } finally {
        setButtonBusy(authForm.querySelector('button[type="submit"]'), false);
      }
    });
  }

  document.querySelectorAll("[data-logout]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await apiFetch("/api/user/logout");
      } finally {
        clearSession();
        window.location.href = "./index.html";
      }
    });
  });

  document.querySelectorAll("[data-refresh-console]").forEach((button) => {
    button.addEventListener("click", () => refreshConsole(true).catch((error) => showToast(error.message)));
  });

  const selectAllKeys = document.getElementById("selectAllKeys");
  if (selectAllKeys) {
    selectAllKeys.addEventListener("change", () => {
      document.querySelectorAll("[data-key-select]").forEach((input) => {
        input.checked = selectAllKeys.checked;
      });
    });
  }

  const keyForm = document.getElementById("keyForm");
  if (keyForm) {
    keyForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(keyForm);
      const cap = parseMoney(formData.get("keyCap"));
      const submitButton = keyForm.querySelector('button[type="submit"]');
      setButtonBusy(submitButton, true);
      try {
        const isAdmin = Number(currentUser?.role || 0) >= 10;
        const balance = Number(currentUser?.quota || 0) / QUOTA_PER_UNIT;
        if (!isAdmin && cap === 0) throw new Error(t("unlimitedKeyAdminOnly"));
        if (!isAdmin && cap > balance) throw new Error(t("insufficientBalanceForKey"));
        const payload = await apiFetch("/api/token/", {
          method: "POST",
          body: JSON.stringify({
            name: String(formData.get("keyName") || "Default key"),
            remain_quota: cap * QUOTA_PER_UNIT,
            unlimited_quota: cap === 0,
            expired_time: -1,
            group: currentUser?.group || "default",
          }),
        });
        audit("api_key_created", { name: String(formData.get("keyName") || "Default key"), cap });
        keyForm.closest("dialog").close();
        keyForm.reset();
        const createdKey = extractCreatedKey(payload);
        if (createdKey) {
          showCreatedKeyDialog(createdKey);
          try {
            await copyText(createdKey);
            showToast(t("keyCreatedCopied"));
          } catch {
            showToast(t("keyCreated"));
          }
        } else {
          showToast(t("keyCreated"));
        }
        await loadTokens();
      } catch (error) {
        showToast(error.message);
      } finally {
        setButtonBusy(submitButton, false);
      }
    });
  }

  document.addEventListener("click", async (event) => {
    const copyRefButton = event.target.closest("[data-copy-key-ref]");
    const editButton = event.target.closest("[data-edit-key]");
    const toggleButton = event.target.closest("[data-toggle-key]");
    const deleteButton = event.target.closest("[data-delete-key]");
    const addModelButton = event.target.closest("[data-add-model]");
    const manualTopupButton = event.target.closest("[data-manual-topup-status]");
    if (copyRefButton) {
      try {
        const token = currentTokens.find((item) => Number(item.id) === Number(copyRefButton.dataset.copyKeyRef));
        if (!token) throw new Error(t("requestFailed"));
        await copyText(tokenLabel(token));
        showToast(t("maskedKeyCopied"));
      } catch (error) {
        showToast(error.message || t("copyFailed"));
      }
    }
    if (editButton) {
      const token = currentTokens.find((item) => Number(item.id) === Number(editButton.dataset.editKey));
      openEditKeyDialog(token);
    }
    if (deleteButton) {
      if (!(await confirmAction("confirmDeleteKey"))) return;
      try {
        await apiFetch(`/api/token/${deleteButton.dataset.deleteKey}`, { method: "DELETE" });
        audit("api_key_deleted", { id: Number(deleteButton.dataset.deleteKey) });
        showToast(t("keyDeleted"));
        await loadTokens();
      } catch (error) {
        showToast(error.message);
      }
    }
    if (toggleButton) {
      try {
        const id = Number(toggleButton.dataset.toggleKey);
        const nextStatus = Number(toggleButton.dataset.nextStatus);
        const token = currentTokens.find((item) => Number(item.id) === id);
        if (!token) throw new Error(t("requestFailed"));
        await apiFetch("/api/token/?status_only=1", {
          method: "PUT",
          body: JSON.stringify({ id, status: nextStatus }),
        });
        audit(nextStatus === 1 ? "api_key_enabled" : "api_key_disabled", { id });
        showToast(nextStatus === 1 ? t("active") : t("disabled"));
        await loadTokens();
      } catch (error) {
        showToast(error.message);
      }
    }
    if (addModelButton) {
      window.location.href = currentUser ? "./docs.html#quickstart" : "./auth.html?next=console.html";
      showToast(t("modelAdded"));
    }
    if (manualTopupButton) {
      try {
        await apiFetch(`/nexa/manual-topups/${encodeURIComponent(manualTopupButton.dataset.manualTopupStatus)}`, {
          method: "PATCH",
          body: JSON.stringify({ status: manualTopupButton.dataset.status }),
        });
        showToast(t("manualTopupUpdated"));
        await loadManualTopupsAdmin();
      } catch (error) {
        showToast(error.message);
      }
    }
  });

  document.querySelectorAll("[data-batch-copy-keys]").forEach((button) => {
    button.addEventListener("click", async () => {
      const ids = selectedKeyIds();
      if (ids.length === 0) {
        showToast(t("selectKeysFirst"));
        return;
      }
      try {
        const refs = currentTokens
          .filter((token) => ids.includes(Number(token.id)))
          .map((token) => tokenLabel(token))
          .join("\n");
        await copyText(refs);
        showToast(t("batchCopied"));
      } catch (error) {
        showToast(error.message || t("copyFailed"));
      }
    });
  });

  document.querySelectorAll("[data-batch-delete-keys]").forEach((button) => {
    button.addEventListener("click", async () => {
      const ids = selectedKeyIds();
      if (ids.length === 0) {
        showToast(t("selectKeysFirst"));
        return;
      }
      if (!(await confirmAction("confirmBatchDeleteKeys"))) return;
      setButtonBusy(button, true);
      try {
        await apiFetch("/api/token/batch", {
          method: "POST",
          body: JSON.stringify({ ids }),
        });
        audit("api_key_batch_deleted", { ids });
        showToast(t("batchDeleted"));
        await loadTokens();
      } catch (error) {
        showToast(error.message);
      } finally {
        setButtonBusy(button, false);
      }
    });
  });

  const topupMode = document.getElementById("topupMode");
  if (topupMode) {
    topupMode.addEventListener("change", syncTopupMode);
  }

  const logFilterForm = document.getElementById("logFilterForm");
  if (logFilterForm) {
    logFilterForm.addEventListener("submit", (event) => {
      event.preventDefault();
      loadLogs(1).catch((error) => showToast(error.message));
    });
  }

  const clearLogFilters = document.getElementById("clearLogFilters");
  if (clearLogFilters && logFilterForm) {
    clearLogFilters.addEventListener("click", () => {
      logFilterForm.reset();
      loadLogs(1).catch((error) => showToast(error.message));
    });
  }

  document.querySelectorAll("[data-log-prev]").forEach((button) => {
    button.addEventListener("click", () => {
      loadLogs(currentLogPage - 1).catch((error) => showToast(error.message));
    });
  });

  document.querySelectorAll("[data-log-next]").forEach((button) => {
    button.addEventListener("click", () => {
      loadLogs(currentLogPage + 1).catch((error) => showToast(error.message));
    });
  });

  const copyIntegrationKey = document.getElementById("copyIntegrationKey");
  if (copyIntegrationKey) {
    copyIntegrationKey.addEventListener("click", async () => {
      const tokenId = document.getElementById("integrationToken")?.value || currentTokens[0]?.id;
      if (!tokenId) {
        showToast(t("noToken"));
        return;
      }
      try {
        const token = currentTokens.find((item) => Number(item.id) === Number(tokenId));
        if (!token) throw new Error(t("requestFailed"));
        await copyText(tokenLabel(token));
        showToast(t("maskedKeyCopied"));
      } catch (error) {
        showToast(error.message || t("copyFailed"));
      }
    });
  }

  const accountForm = document.getElementById("accountForm");
  if (accountForm) {
    accountForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(accountForm);
      try {
        await apiFetch("/api/user/self", {
          method: "PUT",
          body: JSON.stringify({
            username: String(formData.get("username") || currentUser?.username || "").trim(),
            display_name: String(formData.get("display_name") || "").trim(),
          }),
        });
        showToast(t("profileSaved"));
        await loadSelf();
      } catch (error) {
        showToast(error.message);
      }
    });
  }

  const generateAccessToken = document.getElementById("generateAccessToken");
  if (generateAccessToken) {
    generateAccessToken.addEventListener("click", async () => {
      try {
        const payload = await apiFetch("/api/user/token");
        const token = payload.data || "";
        setText("accessTokenValue", token ? `${token.slice(0, 8)}...${token.slice(-6)}` : "-");
        if (token) await copyText(token);
        showToast(t("accessTokenGenerated"));
      } catch (error) {
        showToast(error.message);
      }
    });
  }

  const affTransferForm = document.getElementById("affTransferForm");
  if (affTransferForm) {
    affTransferForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const amount = Math.max(0, Math.round(Number(new FormData(affTransferForm).get("amount") || 0)));
      if (!amount) {
        showToast(t("invalidAmount"));
        return;
      }
      try {
        await apiFetch("/api/user/aff_transfer", {
          method: "POST",
          body: JSON.stringify({ quota: amount * QUOTA_PER_UNIT }),
        });
        affTransferForm.reset();
        showToast(t("affTransferred"));
        await loadSelf();
      } catch (error) {
        showToast(error.message);
      }
    });
  }

  const keyEditForm = document.getElementById("keyEditForm");
  if (keyEditForm) {
    keyEditForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(keyEditForm);
      const id = Number(formData.get("id"));
      const quota = Math.max(0, Math.round(Number(formData.get("quota") || 0)));
      const unlimited = Boolean(formData.get("unlimited_quota"));
      const submitButton = keyEditForm.querySelector('button[type="submit"]');
      setButtonBusy(submitButton, true);
      try {
        await apiFetch("/api/token/", {
          method: "PUT",
          body: JSON.stringify({
            id,
            name: String(formData.get("name") || "").trim(),
            status: Number(formData.get("status") || 1),
            remain_quota: quota * QUOTA_PER_UNIT,
            unlimited_quota: unlimited,
            expired_time: -1,
            model_limits_enabled: Boolean(formData.get("model_limits_enabled")),
            model_limits: String(formData.get("model_limits") || "").replace(/\s+/g, ""),
            allow_ips: String(formData.get("allow_ips") || "").trim(),
            group: currentUser?.group || "default",
          }),
        });
        audit("api_key_updated", { id, unlimited, model_limits_enabled: Boolean(formData.get("model_limits_enabled")) });
        keyEditForm.closest("dialog").close();
        showToast(t("keySaved"));
        await loadTokens();
      } catch (error) {
        showToast(error.message);
      } finally {
        setButtonBusy(submitButton, false);
      }
    });
  }

  const includeAdminLogs = document.getElementById("includeAdminLogs");
  if (includeAdminLogs) {
    includeAdminLogs.addEventListener("change", () => renderProfit(currentProfitLogs));
  }

  const balanceForm = document.getElementById("balanceForm");
  if (balanceForm) {
    balanceForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(balanceForm);
      const mode = String(formData.get("topupMode") || "redeem");
      const submitButton = balanceForm.querySelector('button[type="submit"]');
      setButtonBusy(submitButton, true);
      try {
        if (mode === "redeem") {
          const key = String(formData.get("redemptionKey") || "").trim();
          if (!key) throw new Error(t("enterRedeem"));
          await apiFetch("/api/user/topup", {
            method: "POST",
            body: JSON.stringify({ key }),
          });
          balanceForm.closest("dialog").close();
          balanceForm.reset();
          showToast(t("redeemSuccess"));
        } else if (mode === "manual") {
          const amount = Number(formData.get("manualAmount") || 0);
          if (!Number.isFinite(amount) || amount <= 0) throw new Error(t("invalidAmount"));
          await apiFetch("/nexa/manual-topups", {
            method: "POST",
            body: JSON.stringify({
              amount,
              payment_method: String(formData.get("manualMethod") || "manual"),
              contact: String(formData.get("manualContact") || "").trim(),
              note: String(formData.get("manualNote") || "").trim(),
              username: currentUser?.username || currentUser?.display_name || "",
            }),
          });
          balanceForm.closest("dialog").close();
          balanceForm.reset();
          showToast(t("manualTopupSubmitted"));
        } else {
          const method = String(formData.get("paymentMethod") || "");
          const amount = Math.round(Number(formData.get("amount") || 0));
          await requestOnlinePay(method, amount);
          balanceForm.closest("dialog").close();
          showToast(t("paymentStarted"));
        }
        await Promise.all([loadSelf(), loadLogs(), loadTopupInfo(), loadTopups()]);
      } catch (error) {
        showToast(error.message);
      } finally {
        setButtonBusy(submitButton, false);
      }
    });
  }

  const playgroundForm = document.getElementById("playgroundForm");
  const playgroundOutput = document.getElementById("playgroundOutput");
  if (playgroundForm && playgroundOutput) {
    playgroundForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(playgroundForm);
      const tokenId = formData.get("token_id") || currentTokens[0]?.id;
      const prompt = String(formData.get("prompt") || "").trim();
      if (!tokenId) {
        showToast(t("noToken"));
        return;
      }
      if (!prompt) {
        showToast(t("noPrompt"));
        return;
      }
      const submitButton = playgroundForm.querySelector('button[type="submit"]');
      playgroundOutput.textContent = t("running");
      setButtonBusy(submitButton, true);
      try {
        const response = await apiFetch("/nexa/playground", {
          method: "POST",
          body: JSON.stringify({
            token_id: Number(tokenId),
            model: formData.get("model") || currentModels[0] || "deepseek-chat",
            prompt,
          }),
        });
        playgroundOutput.textContent = response.choices?.[0]?.message?.content || JSON.stringify(response, null, 2);
        await Promise.all([loadSelf(), loadLogs()]);
      } catch (error) {
        playgroundOutput.textContent = error.message || t("requestFailed");
      } finally {
        setButtonBusy(submitButton, false);
      }
    });
  }

  document.querySelectorAll("[data-model-search]").forEach((input) => {
    input.addEventListener("input", debounce(() => filterModels(input.value), 180));
  });

  initializeStatusPage();
  initializePaymentQr();
  initializePublicModelPage();
  initializeProtectedPage();
})();
