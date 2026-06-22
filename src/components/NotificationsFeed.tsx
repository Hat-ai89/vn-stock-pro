import React, { useState } from "react";
import { Bell, Search, Info, TrendingUp, Cpu, X, BookOpen } from "lucide-react";
import { NotificationItem } from "../data";

interface NotificationsFeedProps {
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onClear: () => void;
}

export default function NotificationsFeed({
  notifications,
  onMarkAllRead,
  onMarkRead,
  onClear,
}: NotificationsFeedProps) {
  const [activeTab, setActiveTab] = useState<"ALL" | "MARKET" | "SYSTEM" | "CORPORATE">("ALL");
  const [searchIn, setSearchIn] = useState("");

  const filteredNotifs = notifications.filter((n) => {
    const tabMatch = activeTab === "ALL" || n.category === activeTab;
    const queryMatch =
      n.title.toLowerCase().includes(searchIn.toLowerCase()) ||
      n.content.toLowerCase().includes(searchIn.toLowerCase());
    return tabMatch && queryMatch;
  });

  return (
    <div className="bg-card-main border border-border-main rounded shadow-lg flex flex-col overflow-hidden h-full select-none">
      {/* Header bar */}
      <div className="p-4 border-b border-border-main bg-[#000000]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <Bell className="w-5 h-5 text-tech-green" />
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Thông báo Sàn Giao dịch</h2>
            <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider leading-none">Bản tin nhanh, cảnh báo kỹ thuật số & sự kiện cổ tức doanh nghiệp</p>
          </div>
        </div>

        {/* Action triggers */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onMarkAllRead}
            className="px-3 py-1.5 bg-[#0b0e11] hover:bg-[#1e2329] border border-border-main text-[10px] text-tech-green font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
          >
            Đọc tất cả
          </button>
          <button
            onClick={onClear}
            className="px-3 py-1.5 bg-transparent border border-transparent text-[10px] text-text-muted hover:text-white font-bold uppercase tracking-wider rounded cursor-pointer"
          >
            Dọn dẹp trống
          </button>
        </div>
      </div>

      {/* Sorting bar & search */}
      <div className="p-3 bg-[#000000]/20 border-b border-border-main flex flex-col sm:flex-row justify-between items-center gap-3">
        {/* Pills category selection */}
        <div className="flex space-x-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {(["ALL", "MARKET", "SYSTEM", "CORPORATE"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded text-[10px] font-bold whitespace-nowrap border transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-[#1e2329] text-tech-green border-border-main"
                  : "bg-transparent text-text-muted border-transparent hover:text-white hover:bg-[#1e2329]"
              }`}
            >
              {tab === "ALL" ? "TẤT CẢ" : tab === "MARKET" ? "THỊ TRƯỜNG" : tab === "SYSTEM" ? "HỆ THỐNG" : "DOANH NGHIỆP"}
            </button>
          ))}
        </div>

        {/* Search query field */}
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-text-muted" />
          <input
            type="text"
            placeholder="Tìm kiếm thông cáo..."
            value={searchIn}
            onChange={(e) => setSearchIn(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#0b0e11] border border-border-main text-xs rounded text-white placeholder-gray-500 focus:outline-none focus:border-tech-green animate-none"
          />
        </div>
      </div>

      {/* Grid list notifications */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#000000]/10">
        {filteredNotifs.length === 0 ? (
          <div className="text-center py-16 text-text-muted font-semibold text-xs">
            Không ghi nhận bất kỳ cảnh báo thông cáo nào thỏa mãn điều kiện lọc.
          </div>
        ) : (
          filteredNotifs.map((item) => {
            const isMarket = item.category === "MARKET";
            const isSystem = item.category === "SYSTEM";

            let categoryTag = "Cổ đông";
            let iconTheme = <BookOpen className="w-4 h-4 text-tech-green" />;
            
            if (isMarket) {
              categoryTag = "Thị trường";
              iconTheme = <TrendingUp className="w-4 h-4 text-tech-green" />;
            } else if (isSystem) {
              categoryTag = "Hệ thống";
              iconTheme = <Cpu className="w-4 h-4 text-tech-yellow" />;
            }

            return (
              <div
                key={item.id}
                onClick={() => onMarkRead(item.id)}
                className={`p-4 rounded border flex items-start gap-3.5 transition-all cursor-pointer ${
                  item.unread
                    ? "bg-tech-green/5 border-border-main hover:border-tech-green/40 shadow-inner"
                    : "bg-[#000000]/20 border-border-main opacity-70 hover:opacity-100 hover:border-tech-green/20"
                }`}
              >
                {/* Visual Category badge */}
                <div className={`p-2 rounded shrink-0 border ${
                  item.unread ? "bg-[#1e2329] border-border-main" : "bg-[#0b0e11] border-border-main"
                }`}>
                  {iconTheme}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                      {categoryTag}
                    </span>
                    <span className="text-[10px] text-text-muted font-semibold font-mono">{item.time}</span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-100 flex items-center">
                    {item.unread && (
                      <span className="w-1.5 h-1.5 rounded-full bg-tech-green inline-block mr-2 shrink-0 animate-pulse"></span>
                    )}
                    <span>{item.title}</span>
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed font-medium">{item.content}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
