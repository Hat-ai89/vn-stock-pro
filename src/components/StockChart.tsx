import React, { useState } from "react";
import { AreaChart, Flame, TrendingUp, TrendingDown, Eye, Calendar, Award } from "lucide-react";
import { Stock, generateStockHistoryCandles } from "../data";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

interface StockChartProps {
  stock: Stock | null;
  dayOffset?: number;
}

type ChartType = "LINE" | "CANDLE";
type TimeFrame = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL";

// Custom Candlestick shape for Recharts
const CandlestickBar = (props: any) => {
  const { x, y, width, height, payload } = props;
  if (!payload || x === undefined || y === undefined || width === undefined || height === undefined) {
    return null;
  }

  const { open, close, high, low } = payload;
  const isGreen = close >= open;
  const color = isGreen ? "#0ecb81" : "#f6465d";

  const centerX = x + width / 2;
  const priceDiff = Math.abs(open - close) || 0.001;
  const scale = height / priceDiff;
  const yHigh = y + (Math.max(open, close) - high) * scale;
  const yLow = y + (Math.max(open, close) - low) * scale;

  return (
    <g>
      {/* Wick line (Râu nến) */}
      <line
        x1={centerX}
        y1={yHigh}
        x2={centerX}
        y2={yLow}
        stroke={color}
        strokeWidth={1.5}
      />
      {/* Body rectangle (Thân nến) */}
      <rect
        x={x}
        y={y}
        width={width}
        height={Math.max(1.5, height)}
        fill={color}
        stroke={color}
        strokeWidth={0}
      />
    </g>
  );
};

// Custom Tooltip component in Vietnamese matching terminal style
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isUp = data.close >= data.open;
    const colorClass = isUp ? "text-tech-green" : "text-tech-red";

    return (
      <div className="bg-[#111622] border border-border-main rounded-md p-3 shadow-2xl space-y-1.5 font-mono text-[11px] min-w-[160px] z-50">
        <div className="text-gray-400 font-bold border-b border-border-main/60 pb-1 mb-1 text-xs flex items-center gap-1">
          <Calendar className="w-3 h-3 text-tech-green" />
          {data.time}
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-text-muted">Mở (Open):</span>
          <span className="text-gray-200 font-semibold">{data.open.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-text-muted">Cao (High):</span>
          <span className="text-tech-green font-semibold">{data.high.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-text-muted">Thấp (Low):</span>
          <span className="text-tech-red font-semibold">{data.low.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4 border-b border-border-main/40 pb-1 mb-1">
          <span className="text-text-muted">Đóng (Close):</span>
          <span className={`font-extrabold ${colorClass}`}>{data.close.toFixed(2)}</span>
        </div>
        {data.ma5 !== undefined && data.ma5 !== null && (
          <div className="flex justify-between gap-4">
            <span className="text-sky-400/80">MA5:</span>
            <span className="text-sky-400 font-semibold">{data.ma5.toFixed(2)}</span>
          </div>
        )}
        {data.ma10 !== undefined && data.ma10 !== null && (
          <div className="flex justify-between gap-4 border-b border-border-main/30 pb-0.5 mb-1">
            <span className="text-purple-400/80">MA10:</span>
            <span className="text-purple-400 font-semibold">{data.ma10.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <span className="text-text-muted">Khối lượng:</span>
          <span className="text-tech-yellow font-bold">{data.volume.toLocaleString()} cp</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function StockChart({ stock, dayOffset = 0 }: StockChartProps) {
  const [chartType, setChartType] = useState<ChartType>("CANDLE");
  const [timeframe, setTimeframe] = useState<TimeFrame>("3M");

  if (!stock) {
    return (
      <div className="bg-card-main border border-border-main rounded flex items-center justify-center p-12 h-80 text-text-muted">
        <div className="text-center">
          <AreaChart className="w-12 h-12 text-[#1c2e42] mx-auto animate-bounce" />
          <p className="mt-4 font-semibold text-xs text-text-muted">
            Vui lòng chọn một mã cổ phiếu trên bảng giá để xem đồ thị chi tiết
          </p>
        </div>
      </div>
    );
  }

  // Determine limits
  const daysLimit = {
    "1D": 5, // Use min 5 days for rendering high-fidelity candlesticks
    "1W": 7,
    "1M": 30,
    "3M": 90,
    "6M": 180,
    "1Y": 250,
    "ALL": 500,
  }[timeframe];

  const basePrice = stock.price;
  const rawCandles = generateStockHistoryCandles(basePrice, daysLimit, dayOffset);

  // Generate dynamic chart data with technical indicators (MA5, MA10) and body bounds
  const chartData = rawCandles.map((c, index) => {
    // MA5
    let ma5 = null;
    if (index >= 4) {
      const sum = rawCandles.slice(index - 4, index + 1).reduce((acc, curr) => acc + curr.close, 0);
      ma5 = sum / 5;
    }
    // MA10
    let ma10 = null;
    if (index >= 9) {
      const sum = rawCandles.slice(index - 9, index + 1).reduce((acc, curr) => acc + curr.close, 0);
      ma10 = sum / 10;
    }

    return {
      ...c,
      // For Candle body range: [open, close] so Recharts knows the min and max coordinates
      body: [c.open, c.close],
      ma5,
      ma10,
    };
  });

  const isProfit = stock.change >= 0;

  // Compute scale boundaries for YAxis domain with small dynamic cushion padding
  const allPrices = rawCandles.flatMap((c) => [c.low, c.high]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const pricePadding = (maxPrice - minPrice) * 0.05 || 1;
  const yDomain = [Math.max(0, minPrice - pricePadding), maxPrice + pricePadding];

  // Max volume for volume sub-axes boundary constraint
  const maxVol = Math.max(...rawCandles.map((c) => c.volume));

  return (
    <div className="bg-card-main border border-border-main rounded shadow-lg p-5 flex flex-col h-full overflow-hidden select-none">
      {/* Header Info details */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border-main pb-4 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold font-mono text-tech-green select-all">{stock.symbol}</span>
            <span className="text-text-muted font-sans text-xs hidden md:inline truncate max-w-xs">{stock.name}</span>
            <span className="px-2 py-0.5 bg-[#1e2329] border border-border-main text-tech-green text-[9px] font-bold rounded">
              {stock.sector}
            </span>
          </div>

          <div className="flex items-center space-x-3.5 mt-1">
            <span className={`text-md font-extrabold font-mono ${isProfit ? "text-tech-green" : "text-tech-red"}`}>
              {stock.price.toFixed(2)}
            </span>
            <span className={`text-xs font-mono font-semibold ${isProfit ? "text-tech-green bg-tech-green/10 px-1.5 py-0.2 rounded" : "text-tech-red bg-tech-red/10 px-1.5 py-0.2 rounded"}`}>
              {isProfit ? "▲" : "▼"} {stock.change > 0 ? "+" : ""}{stock.change.toFixed(2)} ({stock.change > 0 ? "+" : ""}{stock.pctChange.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-3">
          {/* LINE VS CANDLE */}
          <div className="bg-[#000000]/40 p-1 rounded border border-border-main flex space-x-1 shrink-0">
            {(["LINE", "CANDLE"] as ChartType[]).map((type) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${
                  chartType === type
                    ? "bg-[#1e2329] text-tech-green border border-border-main"
                    : "text-text-muted hover:text-white border border-transparent"
                }`}
              >
                {type === "CANDLE" ? "🕯️ NẾN NHẬT" : "📈 ĐỒ THỊ LINE"}
              </button>
            ))}
          </div>

          {/* Timeframes selection */}
          <div className="bg-[#000000]/40 p-1 rounded border border-border-main flex space-x-0.5 overflow-x-auto">
            {(["1D", "1W", "1M", "3M", "6M", "1Y", "ALL"] as TimeFrame[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 text-[9px] font-extrabold rounded transition-all cursor-pointer ${
                  timeframe === tf
                    ? "bg-[#1e2329] text-tech-green font-bold"
                    : "text-text-muted hover:text-white"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RENDER PLOTS CONTAINER */}
      <div className="flex-1 relative min-h-[260px] md:min-h-[300px] w-full bg-[#151a21]/50 rounded p-1">
        {/* Technical overlay indicators info */}
        {chartType === "CANDLE" && (
          <div className="absolute top-2 left-3 z-10 flex flex-wrap gap-3 font-mono text-[9px] text-[#848e9c]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span> MA5:{" "}
              <span className="text-sky-300 font-bold">
                {chartData[chartData.length - 1]?.ma5?.toFixed(2) || "N/A"}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> MA10:{" "}
              <span className="text-purple-300 font-bold">
                {chartData[chartData.length - 1]?.ma10?.toFixed(2) || "N/A"}
              </span>
            </span>
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 15, right: 10, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isProfit ? "#0ecb81" : "#f6465d"} stopOpacity={0.24} />
                <stop offset="95%" stopColor={isProfit ? "#0ecb81" : "#f6465d"} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#232c3f" vertical={false} />

            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6b7280", fontSize: 9, fontFamily: "JetBrains Mono" }}
              tickFormatter={(t) => t.slice(5)}
              minTickGap={15}
            />

            <YAxis
              yAxisId="price"
              domain={yDomain}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#848e9c", fontSize: 9, fontFamily: "JetBrains Mono" }}
              orientation="right"
              scale="linear"
            />

            {/* Scale boundaries constraints to make Volume accumulate in the bottom 25% of the chart */}
            <YAxis yAxisId="volume" hide={true} domain={[0, maxVol * 4]} />

            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255, 255, 255, 0.05)" }} />

            {/* Volume bars chart in background */}
            <Bar dataKey="volume" yAxisId="volume">
              {chartData.map((entry, index) => {
                const isGreen = entry.close >= entry.open;
                return (
                  <Cell
                    key={`cell-vol-${index}`}
                    fill={isGreen ? "rgba(14, 203, 129, 0.16)" : "rgba(246, 70, 93, 0.16)"}
                  />
                );
              })}
            </Bar>

            {chartType === "LINE" ? (
              <Area
                yAxisId="price"
                type="monotone"
                dataKey="close"
                stroke={isProfit ? "#0ecb81" : "#f6465d"}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#areaColor)"
              />
            ) : (
              // Candlestick rendering
              <Bar yAxisId="price" dataKey="body" shape={<CandlestickBar />} />
            )}

            {/* Overlay moving averages line charts dynamically */}
            {chartType === "CANDLE" && (
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="ma5"
                stroke="#38bdf8"
                strokeWidth={1.2}
                dot={false}
                activeDot={false}
              />
            )}
            {chartType === "CANDLE" && (
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="ma10"
                stroke="#a855f7"
                strokeWidth={1.2}
                dot={false}
                activeDot={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Floating technical summary badges */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-border-main pt-3 mt-3 text-[10px] text-text-muted gap-1.5">
        <span className="flex items-center text-text-muted">
          <Eye className="w-3.5 h-3.5 mr-1 text-tech-green" />
          Tín hiệu kỹ thuật:{" "}
          <span className={`font-bold ml-1 flex items-center gap-0.5 ${isProfit ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>
            {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isProfit ? "MUA MẠNH (Strong Buy)" : "BÁN BỚT (Neutral)"}
          </span>
        </span>
        <span className="font-mono text-text-muted flex items-center gap-1.5">
          <Award className="w-3 h-3 text-tech-yellow" />
          Nguồn cấp dữ liệu: HSX / HNX Realtime
        </span>
      </div>
    </div>
  );
}
