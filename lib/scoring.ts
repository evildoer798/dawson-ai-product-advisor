import { DATA_VERSION, SNAPSHOT_AT, defaultProfile, snapshots } from "./snapshot";
import type { Evaluation, Evidence, ProductInput, ScoreDimension, Verdict } from "./types";

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, Math.round(value)));
const dimension = (key: ScoreDimension["key"], labelZh: string, labelEn: string, score: number, weight: number, rationaleZh: string, rationaleEn: string, status: ScoreDimension["status"] = "scored"): ScoreDimension => ({ key, labelZh, labelEn, score: clamp(score), weight, rationaleZh, rationaleEn, status });

export function scoreProduct(product: ProductInput, profile = defaultProfile(product.market), images: string[] = [], id?: string): Evaluation {
  const snap = snapshots[product.market] ?? snapshots.AE;
  const tradeStart = snap.trade[0].valueUsdM;
  const tradeEnd = snap.trade.at(-1)?.valueUsdM ?? tradeStart;
  const growth = (tradeEnd - tradeStart) / Math.max(1, tradeStart);
  const demandScore = clamp(58 + growth * 55 + Math.min(12, snap.newsSignals / 2));

  const ranked = snap.competitors.map((c) => ({ ...c, distance: Math.abs(c.puffs - product.puffs) / Math.max(c.puffs, product.puffs) + Math.abs(c.eLiquidMl - product.eLiquidMl) / Math.max(c.eLiquidMl, product.eLiquidMl) }));
  ranked.sort((a, b) => a.distance - b.distance);
  const nearest = ranked[0];
  const competitionScore = clamp(78 - snap.competitors.length * 3 + (nearest ? nearest.distance * 35 : 10));

  const featureNovelty = Math.min(18, product.visualTraits.length * 4);
  const formatNovelty = nearest ? Math.min(18, nearest.distance * 28) : 14;
  const differentiationScore = clamp(54 + featureNovelty + formatNovelty);

  const hardFails: string[] = [];
  if (!snap.policy.legal) hardFails.push("Market entry is not permitted for this product category.");
  if (product.nicotineMgMl > snap.policy.maxNicotineMgMl) hardFails.push(`Nicotine ${product.nicotineMgMl} mg/ml exceeds limit ${snap.policy.maxNicotineMgMl} mg/ml.`);
  if (product.eLiquidMl > snap.policy.maxELiquidMl) hardFails.push(`E-liquid ${product.eLiquidMl} ml exceeds limit ${snap.policy.maxELiquidMl} ml.`);
  const flavor = product.flavor.toLowerCase();
  const bannedFlavor = snap.policy.bannedFlavorKeywords.find((keyword) => flavor.includes(keyword.toLowerCase()));
  if (bannedFlavor) hardFails.push(`Flavor category matches a restricted keyword: ${bannedFlavor}.`);
  const complianceScore = hardFails.length ? Math.max(5, 32 - hardFails.length * 8) : 88;

  const supplyScore = clamp(55 + Math.min(22, snap.supplierCount / 2) + Math.min(12, snap.factoryCount));
  const commercialComplete = product.targetCostUsd != null && product.targetCostUsd > 0;
  const grossMargin = commercialComplete ? (product.retailPriceUsd - product.targetCostUsd!) / product.retailPriceUsd : null;
  const priceDistance = nearest ? Math.abs(product.retailPriceUsd - nearest.retailPriceUsd) / nearest.retailPriceUsd : 0.1;
  const commercialScore = commercialComplete ? clamp(45 + (grossMargin ?? 0) * 55 - priceDistance * 20) : 50;

  const dimensions: ScoreDimension[] = [
    dimension("demand", "市场需求", "Market demand", demandScore, profile.weights.demand, `设备贸易额由 ${tradeStart}M 美元变化至 ${tradeEnd}M 美元，快照内有 ${snap.newsSignals} 条市场信号。`, `Device trade value moved from USD ${tradeStart}M to ${tradeEnd}M with ${snap.newsSignals} market signals in the snapshot.`),
    dimension("competition", "竞争机会", "Competitive whitespace", competitionScore, profile.weights.competition, nearest ? `最接近的竞品是 ${nearest.brand} ${nearest.name}；当前市场快照包含 ${snap.competitors.length} 个直接对标产品。` : "当前快照缺少直接竞品，结论需补充验证。", nearest ? `The nearest benchmark is ${nearest.brand} ${nearest.name}; ${snap.competitors.length} direct comparables are present.` : "No direct comparator is available in the snapshot; further validation is required."),
    dimension("differentiation", "产品差异化", "Product differentiation", differentiationScore, profile.weights.differentiation, `基于 ${product.visualTraits.length} 项已确认视觉特征和规格距离计算。`, `Calculated from ${product.visualTraits.length} confirmed visual traits and specification distance.`),
    dimension("compliance", "合规可行性", "Compliance feasibility", complianceScore, profile.weights.compliance, hardFails.length ? `发现 ${hardFails.length} 项合规硬门槛。` : "未发现与当前快照规则直接冲突的参数。", hardFails.length ? `${hardFails.length} compliance hard gate(s) were triggered.` : "No direct conflict with the current policy snapshot was detected."),
    dimension("supply", "供应链可行性", "Supply-chain feasibility", supplyScore, profile.weights.supply, `快照包含 ${snap.supplierCount} 条供应商线索及 ${snap.factoryCount} 家工厂参考。`, `${snap.supplierCount} supplier leads and ${snap.factoryCount} factory references are available.`),
    dimension("commercial", "商业可行性", "Commercial feasibility", commercialScore, profile.weights.commercial, commercialComplete ? `按目标零售价和成本估算毛利空间为 ${Math.round((grossMargin ?? 0) * 100)}%。` : "未填写目标成本，本维度仅使用价格带，证据不足。", commercialComplete ? `Indicative gross-margin headroom is ${Math.round((grossMargin ?? 0) * 100)}% from target retail and cost.` : "Target cost is missing; this dimension uses price-band fit only and is evidence-limited.", commercialComplete ? "scored" : "insufficient")
  ];

  const weighted = dimensions.reduce((sum, d) => sum + d.score * d.weight, 0) / Math.max(1, dimensions.reduce((sum, d) => sum + d.weight, 0));
  const score = hardFails.length ? Math.min(39, clamp(weighted)) : clamp(weighted);
  const verdict: Verdict = hardFails.length || score < profile.reviewThreshold ? "NO_GO" : score >= profile.goThreshold ? "GO" : "REVIEW";

  const suppliedOptional = [product.batteryMah, product.charging, product.targetCostUsd, product.moq, product.channel, product.brand].filter((v) => v !== undefined && v !== "").length;
  const completeness = clamp(68 + suppliedOptional * 4.5);
  const freshness = product.market === "AE" || product.market === "SA" ? 66 : 72;
  const sourceQuality = 74;
  const confidence = Math.min(69, clamp(completeness * 0.5 + freshness * 0.3 + sourceQuality * 0.2));

  const evidence: Evidence[] = [
    { id: "policy", titleZh: `${snap.policy.nameZh}监管规则`, titleEn: `${snap.policy.nameEn} regulatory rules`, summaryZh: snap.policy.summaryZh, summaryEn: snap.policy.summaryEn, source: "Dawsen Policy Database", sourceUrl: snap.policy.sourceUrl, snapshotAt: SNAPSHOT_AT, recordAt: snap.policy.recordAt, market: product.market, quality: "high", usedInScore: true },
    { id: "customs", titleZh: "设备海关趋势", titleEn: "Device customs trend", summaryZh: `HS 85434000，${snap.trade[0].year}–${snap.trade.at(-1)?.year}。`, summaryEn: `HS 85434000, ${snap.trade[0].year}–${snap.trade.at(-1)?.year}.`, source: "Dawsen Customs Snapshot", sourceUrl: "https://dawsenai.com/information", snapshotAt: SNAPSHOT_AT, recordAt: "2024-07-31", market: product.market, quality: "medium", usedInScore: true },
    { id: "products", titleZh: "产品数据库对标", titleEn: "Product database benchmark", summaryZh: `从目标市场竞品快照中匹配 ${snap.competitors.length} 个直接对标。`, summaryEn: `${snap.competitors.length} direct benchmarks matched in the target-market snapshot.`, source: "Dawsen Product Database", sourceUrl: "https://dawsenai.com/information", snapshotAt: SNAPSHOT_AT, recordAt: "2026-09-08", market: product.market, quality: "medium", usedInScore: true },
    { id: "supply", titleZh: "供应链与工厂库", titleEn: "Supply chain and factory database", summaryZh: `${snap.supplierCount} 条供应商线索，${snap.factoryCount} 家工厂参考。`, summaryEn: `${snap.supplierCount} supplier leads and ${snap.factoryCount} factory references.`, source: "Dawsen Supply Chain", sourceUrl: "https://dawsenai.com/information", snapshotAt: SNAPSHOT_AT, recordAt: "2025-12-31", market: "CN", quality: "medium", usedInScore: true },
    { id: "retail", titleZh: "零售终端数据", titleEn: "Retail endpoint data", summaryZh: "当前快照无可用记录，未参与评分。", summaryEn: "No usable records in the current snapshot; excluded from scoring.", source: "Dawsen Retailers", sourceUrl: "https://dawsenai.com/information", snapshotAt: SNAPSHOT_AT, recordAt: "2026-09-12", market: product.market, quality: "low", usedInScore: false }
  ];

  const now = new Date().toISOString();
  const isGrowing = growth > 0.08;
  return {
    id: id ?? `eval-${Date.now().toString(36)}`,
    createdAt: now,
    updatedAt: now,
    status: "complete",
    product,
    images,
    score,
    verdict,
    confidence,
    confidenceBand: confidence >= 70 ? "HIGH" : confidence >= 50 ? "MEDIUM" : "LOW",
    completeness,
    compliancePass: hardFails.length === 0,
    hardFails,
    dimensions,
    evidence,
    dataWarningsZh: ["首页摘要与完整产品数据库的记录数量不一致。", "海关数据更新至 2024-07，不能作为实时需求数据。", "零售商和趋势信号数据集暂无可用记录。"],
    dataWarningsEn: ["Homepage summary and full product database record counts are inconsistent.", "Customs data is dated 2024-07 and should not be treated as real-time demand.", "Retailer and trend-signal datasets contain no usable records."],
    opportunitiesZh: [isGrowing ? "目标市场设备进口规模呈增长趋势。" : "目标市场仍有稳定的设备进口基础。", `产品与最近竞品在规格上的距离为 ${nearest ? nearest.distance.toFixed(2) : "未知"}。`, "现有供应链库能够支持初步工厂与资质核验。"],
    opportunitiesEn: [isGrowing ? "Target-market device imports show a growing trend." : "The target market retains a stable device-import base.", `Specification distance to the nearest comparator is ${nearest ? nearest.distance.toFixed(2) : "unknown"}.`, "Existing supply-chain data supports an initial factory and qualification check."],
    risksZh: [hardFails.length ? "存在会阻断市场准入的合规问题。" : "政策结论仍需在立项前由当地法律或合规人员复核。", "缺少真实销量、价格历史和消费者评价数据。", commercialComplete ? "成本与零售价仍是用户提供的目标值，并非成交数据。" : "缺少目标成本，商业可行性证据不足。"],
    risksEn: [hardFails.length ? "Compliance issues block market entry." : "Policy conclusions still require local legal or compliance review before commitment.", "Actual sales, price history and consumer-review data are unavailable.", commercialComplete ? "Cost and retail values are user targets, not observed transactions." : "Target cost is missing, limiting commercial-feasibility evidence."],
    assumptionsZh: ["产品类别为一次性电子烟。", "评估使用固定数据快照，不代表实时市场状态。", "评分表达相对机会，不构成销量保证。"],
    assumptionsEn: ["The product category is disposable vape.", "The assessment uses a fixed data snapshot, not live market state.", "The score expresses relative opportunity and is not a sales guarantee."],
    dataVersion: DATA_VERSION,
    scoringVersion: profile.version,
    modelVersion: process.env.OPENAI_MODEL || "deterministic-demo",
    analysisMode: process.env.OPENAI_API_KEY ? "openai" : "demo"
  };
}

export function demoEvaluation(): Evaluation {
  return scoreProduct({ name: "Dawsen Aero 15K", market: "AE", brand: "DAWSEN", puffs: 15000, eLiquidMl: 18, nicotineMgMl: 20, flavor: "Mint", retailPriceUsd: 17.9, batteryMah: 650, charging: "USB-C", dimensions: "88 × 48 × 24 mm", targetCostUsd: 6.2, moq: 10000, channel: "Specialty retail", visualTraits: ["dual display", "soft radius", "metallic finish", "battery indicator"] }, defaultProfile("AE"), [], "demo-uae-aero");
}
