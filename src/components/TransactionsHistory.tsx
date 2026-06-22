import React, { useState } from "react";
import { History, Search, ArrowUpRight, ArrowDownLeft, Calendar, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Transaction } from "../data";

interface TransactionsHistoryProps {
  history: Transaction[];
}

export default function TransactionsHistory({ history }: TransactionsHistoryProps) {
  const [searchSymbol, setSearchSymbol] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "BUY" | "SELL">("ALL");
  const [filterYear, setFilterYear] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 50; // show 50 per page representing high speed virtualization

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num) + " đ";
  };

  // Filter pipeline
  const filteredHistory = history.filter((tx) => {
    const symbolMatches = tx.symbol.toLowerCase().includes(searchSymbol.toLowerCase().trim());
    const typeMatches = filterType === "ALL" || tx.type === filterType;
    const yearMatches = filterYear === "ALL" || tx.date.startsWith(filterYear);
    return symbolMatches && typeMatches && yearMatches;
  });

  // Pagination slice
  const totalItems = filteredHistory.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const displayItems = filteredHistory.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const yearsList = ["2026", "2025", "2024", "2023", "2022", "2021"];

  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= totalPages) {
      setCurrentPage(p);
    }
  };

  return (
    <div className="bg-card-main border border-border-main rounded shadow-lg flex flex-col overflow-hidden h-full select-none">
      {/* Header & Filter Controls bar */}
      <div className="p-4 border-b border-border-main bg-[#000000]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Banner */}
        <div className="flex items-center space-x-2.5">
          <History className="w-5 h-5 text-tech-green" />
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Nhật ký Sao kê Giao dịch</h2>
            <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider leading-none">Lịch sử khớp lệnh tài khoản từ năm 2021 - 2026</p>
          </div>
        </div>

        {/* Filter Toolbar inputs */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Symbol search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-text-muted" />
            <input
              type="text"
              placeholder="Tìm mã cổ phiếu..."
              value={searchSymbol}
              onChange={(e) => {
                setSearchSymbol(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-3 py-1.5 w-32 md:w-36 bg-[#0b0e11] border border-border-main text-xs rounded text-white placeholder-gray-500 uppercase focus:outline-none focus:border-tech-green animate-none"
            />
          </div>

          {/* Side Type selective */}
          <div className="bg-[#000000]/40 p-1 border border-border-main rounded flex space-x-0.5 text-[11px] font-bold">
            {(["ALL", "BUY", "SELL"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setFilterType(t);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  filterType === t
                    ? "bg-[#1e2329] text-tech-green font-extrabold border border-border-main"
                    : "text-text-muted hover:text-white"
                }`}
              >
                {t === "ALL" ? "TẤT CẢ" : t === "BUY" ? "MUA" : "BÁN"}
              </button>
            ))}
          </div>

          {/* Year selector dropdown */}
          <div className="relative font-semibold">
            <select
              value={filterYear}
              onChange={(e) => {
                setFilterYear(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 bg-[#0b0e11] border border-border-main text-xs rounded text-gray-300 font-semibold focus:outline-none focus:border-tech-green font-mono"
            >
              <option value="ALL">NĂM TẤT CẢ</option>
              {yearsList.map((y) => (
                <option key={y} value={y}>
                  NĂM {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse min-w-[900px] select-none">
          <thead>
            <tr className="bg-[#000000]/40 border-b border-border-main text-[10px] text-text-muted font-bold uppercase tracking-wider h-11 text-center font-mono">
              <th className="px-3 text-left w-24">ID lệnh</th>
              <th className="px-3 text-left w-36">Ngày khớp</th>
              <th className="px-2 text-left">Mã</th>
              <th className="px-2">Loại lệnh</th>
              <th className="px-2 text-right">Khối lượng (CP)</th>
              <th className="px-2 text-right">Giá khớp (đ)</th>
              <th className="px-2 text-right">Giá trị khớp (đ)</th>
              <th className="px-2 text-right">Phí (0.15% - đ)</th>
              <th className="px-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {displayItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-text-muted text-xs font-semibold">
                  Không tìm thấy giao dịch nào thỏa mãn lọc tìm kiếm của tài khoản!
                </td>
              </tr>
            ) : (
              displayItems.map((tx) => {
                const isBuy = tx.type === "BUY";
                return (
                  <tr
                    key={tx.id}
                    className="border-b border-border-main hover:bg-[#1e2329]/50 h-10 align-middle text-center font-mono font-semibold"
                  >
                    <td className="px-3 text-left text-text-muted text-[11px]">{tx.id}</td>
                    <td className="px-3 text-left text-gray-400 text-[11px] font-sans">{tx.date}</td>
                    <td className="px-2 text-left text-tech-green font-bold font-mono text-[13px]">{tx.symbol}</td>
                    <td className="px-2">
                      <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                        isBuy ? "text-tech-green bg-tech-green/10 border-tech-green/10" : "text-tech-red bg-tech-red/10 border-tech-red/10"
                      }`}>
                        {isBuy ? (
                          <>
                            <ArrowUpRight className="w-3 h-3" />
                            <span>MUA</span>
                          </>
                        ) : (
                          <>
                            <ArrowDownLeft className="w-3 h-3" />
                            <span>BÁN</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-2 text-right text-gray-200">{tx.volume.toLocaleString("vi-VN")}</td>
                    <td className="px-2 text-right font-bold text-gray-100">{tx.price.toLocaleString("vi-VN")}</td>
                    <td className="px-2 text-right text-tech-green font-extrabold">{formatVND(tx.value)}</td>
                    <td className="px-2 text-right text-text-muted">{formatVND(tx.fee)}</td>
                    <td className="px-3">
                      <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-tech-green/10 text-tech-green border border-tech-green/20 leading-none">
                        THÀNH CÔNG
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination control footer bar */}
      {totalPages > 1 && (
        <div className="p-3 bg-[#000000]/40 border-t border-border-main flex items-center justify-between text-xs text-text-muted select-none">
          <span>
            Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalItems)} trong tổng số{" "}
            <span className="text-tech-green font-bold font-mono">{totalItems}</span> giao dịch của tài khoản
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 px-2.5 bg-[#1e2329] border border-border-main text-text-muted hover:text-white rounded disabled:opacity-50 disabled:hover:text-text-muted font-bold flex items-center space-x-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 shrink-0" />
            </button>
            <span className="font-mono font-bold text-gray-300">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 px-2.5 bg-[#1e2329] border border-border-main text-text-muted hover:text-white rounded disabled:opacity-50 disabled:hover:text-text-muted font-bold flex items-center space-x-1 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
