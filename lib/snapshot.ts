import type { MarketSnapshot, ScoringProfile } from "./types";

export const SNAPSHOT_AT = "2026-09-12T08:00:00.000Z";
export const DATA_VERSION = "dawsen-snapshot-2026.09-demo";

const competitors = [
  { id: "c1", brand: "NOVA", name: "Arc 12000", markets: ["AE", "SA", "GB"], puffs: 12000, eLiquidMl: 18, retailPriceUsd: 16.9, features: ["curved body", "dual display", "usb-c"] },
  { id: "c2", brand: "VANTA", name: "Pulse 15000", markets: ["AE", "SA", "US"], puffs: 15000, eLiquidMl: 20, retailPriceUsd: 18.5, features: ["screen", "battery indicator", "usb-c"] },
  { id: "c3", brand: "LUMO", name: "Air 9000", markets: ["AE", "GB", "DE"], puffs: 9000, eLiquidMl: 14, retailPriceUsd: 13.9, features: ["compact", "soft-touch", "usb-c"] },
  { id: "c4", brand: "MIRA", name: "Cube 18000", markets: ["AE", "SA", "MX"], puffs: 18000, eLiquidMl: 22, retailPriceUsd: 19.9, features: ["square body", "large screen", "airflow"] },
  { id: "c5", brand: "RELX", name: "Infinity Go", markets: ["AE", "JP", "GB"], puffs: 6000, eLiquidMl: 10, retailPriceUsd: 14.5, features: ["minimal", "compact", "usb-c"] },
  { id: "c6", brand: "ZENA", name: "Crystal 10000", markets: ["SA", "AE", "MX"], puffs: 10000, eLiquidMl: 16, retailPriceUsd: 15.2, features: ["transparent shell", "light ring", "usb-c"] }
];

const policy = (
  code: string,
  nameZh: string,
  nameEn: string,
  flag: string,
  maxNicotineMgMl: number,
  maxELiquidMl: number,
  bannedFlavorKeywords: string[],
  summaryZh: string,
  summaryEn: string,
  recordAt = "2026-01-19"
) => ({
  code, nameZh, nameEn, flag, legal: true, maxNicotineMgMl, maxELiquidMl,
  bannedFlavorKeywords, summaryZh, summaryEn,
  sourceUrl: `https://dawsenai.com/information?market=${code}`,
  recordAt
});

export const snapshots: Record<string, MarketSnapshot> = {
  AE: {
    policy: policy("AE", "阿联酋", "United Arab Emirates", "🇦🇪", 20, 20, [], "电子烟可在指定渠道销售，需满足标签、警示和广告限制。", "Vape products may be sold through designated channels subject to labelling, warning and advertising restrictions."),
    competitors: competitors.filter((x) => x.markets.includes("AE")),
    trade: [{ year: 2022, valueUsdM: 41 }, { year: 2023, valueUsdM: 52 }, { year: 2024, valueUsdM: 64 }],
    supplierCount: 26, factoryCount: 10, newsSignals: 8
  },
  SA: {
    policy: policy("SA", "沙特阿拉伯", "Saudi Arabia", "🇸🇦", 20, 20, ["coffee", "coffee flavor", "咖啡", "vanilla", "香草", "cola", "可乐", "candy", "糖果", "alcohol", "酒"], "电子烟受严格监管；部分甜味、饮料及食品类风味禁止。", "Vape products are tightly regulated; several confectionery, beverage and food-associated flavours are prohibited."),
    competitors: competitors.filter((x) => x.markets.includes("SA")),
    trade: [{ year: 2022, valueUsdM: 28 }, { year: 2023, valueUsdM: 34 }, { year: 2024, valueUsdM: 39 }],
    supplierCount: 19, factoryCount: 10, newsSignals: 6
  },
  GB: {
    policy: policy("GB", "英国", "United Kingdom", "🇬🇧", 20, 2, [], "一次性电子烟受到禁令与包装规则变化影响，进入市场前需重新核验产品形态。", "Disposable vapes are affected by prohibition and packaging changes; product format requires renewed legal review.", "2026-08-20"),
    competitors: competitors.filter((x) => x.markets.includes("GB")),
    trade: [{ year: 2022, valueUsdM: 185 }, { year: 2023, valueUsdM: 213 }, { year: 2024, valueUsdM: 177 }],
    supplierCount: 31, factoryCount: 10, newsSignals: 15
  },
  US: {
    policy: policy("US", "美国", "United States", "🇺🇸", 50, 20, [], "产品需要满足联邦和州级市场准入要求，授权状态是核心门槛。", "Products must satisfy federal and state market-access requirements; authorization status is a core gate."),
    competitors: competitors.filter((x) => x.markets.includes("US")),
    trade: [{ year: 2022, valueUsdM: 620 }, { year: 2023, valueUsdM: 701 }, { year: 2024, valueUsdM: 655 }],
    supplierCount: 44, factoryCount: 10, newsSignals: 22
  },
  DE: {
    policy: policy("DE", "德国", "Germany", "🇩🇪", 20, 2, [], "适用欧盟烟草制品指令及德国税务、包装与销售要求。", "EU Tobacco Products Directive requirements apply together with German tax, packaging and sales rules."),
    competitors: competitors.filter((x) => x.markets.includes("DE")),
    trade: [{ year: 2022, valueUsdM: 92 }, { year: 2023, valueUsdM: 107 }, { year: 2024, valueUsdM: 101 }],
    supplierCount: 18, factoryCount: 10, newsSignals: 7
  },
  JP: {
    policy: policy("JP", "日本", "Japan", "🇯🇵", 0, 0, [], "含尼古丁烟油的商业销售受到严格限制，需单独确认产品路径。", "Commercial sale of nicotine e-liquid is heavily restricted and requires a separate product pathway review."),
    competitors: competitors.filter((x) => x.markets.includes("JP")),
    trade: [{ year: 2022, valueUsdM: 48 }, { year: 2023, valueUsdM: 55 }, { year: 2024, valueUsdM: 58 }],
    supplierCount: 12, factoryCount: 10, newsSignals: 5
  },
  MX: {
    policy: policy("MX", "墨西哥", "Mexico", "🇲🇽", 20, 20, [], "法规及执法环境波动较大，市场准入结论需要法律复核。", "The regulatory and enforcement environment is volatile; market-access conclusions require legal review."),
    competitors: competitors.filter((x) => x.markets.includes("MX")),
    trade: [{ year: 2022, valueUsdM: 21 }, { year: 2023, valueUsdM: 27 }, { year: 2024, valueUsdM: 30 }],
    supplierCount: 14, factoryCount: 10, newsSignals: 9
  }
};

export const marketList = Object.values(snapshots).map((x) => x.policy);

export const defaultProfile = (market: string): ScoringProfile => ({
  market,
  version: "score-v1.0",
  enabled: true,
  goThreshold: 75,
  reviewThreshold: 55,
  weights: { demand: 25, competition: 20, differentiation: 15, compliance: 20, supply: 10, commercial: 10 }
});
