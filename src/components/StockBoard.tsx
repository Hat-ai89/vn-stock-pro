import React, { useState, useEffect, useRef } from "react";
import { Search, Plus, Trash2, ArrowUp, ArrowDown, Activity, ListOrdered, CheckCircle } from "lucide-react";
import { Stock } from "../data";

interface StockBoardProps {
  stocks: Record<string, Stock>;
  watchlists: Record<string, string[]>;
  onSelectTicker: (symbol: string) => void;
  onAddToWatchlist: (category: string, symbol: string) => void;
  onRemoveFromWatchlist: (category: string, symbol: string) => void;
  onMoveInWatchlist: (category: string, symbol: string, direction: "UP" | "DOWN") => void;
  selectedTicker: string | null;
  isSyncing?: boolean;
  syncStatus?: string;
  onSyncEOD?: () => void;
}

export default function StockBoard({
  stocks,
  watchlists,
  onSelectTicker,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  onMoveInWatchlist,
  selectedTicker,
  isSyncing = false,
  syncStatus = "",
  onSyncEOD,
}: StockBoardProps) {
  const [activeCategory, setActiveCategory] = useState<string>("Bluechip");
  const [selectedSector, setSelectedSector] = useState<string>("TẤT CẢ");
  const [searchQuery, setSearchQuery] = useState("");
  const [newTickerInput, setNewTickerInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const categories = ["TẤT CẢ", ...Object.keys(watchlists)];

  // Flash effect: theo dõi giá trước đó để tạo hiệu ứng nhấp nháy khi giá thay đổi
  const prevPricesRef = useRef<Record<string, number>>({});
  const [flashMap, setFlashMap] = useState<Record<string, "up" | "down">>({});

  useEffect(() => {
    const prev = prevPricesRef.current;
    const nextFlash: Record<string, "up" | "down"> = {};
    let hasChange = false;

    Object.keys(stocks).forEach((sym) => {
      const prevPrice = prev[sym];
      const curPrice = stocks[sym].price;
      if (prevPrice !== undefined && prevPrice !== curPrice) {
        nextFlash[sym] = curPrice > prevPrice ? "up" : "down";
        hasChange = true;
      }
    });

    prevPricesRef.current = Object.fromEntries(
      Object.entries(stocks).map(([sym, s]) => [sym, s.price])
    );

    if (hasChange) {
      setFlashMap(nextFlash);
      const timer = setTimeout(() => setFlashMap({}), 600);
      return () => clearTimeout(timer);
    }
  }, [stocks]);

  // Get all unique sectors from stocks database dynamically
  const availableSectors = ["TẤT CẢ", ...Array.from(new Set(Object.values(stocks).map(s => s.sector).filter(Boolean)))];

  // Filter stocks based on search query in the full directory or current category
  const activeSymbols = activeCategory === "TẤT CẢ"
    ? Object.keys(stocks)
    : (watchlists[activeCategory] || []);

  const handleAddTicker = (e: React.FormEvent) => {
    e.preventDefault();
    const symbol = newTickerInput.toUpperCase().trim();
    if (!symbol) return;

    if (!stocks[symbol]) {
      setErrorMsg(`Mã '${symbol}' không tồn tại trên thị trường!`);
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }

    if (activeCategory === "TẤT CẢ") {
      setErrorMsg("Không thể thêm trực tiếp vào danh mục TẤT CẢ. Hãy chọn Watchlist chi tiết rồi thêm!");
      setTimeout(() => setErrorMsg(""), 5000);
      return;
    }

    if (activeSymbols.includes(symbol)) {
      setErrorMsg(`Mã '${symbol}' đã có trong danh mục Watchlist!`);
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }

    onAddToWatchlist(activeCategory, symbol);
    setNewTickerInput("");
    setSuccessMsg(`Đã thêm ${symbol} vào Watchlist!`);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const getPriceColor = (price: number, refPrice: number, ceilPrice: number, floorPrice: number) => {
    if (price === ceilPrice) return "text-tech-purple"; // Violet / Ceil
    if (price === floorPrice) return "text-tech-blue"; // Cyan / Floor
    if (price > refPrice) return "text-tech-green"; // Green / Up
    if (price < refPrice) return "text-tech-red"; // Red / Down
    return "text-tech-yellow"; // Yellow / Ref
  };

  const getPriceBgColor = (price: number, refPrice: number, ceilPrice: number, floorPrice: number) => {
    if (price === ceilPrice) return "bg-tech-purple/10";
    if (price === floorPrice) return "bg-tech-blue/10";
    if (price > refPrice) return "bg-tech-green/10";
    if (price < refPrice) return "bg-tech-red/10";
    return "bg-tech-yellow/10";
  };

  // Base list of filtered symbols by category & word search match
  const filteredSymbolsBase = activeCategory === "TẤT CẢ"
    ? (searchQuery.trim() === ""
        ? Object.keys(stocks)
        : Object.keys(stocks).filter(sym => 
            sym.toLowerCase().includes(searchQuery.toLowerCase()) ||
            stocks[sym]?.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : activeSymbols.filter(sym => 
        sym.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stocks[sym]?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Apply Sector Filter
  const sectorFiltered = filteredSymbolsBase.filter(sym => {
    if (selectedSector === "TẤT CẢ") return true;
    return stocks[sym]?.sector === selectedSector;
  });

  // Display Slicing for Performance when displaying all items with no active filtering
  const displaySymbols = (activeCategory === "TẤT CẢ" && selectedSector === "TẤT CẢ" && searchQuery.trim() === "")
    ? sectorFiltered.slice(0, 80)
    : sectorFiltered;

  return (
    <div className="bg-card-main border border-border-main rounded shadow-lg flex flex-col overflow-hidden h-full">
      {/* Tab Selectors & Mini search */}
      <div className="p-4 border-b border-border-main flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-[#000000]/40">
        {/* Category Pill Buttons */}
        <div className="flex space-x-1 overflow-x-auto pb-1 xl:pb-0 scrollbar-none shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setSearchQuery("");
                setErrorMsg("");
              }}
              className={`px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                activeCategory === cat
                  ? "bg-[#1e2329] text-tech-green border-border-main"
                  : "bg-transparent text-text-muted hover:text-white border-transparent hover:bg-[#1e2329]/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Watchlist Customizer Tools */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Live Link Connection Indicator & Elite EOD Sync Button */}
          <div className="flex items-center space-x-2">
            {/* Live Link Indicator */}
            <div className="px-2 py-1 rounded text-[9px] font-semibold font-mono text-tech-green uppercase tracking-wider flex items-center space-x-1.5 bg-tech-green/5 border border-tech-green/15 select-none mr-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tech-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-tech-green"></span>
              </span>
              <span>LIVE</span>
            </div>

            {/* Recreated & Beautiful Sync EOD Board Button */}
            {onSyncEOD && (
              <button
                type="button"
                onClick={onSyncEOD}
                disabled={isSyncing}
                className={`px-2.5 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all outline-none md:active:scale-95 cursor-pointer border ${
                  isSyncing
                    ? "bg-tech-yellow/15 text-tech-yellow border-tech-yellow/30 cursor-wait animate-pulse"
                    : "bg-tech-yellow/5 text-tech-yellow hover:text-[#ffd043] border-tech-yellow/20 hover:border-tech-yellow/50 hover:bg-tech-yellow/15 shadow-sm"
                }`}
                title={isSyncing ? "Đang xử lý gói tin chốt phiên..." : "Đồng bộ & cập nhật toàn bộ giá đóng cửa ngày trực tiếp (17h)"}
              >
                <Activity className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
                <span>{isSyncing ? "ĐỒNG BỘ..." : "CẬP NHẬT CUỐI NGÀY"}</span>
              </button>
            )}
          </div>

          {/* Sector Selector Dropdown Filter */}
          <div className="relative">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="pl-3 pr-8 py-1.5 bg-[#0b0e11] border border-border-main text-xs rounded text-white focus:outline-none focus:border-tech-green cursor-pointer appearance-none outline-none font-semibold"
            >
              <option value="TẤT CẢ">Tất cả Nhóm Ngành</option>
              {availableSectors.filter(sec => sec !== "TẤT CẢ").map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-text-muted">
              {/* Caret icon */}
              <svg className="fill-current h-3 w-3 text-text-muted" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>

          {/* Active search filter */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-text-muted" />
            <input
              type="text"
              placeholder="Bộ lọc mã..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 w-32 sm:w-36 bg-[#0b0e11] border border-border-main text-xs rounded text-white placeholder-gray-500 focus:outline-none focus:border-tech-green font-semibold"
            />
          </div>

          {/* Add fast stock */}
          <form onSubmit={handleAddTicker} className="flex items-center space-x-1.5">
            <input
              type="text"
              placeholder="Thêm mã nhanh..."
              value={newTickerInput}
              onChange={(e) => {
                setNewTickerInput(e.target.value);
                setErrorMsg("");
              }}
              className="px-3 py-1.5 w-28 bg-[#0b0e11] border border-border-main text-xs rounded text-white placeholder-gray-500 uppercase focus:outline-none focus:border-tech-green font-semibold"
            />
            <button
              type="submit"
              className="bg-tech-green hover:bg-[#0cb372] text-black p-1.5 rounded border border-transparent transition-colors flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>
      </div>

      {/* Warning/Success Toast feedback lines inside board header */}
      {(errorMsg || successMsg || syncStatus) && (
        <div className="px-4 py-1.5 flex items-center justify-between text-[11px] font-semibold bg-[#1e2329] border-b border-border-main">
          {errorMsg ? (
            <span className="text-tech-red">⚠️ {errorMsg}</span>
          ) : syncStatus ? (
            <span className="text-tech-yellow flex items-center">
              <Activity className="w-3 h-3 mr-1.5 animate-spin" /> {syncStatus}
            </span>
          ) : (
            <span className="text-tech-green flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" /> {successMsg}
            </span>
          )}
        </div>
      )}

      {/* Main Board Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse min-w-[420px] md:min-w-[1200px] select-none">
          {/* Header */}
          <thead>
            <tr className="bg-[#000000]/40 border-b border-border-main text-text-muted font-bold text-[10px] uppercase tracking-wider h-11 text-center font-mono">
              <th className="px-3 text-left w-20 min-w-[100px] text-white table-cell">Mã</th>
              <th className="text-tech-yellow w-12 border-r border-border-main hidden md:table-cell">TC</th>
              <th className="text-tech-purple w-12 hidden lg:table-cell">Trần</th>
              <th className="text-tech-blue w-12 border-r border-border-main hidden lg:table-cell">Sàn</th>

              {/* Bid Columns */}
              <th className="bg-[#121721]/10 text-text-muted border-r border-dashed border-border-main hidden xl:table-cell">Giá 3</th>
              <th className="bg-[#121721]/10 text-text-muted border-r border-dashed border-border-main hidden xl:table-cell">KL 3</th>
              <th className="bg-[#121721]/10 text-text-muted border-r border-dashed border-border-main hidden xl:table-cell">Giá 2</th>
              <th className="bg-[#121721]/10 text-text-muted border-r border-dashed border-border-main hidden xl:table-cell">KL 2</th>
              <th className="bg-[#121721]/10 text-text-muted border-r border-border-main hidden md:table-cell">Giá 1</th>
              <th className="bg-[#121721]/10 text-text-muted border-r border-border-main hidden md:table-cell">KL 1</th>

              {/* Execution Match Columns */}
              <th className="bg-[#0c1b24]/40 text-tech-green table-cell">Khớp Giá</th>
              <th className="bg-[#0c1b24]/40 text-tech-green hidden sm:table-cell">+/-</th>
              <th className="bg-[#0c1b24]/40 text-tech-green border-r border-border-main table-cell">%</th>

              {/* Ask Columns */}
              <th className="bg-[#1a131a]/10 text-text-muted border-r border-dashed border-border-main hidden md:table-cell">Giá 1</th>
              <th className="bg-[#1a131a]/10 text-text-muted border-r border-dashed border-border-main hidden md:table-cell">KL 1</th>
              <th className="bg-[#1a131a]/10 text-text-muted border-r border-dashed border-border-main hidden xl:table-cell">Giá 2</th>
              <th className="bg-[#1a131a]/10 text-text-muted border-r border-dashed border-border-main hidden xl:table-cell">KL 2</th>
              <th className="bg-[#1a131a]/10 text-text-muted border-r border-border-main hidden xl:table-cell">Giá 3</th>
              <th className="bg-[#1a131a]/10 text-text-muted border-r border-border-main hidden xl:table-cell">KL 3</th>

              <th className="text-text-muted w-24 border-r border-border-main hidden sm:table-cell">T.Khối Lượng</th>
              <th className="text-orange-400 w-16 border-r border-border-main hidden lg:table-cell">Room NN</th>
              <th className="text-text-muted w-28 text-left px-3 table-cell">Sắp xếp</th>
            </tr>
          </thead>

          {/* Body Rows */}
          <tbody>
            {displaySymbols.length === 0 ? (
              <tr>
                <td colSpan={23} className="text-center py-10 text-text-muted bg-[#000000]/10">
                  Watchlist hiện thời trống. Tìm kiếm mã để bổ sung vào danh mục!
                </td>
              </tr>
            ) : (
              displaySymbols.map((symbol) => {
                const stock = stocks[symbol];
                if (!stock) return null;

                const isSelected = selectedTicker === symbol;
                const formattedVol = new Intl.NumberFormat("vi-VN").format(stock.totalVolume);

                const priceCol = getPriceColor(stock.price, stock.refPrice, stock.ceilPrice, stock.floorPrice);
                const priceBg = getPriceBgColor(stock.price, stock.refPrice, stock.ceilPrice, stock.floorPrice);

                return (
                  <tr
                    key={symbol}
                    id={`stock-row-${symbol}`}
                    onClick={() => onSelectTicker(symbol)}
                    className={`border-b border-border-main/50 hover:bg-[#1e2329]/50 h-10 align-middle text-center font-semibold cursor-pointer transition-colors duration-100 ${
                      isSelected ? "bg-[#1e2329] border-l-[3px] border-l-tech-green" : ""
                    }`}
                  >
                    {/* Ticker Symbol */}
                    <td className="px-3 text-left font-bold border-r border-border-main text-tech-green select-all hover:underline table-cell">
                      <div className="flex flex-col">
                        <span>{symbol}</span>
                        <span className="text-[9px] text-text-muted font-medium font-sans truncate max-w-[110px]">
                          {stock.name}
                        </span>
                      </div>
                    </td>

                    {/* Technical prices */}
                    <td className="text-tech-yellow font-mono border-r border-border-main hidden md:table-cell">{(stock.refPrice).toFixed(2)}</td>
                    <td className="text-tech-purple font-mono hidden lg:table-cell">{(stock.ceilPrice).toFixed(2)}</td>
                    <td className="text-tech-blue font-mono border-r border-border-main hidden lg:table-cell">{(stock.floorPrice).toFixed(2)}</td>

                    {/* Bids */}
                    <td className={`font-mono text-xs hidden xl:table-cell ${getPriceColor(stock.bidPrice3, stock.refPrice, stock.ceilPrice, stock.floorPrice)}`}>
                      {stock.bidPrice3.toFixed(2)}
                    </td>
                    <td className="text-text-muted font-mono text-[11px] hidden xl:table-cell">{stock.bidVol3 / 10}</td>

                    <td className={`font-mono text-xs hidden xl:table-cell ${getPriceColor(stock.bidPrice2, stock.refPrice, stock.ceilPrice, stock.floorPrice)}`}>
                      {stock.bidPrice2.toFixed(2)}
                    </td>
                    <td className="text-text-muted font-mono text-[11px] hidden xl:table-cell">{stock.bidVol2 / 10}</td>

                    <td className={`font-mono text-xs border-l border-dashed border-border-main hidden md:table-cell ${getPriceColor(stock.bidPrice1, stock.refPrice, stock.ceilPrice, stock.floorPrice)}`}>
                      {stock.bidPrice1.toFixed(2)}
                    </td>
                    <td className="text-text-muted font-mono text-[11px] border-r border-border-main hidden md:table-cell">{stock.bidVol1 / 10}</td>

                    {/* Matched Execution Column */}
                    <td className={`font-mono font-bold text-sm table-cell ${priceCol} ${priceBg} px-1.5 transition-colors duration-300 ${
                      flashMap[symbol] === "up" ? "bg-tech-green/40" : flashMap[symbol] === "down" ? "bg-tech-red/40" : ""
                    }`}>
                      {stock.price.toFixed(2)}
                    </td>
                    <td className={`font-mono text-[11px] animate-pulse hidden sm:table-cell ${priceCol} ${priceBg}`}>
                      {stock.change > 0 ? "+" : ""}{stock.change.toFixed(2)}
                    </td>
                    <td className={`font-mono text-[11px] border-r border-border-main table-cell ${priceCol} ${priceBg}`}>
                      {stock.pctChange > 0 ? "+" : ""}{stock.pctChange.toFixed(2)}%
                    </td>

                    {/* Asks */}
                    <td className={`font-mono text-xs hidden md:table-cell ${getPriceColor(stock.askPrice1, stock.refPrice, stock.ceilPrice, stock.floorPrice)}`}>
                      {stock.askPrice1.toFixed(2)}
                    </td>
                    <td className="text-text-muted font-mono text-[11px] hidden md:table-cell">{stock.askVol1 / 10}</td>

                    <td className={`font-mono text-xs hidden xl:table-cell ${getPriceColor(stock.askPrice2, stock.refPrice, stock.ceilPrice, stock.floorPrice)}`}>
                      {stock.askPrice2.toFixed(2)}
                    </td>
                    <td className="text-text-muted font-mono text-[11px] hidden xl:table-cell">{stock.askVol2 / 10}</td>

                    <td className={`font-mono text-xs hidden xl:table-cell ${getPriceColor(stock.askPrice3, stock.refPrice, stock.ceilPrice, stock.floorPrice)}`}>
                      {stock.askPrice3.toFixed(2)}
                    </td>
                    <td className="text-text-muted font-mono text-[11px] border-r border-border-main hidden xl:table-cell">{stock.askVol3 / 10}</td>

                    {/* Total Cumulative Volume */}
                    <td className="text-gray-300 font-mono text-[11px] border-r border-border-main text-right pr-2 hidden sm:table-cell">
                      {formattedVol}
                    </td>

                    {/* Foreign Room (Room NN) */}
                    <td className={`font-mono text-[11px] border-r border-border-main hidden lg:table-cell ${stock.foreignRoom < 2 ? "text-tech-red" : "text-orange-400"}`}>
                      {stock.foreignRoom.toFixed(1)}%
                    </td>

                    {/* Watchlist Actions / sorting arrangement */}
                    <td className="text-left px-3 border-b border-border-main table-cell" onClick={(e) => e.stopPropagation()}>
                      {activeCategory === "TẤT CẢ" ? (
                        <div className="flex justify-center sm:justify-start items-center">
                          <span className="text-[10px] text-text-muted italic bg-transparent">Danh mục chung</span>
                        </div>
                      ) : (
                        <div className="flex space-x-1.5 justify-center sm:justify-start items-center">
                          <button
                            onClick={() => onMoveInWatchlist(activeCategory, symbol, "UP")}
                            className="text-text-muted hover:text-tech-green p-1 hover:bg-[#1e2329] rounded transition-colors cursor-pointer"
                            title="Di chuyển lên"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onMoveInWatchlist(activeCategory, symbol, "DOWN")}
                            className="text-text-muted hover:text-tech-green p-1 hover:bg-[#1e2329] rounded transition-colors cursor-pointer"
                            title="Di chuyển xuống"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRemoveFromWatchlist(activeCategory, symbol)}
                            className="text-text-muted hover:text-tech-red p-1 hover:bg-tech-red/10 rounded transition-colors cursor-pointer"
                            title="Xóa mã khỏi watchlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Rules Footer tip */}
      <div className="p-3 bg-[#000000]/40 border-t border-border-main text-[10px] text-text-muted flex items-center justify-between">
        <span className="flex items-center">
          <Activity className="w-3 h-3 text-tech-green mr-1.5" />
          Chỉ số VN Index sàn HOSE (biên độ +/-7%), HNX (biên độ +/-10%), UPCOM (biên độ +/-15%). Khối lượng bảng hiển thị theo Lô 10 cổ phiếu.
        </span>
        <span className="font-mono text-tech-green text-[9px] font-bold">HOSE LIVE: ATC/MP / Khớp lệnh liên tục</span>
      </div>
    </div>
  );
}
