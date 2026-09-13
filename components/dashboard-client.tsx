"use client";

import Link from "next/link";
import { ArrowUpRight, CircleAlert, Database, FilePlus2, Globe2, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import type { Evaluation, MarketPolicy } from "@/lib/types";
import { AppShell } from "./app-shell";
import { useLocale } from "./app-providers";

const verdictLabel = (value: Evaluation["verdict"]) => value === "NO_GO" ? "NO-GO" : value;

export function DashboardClient({ evaluations, markets, snapshotAt }: { evaluations: Evaluation[]; markets: MarketPolicy[]; snapshotAt: string }) {
  const { t } = useLocale();
  return (
    <AppShell title={t("任务中心", "Mission control")} action={<Link href="/new" className="button primary"><FilePlus2 size={16}/>{t("新建评估", "New assessment")}</Link>}>
      <section className="command-hero">
        <div className="hero-copy">
          <span className="live-chip"><span className="status-dot" />{t("情报快照已就绪", "Intelligence snapshot ready")}</span>
          <h2>{t("把产品判断，变成一条可验证的证据链。", "Turn product judgment into a verifiable evidence chain.")}</h2>
          <p>{t("上传成品图与规格，Agent 将监管、竞品、贸易和供应链信号汇总为可复现的机会评估。", "Upload a product image and specifications. The agent turns regulatory, competitive, trade and supply-chain signals into a reproducible opportunity assessment.")}</p>
          <div className="hero-actions"><Link href="/new" className="button primary large"><Sparkles size={17}/>{t("评估一个产品", "Assess a product")}</Link><Link href="/evaluations/demo-uae-aero" className="button quiet large">{t("查看示例报告", "View sample report")}<ArrowUpRight size={17}/></Link></div>
        </div>
        <div className="signal-console" aria-label={t("数据资产摘要", "Data asset summary")}>
          <div className="console-head"><span>{t("当前数据面", "Current data surface")}</span><small>{t("固定快照", "Fixed snapshot")}</small></div>
          <div className="console-stat"><strong>43</strong><span>{t("监管市场", "Regulated markets")}</span><small>7 {t("已启用", "enabled")}</small></div>
          <div className="console-stat"><strong>35,703</strong><span>{t("标准产品记录", "Canonical products")}</span><small>42,474 {t("来源页", "source pages")}</small></div>
          <div className="console-stat"><strong>2,822</strong><span>{t("品牌索引", "Indexed brands")}</span><small>{t("每周刷新", "Weekly refresh")}</small></div>
          <div className="console-foot"><RefreshCw size={14}/>{t("快照时间", "Snapshot")} · {new Date(snapshotAt).toLocaleDateString()}</div>
        </div>
      </section>

      <section className="metric-strip" id="data">
        <div><Globe2/><span>{t("市场范围", "Market coverage")}</span><strong>{markets.length}</strong><small>{t("当前启用", "currently enabled")}</small></div>
        <div><Database/><span>{t("证据类型", "Evidence types")}</span><strong>7</strong><small>{t("统一适配", "normalized adapters")}</small></div>
        <div><ShieldCheck/><span>{t("合规硬门槛", "Compliance gates")}</span><strong>ON</strong><small>{t("覆盖评分结论", "overrides verdict")}</small></div>
        <div><CircleAlert/><span>{t("数据告警", "Data warnings")}</span><strong>3</strong><small>{t("透明展示", "shown transparently")}</small></div>
      </section>

      <section className="section-block">
        <div className="section-heading"><div><h2>{t("最近评估", "Recent assessments")}</h2><p>{t("每条记录都绑定输入、快照、评分版本和专家反馈。", "Every record binds inputs, snapshot, scoring version and expert feedback.")}</p></div><Link href="/new" className="text-link">{t("创建新任务", "Create task")}<ArrowUpRight size={15}/></Link></div>
        <div className="assessment-list">
          {evaluations.map((evaluation) => <Link href={`/evaluations/${evaluation.id}`} className="assessment-row" key={evaluation.id}>
            <div className="product-avatar"><span>{evaluation.product.brand?.slice(0, 1) || "D"}</span></div>
            <div className="assessment-name"><strong>{evaluation.product.name}</strong><span>{evaluation.product.brand || t("未命名品牌", "Unbranded")} · {evaluation.product.puffs.toLocaleString()} PUFFS</span></div>
            <div className="market-cell"><span>{markets.find((m) => m.code === evaluation.product.market)?.flag}</span><div><strong>{t(markets.find((m) => m.code === evaluation.product.market)?.nameZh || evaluation.product.market, markets.find((m) => m.code === evaluation.product.market)?.nameEn || evaluation.product.market)}</strong><small>{evaluation.product.market}</small></div></div>
            <div className="score-cell"><span className={`verdict ${evaluation.verdict.toLowerCase()}`}>{verdictLabel(evaluation.verdict)}</span><strong>{evaluation.score}</strong><small>/ 100</small></div>
            <div className="confidence-cell"><span>{t("置信度", "Confidence")}</span><div className="meter"><i style={{width:`${evaluation.confidence}%`}}/></div><small>{evaluation.confidence}%</small></div>
            <ArrowUpRight className="row-arrow" size={18}/>
          </Link>)}
        </div>
      </section>

      <section className="data-footnote" id="signals"><CircleAlert size={17}/><div><strong>{t("数据质量提示", "Data quality notice")}</strong><p>{t("海关数据更新至 2024-07；零售商与趋势信号暂无可用记录。系统会降低置信度，而不是补写缺失事实。", "Customs data is current to 2024-07; retailer and trend-signal datasets have no usable records. The system lowers confidence instead of inventing missing facts.")}</p></div></section>
    </AppShell>
  );
}
