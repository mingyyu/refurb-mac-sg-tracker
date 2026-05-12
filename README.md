# Refurb Mini Spy

Monitors Apple's refurbished Mac store (Singapore) for Mac Mini availability and sends Telegram notifications when qualifying models appear.

## How It Works

A GitHub Action runs every 15 minutes, scrapes product data from Apple's refurbished Mac page via JSON-LD extraction, and sends a Telegram message when Mac Minis meeting the alert criteria are found.

### Alert Criteria

Only models matching **all** of the following are included in notifications:

- **Chip:** M4 or newer
- **RAM:** 16GB or more
- **Storage:** 512GB or more

## Setup

1. Push this repo to a **private** GitHub repository
2. Create a Telegram bot via `@BotFather` and save the bot token
3. Get your `chat_id`:
   - Send a message to your bot (or add it to a group/channel)
   - Call: `curl "https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates"` to find the `chat_id`
   - Or use `@userinfobot` to get your personal chat id
4. Add these as **repository secrets** in **Settings → Secrets → Actions**:
   - `TELEGRAM_BOT_TOKEN` — the token from `@BotFather`
   - `TELEGRAM_CHAT_ID` — the numeric chat id (or `@channelusername` for channels where the bot is an admin)
5. The workflow runs automatically every 15 minutes, or trigger it manually from the **Actions** tab

## Local Testing

```sh
# Dry run (logs output, no Telegram message sent)
bun run check.ts

# With Telegram notification
# Linux/macOS
TELEGRAM_BOT_TOKEN="<token>" TELEGRAM_CHAT_ID="<chat_id>" bun run check.ts

# PowerShell (Windows)
$env:TELEGRAM_BOT_TOKEN = "<token>"; $env:TELEGRAM_CHAT_ID = "<chat_id>"; bun run check.ts
```

## Example Notification

```
🖥️ Mac Minis spotted on Apple Refurbished (SG)!

• SGD 579.00 — Refurbished Mac mini Apple M4 chip, 16GB, 256GB
• SGD 1,589.00 — Refurbished Mac mini Apple M4 Pro chip, 24GB, 512GB

👉 https://www.apple.com/sg/shop/refurbished/mac
```
