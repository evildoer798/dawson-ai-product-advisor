export type Locale = "zh" | "en";
export type Verdict = "GO" | "REVIEW" | "NO_GO";
export type ConfidenceBand = "LOW" | "MEDIUM" | "HIGH";
export type Quality = "high" | "medium" | "low";

export type ProductInput = {
  name: string;
  market: string;
  brand?: string;
  puffs: number;
  eLiquidMl: number;
  nicotineMgMl: number;
  flavor: string;
  retailPriceUsd: number;
  batteryMah?: number;
  charging?: string;
  dimensions?: string;
  targetCostUsd?: number;
  moq?: number;
  channel?: string;
  visualTraits: string[];
};

export type Evidence = {
  id: string;
  titleZh: string;
  titleEn: string;
  summaryZh: string;
  summaryEn: string;
  source: string;
  sourceUrl: string;
  snapshotAt: string;
  recordAt: string;
  market: string;
  quality: Quality;
  usedInScore: boolean;
};

export type ScoreDimension = {
  key: "demand" | "competition" | "differentiation" | "compliance" | "supply" | "commercial";
  labelZh: string;
  labelEn: string;
  score: number;
  weight: number;
  status: "scored" | "insufficient";
  rationaleZh: string;
  rationaleEn: string;
};

export type ScoringProfile = {
  market: string;
  version: string;
  enabled: boolean;
  goThreshold: number;
  reviewThreshold: number;
  weights: Record<ScoreDimension["key"], number>;
};

export type Evaluation = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: "processing" | "complete" | "failed";
  product: ProductInput;
  images: string[];
  score: number;
  verdict: Verdict;
  confidence: number;
  confidenceBand: ConfidenceBand;
  completeness: number;
  compliancePass: boolean;
  hardFails: string[];
  dimensions: ScoreDimension[];
  evidence: Evidence[];
  dataWarningsZh: string[];
  dataWarningsEn: string[];
  opportunitiesZh: string[];
  opportunitiesEn: string[];
  risksZh: string[];
  risksEn: string[];
  assumptionsZh: string[];
  assumptionsEn: string[];
  dataVersion: string;
  scoringVersion: string;
  modelVersion: string;
  analysisMode: "demo" | "openai";
  feedback?: {
    decision: "accepted" | "rejected";
    finalAction: "go" | "review" | "no-go";
    note: string;
    createdAt: string;
  };
};

export type MarketPolicy = {
  code: string;
  nameZh: string;
  nameEn: string;
  flag: string;
  legal: boolean;
  maxNicotineMgMl: number;
  maxELiquidMl: number;
  bannedFlavorKeywords: string[];
  summaryZh: string;
  summaryEn: string;
  sourceUrl: string;
  recordAt: string;
};

export type Competitor = {
  id: string;
  brand: string;
  name: string;
  markets: string[];
  puffs: number;
  eLiquidMl: number;
  retailPriceUsd: number;
  features: string[];
};

export type TradePoint = { year: number; valueUsdM: number };

export type MarketSnapshot = {
  policy: MarketPolicy;
  competitors: Competitor[];
  trade: TradePoint[];
  supplierCount: number;
  factoryCount: number;
  newsSignals: number;
};
