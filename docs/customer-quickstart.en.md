# Developer Quickstart

This gateway provides an OpenAI-compatible API for authorized model access.

## Base URL

```text
https://nexagate.yourdomain.com/v1
```

Replace `nexagate.yourdomain.com` with the production domain.

## Authentication

Create an API token in the dashboard and send it as a bearer token:

```http
Authorization: Bearer YOUR_API_TOKEN
```

Never expose your token in frontend code, mobile apps, browser extensions, public repositories, or logs.

## List Models

```bash
curl https://nexagate.yourdomain.com/v1/models \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

## Chat Completions

```bash
curl https://nexagate.yourdomain.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [
      { "role": "user", "content": "Write a short product description for a travel backpack." }
    ]
  }'
```

## Streaming

```bash
curl https://nexagate.yourdomain.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "stream": true,
    "messages": [
      { "role": "user", "content": "Give me three onboarding email subject lines." }
    ]
  }'
```

## JavaScript Example

```js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  baseURL: "https://nexagate.yourdomain.com/v1",
});

const completion = await client.chat.completions.create({
  model: "deepseek-chat",
  messages: [
    { role: "user", content: "Summarize this customer feedback in one sentence." },
  ],
});

console.log(completion.choices[0].message.content);
```

## Python Example

```python
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_TOKEN",
    base_url="https://nexagate.yourdomain.com/v1",
)

completion = client.chat.completions.create(
    model="deepseek-chat",
    messages=[
        {"role": "user", "content": "Translate this sentence into Spanish: Hello, welcome to our store."}
    ],
)

print(completion.choices[0].message.content)
```

## Usage Rules

- Use only models and features enabled for your account.
- Do not use the service for spam, fraud, credential theft, malware, evasion, or other abusive activity.
- Requests may be routed to third-party model providers. Avoid sending secrets, passwords, private keys, payment card data, or highly sensitive personal data.
- Keep enough prepaid balance before running batch jobs.
- Contact support before high-volume usage so rate limits and billing rules can be adjusted safely.
