# VN-Stock Pro — Hướng dẫn Deploy & Vận hành

## Những gì đã thay đổi so với bản cũ
- **Bỏ hẳn server Express / Cloud Run.** App giờ là trang tĩnh 100% (chỉ HTML/CSS/JS) — đây là lý do mọi lỗi 404/port suốt thời gian qua sẽ không còn nữa.
- **Không gọi API live nữa.** Dữ liệu giá đọc từ file tĩnh `public/eod-data.json`, cập nhật 1 lần/ngày sau 15:30.
- Thêm cột **Room NN** (room nước ngoài) vào bảng giá.
- Thêm **hiệu ứng nhấp nháy** (flash) khi giá khớp lệnh thay đổi.
- Giữ nguyên toàn bộ: 5 màu chuẩn (xanh/đỏ/vàng/tím trần/xanh lam sàn), bảng giá 3 lệnh mua/bán, biểu đồ nến, vòng lặp "giá nhảy" mỗi 3.5 giây (đã có sẵn, có giới hạn biên độ ±4.5% quanh giá tham chiếu — không trôi dạt sai số liệu thật).

## Cách Deploy lên Netlify (lần đầu)

**Cách nhanh nhất — kéo thả (không cần Git):**
1. Vào https://app.netlify.com -> đăng nhập.
2. Vào mục "Deploys" của 1 site mới (hoặc trang chủ sau khi login sẽ có khung kéo-thả).
3. Kéo thả toàn bộ thư mục `dist/` (có trong file `vn-stock-pro-dist.zip` mình gửi kèm - giải nén ra rồi kéo thư mục đó vào) vào khung "Drag and drop your site output folder here".
4. Xong - Netlify cho bạn link dạng random-name-12345.netlify.app ngay, chạy được luôn, có thể đổi tên site trong Settings.

**Cách chuyên nghiệp hơn - qua Git (để sau này dễ cập nhật):**
1. Đẩy code (file `vn-stock-pro-source.zip`, giải nén ra) lên 1 repo GitHub.
2. Trong Netlify: Add new site -> Import an existing project -> chọn repo đó.
3. Build command: `npm run build` - Publish directory: `dist` (Netlify thường tự nhận đúng nhờ file netlify.toml đã có sẵn trong code).
4. Deploy - xong.

## Cách cập nhật giá đóng cửa mỗi ngày (sau 15:30)

1. Mở file `public/eod-data.json` (trong source code).
2. Sửa giá trong từng mã, ví dụ:
   ```json
   "VCB": { "price": 92.3, "change": 0.8, "pctChange": 0.87, "volume": 210000 }
   ```
3. Lưu file, chạy lại `npm run build`, rồi:
   - Nếu deploy kiểu kéo-thả: kéo thả lại thư mục `dist/` mới vào Netlify.
   - Nếu deploy qua Git: `git commit` + `git push` - Netlify tự build lại.

> Lưu ý: hiện file `eod-data.json` đang chứa dữ liệu giả lập (vì mình không lấy được dữ liệu thật do API TCBS chặn truy cập tự động/robots.txt). Bạn cần tự cập nhật giá thật vào đây, hoặc nhờ ai đó hỗ trợ viết script tự động lấy giá sau 15:30 (xem gợi ý Tự động hóa bên dưới).

## Tự động hóa cập nhật bằng GitHub Actions (Hướng 2 — không cần ai bấm gì)

Đã viết sẵn:
- `scripts/scrape-real-eod.mjs` — script tự mở liveboard.cafef.vn, gõ từng mã trong `scripts/real-tickers.json`, đọc giá thật, ghi vào `public/eod-data.json`.
- `.github/workflows/update-eod.yml` — lịch tự chạy script trên **lúc 15:35 (giờ VN) các ngày Thứ 2-6**, rồi tự commit + push.

**Việc bạn cần làm 1 LẦN duy nhất (khoảng 10 phút):**

1. **Đẩy code lên GitHub** (nếu chưa làm): tạo repo mới trên github.com, làm theo hướng dẫn "…or push an existing repository" để đẩy toàn bộ source code này lên.

2. **Kết nối Netlify với repo đó** (thay cho kéo-thả zip):
   - Netlify → "Add new site" → "Import an existing project" → chọn repo GitHub vừa tạo.
   - Build command: `npm run build` — Publish directory: `dist` (đã có sẵn trong `netlify.toml`).
   - Bấm Deploy.
   - **Lưu ý:** site Netlify mới này sẽ có **link mới**. Bạn cần làm lại bước "Add to Home Screen" trên điện thoại với link mới (hoặc đổi tên site trong Netlify Settings về đúng tên cũ `glistening-melomakarona-218329` nếu muốn giữ link).

3. **Test thử 1 lần trước khi tin tưởng lịch tự động:**
   - Vào repo trên GitHub → tab **Actions** → chọn workflow "Cập nhật giá đóng cửa (EOD) tự động" → bấm **"Run workflow"** để chạy thử ngay (không cần đợi tới 15:35).
   - Xem log chạy: nếu thấy "Đã ghi public/eod-data.json" và tỷ lệ lấy được mã cao (gần 68/68) → thành công, từ giờ chạy tự động mỗi ngày.
   - Nếu lỗi hoặc lấy được quá ít mã: nhiều khả năng CafeF đã đổi giao diện trang — gửi lỗi đó cho mình, mình sẽ sửa lại script.

Sau khi xong 3 bước trên: **mỗi ngày 15:35, hệ thống tự lấy giá → tự cập nhật → Netlify tự build lại → app tự có giá mới**, không cần điện thoại, không cần máy tính, không cần ai làm gì cả.

## Cấu trúc thư mục chính
```
src/
  App.tsx              -> Logic chính, state, vòng lặp giá nhảy
  data.ts              -> Định nghĩa Stock, sinh dữ liệu mock 300 mã
  components/
    StockBoard.tsx     -> Bảng giá (màu sắc, độ sâu lệnh, Room NN, flash)
    StockChart.tsx     -> Biểu đồ nến
public/
  eod-data.json        -> Dữ liệu giá đóng cửa - SỬA FILE NÀY MỖI NGÀY
netlify.toml           -> Cấu hình deploy Netlify
```
