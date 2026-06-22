import React, { useState } from "react";
import { Cpu, CheckCircle2, TrendingUp, AlertTriangle, PlayCircle, Coins, Percent, Ticket } from "lucide-react";
import { CorporateEvent, StockHolding } from "../data";

interface CorporateActionsProps {
  portfolio: StockHolding[];
  events: CorporateEvent[];
  onApplyEvent: (id: string) => void;
  cash: number;
}

export default function CorporateActions({ portfolio, events, onApplyEvent, cash }: CorporateActionsProps) {
  const [successEventId, setSuccessEventId] = useState<string | null>(null);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  const handleApply = (id: string) => {
    onApplyEvent(id);
    setSuccessEventId(id);
    setTimeout(() => {
      setSuccessEventId(null);
    }, 4000);
  };

  return (
    <div className="bg-card-main border border-border-main rounded shadow-lg p-5 flex flex-col h-full select-none">
      {/* Header */}
      <div className="flex items-center space-x-2.5 pb-4 border-b border-border-main mb-5">
        <Cpu className="w-5 h-5 text-tech-green" />
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Sự kiện Quyền & Doanh nghiệp</h2>
          <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider leading-none">Cổ tức tiền mặt, Quyên mua ưu đãi, Cổ phiếu thưởng & Chia tách</p>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {events.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            Tất cả sự kiện doanh nghiệp đã được thực thi và áp dụng thành công!
          </div>
        ) : (
          events.map((evt) => {
            const holding = portfolio.find((h) => h.symbol === evt.symbol);
            const isHolding = !!holding;

            let iconTheme = <Percent className="w-4 h-4 text-tech-green" />;
            let badgeText = "Cổ tức tiền mặt";
            let actionDesc = "";

            if (evt.type === "CASH_DIVIDEND") {
              iconTheme = <Coins className="w-4 h-4 text-tech-green" />;
              badgeText = "Sự kiện chi trả cổ tức tiền mặt";
              if (holding) {
                const totalPay = holding.volume * (evt.valueAmount || 0);
                actionDesc = `Bạn đang nắm giữ ${holding.volume.toLocaleString()} CP ${evt.symbol}. Nhận về ${formatVND(totalPay)} vào tiền mặt khả dụng.`;
              }
            } else if (evt.type === "BONUS_SHARES") {
              iconTheme = <TrendingUp className="w-4 h-4 text-tech-yellow" />;
              badgeText = "Phát hành cổ phiếu thưởng";
              if (holding) {
                const parts = evt.ratio?.split(":") || ["20", "3"];
                const bonusShares = Math.floor((holding.volume / parseInt(parts[0])) * parseInt(parts[1]));
                actionDesc = `Bạn đang nắm giữ ${holding.volume.toLocaleString()} CP ${evt.symbol}. Nhận thêm +${bonusShares.toLocaleString()} CP thưởng miễn phí.`;
              }
            } else if (evt.type === "RIGHTS_ISSUE") {
              iconTheme = <Ticket className="w-4 h-4 text-tech-yellow" />;
              badgeText = "Thực hiện quyền mua thêm";
              if (holding) {
                const parts = evt.ratio?.split(":") || ["10", "1"];
                const qtyBuy = Math.floor((holding.volume / parseInt(parts[0])) * parseInt(parts[1]));
                const totalCost = qtyBuy * (evt.priceAmount || 15000);
                actionDesc = `Quyền mua thêm ${qtyBuy.toLocaleString()} CP ${evt.symbol} giá chiết khấu ${formatVND(evt.priceAmount || 15000)} (Chi phí khẩu trừ tiền mặt: ${formatVND(totalCost)}).`;
              }
            } else if (evt.type === "STOCK_SPLIT") {
              iconTheme = <Cpu className="w-4 h-4 text-tech-blue" />;
              badgeText = "Chia tách cổ phiếu";
              if (holding) {
                actionDesc = `Chia tách cổ phiếu ${evt.symbol} tỷ lệ 1:2. Khối lượng nắm giữ nhân đôi (${(holding.volume * 2).toLocaleString()} CP), giá vốn đầu tư chia đôi.`;
              }
            }

            const canExecute = isHolding && !evt.applied;

            return (
              <div
                key={evt.id}
                className={`p-4 rounded border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-150 ${
                  evt.applied
                    ? "bg-[#0b0e11]/50 border-border-main opacity-60"
                    : isHolding
                    ? "bg-tech-green/5 border-border-main hover:border-tech-green/50"
                    : "bg-[#000000]/40 border-border-main"
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div className={`p-2.5 rounded shrink-0 ${
                    evt.applied ? "bg-card-main/40" : "bg-[#1e2329] border border-border-main"
                  }`}>
                    {iconTheme}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2.5">
                      <span className="text-tech-green font-bold font-mono text-sm">{evt.symbol}</span>
                      <span className="text-[10px] text-tech-green bg-tech-green/10 border border-tech-green/20 px-1.5 py-0.2 rounded font-semibold leading-none">
                        {badgeText}
                      </span>
                      <span className="text-[10px] text-text-muted font-semibold">{evt.date}</span>
                    </div>

                    <h3 className="text-[13px] font-bold text-gray-200 mt-1">{evt.title}</h3>
                    <p className="text-[11.5px] text-text-muted mt-0.5 leading-relaxed font-medium">{evt.description}</p>
                    
                    {/* Active dynamic impact warnings */}
                    {isHolding && !evt.applied && (
                      <p className="text-[11px] text-tech-green font-semibold mt-1.5 flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        {actionDesc}
                      </p>
                    )}

                    {!isHolding && (
                      <p className="text-[11px] text-text-muted font-semibold mt-1 flex items-center">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1 text-tech-yellow" />
                        Tài khoản không nắm giữ mã này - không bị tác động trực tiếp.
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit interaction button */}
                <div className="shrink-0 w-full md:w-auto text-right">
                  {evt.applied ? (
                    <span className="inline-flex items-center text-[11px] text-text-muted font-bold bg-[#1e2329] border border-border-main px-3 py-1.5 rounded select-none">
                      <CheckCircle2 className="w-4 h-4 mr-1 text-tech-green" /> ĐÃ THỰC THI
                    </span>
                  ) : canExecute ? (
                    <button
                      onClick={() => handleApply(evt.id)}
                      className="w-full md:w-auto px-4 py-2 bg-tech-green hover:bg-[#0cb372] text-black font-extrabold text-[11px] uppercase tracking-wider rounded border border-transparent flex items-center justify-center space-x-1.5 transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Thực thi quyền</span>
                    </button>
                  ) : (
                    <span className="inline-flex text-[10px] text-text-muted bg-[#000000]/40 px-3 py-1.5 rounded border border-border-main select-none">
                      KHÔNG ÁP DỤNG
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Success notification overlay prompt */}
      {successEventId && (
        <div className="mt-4 p-3 bg-tech-green/10 border border-tech-green/20 rounded text-tech-green font-bold text-xs flex items-center animate-bounce">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Sự kiện được áp dụng hoàn tất! Khối lượng sở hữu cổ phiếu và vốn đầu tư tương ứng đã được hạch toán lại một cách hoàn toàn chuẩn xác.
        </div>
      )}

      {/* Warning disclaimer cards */}
      <div className="p-4 bg-[#000000]/40 border-t border-border-main rounded text-[10px] leading-relaxed text-text-muted mt-5">
        <p className="font-bold text-[#eaeaeb] uppercase tracking-widest flex items-center mb-1">
          <AlertTriangle className="w-4 h-4 text-tech-yellow mr-2 shrink-0 animate-pulse" />
          Quy tắc điều chỉnh giá Giao dịch không hưởng quyền
        </p>
        <p>
          Vào ngày giao dịch không hưởng quyền (GDKHQ), giá cổ phiếu trên bảng điện sẽ được điều chỉnh giảm tương ứng với quyền cổ tức hoặc tỷ lệ thưởng cổ phiếu theo công thức chuẩn của Ủy ban Chứng khoán Nhà nước Việt Nam SSC. NAV tổng tài sản của nhà đầu tư không thay đổi tại ngày chốt quyền.
        </p>
      </div>
    </div>
  );
}
