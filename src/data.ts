/**
 * VN-Stock Pro Trading Terminal - Data Store
 * All Vietnamese stock market rules, corporate events, initial watchlists, and historic data.
 */

export interface InvestorProfile {
  name: string;
  rank: string;
  clientId: string;
  subAccount: string;
  registrationDate: string;
  status: string;
  feeRate: number;
  avatar?: string;
}

export interface StockHolding {
  symbol: string;
  costPrice: number; // Avg cost price in VND (e.g. 80,000)
  volume: number; // Number of shares held
  purchaseDate: string;
  currentPrice?: number; // Optional current market price in VND
}

export interface BondHolding {
  symbol: string; // Mã trái phiếu
  name: string; // Tên tổ chức phát hành
  bondType: "Chính phủ" | "Doanh nghiệp"; // Trái phiếu Chính phủ hoặc Doanh nghiệp
  sector: string; // Ngành của tổ chức phát hành
  faceValue: number; // Mệnh giá / trái phiếu, in VND (thường 100,000 hoặc 1,000,000)
  couponRate: number; // Lãi suất coupon hàng năm (%)
  maturityDate: string; // Ngày đáo hạn (dd/mm/yyyy)
  purchaseDate: string;
  costPrice: number; // Giá mua / trái phiếu, in VND (thường gần mệnh giá)
  currentPrice: number; // Giá trị hợp lý hiện tại / trái phiếu, in VND
  volume: number; // Số lượng trái phiếu nắm giữ
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  pctChange: number;
  advances: number;
  declines: number;
  unChanges: number;
  totalVolume: number;
  totalValue: number; // in Billion VND
}

export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  refPrice: number; // in k-VND (e.g. 120.0 = 120,000 VND)
  ceilPrice: number;
  floorPrice: number;
  price: number; // Current trading price
  change: number;
  pctChange: number;
  totalVolume: number;
  foreignRoom: number; // % room nước ngoài còn lại được mua thêm (0-49%)
  bidPrice1: number;
  bidVol1: number;
  bidPrice2: number;
  bidVol2: number;
  bidPrice3: number;
  bidVol3: number;
  askPrice1: number;
  askVol1: number;
  askPrice2: number;
  askVol2: number;
  askPrice3: number;
  askVol3: number;
}

export interface Transaction {
  id: string;
  date: string;
  symbol: string;
  type: "BUY" | "SELL";
  price: number; // in VND
  volume: number;
  value: number; // in VND
  feeRate: number;
  fee: number;
  status: "COMPLETE";
}

export interface Order {
  id: string;
  time: string;
  symbol: string;
  type: "BUY" | "SELL";
  price: number; // in k-VND or "ATO"/"ATC"/"MP"
  volume: number;
  filledVolume: number;
  status: "PENDING" | "FILLED" | "CANCELLED" | "MODIFIED";
}

export interface NotificationItem {
  id: string;
  time: string;
  title: string;
  content: string;
  category: "MARKET" | "SYSTEM" | "CORPORATE";
  unread: boolean;
}

export interface CorporateEvent {
  id: string;
  date: string;
  symbol: string;
  type: "CASH_DIVIDEND" | "BONUS_SHARES" | "RIGHTS_ISSUE" | "STOCK_SPLIT";
  title: string;
  description: string;
  ratio?: string; // For bonus shares, splits e.g. "10:2", "1:1"
  valueAmount?: number; // For cash dividends
  priceAmount?: number; // For rights purchase
  applied?: boolean;
}

export const INVESTOR_INFO: InvestorProfile = {
  name: "Nguyễn Hồng Anh Tuấn",
  rank: "Nhà đầu tư Chuyên nghiệp",
  clientId: "HTA-8927-XV",
  subAccount: "880168",
  registrationDate: "15/03/2021",
  status: "Đang hoạt động",
  feeRate: 0.15, // 0.15% trading fee
};

// Premium real tickers base (approximately 60 key VN tickers)
const BASE_TICKERS = [
  // Banks (Ngân hàng)
  { symbol: "VCB", name: "Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank)", sector: "Ngân hàng", ref: 61.6 },
  { symbol: "BID", name: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)", sector: "Ngân hàng", ref: 42.75 },
  { symbol: "CTG", name: "Ngân hàng TMCP Công Thương Việt Nam (VietinBank)", sector: "Ngân hàng", ref: 33.95 },
  { symbol: "TCB", name: "Ngân hàng TMCP Kỹ Thương Việt Nam (Techcombank)", sector: "Ngân hàng", ref: 31.2 },
  { symbol: "MBB", name: "Ngân hàng TMCP Quân Đội (MB Bank)", sector: "Ngân hàng", ref: 25.25 },
  { symbol: "ACB", name: "Ngân hàng TMCP Á Châu", sector: "Ngân hàng", ref: 22.4 },
  { symbol: "VPB", name: "Ngân hàng TMCP Việt Nam Thịnh Vượng", sector: "Ngân hàng", ref: 26.4 },
  { symbol: "STB", name: "Ngân hàng TMCP Sài Gòn Thương Tín (Sacombank)", sector: "Ngân hàng", ref: 70.9 },
  { symbol: "SHB", name: "Ngân hàng TMCP Sài Gòn - Hà Nội", sector: "Ngân hàng", ref: 13.9 },
  { symbol: "VIB", name: "Ngân hàng TMCP Quốc tế Việt Nam", sector: "Ngân hàng", ref: 16.25 },
  { symbol: "HDB", name: "Ngân hàng TMCP Phát triển TP.HCM (HDBank)", sector: "Ngân hàng", ref: 25.15 },
  { symbol: "LPB", name: "Ngân hàng TMCP Lộc Phát Việt Nam", sector: "Ngân hàng", ref: 47.05 },
  { symbol: "TPB", name: "Ngân hàng TMCP Tiền Phong (TienPhong Bank)", sector: "Ngân hàng", ref: 16.2 },

  // Securities (Chứng khoán)
  { symbol: "SSI", name: "CTCP Chứng khoán SSI", sector: "Chứng khoán", ref: 27.5 },
  { symbol: "VCI", name: "CTCP Chứng khoán Vietcap", sector: "Chứng khoán", ref: 24.5 },
  { symbol: "HCM", name: "CTCP Chứng khoán TP.HCM (HSC)", sector: "Chứng khoán", ref: 28.45 },
  { symbol: "MBS", name: "CTCP Chứng khoán MB", sector: "Chứng khoán", ref: 20.6 },
  { symbol: "SHS", name: "CTCP Chứng khoán Sài Gòn - Hà Nội", sector: "Chứng khoán", ref: 19.1 },
  { symbol: "VND", name: "CTCP Chứng khoán VNDIRECT", sector: "Chứng khoán", ref: 17.85 },
  { symbol: "FTS", name: "CTCP Chứng khoán FPT (FTS)", sector: "Chứng khoán", ref: 27.15 },

  // Real Estate (Bất động sản)
  { symbol: "VHM", name: "CTCP Vinhomes", sector: "Bất động sản", ref: 144.4 },
  { symbol: "VIC", name: "Tập đoàn Vingroup", sector: "Bất động sản", ref: 205.4 },
  { symbol: "VRE", name: "CTCP Vincom Retail", sector: "Bất động sản", ref: 29.35 },
  { symbol: "DIG", name: "Tổng CTCP Đầu tư Phát triển Xây dựng (DIC Corp)", sector: "Bất động sản", ref: 13.0 },
  { symbol: "KDH", name: "CTCP Đầu tư & Kinh doanh Nhà Khang Điền", sector: "Bất động sản", ref: 23.0 },
  { symbol: "NLG", name: "CTCP Đầu tư Nam Long", sector: "Bất động sản", ref: 27.05 },
  { symbol: "PDR", name: "CTCP Phát triển Bất động sản Phát Đạt", sector: "Bất động sản", ref: 15.1 },
  { symbol: "DXG", name: "CTCP Tập đoàn Đất Xanh", sector: "Bất động sản", ref: 13.25 },
  { symbol: "CEO", name: "CTCP Tập đoàn C.E.O", sector: "Bất động sản", ref: 15.6 },
  { symbol: "NVL", name: "CTCP Tập đoàn Đầu tư Địa ốc No Va (Novaland)", sector: "Bất động sản", ref: 13.3 },

  // Steel / Metals (Sắt Thép)
  { symbol: "HPG", name: "CTCP Tập đoàn Hòa Phát", sector: "Thép & Kim loại", ref: 23.65 },
  { symbol: "HSG", name: "CTCP Tập đoàn Hoa Sen", sector: "Thép & Kim loại", ref: 12.0 },
  { symbol: "NKG", name: "CTCP Thép Nam Kim", sector: "Thép & Kim loại", ref: 12.45 },

  // Tech / Tel (Công nghệ)
  { symbol: "FPT", name: "CTCP FPT", sector: "Công nghệ", ref: 71.6 },
  { symbol: "CMG", name: "Tập đoàn Công nghệ CMC", sector: "Công nghệ", ref: 27.65 },
  { symbol: "VGI", name: "Tổng CTCP Công trình Viettel", sector: "Công nghệ", ref: 91.5 },
  { symbol: "FOX", name: "CTCP Viễn thông FPT (FPT Telecom)", sector: "Công nghệ", ref: 82.0 },
  { symbol: "VTP", name: "Tổng CTCP Bưu chính Viettel (Viettel Post)", sector: "Công nghệ", ref: 65.5 },

  // Energy & Gas (Dầu khí / Năng lượng)
  { symbol: "GAS", name: "Tổng Công ty Khí Việt Nam (PV GAS)", sector: "Dầu khí", ref: 81.8 },
  { symbol: "PLX", name: "Tập đoàn Xăng dầu Việt Nam (Petrolimex)", sector: "Dầu khí", ref: 39.0 },
  { symbol: "PVS", name: "Tổng CTCP Dịch vụ Kỹ thuật Dầu khí Việt Nam", sector: "Dầu khí", ref: 39.2 },
  { symbol: "BSR", name: "CTCP Lọc hóa Dầu Bình Sơn", sector: "Dầu khí", ref: 26.4 },
  { symbol: "PVD", name: "Tổng CTCP Khoan và Dịch vụ Khoan Dầu khí", sector: "Dầu khí", ref: 30.75 },
  { symbol: "POW", name: "Tổng công ty Điện lực Dầu khí Việt Nam", sector: "Năng lượng-Điện", ref: 14.2 },
  { symbol: "REE", name: "CTCP Cơ Điện Lạnh (REE)", sector: "Năng lượng-Điện", ref: 50.5 },
  { symbol: "GEG", name: "CTCP Điện Gia Lai (TMD - Điện thuộc TTC Group)", sector: "Năng lượng-Điện", ref: 13.4 },

  // Logistics / Ports (Cảng biển & Logistics)
  { symbol: "GMD", name: "CTCP Gemadept (Logistics & Cảng biển)", sector: "Cảng biển & Logistics", ref: 77.6 },
  { symbol: "HAH", name: "CTCP Vận tải và Xếp dỡ Hải An", sector: "Cảng biển & Logistics", ref: 41.2 },
  { symbol: "VSC", name: "CTCP Container Việt Nam (Viconship)", sector: "Cảng biển & Logistics", ref: 19.9 },
  { symbol: "PVT", name: "Tổng CTCP Vận tải Dầu khí (PV Trans)", sector: "Cảng biển & Logistics", ref: 19.95 },
  { symbol: "VOS", name: "CTCP Vận tải Biển Việt Nam (Vosco)", sector: "Cảng biển & Logistics", ref: 12.65 },

  // Consumers & Retail (Bán lẻ / Tiêu dùng)
  { symbol: "MWG", name: "CTCP Đầu tư Thế Giới Di Động", sector: "Tiêu dùng", ref: 78.7 },
  { symbol: "VNM", name: "CTCP Sữa Việt Nam (Vinamilk)", sector: "Tiêu dùng", ref: 58.6 },
  { symbol: "MSN", name: "Tập đoàn Masan", sector: "Tiêu dùng", ref: 72.1 },
  { symbol: "PNJ", name: "CTCP Vàng bạc Đá quý Phú Nhuận", sector: "Tiêu dùng", ref: 68.0 },
  { symbol: "SAB", name: "Tổng CTCP Bia - Rượu - Nước giải khát Sài Gòn", sector: "Tiêu dùng", ref: 48.2 },
  { symbol: "DGW", name: "CTCP Thế Giới Số (Digiworld)", sector: "Tiêu dùng", ref: 41.0 },
  { symbol: "FRT", name: "CTCP Bán lẻ Kỹ thuật số FPT", sector: "Tiêu dùng", ref: 145.0 },
  { symbol: "SBT", name: "CTCP Thành Thành Công - Biên Hòa (TTC Sugar)", sector: "Tiêu dùng", ref: 21.3 },
  { symbol: "TTC", name: "CTCP Tập đoàn Thành Thành Công (TTC Group)", sector: "Tiêu dùng", ref: 8.7 },

  // Chemicals / Fertilizers (Hóa chất & Phân bón)
  { symbol: "DGC", name: "CTCP Tập đoàn Hóa chất Đức Giang", sector: "Hóa chất-Phân bón", ref: 47.8 },
  { symbol: "DPM", name: "Tổng CTCP Phân bón và Hóa chất Dầu khí", sector: "Hóa chất-Phân bón", ref: 23.7 },
  { symbol: "DCM", name: "CTCP Phân bón Dầu khí Cà Mau (Đạm Cà Mau)", sector: "Hóa chất-Phân bón", ref: 36.75 },

  // Seafood & Agriculture (Thủy sản & Nông nghiệp)
  { symbol: "VHC", name: "CTCP Vĩnh Hoàn (Thủy sản)", sector: "Thủy sản", ref: 57.9 },
  { symbol: "ANV", name: "CTCP Nam Việt (Thủy sản Navico)", sector: "Thủy sản", ref: 21.8 },
  { symbol: "EDBH", name: "Quỹ đầu tư Việt Nam", sector: "ETF", ref: 15.0 },

  // ETFs
  { symbol: "E1VFVN30", name: "Quỹ ETF VFM VN30", sector: "ETF", ref: 34.95 },
  { symbol: "FUEVFVND", name: "Quỹ ETF DCVFMVN DIAMOND", sector: "ETF", ref: 35.75 },
  { symbol: "FUESSVFL", name: "Quỹ ETF SSIAM VN FIN LEAD", sector: "ETF", ref: 29.45 },
];

// List of sectors and helper prefixes to generate realistic tickers to fulfill exactly 300 stocks
const mockSectors = [
  "Ngân hàng", "Chứng khoán", "Bất động sản", "Thép & Kim loại", "Công nghệ", 
  "Dầu khí", "Tiêu dùng", "Thủy sản", "Xây dựng-Hạ tầng", "Hóa chất-Phân bón",
  "Năng lượng-Điện", "Nông nghiệp-Thực phẩm", "Cảng biển & Logistics", "Dược phẩm", "Bảo hiểm"
];

const mockCompanyPrefixes = [
  "Tổng CTCP", "CTCP Tập đoàn", "CTCP Đầu tư", "CTCP Thương mại", 
  "CTCP Sản xuất", "CTCP Phát triển Đô thị", "CTCP Xuất nhập khẩu", "CTCP Dịch vụ",
  "CTCP Năng lượng", "CTCP Công nghiệp", "CTCP Thiết bị kỹ thuật", "CTCP Đầu tư Hạ tầng",
  "CTCP Đầu tư & Xây dựng", "CTCP Logistics & Dịch vụ", "CTCP Phát triển Công nghệ"
];

const mockSectorCoreNames: Record<string, string[]> = {
  "Ngân hàng": ["Đông Á", "Bình Trị Đông", "Tân Tiến", "Đồng Tháp", "Phương Đông", "Hoạt động Việt", "Nhà Việt"],
  "Chứng khoán": ["APEC", "Mê Kông", "Sơn Lâm", "Sen Vàng", "Đông Nam Á", "Bắc Á", "Gia Định", "Rồng Việt", "Thái Bình Dương"],
  "Bất động sản": ["Phát triển Đô thị", "Nam Long Sài Gòn", "Địa ốc Thủ Thiêm", "Bình Chánh", "Khánh Hội", "Hoàng Quân", "Phát triển Nhà Hà Nội", "Hưng Thịnh Cát Tường", "Nam Từ Liêm"],
  "Thép & Kim loại": ["Thép Việt", "Ống Thép Sài Gòn", "Kim khí TP.HCM", "Luyện kim Thái Nguyên", "Thép Gia Lai", "Gang thép Thái Bình"],
  "Công nghệ": ["Giải pháp Số VN", "Viễn thông Á Châu", "Phần mềm Quang Trung", "Bưu chính Số", "Trí tuệ Nhân tạo", "Truyền thông Việt"],
  "Dầu khí": ["Dầu khí Miền Nam", "Vận tải xăng dầu Phú Yên", "Khí hóa lỏng Miền Bắc", "Thương mại Hóa dầu Hải Phòng", "Dịch vụ Dầu khí Vũng Tàu"],
  "Tiêu dùng": ["Thực phẩm Hữu Nghị", "Kinh Đô", "Đường Quảng Ngãi", "Sabeco Tây Nguyên", "Mứt kẹo Bibica", "Nước khoáng Vĩnh Hảo"],
  "Thủy sản": ["Thủy sản Hùng Vương", "Minh Phú Hậu Giang", "Xuất khẩu Thủy sản miền Trung", "Nuôi trồng Khánh Hòa", "Chế biến tôm Bạc Liêu"],
  "Xây dựng-Hạ tầng": ["Cienco 4 Sông Đà", "Xây dựng Sông Đà 5", "Hạ tầng kỹ thuật Licogi 16", "Cầu đường miền Bắc", "Đèo Cả Miền Nam"],
  "Hóa chất-Phân bón": ["Hóa chất Lâm Thao", "Premium Hà Bắc", "Hóa phẩm Dầu khí Sài Gòn", "Phân lân Văn Điển", "Sơn Hải Phòng"],
  "Năng lượng-Điện": ["Điện lực Miền Trung", "Thủy điện Thác Bà", "Nhiệt điện Phả Lại", "Năng lượng Trung Nam", "Năng lượng xanh Ninh Thuận"],
  "Nông nghiệp-Thực phẩm": ["Nông nghiệp HAGL", "Cao su Phú Riềng", "Bột mì Bình Đông", "Sữa Hà Nội", "Chăn nuôi Tây Nguyên", "Lâm nghiệp Yên Bái"],
  "Cảng biển & Logistics": ["Cảng Quy Nhơn", "Cảng Hải Phòng", "Vận tải biển Quảng Ninh", "Xếp dỡ Đà Nẵng", "Cảng Container Hải An"],
  "Dược phẩm": ["Dược Hà Tây", "Dược OPC", "Dược phẩm Nam Hà", "Thiết bị Y tế TW1", "Dược phẩm Khánh Hòa"],
  "Bảo hiểm": ["Bảo hiểm Bảo Long", "Bảo hiểm PJICO", "Bảo hiểm Thăng Long", "Bảo hiểm Quân đội", "Bảo hiểm Viễn Đông"]
};

const VN_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Generate clean TICKERS_RAW up to exactly 300 items
function build300Tickers(): { symbol: string; name: string; sector: string; ref: number }[] {
  const resultList = [...BASE_TICKERS];
  const symbolSet = new Set(resultList.map((t) => t.symbol));
  
  // Custom deterministic pseudo-random sequence
  let rSeed = 45678;
  const rand = () => {
    const x = Math.sin(rSeed++) * 10000;
    return x - Math.floor(x);
  };

  while (resultList.length < 300) {
    const char1 = VN_ALPHABET[Math.floor(rand() * 26)];
    const char2 = VN_ALPHABET[Math.floor(rand() * 26)];
    const char3 = VN_ALPHABET[Math.floor(rand() * 26)];
    const symbol = `${char1}${char2}${char3}`;

    if (!symbolSet.has(symbol)) {
      symbolSet.add(symbol);
      const sector = mockSectors[Math.floor(rand() * mockSectors.length)];
      const prefix = mockCompanyPrefixes[Math.floor(rand() * mockCompanyPrefixes.length)];
      const coreOptions = mockSectorCoreNames[sector] || ["Đầu tư Tổng hợp", "Phát triển Công nghiệp", "Giao dịch Thương mại"];
      const coreName = coreOptions[Math.floor(rand() * coreOptions.length)] + " " + String.fromCharCode(65 + Math.floor(rand() * 26)) + String.fromCharCode(65 + Math.floor(rand() * 26));
      
      // Price in k-VND (e.g. 5.5 = 5,500 VND to 145.0 = 145,000 VND)
      const ref = Math.round((6.5 + rand() * 110) * 10) / 10;

      resultList.push({
        symbol,
        name: `${prefix} ${coreName}`,
        sector,
        ref,
      });
    }
  }

  return resultList;
}

export const TICKERS_RAW = build300Tickers();

// Map default watchlist keys
export const WATCHLISTS_DEFAULT: Record<string, string[]> = {
  "Bluechip": ["FPT", "VCB", "VIC", "VHM", "MWG", "VNM", "GAS", "MSN", "TCB", "PNJ", "NVL", "SBT"],
  "Ngân hàng": ["VCB", "BID", "CTG", "TCB", "MBB", "ACB", "VPB", "STB", "VIB", "LPB"],
  "Bất động sản": ["VHM", "VIC", "VRE", "DIG", "KDH", "NLG", "PDR", "DXG", "NVL"],
  "Chứng khoán": ["SSI", "VCI", "HCM", "MBS", "SHS", "VND", "FTS"],
  "Thép & Kim loại": ["HPG", "HSG", "NKG"],
  "Công nghệ": ["FPT", "CMG", "VGI", "FOX", "VTP"],
  "Dầu khí & Điện": ["GAS", "PLX", "PVS", "BSR", "POW", "REE", "PVD", "GEG"],
  "Cảng & Logistics": ["GMD", "HAH", "VSC", "PVT", "VOS"],
  "Bán lẻ & Tiêu dùng": ["MWG", "VNM", "MSN", "PNJ", "SAB", "DGW", "FRT", "SBT", "TTC"],
  "Hóa chất & Thủy sản": ["DGC", "DPM", "DCM", "VHC", "ANV"],
  "ETF": ["E1VFVN30", "FUEVFVND", "FUESSVFL"],
};

// Initial stock state synthesizer
export function initializeStockBoard(): Record<string, Stock> {
  const board: Record<string, Stock> = {};
  TICKERS_RAW.forEach((item) => {
    // HOSE (±7%), HNX (±10%), UPCOM (±15%) exchange standards
    let rate = 0.07;
    if (["PVS", "MBS", "SHS"].includes(item.symbol)) {
      rate = 0.10; // HNX
    } else if (["VGI", "FOX", "VTP", "BSR"].includes(item.symbol)) {
      rate = 0.15; // UPCOM
    }

    const refPrice = item.ref;
    const ceilPrice = Math.round(refPrice * (1 + rate) * 20) / 20;
    const floorPrice = Math.round(refPrice * (1 - rate) * 20) / 20;

    // Simulate trading price clustered around reference
    const drift = (Math.random() - 0.48) * 0.035;
    let price = Math.round(refPrice * (1 + drift) * 20) / 20;
    if (price > ceilPrice) price = ceilPrice;
    if (price < floorPrice) price = floorPrice;

    const change = Math.round((price - refPrice) * 100) / 100;
    const pctChange = Math.round((change / refPrice) * 10000) / 100;

    // Active bid / ask spread queues
    const bidPrice1 = Math.round((price - 0.05) * 20) / 20;
    const bidPrice2 = Math.round((price - 0.10) * 20) / 20;
    const bidPrice3 = Math.round((price - 0.15) * 20) / 20;

    const askPrice1 = Math.round((price + 0.05) * 20) / 20;
    const askPrice2 = Math.round((price + 0.10) * 20) / 20;
    const askPrice3 = Math.round((price + 0.15) * 20) / 20;

    // Room nước ngoài: Ngân hàng (room pháp định 30%) thường gần hết room -> room còn lại thấp.
    // Mã chứng khoán/BĐS thường room cao hơn (room pháp định 49%), dao động rộng hơn.
    const isBank = ["VCB", "BID", "CTG", "TCB", "MBB", "ACB", "VPB", "STB", "VIB", "LPB"].includes(item.symbol);
    const foreignRoom = isBank
      ? Math.round((Math.random() * 4.5) * 10) / 10 // 0.0% - 4.5% (gần cạn room)
      : Math.round((Math.random() * 42 + 3) * 10) / 10; // 3.0% - 45.0%

    board[item.symbol] = {
      symbol: item.symbol,
      name: item.name,
      sector: item.sector,
      refPrice,
      ceilPrice,
      floorPrice,
      price,
      change,
      pctChange,
      totalVolume: Math.floor(Math.random() * 950000) + 120000,
      foreignRoom,
      bidPrice1,
      bidVol1: Math.floor(Math.random() * 600 + 10) * 100,
      bidPrice2,
      bidVol2: Math.floor(Math.random() * 1100 + 20) * 100,
      bidPrice3,
      bidVol3: Math.floor(Math.random() * 1900 + 50) * 100,
      askPrice1,
      askVol1: Math.floor(Math.random() * 550 + 10) * 100,
      askPrice2,
      askVol2: Math.floor(Math.random() * 1400 + 30) * 100,
      askPrice3,
      askVol3: Math.floor(Math.random() * 2400 + 80) * 100,
    };
  });
  return board;
}

// Exactly 30 portfolio holdings.
export const INITIAL_PORTFOLIO: StockHolding[] = [
  // LAI / GAINERS (13)
  { symbol: "FPT", costPrice: 86000, volume: 10000, purchaseDate: "12/04/2024" },
  { symbol: "VCB", costPrice: 81000, volume: 4000, purchaseDate: "05/01/2024" },
  { symbol: "SSI", costPrice: 27000, volume: 28000, purchaseDate: "18/02/2024" },
  { symbol: "TCB", costPrice: 39000, volume: 12000, purchaseDate: "11/11/2024" },
  { symbol: "MWG", costPrice: 49500, volume: 14000, purchaseDate: "20/03/2024" },
  { symbol: "VGI", costPrice: 38000, volume: 8000, purchaseDate: "08/04/2025" },
  { symbol: "MBS", costPrice: 23000, volume: 12000, purchaseDate: "15/09/2024" },
  { symbol: "VTP", costPrice: 61000, volume: 5000, purchaseDate: "22/10/2024" },
  { symbol: "ACB", costPrice: 21500, volume: 20000, purchaseDate: "07/07/2024" },
  { symbol: "PNJ", costPrice: 83000, volume: 5000, purchaseDate: "14/05/2024" },
  { symbol: "FUEVFVND", costPrice: 24500, volume: 16000, purchaseDate: "03/03/2024" },
  { symbol: "BSR", costPrice: 18500, volume: 16000, purchaseDate: "19/12/2024" },
  { symbol: "SBT", costPrice: 11000, volume: 40000, purchaseDate: "15/03/2025" },

  // HOA / FLAT (10)
  { symbol: "CTG", costPrice: 34000, volume: 12000, purchaseDate: "21/01/2025" },
  { symbol: "VCI", costPrice: 38000, volume: 8000, purchaseDate: "15/05/2025" },
  { symbol: "KDH", costPrice: 35000, volume: 6500, purchaseDate: "10/06/2025" },
  { symbol: "GAS", costPrice: 80000, volume: 4000, purchaseDate: "11/11/2025" },
  { symbol: "MSN", costPrice: 72000, volume: 4000, purchaseDate: "01/12/2025" },
  { symbol: "E1VFVN30", costPrice: 21000, volume: 12000, purchaseDate: "20/01/2025" },
  { symbol: "PVS", costPrice: 36000, volume: 8000, purchaseDate: "14/02/2025" },
  { symbol: "VPB", costPrice: 19000, volume: 16000, purchaseDate: "09/03/2025" },
  { symbol: "GEG", costPrice: 12200, volume: 30000, purchaseDate: "10/04/2025" },
  { symbol: "TTC", costPrice: 18500, volume: 24000, purchaseDate: "05/05/2025" },

  // LO / LOSERS (11)
  { symbol: "VHM", costPrice: 44000, volume: 5000, purchaseDate: "15/09/2024" },
  { symbol: "VIC", costPrice: 52000, volume: 4000, purchaseDate: "30/08/2024" },
  { symbol: "VRE", costPrice: 24000, volume: 8000, purchaseDate: "20/10/2024" },
  { symbol: "DIG", costPrice: 26000, volume: 6000, purchaseDate: "05/11/2024" },
  { symbol: "VNM", costPrice: 74000, volume: 2500, purchaseDate: "11/12/2024" },
  { symbol: "SHS", costPrice: 17500, volume: 8000, purchaseDate: "28/10/2024" },
  { symbol: "PLX", costPrice: 39000, volume: 1000, purchaseDate: "05/01/2025" },
  { symbol: "STB", costPrice: 33100, volume: 1000, purchaseDate: "16/01/2025" },
  { symbol: "CMG", costPrice: 48000, volume: 1000, purchaseDate: "22/11/2024" },
  { symbol: "SAB", costPrice: 65000, volume: 1000, purchaseDate: "03/03/2025" },
  { symbol: "NVL", costPrice: 13300, volume: 30000, purchaseDate: "20/02/2025" },
];

export const INITIAL_CASH = 100429628; // in VND (Odd digits to maintain realistic odd trailing cash and NAV)

// Trái phiếu nắm giữ: đa dạng hóa danh mục ngoài cổ phiếu/chứng chỉ quỹ.
// Bao gồm cả Trái phiếu Chính phủ (an toàn, lãi suất thấp hơn) và Trái phiếu Doanh nghiệp
// (rủi ro & lãi suất cao hơn, đa ngành: Ngân hàng, Bất động sản, Năng lượng).
export const INITIAL_BONDS: BondHolding[] = [
  {
    symbol: "GB0525_10Y",
    name: "Trái phiếu Chính phủ Việt Nam kỳ hạn 10 năm",
    bondType: "Chính phủ",
    sector: "Trái phiếu Chính phủ",
    faceValue: 100000,
    couponRate: 3.2,
    maturityDate: "15/05/2034",
    purchaseDate: "15/05/2024",
    costPrice: 100000,
    currentPrice: 101200,
    volume: 8000, // 800,000,000 VND mệnh giá
  },
  {
    symbol: "TCB12303",
    name: "Trái phiếu Ngân hàng TMCP Kỹ Thương Việt Nam (Techcombank)",
    bondType: "Doanh nghiệp",
    sector: "Ngân hàng",
    faceValue: 100000,
    couponRate: 7.5,
    maturityDate: "20/03/2028",
    purchaseDate: "20/03/2025",
    costPrice: 100000,
    currentPrice: 100850,
    volume: 6000, // 600,000,000 VND mệnh giá
  },
  {
    symbol: "VHM12402",
    name: "Trái phiếu CTCP Vinhomes",
    bondType: "Doanh nghiệp",
    sector: "Bất động sản",
    faceValue: 100000,
    couponRate: 9.8,
    maturityDate: "10/09/2027",
    purchaseDate: "10/09/2024",
    costPrice: 99500,
    currentPrice: 100100,
    volume: 5000, // 500,000,000 VND mệnh giá
  },
];

// Vốn ban đầu được TÍNH TOÁN trực tiếp từ danh mục thật (cổ phiếu + trái phiếu + tiền mặt),
// đảm bảo luôn khớp 100% với ROI thực tế, không cần khai báo số liệu cố định dễ sai lệch.
function calculateStartingCapital(
  stocks: StockHolding[],
  bonds: BondHolding[],
  cash: number
): number {
  const stockCost = stocks.reduce((sum, h) => sum + h.costPrice * h.volume, 0);
  const bondCost = bonds.reduce((sum, b) => sum + b.costPrice * b.volume, 0);
  return stockCost + bondCost + cash;
}

export const STARTING_CAPITAL = calculateStartingCapital(INITIAL_PORTFOLIO, INITIAL_BONDS, INITIAL_CASH);
export const TARGET_NAV = 15000000000;

// Generate 650+ transaction history items concentrated across the years 2024, 2025, 2026.
export function generateMockTransactionHistory(portfolio: StockHolding[]): Transaction[] {
  const transactions: Transaction[] = [];
  const tickers = TICKERS_RAW.map(t => t.symbol);
  const actionTypes: Array<"BUY" | "SELL"> = ["BUY", "SELL", "BUY", "BUY"];
  
  // Start on January 15, 2024 to satisfy "2024, 2025, 2026" requirement
  let dt = new Date(2024, 0, 15);
  const today = new Date("2026-06-17");

  for (let i = 0; i < 720; i++) {
    // Distribute spacing to cover 2.5 years evenly
    dt.setHours(dt.getHours() + Math.floor(Math.random() * 20) + 6);
    if (dt.getDay() === 0) dt.setDate(dt.getDate() + 1); // skip Sunday
    if (dt.getDay() === 6) dt.setDate(dt.getDate() + 2); // skip Saturday

    if (dt.getTime() > today.getTime()) {
      break;
    }

    const symbol = tickers[Math.floor(Math.random() * tickers.length)];
    const meta = TICKERS_RAW.find(t => t.symbol === symbol)!;
    const type = actionTypes[Math.floor(Math.random() * actionTypes.length)];
    const volume = (Math.floor(Math.random() * 19) + 1) * 500; // block multiples of 500
    
    // Price factoring reference price & historical drifts across 2024, 2025, 2026
    const yearBias = 1 + (dt.getFullYear() - 2024) * 0.07;
    const rawPrice = meta.ref * yearBias * (0.85 + Math.random() * 0.3);
    const price = Math.round(rawPrice * 10) * 100; // complete price in VND

    const value = price * volume;
    const fee = Math.round(value * 0.0015);

    transactions.push({
      id: `TX-${200000 + i}`,
      date: dt.toISOString().split("T")[0] + " " + dt.toTimeString().split(" ")[0].substring(0, 5),
      symbol,
      type,
      price,
      volume,
      value,
      feeRate: 0.15,
      fee,
      status: "COMPLETE",
    });
  }

  // Sort descending by date so newer trades surface first
  return transactions.sort((a, b) => b.date.localeCompare(a.date));
}

// Corporate news notification feed
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: "N1", time: "2026-06-17 08:00", title: "VN-INDEX bứt tốc vượt ngưỡng 1.800 điểm", content: "Chỉ số VN-INDEX mở cửa bùng nổ, chính thức vượt qua mốc lịch sử 1.800 điểm với thanh khoản lớn dẫn dắt bởi nhóm cổ phiếu Công nghệ FPT và nhóm Ngân hàng thương mại.", category: "MARKET", unread: true },
  { id: "N2", time: "2026-06-16 17:30", title: "FPT công bố kết quả kinh doanh kỷ lục", content: "Tập đoàn FPT công bố lợi nhuận trước thuế quý 1/2026 tăng trưởng 28.5% so với cùng kỳ, tiếp tục giữ vững vị thế đầu ngành chuyển đổi số toàn cầu.", category: "MARKET", unread: true },
  { id: "N3", time: "2026-06-15 09:15", title: "STB hoàn thành xử lý nợ xấu Trầm Bê", content: "Ngân hàng TMCP Sài Gòn Thương Tín (Sacombank) chính thức thông báo hoàn thành dứt điểm đề án tái cơ cấu, tăng mạnh sức mua room ngoại.", category: "CORPORATE", unread: false },
  { id: "N4", time: "2026-06-14 11:00", title: "Cổ đông lớn VCB chi trả cổ tức tiền mặt 20%", content: "Hội đồng quản trị Ngân hàng Vietcombank (VCB) phê duyệt thời gian chốt quyền nhận cổ tức bằng tiền mặt tỷ lệ 20% (2.000đ/cổ phiếu). Ngày giao dịch không hưởng quyền là 30/06/2026.", category: "CORPORATE", unread: false },
  { id: "N5", time: "2026-06-12 14:00", title: "MWG tiếp tục mở rộng chuỗi EraBlue tại Indonesia", content: "Thế giới di động (MWG) đạt thỏa thuận chiến lược mở rộng thêm 100 cửa hàng điện máy EraBlue, tăng trưởng kỳ vọng xuất khẩu dịch vụ xuất sắc.", category: "CORPORATE", unread: false },
  { id: "N6", time: "2026-06-10 09:00", title: "VHM bàn giao vượt tiến độ phân khu Royal Wave", content: "CTCP Vinhomes công bố đạt doanh thu vượt kế hoạch nhờ ghi nhận bàn giao đợt lớn tại dự án trọng điểm phía Đông.", category: "CORPORATE", unread: false },
  { id: "N7", time: "2026-06-08 16:45", title: "Tổng công ty Khí VN (GAS) đặt kế hoạch doanh thu tỷ USD", content: "Hội đồng cổ đông GAS nhất trí nâng chỉ tiêu phát triển kho cảng khí hóa lỏng LNG Thị Vải giai đoạn 2.", category: "CORPORATE", unread: false },
  { id: "N8", time: "2026-06-05 10:30", title: "Hệ thống KRX chính thức triển khai giao dịch T+0", content: "Sở Giao dịch Chứng khoán TP.HCM (HOSE) thông báo diễn tập toàn hệ thống chuẩn bị chính thức nâng cấp chu kỳ thanh toán T+0 và bán khống.", category: "MARKET", unread: false },
];

export function generateExtraNotifications(): NotificationItem[] {
  const extra: NotificationItem[] = [...INITIAL_NOTIFICATIONS];
  const sampleTitles = [
    { title: "Cổ tức cổ phiếu PNJ tỷ lệ 10:1", content: "PNJ thông báo chốt danh sách chia cổ tức bằng cổ phiếu thưởng năm 2025 tỷ lệ 10:1.", category: "CORPORATE" },
    { title: "VGI tăng trần liên tiếp 3 phiên", content: "Cổ phiếu Viettel Global (VGI) tiếp tục bứt phá ngoạn mục tăng kịch trần Upcom nhờ lợi nhuận từ các thị trường Châu Phi và Đông Nam Á vượt kỳ vọng.", category: "MARKET" },
    { title: "BSR bảo dưỡng thành công Nhà máy lọc dầu Dung Quất", content: "Lọc hóa dầu Bình Sơn hoàn thành đợt bảo dưỡng tổng thể lần thứ 5 vượt tiến độ 4 ngày, tiết kiệm hàng triệu USD.", category: "CORPORATE" },
    { title: "ETF FUEVFVND thu hút dòng vốn ngoại hơn 500 tỷ VND", content: "Khối nhà đầu tư Thái Lan và Hàn Quốc tiếp tục gia tăng chứng chỉ quỹ Diamond trong tuần giao dịch qua.", category: "MARKET" },
    { title: "Cảnh báo bảo mật hệ thống Trading", content: "Hệ thống ghi nhận hoạt động nâng cấp chính sách xác thực giao dịch qua Smart OTP để nâng cao bảo mật tài khoản cho khách hàng.", category: "SYSTEM" },
    { title: "VIC phát hành thành công 500 triệu USD trái phiếu quốc tế", content: "Tập đoàn Vingroup niêm yết thành công trái phiếu chuyển đổi tại sàn giao dịch Singapore (SGX).", category: "CORPORATE" },
    { title: "SSI mở rộng room ký quỹ Margin cho nhóm cổ phiếu VN30", content: "Để đáp ứng sức cầu mạnh mẽ của thị trường đầu năm, SSI thông báo tối ưu tỷ lệ tài trợ margin đối với các mã lớn.", category: "SYSTEM" },
  ];

  let dt = new Date("2026-06-04");
  for (let i = 0; i < 70; i++) {
    dt.setDate(dt.getDate() - Math.floor(Math.random() * 2) - 1);
    const sample = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
    extra.push({
      id: `N-EXTRA-${1000 + i}`,
      time: dt.toISOString().split("T")[0] + " " + (10 + (i % 8)) + ":20",
      title: sample.title,
      content: sample.content,
      category: sample.category as "MARKET" | "SYSTEM" | "CORPORATE",
      unread: false,
    });
  }

  return extra;
}

// Corporate rights database events
export const CORPORATE_EVENTS_FEED: CorporateEvent[] = [
  {
    id: "E-1",
    date: "2026-06-25",
    symbol: "FPT",
    type: "BONUS_SHARES",
    title: "Nhận cổ phiếu thưởng tỷ lệ 20:3",
    description: "Nhận cổ phiếu thưởng phát hành từ nguồn vốn chủ sở hữu tỷ lệ 20:3. Người sở hữu 20 cổ phiếu sẽ được nhận 3 cổ phiếu mới.",
    ratio: "20:3",
    applied: false,
  },
  {
    id: "E-2",
    date: "2026-06-30",
    symbol: "VCB",
    type: "CASH_DIVIDEND",
    title: "Chi trả cổ tức tiền mặt 2,000đ/cp",
    description: "Chi trả cổ tức bằng tiền mặt năm 2025 tỷ lệ 20% (tương đương 2.000 VNĐ cho mỗi cổ phiếu đang nắm giữ).",
    valueAmount: 2000,
    applied: false,
  },
  {
    id: "E-3",
    date: "2026-07-05",
    symbol: "SSI",
    type: "RIGHTS_ISSUE",
    title: "Quyền mua cổ phiếu phát hành thêm tỷ lệ 10:1",
    description: "Thực hiện quyền mua cổ phiếu ưu đãi phát hành thêm tỷ lệ 10:1 với giá chiết khấu mạnh 15.000 VNĐ/cp.",
    ratio: "10:1",
    priceAmount: 15000,
    applied: false,
  },
  {
    id: "E-4",
    date: "2026-07-12",
    symbol: "VGI",
    type: "STOCK_SPLIT",
    title: "Chia tách cổ phiếu tỷ lệ 1:2",
    description: "Tổng CTCP Công trình Viettel thực hiện chia tách cổ phiếu tỷ lệ 1:2 để gia tăng tính thanh khoản thị trường.",
    ratio: "1:2",
    applied: false,
  },
];

// Historical valuation tracks with smart backward calculation to match the live total asset value exactly
export function generateChartHistory(currentNAV: number = 17500000000, dayOffset: number = 0): {
  date: string;
  vnindex: number;
  nav: number;
  profit: number;
}[] {
  const history = [];
  let nav = currentNAV;
  let currentVN = 1302.4; // ending VNINDEX

  const steps = 180;
  const dt = new Date("2026-06-17");
  dt.setDate(dt.getDate() + dayOffset);

  for (let i = 0; i < steps; i++) {
    const dateStr = dt.toISOString().split("T")[0];

    // Unshift to generate in chronologically forward order
    history.unshift({
      date: dateStr,
      vnindex: Math.round(currentVN * 10) / 10,
      nav: Math.round(nav),
      profit: Math.round((Math.random() - 0.48) * 85000000),
    });

    // Step backward in time
    const dayChangeVN = (Math.random() - 0.46) * 8;
    currentVN = currentVN - dayChangeVN;

    const dayChangeNAV = (Math.random() - 0.45) * 45000000 + (dayChangeVN * 1500000);
    nav = nav - dayChangeNAV;

    dt.setDate(dt.getDate() - 1);
    while (dt.getDay() === 0 || dt.getDay() === 6) {
      dt.setDate(dt.getDate() - 1);
    }
  }

  // Force the very last point to match the present moment exactly
  const lastIndex = history.length - 1;
  if (lastIndex >= 0) {
    const latestDate = new Date("2026-06-17");
    latestDate.setDate(latestDate.getDate() + dayOffset);
    history[lastIndex] = {
      date: latestDate.toISOString().split("T")[0],
      vnindex: 1302.4 + (dayOffset * 3.5), // Drifts realistically over simulated days
      nav: Math.round(currentNAV),
      profit: Math.round((currentNAV - 16719529628) * 0.08), // Represent some corresponding profit segment
    };
  }

  return history;
}

// Hist Candles for graph
export function generateStockHistoryCandles(refPrice: number, days: number = 30, dayOffset: number = 0): {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}[] {
  const candles = [];
  const dt = new Date();
  dt.setDate(dt.getDate() + dayOffset); // Shift the current date forward by dayOffset
  dt.setDate(dt.getDate() - days);

  let price = refPrice;
  for (let i = 0; i < days; i++) {
    dt.setDate(dt.getDate() + 1);
    if (dt.getDay() === 0 || dt.getDay() === 6) continue;

    const open = Math.round((price + (Math.random() - 0.5) * 1.5) * 10) / 10;
    const close = Math.round((open + (Math.random() - 0.48) * 2.0) * 10) / 10;
    const high = Math.round((Math.max(open, close) + Math.random() * 1.2) * 10) / 10;
    const low = Math.round((Math.min(open, close) - Math.random() * 1.2) * 10) / 10;
    const volume = Math.floor(Math.random() * 400000) + 100000;

    candles.push({
      time: dt.toISOString().split("T")[0],
      open,
      high,
      low,
      close,
      volume,
    });
    price = close;
  }
  return candles;
}
