import React from "react";
import { 
  LayoutDashboard, 
  TableProperties, 
  ArrowUpRight, 
  History, 
  Bookmark, 
  Briefcase, 
  Bell, 
  TrendingUp,
  Cpu
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  unreadCount: number;
}

export default function Sidebar({ activeTab, onTabChange, unreadCount }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard Tài sản", icon: LayoutDashboard },
    { id: "board", label: "Bảng giá iBoard", icon: TableProperties },
    { id: "trading", label: "Đặt lệnh Mua/Bán", icon: ArrowUpRight },
    { id: "portfolio", label: "Danh mục đầu tư", icon: Briefcase },
    { id: "corporate", label: "Sự kiện Doanh nghiệp", icon: Cpu },
    { id: "history", label: "Lịch sử giao dịch", icon: History },
    { id: "notifications", label: "Thông báo thị trường", icon: Bell, badgeCount: unreadCount },
  ];

  return (
    <aside className="hidden md:flex w-full md:w-64 bg-bg-main border-r border-border-main flex-col pt-4 pb-6 shrink-0 text-text-muted select-none">
      <div className="px-4 mb-4">
        <span className="text-[10px] text-tech-green font-extrabold uppercase tracking-widest block ml-2">KHÔNG GIAN GIAO DỊCH</span>
      </div>

      <nav className="flex-1 space-y-1.5 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-semibold tracking-wide transition-all duration-150 group border border-transparent border-l-2 cursor-pointer ${
                isActive
                  ? "bg-[#1e2329]/60 border-l-tech-green text-white font-extrabold"
                  : "bg-transparent text-text-muted hover:text-white hover:bg-[#1e2329]/20"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                  isActive ? "text-tech-green" : "text-text-muted group-hover:text-tech-green"
                }`} />
                <span>{item.label}</span>
              </div>
              
              {item.badgeCount && item.badgeCount > 0 ? (
                <span className="bg-tech-red/20 text-tech-red text-[10px] font-bold px-2 py-0.5 rounded-full border border-tech-red/30 animate-pulse">
                  {item.badgeCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      <div className="px-5 pt-4 border-t border-border-main mt-4">
        <div className="bg-[#1e2329]/40 p-3 rounded border border-border-main text-[11px] leading-relaxed">
          <p className="font-bold text-gray-300 flex items-center space-x-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-tech-green" />
            <span>Mức phí 0.15%</span>
          </p>
          <p className="text-gray-500 mt-1">Đã áp dụng thuế thu nhập cá nhân & phí sở giao dịch HOSE/HNX.</p>
        </div>
      </div>
    </aside>
  );
}
