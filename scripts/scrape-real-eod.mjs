// scripts/scrape-real-eod.mjs
//
// Tự động lấy giá đóng cửa thật cho danh sách mã trong real-tickers.json
// từ CafeF Liveboard (liveboard.cafef.vn), rồi ghi vào public/eod-data.json.
//
// Mô phỏng đúng quy trình đã làm tay bằng Claude trong Chrome:
//   1. Mở liveboard.cafef.vn
//   2. Gõ từng mã vào ô tìm kiếm "Nhập mã CK", chọn gợi ý đầu tiên
//   3. Đọc lại toàn bộ bảng "Theo dõi riêng" đã tích lũy
//   4. Trích T.C (giá tham chiếu) và Giá khớp lệnh (giá hiện tại) cho mỗi mã
//
// Chạy thủ công:   node scripts/scrape-real-eod.mjs
// Chạy tự động:    xem .github/workflows/update-eod.yml (chạy hàng ngày qua cron)
//
// QUAN TRỌNG: Script này được viết dựa trên cấu trúc trang liveboard.cafef.vn
// quan sát được tại thời điểm viết (06/2026). Nếu CafeF đổi giao diện, cần
// cập nhật lại các selector bên dưới. Nên chạy thử thủ công 1 lần để xác nhận
// trước khi tin tưởng hoàn toàn vào lịch tự động.

import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const TICKERS = JSON.parse(fs.readFileSync(path.join(__dirname, "real-tickers.json"), "utf-8"));

const SEARCH_BOX_SELECTOR = 'input[placeholder="Nhập mã CK"]';
const TABLE_ROW_SELECTOR = "table tbody tr";

function parseVNNumber(text) {
  if (!text) return 0;
  const cleaned = text.replace(/[,\s]/g, "").replace(/[^\d.\-]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

async function addTickerToWatchlist(page, symbol) {
  const box = page.locator(SEARCH_BOX_SELECTOR).first();
  await box.click();
  await box.fill("");
  await page.keyboard.press("Meta+A").catch(() => {});
  await box.fill(symbol);
  await page.waitForTimeout(900);

  // Gợi ý xuất hiện ngay dưới ô tìm kiếm, dạng "<MÃ>-<Tên tổ chức>"
  const suggestion = page.locator(`text=/^${symbol}-/`).first();
  try {
    await suggestion.waitFor({ timeout: 2000 });
    await suggestion.click();
    await page.waitForTimeout(400);
    return true;
  } catch {
    console.warn(`  [!] Không tìm thấy gợi ý cho mã ${symbol} — bỏ qua.`);
    return false;
  }
}

async function extractWatchlistTable(page) {
  const rows = await page.locator(TABLE_ROW_SELECTOR).all();
  const results = {};

  for (const row of rows) {
    const cells = await row.locator("td").allInnerTexts();
    if (cells.length < 14) continue; // dòng không đủ cột, bỏ qua

    const symbol = cells[0]?.trim();
    if (!symbol || !/^[A-Z0-9]+$/.test(symbol)) continue;

    // Thứ tự cột quan sát được: Mã,Trần,Sàn,T.C,Giá3,KL3,Giá2,KL2,Giá1,KL1,+/-,Giá,KL,TổngKL,...
    const refPrice = parseVNNumber(cells[3]);
    const matchedPrice = parseVNNumber(cells[11]) || refPrice;
    const change = parseVNNumber(cells[10]);
    const totalVolume = parseVNNumber(cells[13]);

    if (refPrice > 0) {
      results[symbol] = {
        refPrice,
        price: matchedPrice,
        change,
        pctChange: refPrice > 0 ? Math.round((change / refPrice) * 10000) / 100 : 0,
        volume: Math.floor(totalVolume),
      };
    }
  }

  return results;
}

async function main() {
  console.log(`Bắt đầu lấy giá thật cho ${TICKERS.length} mã từ CafeF Liveboard...`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.goto("https://liveboard.cafef.vn/", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);

  let added = 0;
  for (const symbol of TICKERS) {
    const ok = await addTickerToWatchlist(page, symbol);
    if (ok) added++;
  }
  console.log(`Đã thêm ${added}/${TICKERS.length} mã vào danh sách theo dõi.`);

  await page.waitForTimeout(1500);
  const quotes = await extractWatchlistTable(page);
  console.log(`Trích xuất được dữ liệu cho ${Object.keys(quotes).length} mã.`);

  await browser.close();

  // Ghi vào public/eod-data.json đúng format app đang đọc
  const outPath = path.join(ROOT, "public", "eod-data.json");
  const output = {
    success: true,
    source: "CAFEF_LIVEBOARD_AUTO",
    note: "Tự động cập nhật bởi GitHub Actions từ liveboard.cafef.vn",
    updatedAt: new Date().toISOString(),
    quotes: Object.fromEntries(
      Object.entries(quotes).map(([sym, q]) => [
        sym,
        { price: q.price, change: q.change, pctChange: q.pctChange, volume: q.volume },
      ])
    ),
  };

  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf-8");
  console.log(`Đã ghi ${outPath}`);

  // Báo lỗi rõ ràng nếu lấy được quá ít dữ liệu (có thể CafeF đã đổi giao diện)
  const successRate = Object.keys(quotes).length / TICKERS.length;
  if (successRate < 0.5) {
    console.error(
      `CẢNH BÁO: chỉ lấy được ${(successRate * 100).toFixed(0)}% số mã. ` +
      `Có thể trang CafeF đã thay đổi cấu trúc — cần kiểm tra lại script.`
    );
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("Lỗi khi chạy script:", err);
  process.exitCode = 1;
});
