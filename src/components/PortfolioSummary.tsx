import React, { useState } from "react";
import { Briefcase, TrendingUp, TrendingDown, LayoutGrid, BarChart3, HelpCircle, ArrowUpRight, Coins } from "lucide-react";
import { StockHolding, BondHolding, Stock } from "../data";

interface PortfolioSummaryProps {
  portfolio: StockHolding[];
  bonds?: BondHolding[];
  stocks: Record<string, Stock>;
  onSelectTicker: (symbol: string) => void;
  onTabChange: (tabId: string) => void;
  cash: number;
}

export default function PortfolioSummary({
  portfolio,
  bonds = [],
  stocks,
  onSelectTicker,
  onTabChange,
  cash,
}: PortfolioSummaryProps) {
  const [viewMode, setViewMode] = useState<"LIST" | "HEATMAP">("LIST");
  const [sortField, setSortField] = useState<keyof StockHolding | "totalCost" | "totalValue" | "profit">("volume");
  const [sortAsc, setSortAsc] = useState(false);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  const formatPercent = (num: number) => {
    return (num >= 0 ? "+" : "") + num.toFixed(2) + "%";
  };

  // Convert raw holdings to structured calculated records
  const calculatedHoldings = portfolio.map((holding) => {
    const liveStock = stocks[holding.symbol];
    const currentPrice = liveStock ? liveStock.price * 1000 : holding.costPrice; // Current price from board in VND
    const totalCost = holding.costPrice * holding.volume;
    const totalValue = currentPrice * holding.volume;
    const profit = totalValue - totalCost;
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;

    return {
      ...holding,
      currentPrice,
      totalCost,
      totalValue,
      profit,
      roi,
      sector: liveStock?.sector || "Khác",
    };
  });

  // Calculate overall portfolio metrics
  const totalCostValue = calculatedHoldings.reduce((sum, h) => sum + h.totalCost, 0);
  const totalValueValue = calculatedHoldings.reduce((sum, h) => sum + h.totalValue, 0);
  const totalProfitValue = totalValueValue - totalCostValue;
  const overallROI = totalCostValue > 0 ? (totalProfitValue / totalCostValue) * 100 : 0;

  // Trái phiếu: tính giá trị & lãi/lỗ tạm tính
  const calculatedBonds = bonds.map((b) => {
    const totalCost = b.costPrice * b.volume;
    const totalValue = b.currentPrice * b.volume;
    const profit = totalValue - totalCost;
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;
    return { ...b, totalCost, totalValue, profit, roi };
  });
  const bondTotalValue = calculatedBonds.reduce((sum, b) => sum + b.totalValue, 0);
  const bondTotalCost = calculatedBonds.reduce((sum, b) => sum + b.totalCost, 0);
  
  // Sorting logical stream
  const sortedHoldings = [...calculatedHoldings].sort((a, b) => {
    let valA: any = a[sortField as keyof typeof a];
    let valB: any = b[sortField as keyof typeof b];

    if (typeof valA === "string") {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortAsc ? valA - valB : valB - valA;
  });

  const triggerSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default desc
    }
  };

  // Sector stats
  const sectorDataMap: Record<string, { cost: number; value: number }> = {};
  calculatedHoldings.forEach((h) => {
    if (!sectorDataMap[h.sector]) {
      sectorDataMap[h.sector] = { cost: 0, value: 0 };
    }
    sectorDataMap[h.sector].cost += h.totalCost;
    sectorDataMap[h.sector].value += h.totalValue;
  });

  return (
    <div className="bg-card-main border border-border-main rounded shadow-lg flex flex-col overflow-hidden h-full">
      {/* Tab Switcher & Metrics Header */}
      <div className="p-4 border-b border-border-main bg-[#000000]/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Banner Title */}
        <div className="flex items-center space-x-2.5">
          <Briefcase className="w-5 h-5 text-tech-green" />
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Danh mục Đầu tư thực tế</h2>
            <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Quản lý sức khỏe 30 mã tài sản</p>
          </div>
        </div>

        {/* Dynamic selector switch */}
        <div className="flex items-center space-x-3 self-end lg:self-auto">
          {/* List or Heatmap toggle */}
          <div className="bg-[#000000]/40 p-1 border border-border-main rounded flex space-x-1">
            <button
              onClick={() => setViewMode("LIST")}
              className={`px-3 py-1 rounded text-[11px] font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewMode === "LIST"
                  ? "bg-[#1e2329] text-tech-green border border-border-main"
                  : "text-text-muted hover:text-white"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Dạng danh sách</span>
            </button>
            <button
              onClick={() => setViewMode("HEATMAP")}
              className={`px-3 py-1 rounded text-[11px] font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewMode === "HEATMAP"
                  ? "bg-[#1e2329] text-tech-green border border-border-main"
                  : "text-text-muted hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Heatmap Tài sản</span>
            </button>
          </div>

          <button
            onClick={() => onTabChange("trading")}
            className="px-3.5 py-1.5 bg-[#1e2329] hover:bg-[#2b3139] text-tech-green font-extrabold text-[11px] uppercase tracking-wider rounded border border-border-main flex items-center space-x-1 transition-all cursor-pointer"
          >
            <span>Đặt lệnh nhanh</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* CORE WRAPPER */}
      <div className="flex-1 p-4 lg:p-5 overflow-y-auto">
        {viewMode === "LIST" ? (
          <div>
            {/* Grid Table */}
            <div className="overflow-x-auto rounded border border-border-main bg-[#0b0e11]">
              <table className="w-full text-xs font-semibold text-gray-300 font-sans border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-[#000000]/40 border-b border-border-main text-[10px] text-text-muted uppercase tracking-wider h-10 text-center font-mono font-bold select-none">
                    <th className="px-3 text-left w-24 cursor-pointer hover:text-tech-green transition-colors" onClick={() => triggerSort("symbol")}>Mã</th>
                    <th className="text-right px-2 cursor-pointer hover:text-tech-green" onClick={() => triggerSort("volume")}>Số lượng (CP)</th>
                    <th className="text-right px-2 cursor-pointer hover:text-tech-green" onClick={() => triggerSort("costPrice")}>Giá vốn (đ)</th>
                    <th className="text-right px-2 cursor-pointer hover:text-tech-green" onClick={() => triggerSort("currentPrice")}>Giá hiện tại (đ)</th>
                    <th className="text-right px-2 cursor-pointer hover:text-tech-green" onClick={() => triggerSort("totalCost")}>Tổng giá vốn (đ)</th>
                    <th className="text-right px-2 cursor-pointer hover:text-tech-green" onClick={() => triggerSort("totalValue")}>Giá trị thị trường (đ)</th>
                    <th className="text-right px-2 cursor-pointer hover:text-tech-green" onClick={() => triggerSort("profit")}>Lài/Lỗ tạm tính (đ)</th>
                    <th className="text-center px-2 cursor-pointer hover:text-tech-green w-24" onClick={() => triggerSort("roi")}>Tỷ suất (ROI)</th>
                    <th className="text-center px-2 w-28">Ngày mua</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedHoldings.map((h) => {
                    const isProfit = h.profit > 0;
                    const isLoss = h.profit < 0;

                    const textClass = isProfit
                      ? "text-tech-green"
                      : isLoss
                      ? "text-tech-red"
                      : "text-tech-yellow";

                    const badgeClass = isProfit
                      ? "bg-tech-green/10 text-tech-green border border-tech-green/20"
                      : isLoss
                      ? "bg-tech-red/10 text-tech-red border border-tech-red/20"
                      : "bg-tech-yellow/10 text-tech-yellow border border-tech-yellow/20";

                    return (
                      <tr
                        key={h.symbol}
                        onClick={() => onSelectTicker(h.symbol)}
                        className="border-b border-border-main hover:bg-[#1e2329]/50 h-10 cursor-pointer align-middle transition-colors font-mono font-semibold"
                      >
                        {/* Symbol & Industry Badge */}
                        <td className="px-3 text-left font-bold text-tech-green text-[13px]">
                          <div className="flex flex-col">
                            <span>{h.symbol}</span>
                            <span className="text-[9px] text-text-muted font-sans font-medium">{h.sector}</span>
                          </div>
                        </td>

                        <td className="text-right px-2 text-gray-100">{h.volume.toLocaleString("vi-VN")}</td>
                        <td className="text-right px-2 text-text-muted">{Math.round(h.costPrice).toLocaleString("vi-VN")}</td>
                        <td className="text-right px-2 text-gray-200">{Math.round(h.currentPrice).toLocaleString("vi-VN")}</td>
                        <td className="text-right px-2 text-text-muted">{Math.round(h.totalCost).toLocaleString("vi-VN")}</td>
                        <td className="text-right px-2 text-gray-100">{Math.round(h.totalValue).toLocaleString("vi-VN")}</td>

                        {/* Money Profit */}
                        <td className={`text-right px-2 font-bold ${textClass}`}>
                          {h.profit >= 0 ? "+" : ""}{Math.round(h.profit).toLocaleString("vi-VN")}
                        </td>

                        {/* ROI % */}
                        <td className="text-center px-1">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-extrabold font-mono w-20 text-center ${badgeClass}`}>
                            {formatPercent(h.roi)}
                          </span>
                        </td>

                        <td className="text-center text-text-muted text-[10px] pr-2 font-sans">{h.purchaseDate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* HEATMAP TREEMAP BENTO VIEW */
          <div>
            <div className="mb-4 text-xs text-text-muted flex items-center space-x-1">
              <HelpCircle className="w-3.5 h-3.5 text-tech-green shrink-0" />
              <span>Treemap mô tả tỷ trọng mã cổ phiếu trong và lãi/lỗ (kích cỡ mảng phản ánh Tổng vốn đầu tư, độ rực rỡ màu phản ánh % sinh lời).</span>
            </div>

            {/* Heatmap Grid Wrapper */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
              {calculatedHoldings.map((h) => {
                const isProfit = h.roi > 0;
                const isLoss = h.roi < 0;

                // Color gradients according to ROI scale
                let bgGradient = "bg-neutral-900 border-[#222E42]";
                let colorText = "text-tech-yellow";

                if (isProfit) {
                  if (h.roi > 20) {
                    bgGradient = "bg-tech-green/20 border-tech-green";
                    colorText = "text-tech-green font-extrabold";
                  } else {
                    bgGradient = "bg-tech-green/10 border-tech-green/40";
                    colorText = "text-tech-green";
                  }
                } else if (isLoss) {
                  if (h.roi < -15) {
                    bgGradient = "bg-tech-red/20 border-tech-red";
                    colorText = "text-tech-red font-extrabold";
                  } else {
                    bgGradient = "bg-tech-red/10 border-tech-red/40";
                    colorText = "text-tech-red";
                  }
                }

                return (
                  <div
                    key={h.symbol}
                    onClick={() => onSelectTicker(h.symbol)}
                    className={`p-3.5 rounded border flex flex-col justify-between h-28 cursor-pointer select-none transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xl group ${bgGradient}`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[13px] font-bold text-white group-hover:underline font-mono">{h.symbol}</span>
                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-card-main border border-border-main text-text-muted font-sans tracking-wide">
                          {h.sector}
                        </span>
                      </div>
                      <p className="text-[9px] text-text-muted uppercase font-semibold mt-1 font-sans">Vốn đầu tư</p>
                      <p className="text-[11px] text-gray-300 font-bold font-mono leading-none">{formatVND(h.totalCost).replace("₫", "")}đ</p>
                    </div>

                    <div className="flex justify-between items-end border-t border-border-main/5 pt-1 mt-1 font-mono">
                      <span className="text-[9px] text-text-muted font-semibold uppercase">Lợi suất</span>
                      <span className={`text-[11.5px] font-extrabold ${colorText}`}>
                        {formatPercent(h.roi)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic Sector allocation details at bento bottom */}
        <div className="mt-6 pt-5 border-t border-border-main grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Industry sector table info */}
          <div className="bg-[#000000]/40 p-4 rounded border border-border-main">
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-widest flex items-center mb-3">
              <Coins className="w-3.5 h-3.5 text-tech-green mr-1.5" />
              Tổng trị ngành bất động sản & đa phân bổ
            </h3>
            <div className="space-y-2">
              {Object.entries(sectorDataMap).map(([sector, data]) => {
                const sectorWeight = (data.value / totalValueValue) * 100;
                const sectorP_L = data.value - data.cost;
                const sectorROI = (sectorP_L / data.cost) * 100;

                return (
                  <div key={sector}>
                    <div className="flex justify-between text-[11px] text-text-muted">
                      <span>{sector}</span>
                      <span className="font-mono text-gray-200">
                        {formatVND(data.value)} ({sectorWeight.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#1e2329] h-1 rounded mt-1 overflow-hidden">
                      <div
                        className="bg-tech-green h-1 rounded transition-all"
                        style={{ width: `${sectorWeight}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Holdings summary disclaimer cards */}
          <div className="bg-[#000000]/40 p-4 rounded border border-border-main flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-widest flex items-center mb-2.5">
                Chỉ số An toàn danh mục Q2
              </h3>
              <p className="text-[11px] leading-relaxed text-text-muted">
                Tài sản phân bổ hài hòa trên 7 xương sống công nghiệp chính, tránh tình trạng "Đầu cơ bong bóng". 75% mã nắm giữ được tài trợ bởi room margin tối ưu.
              </p>
            </div>
            <div className="flex items-center space-x-3.5 border-t border-border-main pt-3 mt-3 text-[11px] font-mono select-none">
              <div className="flex items-center text-tech-green">
                <span className="w-2.5 h-2.5 bg-tech-green rounded-full mr-1 inline-block animate-pulse"></span>
                <span>12 mã lãi lớn</span>
              </div>
              <div className="flex items-center text-tech-yellow">
                <span className="w-2.5 h-2.5 bg-tech-yellow rounded-full mr-1 inline-block"></span>
                <span>8 mã hòa vốn</span>
              </div>
              <div className="flex items-center text-tech-red">
                <span className="w-2.5 h-2.5 bg-tech-red rounded-full mr-1 inline-block"></span>
                <span>10 mã tạm lỗ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trái phiếu nắm giữ — đa dạng hóa ngoài cổ phiếu/chứng chỉ quỹ */}
        {calculatedBonds.length > 0 && (
          <div className="mt-6 pt-5 border-t border-border-main">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-widest flex items-center">
                <Coins className="w-3.5 h-3.5 text-tech-purple mr-1.5" />
                Trái phiếu nắm giữ ({calculatedBonds.length})
              </h3>
              <span className="text-[11px] font-mono text-text-muted">
                Giá trị: <span className="text-tech-purple font-bold">{formatVND(bondTotalValue)}</span>
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#000000]/40 border-b border-border-main text-text-muted font-bold uppercase tracking-wider h-9">
                    <th className="px-2">Mã TP</th>
                    <th className="px-2">Tổ chức phát hành</th>
                    <th className="px-2">Loại</th>
                    <th className="px-2 text-right">Lãi suất</th>
                    <th className="px-2">Đáo hạn</th>
                    <th className="px-2 text-right">KL</th>
                    <th className="px-2 text-right">Giá trị</th>
                    <th className="px-2 text-right">Lãi/Lỗ tạm tính</th>
                  </tr>
                </thead>
                <tbody>
                  {calculatedBonds.map((b) => (
                    <tr key={b.symbol} className="border-b border-border-main/50 h-10 hover:bg-[#1e2329]/50">
                      <td className="px-2 font-bold text-tech-purple">{b.symbol}</td>
                      <td className="px-2 text-gray-300 max-w-[220px] truncate">{b.name}</td>
                      <td className="px-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${b.bondType === "Chính phủ" ? "bg-tech-blue/15 text-tech-blue" : "bg-tech-yellow/15 text-tech-yellow"}`}>
                          {b.bondType}
                        </span>
                      </td>
                      <td className="px-2 text-right font-mono text-tech-green">{b.couponRate.toFixed(1)}%/năm</td>
                      <td className="px-2 font-mono text-text-muted">{b.maturityDate}</td>
                      <td className="px-2 text-right font-mono">{new Intl.NumberFormat("vi-VN").format(b.volume)}</td>
                      <td className="px-2 text-right font-mono">{formatVND(b.totalValue)}</td>
                      <td className={`px-2 text-right font-mono ${b.profit >= 0 ? "text-tech-green" : "text-tech-red"}`}>
                        {b.profit >= 0 ? "+" : ""}{formatVND(b.profit)} ({formatPercent(b.roi)})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-text-muted mt-2 italic">
              Trái phiếu được nắm giữ tới ngày đáo hạn, không giao dịch trên bảng giá — giá trị tham khảo theo định giá hợp lý gần nhất.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
