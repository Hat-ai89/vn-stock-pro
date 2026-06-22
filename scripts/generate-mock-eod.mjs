import { initializeStockBoard } from "../src/data.ts";

const board = initializeStockBoard();
const quotes = {};
Object.values(board).forEach((s) => {
  quotes[s.symbol] = {
    price: s.price,
    change: s.change,
    pctChange: s.pctChange,
    volume: s.totalVolume,
  };
});

const output = {
  success: true,
  source: "MANUAL_EOD",
  note: "Cập nhật giá đóng cửa thật vào đây sau 15:30 mỗi ngày giao dịch. Xem README.md.",
  updatedAt: new Date().toISOString(),
  quotes,
};

console.log(JSON.stringify(output, null, 2));
