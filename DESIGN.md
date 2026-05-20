# NexaGate Design System

NexaGate uses a Claude-inspired product design language: warm, editorial, calm, and developer-focused. This design system applies only to `nexagate-site`. Do not restyle or rename the upstream New API admin interface.

## Brand Feel

- Warm and trustworthy rather than cold SaaS blue.
- Chinese-first content, with English as a secondary language.
- Product pages should feel like a polished AI developer platform, not a generic admin template.
- The interface should be quiet, readable, and useful. Avoid marketing clutter and decorative filler.

## Palette

- Background: warm ivory `#fbf7ef`
- Soft background: `#f4ede3`
- Surface: `#fffdf8`
- Raised surface: `#ffffff`
- Ink: `#201915`
- Muted ink: `#6f6258`
- Border: `#e7ddd0`
- Strong border: `#d7c8b8`
- Primary accent: clay/coral `#d9684f`
- Primary accent hover: `#bf533d`
- Accent soft: `#fae6dc`
- Dark code/product surface: `#171412`

## Typography

- Display headings use a serif stack: `Georgia`, `Times New Roman`, `Songti SC`, `SimSun`, serif.
- UI and body text use system sans: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Microsoft YaHei`, sans-serif.
- Headings should feel editorial and large, with disciplined line-height.
- UI labels, buttons, tables, and sidebars must use deliberate smaller sizes and weights.
- Letter spacing stays `0`; no negative tracking overrides.

## Layout

- Prefer open editorial layouts with strong whitespace.
- Use one purposeful product mockup or code surface per hero, not many small decorative cards.
- Console surfaces should be dense enough for work but visually warm.
- Cards are allowed for repeated items, dialogs, tables, and dashboard modules. Avoid cards inside cards.
- Radius target: 10-14px. Use larger radii only for hero product surfaces.

## Components

- Primary button: clay fill, white text.
- Secondary button: warm paper fill, subtle border.
- Inputs: white/warm surface, clear border, clay focus ring.
- Code blocks: dark warm charcoal with amber/coral syntax feel.
- Model cards: include icon block, model name, short description, tags, input/output pricing, and one action.
- Console sidebar: warm paper, clear selected state, compact navigation.
- Dialogs: warm surface, strong shadow, clear close button.

## Interaction

- Copy buttons must show a toast/state change.
- Forms and dashboard actions must feel real, not decorative.
- Hover states should lift subtly, never bounce or feel playful.
- Respect reduced motion.

## Page Rules

- Homepage: lead with NexaGate, concise product explanation, Base URL copy, and a dark API request mockup.
- Auth: simple warm login/register panel, no extra distractions.
- Console: functional dashboard with sidebar, metrics, keys, balance, usage, integration, logs, and settings.
- Models: marketplace grid with polished model cards and clear pricing.
- Docs: readable guide with sticky side navigation and code blocks.
- Pricing: transparent table and simple explanation.

## Content Rules

- Do not mention New API in user-facing NexaGate pages.
- Do not imply users need to understand backend channels.
- Keep copy short and practical.
- Avoid low-end model/vendor phrasing. Say OpenAI, Claude, DeepSeek, and similar models when necessary.
