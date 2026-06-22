import React, { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import { 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  Activity, 
  Briefcase, 
  Award, 
  ArrowRight, 
  Calendar,
  Wallet,
  Compass,
  PieChart,
  BarChart3
} from "lucide-react";
import { StockHolding, BondHolding, Stock, generateChartHistory, STARTING_CAPITAL, generateStockHistoryCandles } from "../data";

Chart.register(...registerables);

interface AssetAnalyticsProps {
  portfolio: StockHolding[];
  bonds?: BondHolding[];
  stocks: Record<string, Stock>;
  cash: number;
  dayOffset?: number;
}

type PeriodFilter = "1W" | "1M" | "3M" | "6M" | "1Y" | "YTD" | "ALL";
type GroupByFilter = "DAY" | "WEEK" | "MONTH" | "QUARTER" | "YEAR";

export default function AssetAnalytics({ portfolio, bonds = [], stocks, cash, dayOffset = 0 }: AssetAnalyticsProps) {
  const [period, setPeriod] = useState<PeriodFilter>("3M");
  const [groupBy, setGroupBy] = useState<GroupByFilter>("MONTH");
  const [viewMode, setViewMode] = useState<"NAV" | "VNINDEX_CANDLE">("VNINDEX_CANDLE");

  // Chart canvas refs
  const comparativeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const vnindexCandleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const allocationCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const holdingsCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const performanceBarRef = useRef<HTMLCanvasElement | null>(null);

  // Chart instances refs
  const comparativeChartRef = useRef<Chart | null>(null);
  const allocationChartRef = useRef<Chart | null>(null);
  const holdingsChartRef = useRef<Chart | null>(null);
  const performanceChartRef = useRef<Chart | null>(null);

  // Calculations for total valuations
  const calculatedHoldings = portfolio.map((h) => {
    const live = stocks[h.symbol];
    const curP = live ? live.price * 1000 : h.costPrice;
    const value = curP * h.volume;
    const cost = h.costPrice * h.volume;
    const pnl = value - cost;
    return {
      ...h,
      sector: live?.sector || "Khác",
      totalCost: cost,
      totalValue: value,
      pnl,
    };
  });

  const stockValue = calculatedHoldings.reduce((sum, h) => sum + h.totalValue, 0);
  const totalCost = calculatedHoldings.reduce((sum, h) => sum + h.totalCost, 0);
  const bondValue = bonds.reduce((sum, b) => sum + b.currentPrice * b.volume, 0);
  const navValue = stockValue + bondValue + cash;
  const totalProfit = navValue - STARTING_CAPITAL;
  const overallROI = (totalProfit / STARTING_CAPITAL) * 100;

  // Win Rate & Stats Simulation values
  const totalTrades = 620; // Simulated from mock trades
  const winCount = 380; // 380 profitable closed transactions
  const winRate = (winCount / totalTrades) * 100;
  const maxGainTrade = 145000000; // 145 Million FPT trade gain
  const maxLossTrade = -38000000; // -38 Million DIG trade loss

  // Format VND
  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  // Convert timeline limits for Chart History
  const limitDays = {
    "1W": 7,
    "1M": 30,
    "3M": 90,
    "6M": 180,
    "1Y": 270, // proxy standard trading days
    "YTD": 120,
    "ALL": 360,
  }[period];

  const chartHistoryPoints = generateChartHistory(navValue, dayOffset).slice(-limitDays);

  // Initialize Dual-Axis line chart (NAV vs VN-INDEX)
  useEffect(() => {
    if (viewMode !== "NAV" || !comparativeCanvasRef.current) return;

    if (comparativeChartRef.current) {
      comparativeChartRef.current.destroy();
    }

    const labels = chartHistoryPoints.map((p) => p.date);
    const navPoints = chartHistoryPoints.map((p) => p.nav / 1000000000); // in Billion VND
    const vnPoints = chartHistoryPoints.map((p) => p.vnindex);

    const ctx = comparativeCanvasRef.current.getContext("2d");
    if (!ctx) return;

    comparativeChartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Tài sản NAV (Tỷ VNĐ)",
            data: navPoints,
            borderColor: "#00b06b", // tech-green
            borderWidth: 2,
            tension: 0.15,
            yAxisID: "yNav",
            pointRadius: 0,
            fill: false,
          },
          {
            label: "Chỉ số VN-INDEX",
            data: vnPoints,
            borderColor: "#ffbf00", // tech-yellow
            borderWidth: 1.5,
            tension: 0.15,
            yAxisID: "yVn",
            pointRadius: 0,
            fill: false,
            borderDash: [3, 3],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: { color: "#848e9c", font: { size: 10, family: "JetBrains Mono, monospace" } },
          },
          tooltip: {
            mode: "index",
            intersect: false,
            backgroundColor: "#0b0e11",
            borderColor: "#1e2329",
            borderWidth: 1,
            titleColor: "#848e9c",
            bodyColor: "#eaebeb",
            titleFont: { family: "JetBrains Mono, monospace" },
            bodyFont: { family: "JetBrains Mono, monospace" }
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#848e9c", font: { size: 9, family: "JetBrains Mono, monospace" }, maxTicksLimit: 10 },
          },
          yNav: {
            type: "linear",
            display: true,
            position: "left",
            grid: { color: "#1e2329" },
            ticks: {
              color: "#00b06b",
              font: { size: 9, family: "JetBrains Mono, monospace" },
              callback: (val) => `${val}T`,
            },
          },
          yVn: {
            type: "linear",
            display: true,
            position: "right",
            grid: { drawOnChartArea: false },
            ticks: {
              color: "#ffbf00",
              font: { size: 9, family: "JetBrains Mono, monospace" },
            },
          },
        },
      },
    });

    return () => comparativeChartRef.current?.destroy();
  }, [period, viewMode, dayOffset]);

  // Custom draw effect for VN-INDEX Japanese Candlestick Chart (viewMode: VNINDEX_CANDLE)
  useEffect(() => {
    if (viewMode !== "VNINDEX_CANDLE" || !vnindexCandleCanvasRef.current) return;

    const canvas = vnindexCandleCanvasRef.current;
    const parent = canvas.parentElement;
    if (!parent) return;

    const width = parent.clientWidth || 800;
    const height = 256; 
    
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Dark sleek template background matching the container
    ctx.fillStyle = "#151a21";
    ctx.fillRect(0, 0, width, height);

    // Get VN-INDEX candlestick historical dates
    const candlesData = generateStockHistoryCandles(1302.4, limitDays, dayOffset);

    let maxPrice = -Infinity;
    let minPrice = Infinity;
    let maxVol = -Infinity;

    candlesData.forEach((c) => {
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.low < minPrice) minPrice = c.low;
      if (c.volume > maxVol) maxVol = c.volume;
    });

    const topPad = 25;
    const botPad = 35;
    const leftPad = 15;
    const rightPad = 65;

    const chartWidth = width - leftPad - rightPad;
    const chartHeight = height - topPad - botPad;

    const priceRange = maxPrice - minPrice || 1;
    const getX = (idx: number) => leftPad + (idx / (candlesData.length - 1 || 1)) * chartWidth;
    const getY = (val: number) => topPad + chartHeight - ((val - minPrice) / priceRange) * chartHeight;

    // Draw grid horizontal lines & price marks on vertical right margin
    ctx.strokeStyle = "#232c3f";
    ctx.lineWidth = 0.5;
    ctx.fillStyle = "#848e9c";
    ctx.font = "9px 'JetBrains Mono', monospace";

    for (let k = 0; k <= 4; k++) {
      const priceVal = minPrice + (k / 4) * priceRange;
      const y = getY(priceVal);
      ctx.beginPath();
      ctx.moveTo(leftPad, y);
      ctx.lineTo(width - rightPad, y);
      ctx.stroke();

      ctx.fillText(priceVal.toFixed(1), width - rightPad + 6, y + 3);
    }

    // Draw Japanese Candles (Nến Nhật) & Volume bars
    const candleWidth = Math.max(1.8, (chartWidth / candlesData.length) * 0.6);

    candlesData.forEach((candle, idx) => {
      const x = getX(idx);
      const yOpen = getY(candle.open);
      const yClose = getY(candle.close);
      const yHigh = getY(candle.high);
      const yLow = getY(candle.low);

      const isGreen = candle.close >= candle.open;
      const themeColor = isGreen ? "#0ecb81" : "#f6465d";

      // Draw high-low line (Râu nến)
      ctx.strokeStyle = themeColor;
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      // Draw close-open body (Thân nến)
      ctx.fillStyle = themeColor;
      const bodyH = Math.max(1.2, Math.abs(yClose - yOpen));
      const bodyY = Math.min(yOpen, yClose);
      ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyH);

      // Lower third volume drawing
      const volH = (candle.volume / (maxVol || 1)) * 30;
      const volY = height - botPad;
      ctx.fillStyle = isGreen ? "rgba(14, 203, 129, 0.16)" : "rgba(246, 70, 93, 0.16)";
      ctx.fillRect(x - candleWidth / 3, volY - volH, candleWidth * 0.7, volH);
    });

    // Draw Date labels on bottom line
    ctx.fillStyle = "#6b7280";
    const segment = Math.max(1, Math.floor(candlesData.length / 5));
    candlesData.forEach((candle, idx) => {
      if (idx % segment === 0 || idx === candlesData.length - 1) {
        const x = getX(idx);
        ctx.fillText(candle.time.slice(5), x - 12, height - 12);
      }
    });

  }, [period, viewMode, limitDays, dayOffset]);

  // Sector industry donut Chart
  useEffect(() => {
    if (!allocationCanvasRef.current) return;

    if (allocationChartRef.current) {
      allocationChartRef.current.destroy();
    }

    const sectorWeights: Record<string, number> = {};
    calculatedHoldings.forEach((h) => {
      sectorWeights[h.sector] = (sectorWeights[h.sector] || 0) + h.totalValue;
    });

    // Trái phiếu: gộp vào allocation theo nhóm "Trái phiếu [Ngành phát hành]"
    bonds.forEach((b) => {
      const key = `Trái phiếu ${b.sector}`;
      sectorWeights[key] = (sectorWeights[key] || 0) + b.currentPrice * b.volume;
    });

    // Append cash to allocation
    sectorWeights["Tiền mặt"] = cash;

    const labels = Object.keys(sectorWeights);
    const dataValues = Object.values(sectorWeights).map((val) => Math.round(val / 1000000)); // in Million VND

    const bgColors = [
      "rgba(0, 176, 107, 0.7)",  // tech-green trans
      "rgba(255, 191, 0, 0.7)",  // tech-yellow trans
      "rgba(240, 48, 74, 0.7)",   // tech-red trans
      "rgba(50, 134, 255, 0.7)",  // tech-blue trans
      "rgba(182, 80, 248, 0.7)", // tech-purple trans
      "rgba(120, 113, 108, 0.7)",
      "rgba(14, 116, 144, 0.7)",
    ];

    const ctx = allocationCanvasRef.current.getContext("2d");
    if (!ctx) return;

    allocationChartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: dataValues,
            backgroundColor: bgColors,
            borderColor: "#12161a",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              color: "#eaebeb",
              font: { size: 10, family: "Inter, sans-serif" },
              boxWidth: 8,
              padding: 8,
            },
          },
          tooltip: {
            backgroundColor: "#0b0e11",
            borderColor: "#1e2329",
            borderWidth: 1,
            titleColor: "#848e9c",
            bodyColor: "#eaebeb",
            callbacks: {
              label: (ctx) => `Giá trị: ${ctx.parsed.toLocaleString("vi-VN")} Triệu đ`,
            },
          },
        },
      },
    });

    return () => allocationChartRef.current?.destroy();
  }, [portfolio, bonds, stocks, cash]);

  // Top 10 Holdings vertical bar graph
  useEffect(() => {
    if (!holdingsCanvasRef.current) return;

    if (holdingsChartRef.current) {
      holdingsChartRef.current.destroy();
    }

    const sortedTop10 = [...calculatedHoldings]
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10);

    const labels = sortedTop10.map((h) => h.symbol);
    const values = sortedTop10.map((h) => Math.round(h.totalValue / 1000000)); // in m-VND

    const ctx = holdingsCanvasRef.current.getContext("2d");
    if (!ctx) return;

    holdingsChartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Giá trị sở hữu (Triệu VNĐ)",
            data: values,
            backgroundColor: "rgba(0, 176, 107, 0.15)",
            borderColor: "#00b06b",
            borderWidth: 1,
            borderRadius: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#0b0e11",
            borderColor: "#1e2329",
            borderWidth: 1,
            callbacks: {
              label: (ctx) => `Giá trị: ${ctx.parsed.y.toLocaleString()} Triệu đ`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#848e9c", font: { size: 9, family: "JetBrains Mono, monospace" } },
          },
          y: {
            grid: { color: "#1e2329" },
            ticks: { color: "#848e9c", font: { size: 9, family: "JetBrains Mono, monospace" } },
          },
        },
      },
    });

    return () => holdingsChartRef.current?.destroy();
  }, [portfolio, stocks]);

  // Performance/profit records grouped by periods bar chart
  useEffect(() => {
    if (!performanceBarRef.current) return;

    if (performanceChartRef.current) {
      performanceChartRef.current.destroy();
    }

    // Config labels & values according to period grouping
    let labels: string[] = [];
    let values: number[] = [];

    if (groupBy === "MONTH") {
      labels = ["T01", "T02", "T03", "T04", "T05", "T06", "T07", "T08", "T09", "T10", "T11", "T12"];
      values = [145000000, 110000000, 230000000, -85000000, 155000000, 145000000, 95000000, -42000000, 180000000, 210000000, -60000000, 277000000];
    } else if (groupBy === "QUARTER") {
      labels = ["QUÝ 1", "QUÝ 2", "QUÝ 3", "QUÝ 4"];
      values = [485000000, 215000000, 233000000, 482000000];
    } else if (groupBy === "WEEK") {
      labels = ["Tuần 22", "Tuần 23", "Tuần 24", "Tuần 25", "Tuần 26"];
      values = [24000000, -12000000, 52000000, 68000000, 145000000];
    } else if (groupBy === "YEAR") {
      labels = ["2021", "2022", "2023", "2024", "2025", "2026"];
      values = [185000000, -420000000, 890000000, 1205000000, 1150000000, 1415000000];
    } else {
      // Day
      labels = ["10-06", "11-06", "13-06", "14-06", "15-06", "16-06", "17-06"];
      values = [12000000, -8000000, 14000000, 24000000, -11000000, 32000000, 145000000];
    }

    const bgColors = values.map((val) => (val >= 0 ? "rgba(0, 176, 107, 0.15)" : "rgba(240, 48, 74, 0.15)"));
    const borderColors = values.map((val) => (val >= 0 ? "#00b06b" : "#f0304a"));

    const ctx = performanceBarRef.current.getContext("2d");
    if (!ctx) return;

    performanceChartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Lãi/Lỗ ròng (đ)",
            data: values,
            backgroundColor: bgColors,
            borderColor: borderColors,
            borderWidth: 1,
            borderRadius: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#0b0e11",
            borderColor: "#1e2329",
            borderWidth: 1,
            callbacks: {
              label: (ctx) => `Lợi nhuận: ${ctx.parsed.y.toLocaleString("vi-VN")} đ`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#848e9c", font: { size: 9, family: "JetBrains Mono, monospace" } },
          },
          y: {
            grid: { color: "#1e2329" },
            ticks: {
              color: "#848e9c",
              font: { size: 9, family: "JetBrains Mono, monospace" },
              callback: (val) => `${Number(val) / 1000000}M`,
            },
          },
        },
      },
    });

    return () => performanceChartRef.current?.destroy();
  }, [groupBy]);

  // Nhấp nháy khi NAV thay đổi (đồng bộ cảm giác "sống" với vòng lặp live-tick mỗi 3.5s)
  const prevNavRef = useRef<number | null>(null);
  const [navFlash, setNavFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (prevNavRef.current !== null && prevNavRef.current !== navValue) {
      setNavFlash(navValue > prevNavRef.current ? "up" : "down");
      const timer = setTimeout(() => setNavFlash(null), 700);
      prevNavRef.current = navValue;
      return () => clearTimeout(timer);
    }
    prevNavRef.current = navValue;
  }, [navValue]);

  return (
    <div className="space-y-6">
      {/* 1. SCORECARD METRICS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card-main p-4 rounded border border-border-main hover:border-tech-green/40 transition-colors select-none">
          <p className="text-[10px] text-text-muted uppercase font-extrabold tracking-widest flex items-center mb-1">
            <Briefcase className="w-3.5 h-3.5 text-tech-green mr-1.5" />
            Tài sản ròng (NAV)
          </p>
          <p className={`text-sm font-extrabold font-mono text-tech-green mt-0.5 transition-colors duration-300 rounded px-1 -mx-1 ${
            navFlash === "up" ? "bg-tech-green/30" : navFlash === "down" ? "bg-tech-red/30" : ""
          }`}>{formatVND(navValue)}</p>
          <p className="text-[10px] text-text-muted font-semibold uppercase mt-1">CP: {formatVND(stockValue)} · TP: {formatVND(bondValue)} · TM: {formatVND(cash)}</p>
        </div>


        <div className="bg-card-main p-4 rounded border border-border-main hover:border-tech-green/40 transition-colors select-none">
          <p className="text-[10px] text-text-muted uppercase font-extrabold tracking-widest flex items-center mb-1">
            <Percent className="w-3.5 h-3.5 text-tech-green mr-1.5" />
            LỢI SUẤT DANH MỤC (ROI)
          </p>
          <p className="text-sm font-extrabold font-mono text-tech-green mt-0.5">+{overallROI.toFixed(2)}%</p>
          <p className="text-[10px] text-text-muted font-semibold uppercase mt-1">Tổng lãi ròng: +{formatVND(totalProfit)}</p>
        </div>

        <div className="bg-card-main p-4 rounded border border-border-main hover:border-tech-green/40 transition-colors select-none">
          <p className="text-[10px] text-text-muted uppercase font-extrabold tracking-widest flex items-center mb-1">
            <Activity className="w-3.5 h-3.5 text-tech-yellow mr-1.5 animate-pulse" />
            WIN RATE HOÀN THÀNH
          </p>
          <p className="text-sm font-extrabold font-mono text-[#eaebeb] mt-0.5">{winRate.toFixed(1)}%</p>
          <p className="text-[10px] text-text-muted font-semibold uppercase mt-1">Số giao dịch khớp: {totalTrades} lệnh</p>
        </div>

        <div className="bg-card-main p-4 rounded border border-border-main hover:border-tech-green/40 transition-colors select-none">
          <p className="text-[10px] text-text-muted uppercase font-extrabold tracking-widest flex items-center mb-1">
            <Award className="w-3.5 h-3.5 text-tech-blue mr-1.5" />
            MAX PROFIT / MAX LOSS
          </p>
          <p className="text-[11px] font-extrabold font-mono text-tech-green mt-0.5">Top gain: +{formatVND(maxGainTrade)}</p>
          <p className="text-[11px] font-extrabold font-mono text-tech-red mt-1">Top loss: {formatVND(maxLossTrade)}</p>
        </div>
      </div>

      {/* 2. MAIN NAV COMPARATIVE LINE CHART CHART */}
      <div className="bg-card-main border border-border-main rounded p-5 shadow-lg select-none">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border-main pb-4 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-1.5 h-4 bg-tech-green rounded"></div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {viewMode === "VNINDEX_CANDLE" ? "BIỂU ĐỒ KỸ THUẬT VN-INDEX (NẾN NHẬT)" : "SO SÁNH HIỆU QUẢ LỢI NHUẬN"}
              </h3>
              <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider leading-none">
                {viewMode === "VNINDEX_CANDLE" ? "Đồ thị chỉ số VN-Index trực tuyến" : "Biểu đồ so sánh tài sản NAV lũy kế với VN-Index"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* View Mode controls */}
            <div className="bg-[#000000]/40 p-1 rounded border border-border-main flex space-x-0.5 font-mono">
              <button
                onClick={() => setViewMode("VNINDEX_CANDLE")}
                className={`px-2 py-1 text-[9px] font-extrabold rounded transition-all cursor-pointer ${
                  viewMode === "VNINDEX_CANDLE"
                    ? "bg-[#1e2329] text-tech-green font-bold border border-border-main"
                    : "text-text-muted hover:text-white"
                }`}
              >
                🕯️ NẾN NHẬT
              </button>
              <button
                onClick={() => setViewMode("NAV")}
                className={`px-2 py-1 text-[9px] font-extrabold rounded transition-all cursor-pointer ${
                  viewMode === "NAV"
                    ? "bg-[#1e2329] text-tech-green font-bold border border-border-main"
                    : "text-text-muted hover:text-white"
                }`}
              >
                📈 SO SÁNH NAV
              </button>
            </div>

            {/* Period controls */}
            <div className="bg-[#000000]/40 p-1 rounded border border-border-main flex space-x-0.5 font-mono">
              {(["1W", "1M", "3M", "6M", "1Y", "ALL"] as PeriodFilter[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-2.5 py-1 text-[9px] font-extrabold rounded transition-all cursor-pointer ${
                    period === p
                      ? "bg-[#1e2329] text-tech-green font-bold border-border-main"
                      : "text-text-muted hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas container */}
        <div className="h-64 relative bg-[#151a21] rounded overflow-hidden">
          {viewMode === "VNINDEX_CANDLE" ? (
            <canvas ref={vnindexCandleCanvasRef} id="vnindex-candle-canvas" className="w-full h-full" />
          ) : (
            <canvas ref={comparativeCanvasRef} id="nav-comparative-canvas" className="w-full h-full" />
          )}
        </div>
      </div>

      {/* 3. DUAL COLUMN ROW: INDUSTRY DONUT & TOP HOLDINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Industry Sector Donut */}
        <div className="bg-card-main border border-border-main rounded p-5 shadow-lg select-none">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center mb-4 pb-3 border-b border-border-main">
            <PieChart className="w-4 h-4 text-tech-green mr-2" />
            Cơ cấu phân bổ tài sản theo ngành
          </h3>
          <div className="h-56 relative flex items-center justify-center">
            <canvas ref={allocationCanvasRef} id="asset-allocation-canvas" />
          </div>
        </div>

        {/* Top 10 Holdings vertical bar */}
        <div className="bg-card-main border border-border-main rounded p-5 shadow-lg select-none">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center mb-4 pb-3 border-b border-border-main">
            <BarChart3 className="w-4 h-4 text-tech-green mr-2" />
            Top 10 Tỷ trọng tài sản lớn nhất
          </h3>
          <div className="h-56 relative">
            <canvas ref={holdingsCanvasRef} id="holdings-top-canvas" />
          </div>
        </div>
      </div>

      {/* 4. PERFORMANCE RECORDED BAR & ASSET JOURNAL */}
      <div className="bg-card-main border border-border-main rounded p-5 shadow-lg select-none">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border-main pb-4 mb-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
            <Calendar className="w-4 h-4 text-tech-green mr-2" />
            Nhật ký sinh lời danh mục
          </h3>

          {/* GroupBy selectors */}
          <div className="bg-[#000000]/40 p-1 rounded border border-border-main flex space-x-0.5 font-mono">
            {(["DAY", "WEEK", "MONTH", "QUARTER", "YEAR"] as GroupByFilter[]).map((g) => (
              <button
                key={g}
                onClick={() => setGroupBy(g)}
                className={`px-2 py-1 text-[9px] font-extrabold rounded transition-all cursor-pointer ${
                  groupBy === g
                    ? "bg-[#1e2329] text-tech-green font-bold border-border-main"
                    : "text-text-muted hover:text-white"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Column diagram representation */}
        <div className="h-52 relative">
          <canvas ref={performanceBarRef} id="performance-journal-canvas" />
        </div>
      </div>
    </div>
  );
}
