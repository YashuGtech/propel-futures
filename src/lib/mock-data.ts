export type Package = {
  id: string;
  size: number;
  model: "1-Step" | "2-Step" | "Instant";
  profitTarget: number; // %
  dailyDD: number; // %
  maxDD: number; // %
  split: number; // %
  fee: number;
  popular?: boolean;
};

export const PACKAGES: Package[] = [
  { id: "p-5k-2s", size: 5000, model: "2-Step", profitTarget: 8, dailyDD: 5, maxDD: 10, split: 80, fee: 49 },
  { id: "p-10k-2s", size: 10000, model: "2-Step", profitTarget: 8, dailyDD: 5, maxDD: 10, split: 80, fee: 89 },
  { id: "p-25k-2s", size: 25000, model: "2-Step", profitTarget: 8, dailyDD: 5, maxDD: 10, split: 85, fee: 179, popular: true },
  { id: "p-50k-2s", size: 50000, model: "2-Step", profitTarget: 8, dailyDD: 5, maxDD: 10, split: 85, fee: 299 },
  { id: "p-100k-2s", size: 100000, model: "2-Step", profitTarget: 8, dailyDD: 5, maxDD: 10, split: 90, fee: 549 },
  { id: "p-10k-1s", size: 10000, model: "1-Step", profitTarget: 10, dailyDD: 4, maxDD: 6, split: 80, fee: 119 },
  { id: "p-25k-1s", size: 25000, model: "1-Step", profitTarget: 10, dailyDD: 4, maxDD: 6, split: 80, fee: 229 },
  { id: "p-100k-1s", size: 100000, model: "1-Step", profitTarget: 10, dailyDD: 4, maxDD: 6, split: 85, fee: 699 },
  { id: "p-10k-in", size: 10000, model: "Instant", profitTarget: 0, dailyDD: 3, maxDD: 5, split: 70, fee: 199 },
  { id: "p-25k-in", size: 25000, model: "Instant", profitTarget: 0, dailyDD: 3, maxDD: 5, split: 70, fee: 399 },
];

export type Instrument = {
  symbol: string;
  name: string;
  type: "forex" | "crypto" | "metal" | "index";
  basePrice: number;
  spread: number;
  digits: number;
};

export const INSTRUMENTS: Instrument[] = [
  // Forex majors
  { symbol: "EURUSD", name: "Euro / US Dollar", type: "forex", basePrice: 1.0865, spread: 0.0001, digits: 5 },
  { symbol: "GBPUSD", name: "British Pound / US Dollar", type: "forex", basePrice: 1.2734, spread: 0.0001, digits: 5 },
  { symbol: "USDJPY", name: "US Dollar / Japanese Yen", type: "forex", basePrice: 151.42, spread: 0.01, digits: 3 },
  { symbol: "USDCHF", name: "US Dollar / Swiss Franc", type: "forex", basePrice: 0.9024, spread: 0.0001, digits: 5 },
  { symbol: "AUDUSD", name: "Australian / US Dollar", type: "forex", basePrice: 0.6543, spread: 0.0001, digits: 5 },
  { symbol: "NZDUSD", name: "NZ Dollar / US Dollar", type: "forex", basePrice: 0.5987, spread: 0.0001, digits: 5 },
  { symbol: "USDCAD", name: "US Dollar / Canadian Dollar", type: "forex", basePrice: 1.3712, spread: 0.0001, digits: 5 },
  { symbol: "EURJPY", name: "Euro / Japanese Yen", type: "forex", basePrice: 164.51, spread: 0.01, digits: 3 },
  { symbol: "GBPJPY", name: "British Pound / Japanese Yen", type: "forex", basePrice: 192.89, spread: 0.01, digits: 3 },
  { symbol: "EURGBP", name: "Euro / British Pound", type: "forex", basePrice: 0.8534, spread: 0.0001, digits: 5 },
  // Crypto
  { symbol: "BTCUSD", name: "Bitcoin", type: "crypto", basePrice: 67234.5, spread: 2.5, digits: 2 },
  { symbol: "ETHUSD", name: "Ethereum", type: "crypto", basePrice: 3542.1, spread: 0.8, digits: 2 },
  { symbol: "BNBUSD", name: "BNB", type: "crypto", basePrice: 612.4, spread: 0.3, digits: 2 },
  { symbol: "SOLUSD", name: "Solana", type: "crypto", basePrice: 178.9, spread: 0.15, digits: 2 },
  { symbol: "XRPUSD", name: "XRP", type: "crypto", basePrice: 0.5421, spread: 0.0005, digits: 4 },
  // Metals
  { symbol: "XAUUSD", name: "Gold / USD", type: "metal", basePrice: 2342.1, spread: 0.3, digits: 2 },
  { symbol: "XAGUSD", name: "Silver / USD", type: "metal", basePrice: 27.45, spread: 0.03, digits: 3 },
  // Indices
  { symbol: "US30", name: "Dow Jones", type: "index", basePrice: 38901.2, spread: 2, digits: 1 },
  { symbol: "NAS100", name: "Nasdaq 100", type: "index", basePrice: 17234.5, spread: 1.5, digits: 1 },
];

export const CRYPTO_ADDRESSES = {
  USDT_TRC20: "TXYZab1c2D3eF4gH5iJ6kL7mN8oP9qR0sT",
  USDT_ERC20: "0xA1b2C3d4E5f6789012345abcdef67890ABCdef12",
  BTC: "bc1qx2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p",
  ETH: "0xB2c3D4e5F6789012345aBcDeF67890ABCDEF1234",
};
