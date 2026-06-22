import React, { useState } from "react";
import { User, Wallet, ShieldCheck, ChevronDown, Bell, TrendingUp, TrendingDown, Clock, Camera } from "lucide-react";
import { InvestorProfile, MarketIndex } from "../data";

interface HeaderProps {
  investor: InvestorProfile;
  onUpdateInvestor?: (updated: InvestorProfile) => void;
  nav: number;
  cash: number;
  gain: number;
  roi: number;
  indices: MarketIndex[];
  onTabChange: (tabId: string) => void;
  unreadCount: number;
  onSyncEOD?: () => void;
  isSyncing?: boolean;
}

export default function Header({
  investor,
  onUpdateInvestor,
  nav,
  cash,
  gain,
  roi,
  indices,
  onTabChange,
  unreadCount,
  onSyncEOD,
  isSyncing = false,
}: HeaderProps) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  return (
    <header className="sticky top-0 z-40 bg-bg-main border-b border-border-main text-[#eaeaeb] shadow-lg">
      {/* Mini Index Ticker-Tape */}
      <div className="bg-[#000000]/40 border-b border-border-main py-1.5 px-4 overflow-x-auto select-none">
        <div className="flex space-x-8 items-center text-xs whitespace-nowrap min-w-max">
          <div className="flex items-center space-x-2 text-[10px] uppercase tracking-wider text-text-muted font-extrabold border-r border-border-main pr-6">
            <Clock className="w-3 h-3 text-tech-green animate-pulse" />
            <span>Thị trường HSX Live</span>
          </div>

          {onSyncEOD && (
            <button
              onClick={onSyncEOD}
              disabled={isSyncing}
              className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1.5 border transition-all md:active:scale-95 cursor-pointer shadow-md ${
                isSyncing
                  ? "bg-tech-yellow/15 text-tech-yellow border-tech-yellow/30 animate-pulse cursor-wait"
                  : "bg-tech-yellow hover:bg-[#ffd043] text-black border-transparent hover:scale-[1.02]"
              }`}
              title="Đồng bộ toàn bộ chỉ số, giá đóng cửa và nhảy sang ngày mới (EOD)"
            >
              <svg className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 19l-1.378-1.378" />
              </svg>
              <span>{isSyncing ? "ĐANG ĐỒNG BỘ..." : "CẬP NHẬT THEO NGÀY (EOD)"}</span>
            </button>
          )}

          {indices.map((idx) => {
            const isUp = idx.change >= 0;
            return (
              <div key={idx.name} className="flex items-center space-x-3 text-xs bg-card-main px-3 py-1 rounded border border-border-main">
                <span className="font-semibold text-gray-300 font-mono text-[11px]">{idx.name}</span>
                <span className={`font-bold font-mono ${isUp ? "text-tech-green" : "text-tech-red"}`}>
                  {idx.value.toFixed(2)}
                </span>
                <span className={`font-mono flex items-center text-[10px] ${isUp ? "text-tech-green bg-tech-green/10 px-1.5 rounded" : "text-tech-red bg-tech-red/10 px-1.5 rounded"}`}>
                  {isUp ? "+" : ""}{idx.change.toFixed(2)} ({isUp ? "+" : ""}{idx.pctChange.toFixed(2)}%)
                </span>
                
                {/* ADV/DEC details */}
                <span className="text-[10px] text-gray-400 font-semibold font-mono flex space-x-1.5">
                  <span className="text-tech-green">{idx.advances}▲</span>
                  <span className="text-tech-yellow">{idx.unChanges}■</span>
                  <span className="text-tech-red">{idx.declines}▼</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-[1920px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Class */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange("dashboard")}>
          <div className="relative">
            <div className="w-8 h-8 rounded bg-tech-green flex items-center justify-center shadow-md animate-pulse">
              <TrendingUp className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
          </div>
          <div>
            <div className="text-md font-bold tracking-tight text-white flex items-center space-x-1">
              <span>BOARD</span>
              <span className="text-tech-green px-1.5 py-0.5 rounded text-[9px] bg-tech-green/10 border border-tech-green/30 font-extrabold uppercase ml-1 animate-pulse">PRO</span>
            </div>
            <div className="text-[9px] text-text-muted font-semibold tracking-wider uppercase">SSI / TC Invest Style</div>
          </div>
        </div>

        {/* Assets Summary Metrics for Pro display */}
        <div className="hidden lg:flex items-center space-x-8 text-xs">
          <div className="border-r border-border-main pr-6">
            <div className="text-[10px] text-text-muted uppercase font-semibold">Tổng tài sản (NAV)</div>
            <div className="text-sm font-extrabold font-mono text-tech-yellow flex items-center space-x-1 mt-0.5">
              <span>{formatVND(nav)}</span>
            </div>
          </div>

          <div className="border-r border-border-main pr-6">
            <div className="text-[10px] text-text-muted uppercase font-semibold">Tiền mặt Khả dụng</div>
            <div className="text-sm font-extrabold font-mono text-gray-200 mt-0.5">
              {formatVND(cash)}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-text-muted uppercase font-semibold">Lãi/Lỗ Tạm Tính</div>
            <div className={`text-sm font-extrabold font-mono flex items-center space-x-1.5 mt-0.5 ${gain >= 0 ? "text-tech-green" : "text-tech-red"}`}>
              <span>{gain >= 0 ? "+" : ""}{formatVND(gain)}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${gain >= 0 ? "bg-tech-green/10 text-tech-green border border-tech-green/20" : "bg-tech-red/10 text-tech-red border border-tech-red/20"}`}>
                {gain >= 0 ? "+" : ""}{roi.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* User Account controls and notifications */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button 
            id="notification-bell"
            onClick={() => onTabChange("notifications")}
            className="relative p-2 rounded hover:bg-[#1e2329] transition-colors border border-transparent hover:border-border-main group text-text-muted hover:text-white cursor-pointer"
          >
            <Bell className="w-5 h-5 transition-transform group-hover:scale-105" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-tech-red rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-bounce shadow">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User info Card dropdown */}
          <div className="relative">
            <button
              id="user-profile-button"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-3 bg-[#1e2329] hover:bg-[#2b3139] px-3.5 py-1.5 rounded border border-border-main hover:border-tech-green transition-all text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#2b3139] border border-border-main flex items-center justify-center shrink-0 overflow-hidden relative">
                {investor.avatar ? (
                  <img src={investor.avatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-4 h-4 text-tech-green" />
                )}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-gray-200 leading-tight truncate max-w-[120px]">
                  {investor.name}
                </div>
                <div className="text-[9px] text-tech-green font-extrabold flex items-center space-x-1 uppercase tracking-wider leading-none">
                  <ShieldCheck className="w-2.5 h-2.5 shrink-0" />
                  <span>PRO INVESTOR</span>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${showProfileDropdown ? "rotate-180" : ""}`} />
            </button>

            {/* Profile Detail Dropdown box */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-card-main border border-border-main rounded shadow-2xl py-3.5 text-xs select-none animate-in fade-in duration-100 z-50">
                <div className="px-4 pb-4 border-b border-border-main flex flex-col items-center text-center relative">
                  {/* Dynamic Interactive Avatar Ring */}
                  <label htmlFor="avatar-upload" className="relative group cursor-pointer w-16 h-16 rounded-full bg-[#1e2329] border-2 border-tech-green/40 hover:border-tech-green flex items-center justify-center overflow-hidden transition-all shadow-md mb-2">
                    {investor.avatar ? (
                      <img src={investor.avatar} alt="Large Avatar" className="w-full h-full object-cover group-hover:opacity-60 transition-opacity" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="w-8 h-8 text-tech-green group-hover:scale-105 transition-transform" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                  </label>
                  
                  {/* Hidden input file connector */}
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && onUpdateInvestor) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          onUpdateInvestor({
                            ...investor,
                            avatar: reader.result as string,
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />

                  {/* Edit Name Input directly */}
                  <div className="w-full mt-1.5 px-2">
                    <input
                      type="text"
                      value={investor.name}
                      onChange={(e) => {
                        if (onUpdateInvestor) {
                          onUpdateInvestor({
                            ...investor,
                            name: e.target.value,
                          });
                        }
                      }}
                      className="w-full bg-[#0b0e11] border border-border-main hover:border-tech-green/35 focus:border-tech-green px-2.5 py-1 rounded text-center text-xs font-bold text-white uppercase tracking-wide focus:outline-none"
                      placeholder="Thay đổi họ tên..."
                      title="Nhấp đúp chuột hoặc chỉnh sửa trực tiếp họ tên của bạn"
                    />
                    <div className="text-[9px] text-text-muted mt-1 italic font-medium">Nhấp trực tiếp để sửa tên hoặc ảnh</div>
                  </div>

                  <span className="inline-block mt-2 px-2 py-0.5 bg-tech-yellow text-[#0b0e11] font-extrabold uppercase rounded text-[8px] tracking-wider leading-none">
                    {investor.rank}
                  </span>
                </div>

                <div className="px-4 py-3 space-y-2 text-text-muted border-b border-border-main font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span>Mã KH:</span>
                    <span className="font-bold text-gray-200">{investor.clientId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tiểu khoản:</span>
                    <span className="font-bold text-gray-200">{investor.subAccount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ngày mở TK:</span>
                    <span className="text-gray-300">{investor.registrationDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trạng thái:</span>
                    <span className="font-bold text-tech-green flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-tech-green inline-block mr-1"></span>
                      {investor.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí giao dịch:</span>
                    <span className="font-bold text-tech-green">{investor.feeRate}%</span>
                  </div>
                </div>

                <div className="px-3 pt-3">
                  <div className="bg-[#1e2329] p-2.5 rounded border border-border-main text-center">
                    <p className="text-[10px] text-text-muted uppercase font-semibold">Tài sản Thực tế</p>
                    <p className="text-sm font-extrabold font-mono text-tech-yellow mt-0.5">{formatVND(nav)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
