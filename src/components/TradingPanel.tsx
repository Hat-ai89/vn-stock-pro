import React, { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownLeft, X, CheckSquare, Edit, Trash2, Coins, Receipt, Info, Clock, RotateCw } from "lucide-react";
import { Stock, Order, InvestorProfile, StockHolding } from "../data";

interface TradingPanelProps {
  stocks: Record<string, Stock>;
  cash: number;
  portfolio: StockHolding[];
  activeOrders: Order[];
  onPlaceOrder: (order: Omit<Order, "id" | "time" | "filledVolume">) => void;
  onCancelOrder: (id: string) => void;
  onModifyOrder: (id: string, price: number, volume: number) => void;
  selectedTicker: string | null;
  onSelectTicker: (symbol: string) => void;
  isSyncing?: boolean;
  syncStatus?: string;
  onSyncEOD?: () => void;
}

export default function TradingPanel({
  stocks,
  cash,
  portfolio,
  activeOrders,
  onPlaceOrder,
  onCancelOrder,
  onModifyOrder,
  selectedTicker,
  onSelectTicker,
  isSyncing = false,
  syncStatus = "",
  onSyncEOD,
}: TradingPanelProps) {
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [tickerIn, setTickerIn] = useState(selectedTicker || "");
  const [volIn, setVolIn] = useState<number>(100);
  const [priceIn, setPriceIn] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editVol, setEditVol] = useState<number>(0);

  // Sync selected ticker
  useEffect(() => {
    if (selectedTicker) {
      setTickerIn(selectedTicker);
      const stockObj = stocks[selectedTicker];
      if (stockObj) {
        setPriceIn(stockObj.price);
      }
    }
  }, [selectedTicker, stocks]);

  // Adjust default price when ticker input is manually matching a real stock
  const handleTickerChange = (val: string) => {
    const symbol = val.toUpperCase().trim();
    setTickerIn(val);
    const matched = stocks[symbol];
    if (matched) {
      setPriceIn(matched.price);
      onSelectTicker(symbol);
    }
  };

  const getPriceColor = (price: number, refPrice: number, ceilPrice: number, floorPrice: number) => {
    if (price === ceilPrice) return "text-tech-purple";
    if (price === floorPrice) return "text-tech-blue";
    if (price > refPrice) return "text-tech-green";
    if (price < refPrice) return "text-tech-red";
    return "text-tech-yellow";
  };

  const activeStock = stocks[tickerIn.toUpperCase().trim()];
  const matchingHolding = portfolio.find((h) => h.symbol === tickerIn.toUpperCase().trim());

  // Max calculations
  const feeRate = 0.0015; // 0.15%
  const maxBuy = activeStock && priceIn > 0 ? Math.floor(cash / (priceIn * 1000 * (1 + feeRate))) : 0;
  const maxSell = matchingHolding ? matchingHolding.volume : 0;

  const handlePercentageClick = (pct: number) => {
    if (side === "BUY") {
      if (!activeStock || priceIn <= 0) return;
      const targetVol = Math.floor(maxBuy * pct);
      const roundedVol = Math.max(0, Math.floor(targetVol / 10) * 10); // Standard HOSE/HNX round-off LOT size
      setVolIn(roundedVol || targetVol);
    } else {
      if (!matchingHolding) return;
      const targetVol = Math.floor(maxSell * pct);
      const roundedVol = Math.max(0, Math.floor(targetVol / 10) * 10);
      setVolIn(roundedVol || targetVol);
    }
  };

  // Execution triggers
  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const symbol = tickerIn.toUpperCase().trim();
    if (!stocks[symbol]) {
      setErrorMsg(`Mã cổ phiếu '${symbol}' không hợp lệ!`);
      return;
    }
    if (volIn <= 0) {
      setErrorMsg(`Khối lượng đặt hàng phải lớn hơn 0!`);
      return;
    }
    if (priceIn <= 0) {
      setErrorMsg(`Giá đặt hàng phải lớn hơn 0!`);
      return;
    }

    const live = stocks[symbol];
    if (priceIn > live.ceilPrice) {
      setErrorMsg(`Giá đặt (${priceIn}) vượt quá biên trần (${live.ceilPrice})!`);
      return;
    }
    if (priceIn < live.floorPrice) {
      setErrorMsg(`Giá đặt (${priceIn}) thấp hơn biên sàn (${live.floorPrice})!`);
      return;
    }

    const orderValue = priceIn * 1000 * volIn;
    const requiredMargin = orderValue * (1 + feeRate);

    if (side === "BUY") {
      if (requiredMargin > cash) {
        setErrorMsg(`Số dư khả dụng không đủ để ký quỹ (Yêu cầu: ${requiredMargin.toLocaleString("vi-VN")}đ)!`);
        return;
      }
    } else {
      if (!matchingHolding || matchingHolding.volume < volIn) {
        setErrorMsg(`Tài khoản không sở hữu đủ khối lượng khả dụng để bán (Nắm giữ: ${maxSell})!`);
        return;
      }
    }

    // Submit order to parent handler
    onPlaceOrder({
      symbol,
      type: side,
      price: priceIn,
      volume: volIn,
      status: "PENDING",
    });

    setSuccessMsg(`Đã đặt lệnh ${side === "BUY" ? "MUA" : "BÁN"} ${volIn} cổ phiếu ${symbol} giá ${priceIn} thành công!`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleApplyModify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    if (editPrice <= 0 || editVol <= 0) return;

    onModifyOrder(editingOrder.id, editPrice, editVol);
    setSuccessMsg(`Đã sửa lệnh ${editingOrder.symbol} thành công!`);
    setEditingOrder(null);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-full">
      {/* Execution panel Left (xl: col-span-5) */}
      <div className="xl:col-span-5 bg-card-main border border-border-main rounded shadow-lg p-5 flex flex-col justify-between h-full select-none">
        <div>
          {/* BUY SELL TOGGLE */}
          <div className="bg-[#000000]/40 p-1 rounded border border-border-main grid grid-cols-2 gap-1 mb-5">
            <button
              onClick={() => {
                setSide("BUY");
                setErrorMsg("");
              }}
              className={`py-2 rounded font-bold text-xs uppercase flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                side === "BUY"
                  ? "bg-tech-green text-black shadow-lg"
                  : "text-text-muted hover:text-[#eaeaeb]"
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>LỆNH MUA</span>
            </button>
            <button
              onClick={() => {
                setSide("SELL");
                setErrorMsg("");
              }}
              className={`py-2 rounded font-bold text-xs uppercase flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                side === "SELL"
                  ? "bg-tech-red text-white shadow-lg"
                  : "text-text-muted hover:text-[#eaeaeb]"
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>LỆNH BÁN</span>
            </button>
          </div>

          <form onSubmit={handleOrderSubmit} className="space-y-4">
            {/* Stock Code Picker */}
            <div>
              <label className="block text-[10px] text-text-muted uppercase font-bold tracking-widest mb-1.5">
                Mã Chứng khoán
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập mã (SSI, FPT)..."
                  value={tickerIn}
                  onChange={(e) => handleTickerChange(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0b0e11] border border-border-main text-sm text-tech-green font-extrabold rounded placeholder-gray-600 uppercase tracking-widest focus:outline-none focus:border-tech-green"
                  required
                />
                {activeStock && (
                  <span className="absolute right-3.5 top-3.5 text-[10px] bg-[#1e2329] border border-border-main text-tech-green px-1.5 py-0.5 font-bold rounded">
                    {activeStock.sector}
                  </span>
                )}
              </div>

              {/* Real time mini depths ticks */}
              {activeStock && (
                <div className="grid grid-cols-3 gap-2 mt-2 bg-[#000000]/20 p-2.5 rounded border border-border-main font-mono text-[11px]">
                  <div className="text-center">
                    <span className="text-text-muted block text-[9px] font-sans font-semibold">THAM CHIẾU</span>
                    <span className="text-tech-yellow font-semibold">{activeStock.refPrice.toFixed(2)}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-text-muted block text-[9px] font-sans font-semibold">GIÁ TRẦN</span>
                    <span className="text-tech-purple font-bold">{activeStock.ceilPrice.toFixed(2)}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-text-muted block text-[9px] font-sans font-semibold">GIÁ SÀN</span>
                    <span className="text-tech-blue font-bold">{activeStock.floorPrice.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Volume shares */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] text-text-muted uppercase font-bold tracking-widest">
                  Khối lượng đặt (Số CP)
                </label>
                {side === "SELL" && matchingHolding && (
                  <span className="text-[10px] text-text-muted font-bold font-mono">
                    Khả dụng: {matchingHolding.volume.toLocaleString()}
                  </span>
                )}
              </div>
              <input
                type="number"
                min="10"
                step="10"
                placeholder="Khối lượng (Lô tối thiểu 10)..."
                value={volIn || ""}
                onChange={(e) => setVolIn(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-[#0b0e11] border border-border-main text-sm text-white font-bold font-mono rounded focus:outline-none focus:border-tech-green"
                required
              />
            </div>

            {/* Percentage power modifiers */}
            <div className="grid grid-cols-4 gap-1.5">
              {[0.25, 0.50, 0.75, 1.00].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handlePercentageClick(pct)}
                  className="py-1.5 bg-[#1e2329] border border-border-main text-[10px] text-text-muted font-bold rounded hover:text-white hover:bg-[#2b3139] transition-colors cursor-pointer"
                >
                  {pct * 100}%
                </button>
              ))}
            </div>

            {/* Price k-VND */}
            <div>
              <label className="block text-[10px] text-text-muted uppercase font-bold tracking-widest mb-1.5">
                Giá đặt mua (k-VNĐ)
              </label>
              <input
                type="number"
                step="0.05"
                min="1"
                placeholder="Giá đặt (VND k-index, VD: 118.5)..."
                value={priceIn || ""}
                onChange={(e) => setPriceIn(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-[#0b0e11] border border-border-main text-sm text-white font-bold font-mono rounded focus:outline-none focus:border-tech-green"
                required
              />
              <span className="text-[10px] text-text-muted font-semibold block mt-1.5">
                Quy đổi: {(priceIn * 1000).toLocaleString("vi-VN")} VNĐ / cổ phiếu.
              </span>
            </div>

            {/* Feedbacks lines inside UI form */}
            {errorMsg && (
              <div className="p-3 bg-tech-red/10 border border-tech-red/20 rounded text-tech-red font-bold text-[11px] leading-relaxed">
                ⚠️ {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-tech-green/10 border border-tech-green/20 rounded text-tech-green font-bold text-[11px]">
                🚀 {successMsg}
              </div>
            )}

            {/* Estimated Value ledger cards */}
            {activeStock && priceIn > 0 && volIn > 0 && (
              <div className="bg-[#000000]/20 p-3.5 border border-border-main rounded space-y-2 text-[11px] font-semibold text-text-muted font-mono">
                <div className="flex justify-between">
                  <span>Trực lệnh:</span>
                  <span className="font-bold text-gray-200">
                    {side === "BUY" ? "Mua" : "Bán"} {volIn} CP {activeStock.symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Giá trị ước lượng:</span>
                  <span className="font-extrabold text-[#eaeaeb]">
                    {(volIn * priceIn * 1000).toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
                <div className="flex justify-between text-tech-yellow">
                  <span>Phí CTCK (0.15%):</span>
                  <span>
                    {(volIn * priceIn * 1000 * feeRate).toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
                <div className="flex justify-between border-t border-border-main pt-2 text-tech-yellow font-mono text-[12px] font-extrabold">
                  <span>{side === "BUY" ? "Ký quỹ tối đa:" : "Giá trị thực nhận:"}</span>
                  <span className="text-tech-yellow">
                    {side === "BUY"
                      ? (volIn * priceIn * 1000 * (1 + feeRate)).toLocaleString("vi-VN")
                      : (volIn * priceIn * 1000 * (1 - feeRate)).toLocaleString("vi-VN")}{" "}
                    đ
                  </span>
                </div>
              </div>
            )}

            {/* Trading Button trigger */}
            <button
              type="submit"
              className={`w-full py-3.5 rounded font-extrabold tracking-wider text-xs transition-all duration-150 uppercase shadow cursor-pointer ${
                side === "BUY"
                  ? "bg-tech-green hover:bg-[#0cb372] text-black border-transparent"
                  : "bg-tech-red hover:bg-[#eb2f48] text-white border-transparent"
              }`}
            >
              🚀 CHUYỂN LỆNH VÀO SÀN GIAO DỊCH
            </button>
          </form>
        </div>

        {/* Small cash margin reference at bottom */}
        <div className="border-t border-border-main pt-3.5 mt-5 flex items-center justify-between text-[11px] font-mono select-none">
          <div className="flex items-center text-text-muted">
            <Coins className="w-3.5 h-3.5 text-tech-green mr-1.5" />
            <span>Tiền khả dụng:</span>
          </div>
          <span className="font-extrabold text-[#eaeaeb]">{cash.toLocaleString("vi-VN")} đ</span>
        </div>
      </div>

      {/* Sổ Lệnh / Active Ledger orders (Right xl: col-span-7) */}
      <div className="xl:col-span-7 bg-card-main border border-border-main rounded flex flex-col justify-between h-full overflow-hidden select-none">
        <div>
          {/* Header */}
          <div className="p-4 border-b border-border-main bg-[#000000]/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-tech-green" />
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Sổ lệnh Hôm nay</h3>
                <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider leading-none">Chờ khớp & Lịch sử trong phiên</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {onSyncEOD && (
                <button
                  onClick={onSyncEOD}
                  disabled={isSyncing}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-[10px] font-bold border select-none transition-all cursor-pointer ${
                    isSyncing
                      ? "bg-tech-yellow/10 border-tech-yellow/30 text-tech-yellow animate-pulse cursor-not-allowed"
                      : "bg-tech-green/10 hover:bg-tech-green/20 border-tech-green/30 hover:border-tech-green/60 text-tech-green active:scale-95"
                  }`}
                >
                  <RotateCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
                  <span>{isSyncing ? syncStatus || "ĐANG ĐỒNG BỘ..." : "CẬP NHẬT CUỐI NGÀY"}</span>
                </button>
              )}
              <span className="text-[10px] font-extrabold text-[#9da0a7] bg-white/5 border border-white/10 px-2.5 py-1.5 rounded leading-none">
                T+2.5
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#000000]/40 border-b border-border-main text-[10px] text-text-muted font-bold uppercase tracking-wider h-10 text-center font-mono">
                  <th className="px-3 text-left">Thời gian</th>
                  <th className="px-2 text-left">Mã</th>
                  <th className="px-2">Lệnh</th>
                  <th className="px-2 text-right">Khối lượng</th>
                  <th className="px-2 text-right">Khớp</th>
                  <th className="px-2 text-right">Giá đặt (kđ)</th>
                  <th className="px-2">Trạng thái</th>
                  <th className="px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {activeOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-text-muted font-semibold text-xs">
                      Không ghi nhận lệnh đặt trong phiên hôm nay. Hãy lập lệnh đặt ở bảng bên trái!
                    </td>
                  </tr>
                ) : (
                  activeOrders.map((ord) => {
                    const isBuy = ord.type === "BUY";
                    const isPending = ord.status === "PENDING";
                    const isFilled = ord.status === "FILLED";
                    const isCancelled = ord.status === "CANCELLED";

                    let statusClass = "bg-tech-yellow/10 text-tech-yellow border border-tech-yellow/20";
                    if (isFilled) statusClass = "bg-tech-green/10 text-tech-green border border-tech-green/20";
                    if (isCancelled) statusClass = "bg-tech-red/10 text-tech-red border border-tech-red/20";

                    return (
                      <tr
                        key={ord.id}
                        className="border-b border-border-main hover:bg-[#1e2329]/50 h-11 align-middle text-center font-mono font-semibold"
                      >
                        <td className="px-3 text-left text-text-muted font-sans text-[11px]">{ord.time}</td>
                        <td className="px-2 text-left text-tech-green font-bold font-mono text-xs">{ord.symbol}</td>
                        <td className="px-2">
                          <span className={`inline-block px-1.5 py-0.2 rounded font-extrabold text-[10px] border ${
                            isBuy ? "text-tech-green bg-tech-green/10 border-tech-green/20" : "text-tech-red bg-tech-red/10 border-tech-red/20"
                          }`}>
                            {isBuy ? "MUA" : "BÁN"}
                          </span>
                        </td>
                        <td className="px-2 text-right text-gray-200">{ord.volume.toLocaleString()}</td>
                        <td className="px-2 text-right text-tech-green">{ord.filledVolume.toLocaleString()}</td>
                        <td className="px-2 text-right font-bold">{ord.price.toFixed(2)}</td>

                        {/* Status tag */}
                        <td className="px-2">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${statusClass}`}>
                            {ord.status === "PENDING"
                              ? "CHỜ KHỚP"
                              : ord.status === "FILLED"
                              ? "ĐÃ KHỚP"
                              : ord.status === "CANCELLED"
                              ? "ĐÃ HỦY"
                              : "ĐÃ SỬA"}
                          </span>
                        </td>

                        {/* Actions buy/edit */}
                        <td className="px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex space-x-1 justify-end items-center">
                            {isPending && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingOrder(ord);
                                    setEditPrice(ord.price);
                                    setEditVol(ord.volume);
                                  }}
                                  className="p-1 hover:bg-[#1e2329] text-tech-green rounded transition-colors cursor-pointer"
                                  title="Sửa giá/khối lượng"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onCancelOrder(ord.id)}
                                  className="p-1 hover:bg-tech-red/10 text-tech-red rounded transition-colors cursor-pointer"
                                  title="Hủy lệnh đặt"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info panel tips footer */}
        <div className="p-4 bg-[#000000]/40 border-t border-border-main text-[10px] leading-relaxed text-text-muted">
          <p className="flex items-center text-[#eaeaeb] font-semibold mb-1">
            <Info className="w-3.5 h-3.5 text-tech-green mr-1.5 shrink-0" />
            Lưu ý khớp lệnh Hệ thống iBoard:
          </p>
          <p>
            Lệnh khớp tự động dựa trên mức giá khớp gần nhất và khối lượng đối ứng trên bảng live. Hệ thống giao dịch chính thức sẽ tự động khớp hoàn toàn sau 4 - 8 giây nếu mức giá đặt tương hợp.
          </p>
        </div>
      </div>

      {/* Editing Dialog Modal box */}
      {editingOrder && (
        <div className="fixed inset-0 bg-[#000000]/80 flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
          <div className="bg-card-main border border-border-main rounded w-full max-w-sm p-5 shadow-2xl relative select-none">
            <button
              onClick={() => setEditingOrder(null)}
              className="absolute right-3.5 top-3.5 p-1 text-text-muted hover:text-white rounded hover:bg-[#1e2329] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-[#F3F4F6] uppercase tracking-widest mb-1">Sửa lệnh giao dịch</h3>
            <p className="text-[10px] text-text-muted font-semibold uppercase font-mono mb-4">Mã: {editingOrder.symbol} | Tiểu khoản: 880168</p>

            <form onSubmit={handleApplyModify} className="space-y-4 font-semibold text-xs">
              <div>
                <label className="block text-text-muted uppercase font-bold text-[9px] mb-1">Khối lượng (Lô 10)</label>
                <input
                  type="number"
                  step="10"
                  min="10"
                  className="w-full bg-[#0b0e11] border border-border-main px-3.5 py-2.5 rounded text-white font-mono"
                  value={editVol}
                  onChange={(e) => setEditVol(parseInt(e.target.value) || 0)}
                  required
                />
              </div>

              <div>
                <label className="block text-text-muted uppercase font-bold text-[9px] mb-1">Giá đặt sửa (k-VND)</label>
                <input
                  type="number"
                  step="0.05"
                  className="w-full bg-[#0b0e11] border border-border-main px-3.5 py-2.5 rounded text-white font-mono"
                  value={editPrice}
                  onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="pt-3 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="w-1/2 py-2.5 bg-[#1e2329] border border-border-main rounded text-text-muted hover:text-white font-bold cursor-pointer"
                >
                  BỎ QUA
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-tech-green hover:bg-[#0cb372] text-black rounded font-extrabold cursor-pointer"
                >
                  XÁC NHẬN SỬA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
