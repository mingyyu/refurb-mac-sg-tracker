import {
  MINI_URL,
  fetchApplePage,
  extractMacMiniProducts,
  formatPrice,
  parseSpecsString,
  parseChip,
  parseSpecsStructured,
  type Product,
} from "./lib/scrape";

function parseStorageGB(storage: string): number {
  const tb = storage.match(/(\d+)\s*TB/i);
  if (tb) return +tb[1] * 1024;
  const gb = storage.match(/(\d+)\s*GB/i);
  if (gb) return +gb[1];
  return 0;
}

function meetsAlertCriteria(product: Product): boolean {
  const { generation } = parseChip(product.name || "");
  if (generation < 4) return false;

  const specs = parseSpecsStructured(product.description);
  const ram = specs.ram.match(/(\d+)/);
  if (!ram || +ram[1] < 16) return false;

  return parseStorageGB(specs.storage) >= 512;
}

function escapeHtml(s: string): string {
  return (s || "").toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildTelegramMessage(minis: Product[]): string {
  const lines = minis.map((p) => {
    const specs = parseSpecsString(p.description);
    const specLine = specs ? `\n    ${escapeHtml(specs)}` : "";
    return `• <b>${escapeHtml(formatPrice(p))}</b> — ${escapeHtml(p.name || "")}${specLine}`;
  });
  return [
    `🖥️ <b>${minis.length} Mac Mini${minis.length > 1 ? "s" : ""} spotted on Apple Refurbished (SG)!</b>`,
    "",
    ...lines,
    "",
    `👉 ${escapeHtml(MINI_URL)}`,
  ].join("\n");
}

async function notifyTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.log("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — skipping Telegram notification");
    console.log("Message that would be sent:\n", text);
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });

  if (!res.ok) {
    throw new Error(`Telegram API failed: ${res.status} ${await res.text()}`);
  }

  console.log("Telegram notification sent successfully");
}

async function main() {
  console.log("Fetching Apple refurbished Mac page (SG)...");
  const html = await fetchApplePage(MINI_URL);

  const allMinis = extractMacMiniProducts(html);
  console.log(`Found ${allMinis.length} Mac Mini(s)`);

  const minis = allMinis.filter(meetsAlertCriteria);
  const filtered = allMinis.length - minis.length;
  if (filtered > 0) {
    console.log(`Filtered out ${filtered} model(s) not meeting criteria (M4+, 16GB+, 512GB+)`);
  }

  if (minis.length === 0) {
    console.log("No qualifying Mac Minis found. Exiting.");
    return;
  }

  for (const mini of minis) {
    console.log(`  → ${mini.name} — ${formatPrice(mini)}`);
  }

  const message = buildTelegramMessage(minis);
  await notifyTelegram(message);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
