"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, ArrowLeft, Check, CheckCircle2, ChevronDown, CircleHelp, Download, ExternalLink, FileText, History, Info, Send, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import { CartesianGrid, Line, LineChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Evaluation, MarketSnapshot } from "@/lib/types";
import { AppShell } from "./app-shell";
import { useLocale } from "./app-providers";

const verdictCopy = {
  GO: ["建议进入验证", "Proceed to validation"],
  REVIEW: ["建议补充验证", "Further validation required"],
  NO_GO: ["暂不建议进入", "Do not proceed"]
} as const;

export function ReportView({ evaluation, snapshot }: { evaluation: Evaluation; snapshot: MarketSnapshot }) {
  const { t } = useLocale();
  const [feedbackOpen, setFeedbackOpen] = useState(Boolean(evaluation.feedback));
  const [feedbackSaved, setFeedbackSaved] = useState(Boolean(evaluation.feedback));
  const [saving, setSaving] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const radarData = evaluation.dimensions.map((item) => ({ subject: t(item.labelZh, item.labelEn), score: item.score, fullMark: 100 }));
  const nearest = [...snapshot.competitors].sort((a, b) => Math.abs(a.puffs - evaluation.product.puffs) - Math.abs(b.puffs - evaluation.product.puffs)).slice(0, 4);
  const verdict = verdictCopy[evaluation.verdict];

  const saveFeedback = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setFeedbackError("");
    const data = new FormData(event.currentTarget);
    const response = await fetch(`/api/evaluations/${evaluation.id}/feedback`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision: data.get("decision"), finalAction: data.get("finalAction"), note: data.get("note") }) });
    const body = await response.json();
    if (!response.ok) setFeedbackError(body.error || t("保存失败", "Could not save feedback"));
    else setFeedbackSaved(true);
    setSaving(false);
  };

  return (
    <AppShell title={t("评估报告", "Assessment report")} eyebrow={`${snapshot.policy.flag} ${t(snapshot.policy.nameZh, snapshot.policy.nameEn)} · ${evaluation.product.puffs.toLocaleString()} PUFFS`} action={<div className="report-actions"><Link href="/" className="button quiet"><ArrowLeft size={16}/>{t("返回", "Back")}</Link><a className="button primary" href={`/api/evaluations/${evaluation.id}/report.pdf`} target="_blank" rel="noreferrer"><Download size={16}/>{t("导出 PDF", "Export PDF")}</a></div>}>
      <section className={`decision-banner ${evaluation.verdict.toLowerCase()}`}>
        <div className="product-identity">
          {evaluation.images[0] ? <div className="report-product-image"><Image src={evaluation.images[0]} fill unoptimized alt={evaluation.product.name}/></div> : <div className="device-render" aria-label={t("示例产品图", "Sample product rendering")}><div className="device-screen"><span>{evaluation.product.puffs >= 1000 ? `${Math.round(evaluation.product.puffs / 1000)}K` : evaluation.product.puffs}</span><small>PUFFS</small></div><i/></div>}
          <div><span className="product-kicker">{evaluation.product.brand || t("未命名品牌", "Unbranded")} · {evaluation.product.market}</span><h2>{evaluation.product.name}</h2><p>{evaluation.product.eLiquidMl} ml · {evaluation.product.nicotineMgMl} mg/ml · {evaluation.product.flavor}</p></div>
        </div>
        <div className="decision-score"><div><strong>{evaluation.score}</strong><span>/100</span></div><p>{t(verdict[0], verdict[1])}</p><span className={`verdict ${evaluation.verdict.toLowerCase()}`}>{evaluation.verdict === "NO_GO" ? "NO-GO" : evaluation.verdict}</span></div>
        <div className="decision-context">
          <div><span>{t("置信度", "Confidence")}</span><strong>{evaluation.confidence}% · {t(evaluation.confidenceBand === "MEDIUM" ? "中等" : evaluation.confidenceBand === "LOW" ? "较低" : "较高", evaluation.confidenceBand)}</strong><div className="meter"><i style={{width:`${evaluation.confidence}%`}}/></div></div>
          <div><span>{t("数据完整度", "Data completeness")}</span><strong>{evaluation.completeness}%</strong><div className="meter neutral"><i style={{width:`${evaluation.completeness}%`}}/></div></div>
          <div className={evaluation.compliancePass ? "compliance-pass" : "compliance-fail"}>{evaluation.compliancePass ? <ShieldCheck/> : <ShieldAlert/>}<span>{t(evaluation.compliancePass ? "未触发合规硬门槛" : "已触发合规硬门槛", evaluation.compliancePass ? "No compliance hard gate" : "Compliance hard gate triggered")}</span></div>
        </div>
      </section>

      <div className="report-disclaimer"><Info size={15}/><span>{t("本报告基于固定数据快照，仅用于产品决策支持，不构成销量、利润或市场准入保证。", "This report uses a fixed data snapshot for product decision support only. It does not guarantee sales, profit or market access.")}</span><small>{evaluation.dataVersion}</small></div>

      {evaluation.hardFails.length > 0 && <section className="hard-fail"><ShieldAlert size={20}/><div><h3>{t("市场准入阻断项", "Market-entry blockers")}</h3>{evaluation.hardFails.map((fail) => <p key={fail}>{fail}</p>)}</div></section>}

      <section className="report-grid">
        <div className="report-panel radar-panel"><div className="report-panel-head"><div><h3>{t("六维机会结构", "Six-dimension opportunity profile")}</h3><p>{t("权重版本", "Scoring version")} · {evaluation.scoringVersion}</p></div><CircleHelp size={17}/></div><div className="radar-wrap"><ResponsiveContainer width="100%" height="100%"><RadarChart data={radarData} outerRadius="68%"><PolarGrid stroke="oklch(0.33 0.02 230)"/><PolarAngleAxis dataKey="subject" tick={{fill:"oklch(0.76 0.018 230)",fontSize:12}}/><Radar dataKey="score" stroke="oklch(0.72 0.12 230)" fill="oklch(0.65 0.1 230)" fillOpacity={0.25}/><Tooltip contentStyle={{background:"oklch(0.16 0.012 230)",border:"none",borderRadius:10,color:"white"}}/></RadarChart></ResponsiveContainer></div></div>
        <div className="dimension-list">{evaluation.dimensions.map((item) => <div className="dimension-row" key={item.key}><div className="dimension-name"><span>{t(item.labelZh, item.labelEn)}</span><small>{item.weight}%</small></div><strong>{item.score}</strong><div className="dimension-bar"><i style={{width:`${item.score}%`}}/></div><p>{t(item.rationaleZh, item.rationaleEn)}</p>{item.status === "insufficient" && <span className="insufficient">{t("证据不足", "Evidence limited")}</span>}</div>)}</div>
      </section>

      <section className="report-split">
        <div className="report-panel trade-panel"><div className="report-panel-head"><div><h3>{t("设备贸易趋势", "Device trade trend")}</h3><p>HS 85434000 · USD M</p></div><span className="source-tag">2024-07</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><LineChart data={snapshot.trade} margin={{top:10,right:12,left:-18,bottom:0}}><CartesianGrid stroke="oklch(0.25 0.012 230)" vertical={false}/><XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill:"oklch(0.68 0.015 230)",fontSize:12}}/><YAxis axisLine={false} tickLine={false} tick={{fill:"oklch(0.68 0.015 230)",fontSize:12}}/><Tooltip contentStyle={{background:"oklch(0.16 0.012 230)",border:"none",borderRadius:10,color:"white"}}/><Line type="monotone" dataKey="valueUsdM" stroke="oklch(0.79 0.13 176)" strokeWidth={2.5} dot={{fill:"oklch(0.79 0.13 176)",strokeWidth:0,r:4}}/></LineChart></ResponsiveContainer></div><p className="chart-note">{t("历史贸易变化只反映进口规模，不等同于终端销量或未来需求。", "Historical trade movement reflects import scale, not retail sales or future demand.")}</p></div>
        <div className="report-panel policy-panel"><div className="report-panel-head"><div><h3>{t("目标市场法规", "Target-market regulation")}</h3><p>{t(snapshot.policy.nameZh, snapshot.policy.nameEn)} · {snapshot.policy.recordAt}</p></div>{evaluation.compliancePass ? <ShieldCheck className="positive"/> : <ShieldAlert className="critical"/>}</div><p className="policy-summary">{t(snapshot.policy.summaryZh, snapshot.policy.summaryEn)}</p><dl><div><dt>{t("尼古丁上限", "Nicotine limit")}</dt><dd>{snapshot.policy.maxNicotineMgMl} mg/ml</dd></div><div><dt>{t("烟油容量上限", "E-liquid limit")}</dt><dd>{snapshot.policy.maxELiquidMl} ml</dd></div><div><dt>{t("已检查口味词", "Flavour terms checked")}</dt><dd>{snapshot.policy.bannedFlavorKeywords.length || t("无明确列表", "No explicit list")}</dd></div></dl><a href={snapshot.policy.sourceUrl} target="_blank" rel="noreferrer" className="text-link">{t("查看政策来源", "Open policy source")}<ExternalLink size={14}/></a></div>
      </section>

      <section className="section-block"><div className="section-heading"><div><h2>{t("相似产品对标", "Comparable products")}</h2><p>{t("按口数与容量接近程度排序；不代表真实销量排名。", "Ranked by puff-count and volume proximity, not actual sales.")}</p></div><span className="source-tag">{snapshot.competitors.length} {t("条记录", "records")}</span></div><div className="competitor-table"><div className="table-head"><span>{t("产品", "Product")}</span><span>PUFFS</span><span>{t("容量", "Volume")}</span><span>{t("零售价", "Retail")}</span><span>{t("关键特征", "Key attributes")}</span></div>{nearest.map((item, index) => <div className="table-row" key={item.id}><span><i>{String(index + 1).padStart(2,"0")}</i><strong>{item.brand} {item.name}</strong></span><span>{item.puffs.toLocaleString()}</span><span>{item.eLiquidMl} ml</span><span>${item.retailPriceUsd}</span><span className="feature-tags">{item.features.slice(0,2).map((feature) => <small key={feature}>{feature}</small>)}</span></div>)}</div></section>

      <section className="insight-columns">
        <div><div className="insight-title positive"><CheckCircle2/><h3>{t("主要机会", "Key opportunities")}</h3></div><ul>{(evaluation.opportunitiesZh.map((zh,index) => t(zh,evaluation.opportunitiesEn[index]))).map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div><div className="insight-title warning"><AlertTriangle/><h3>{t("主要风险", "Key risks")}</h3></div><ul>{(evaluation.risksZh.map((zh,index) => t(zh,evaluation.risksEn[index]))).map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div><div className="insight-title neutral"><CircleHelp/><h3>{t("评估假设", "Assessment assumptions")}</h3></div><ul>{(evaluation.assumptionsZh.map((zh,index) => t(zh,evaluation.assumptionsEn[index]))).map((item) => <li key={item}>{item}</li>)}</ul></div>
      </section>

      <section className="section-block evidence-section"><div className="section-heading"><div><h2>{t("证据与数据质量", "Evidence and data quality")}</h2><p>{t("每一项均保留来源、适用市场、记录日期和是否参与评分。", "Each item retains source, applicable market, record date and scoring use.")}</p></div><span className="source-tag">{evaluation.evidence.filter((e) => e.usedInScore).length}/{evaluation.evidence.length} {t("已采用", "used")}</span></div><div className="evidence-list">{evaluation.evidence.map((item) => <details key={item.id}><summary><span className={`quality-dot ${item.quality}`}/><div><strong>{t(item.titleZh,item.titleEn)}</strong><small>{item.source} · {item.recordAt}</small></div><span className={item.usedInScore ? "used" : "unused"}>{t(item.usedInScore ? "参与评分" : "未参与评分", item.usedInScore ? "Used" : "Excluded")}</span><ChevronDown size={16}/></summary><div className="evidence-body"><p>{t(item.summaryZh,item.summaryEn)}</p><dl><div><dt>{t("适用市场", "Market")}</dt><dd>{item.market}</dd></div><div><dt>{t("快照时间", "Snapshot")}</dt><dd>{new Date(item.snapshotAt).toLocaleDateString()}</dd></div><div><dt>{t("质量", "Quality")}</dt><dd>{item.quality}</dd></div></dl><a href={item.sourceUrl} target="_blank" rel="noreferrer">{t("打开原始来源", "Open source")}<ExternalLink size={13}/></a></div></details>)}</div><div className="warning-list">{evaluation.dataWarningsZh.map((warning, index) => <p key={warning}><AlertTriangle size={14}/>{t(warning, evaluation.dataWarningsEn[index])}</p>)}</div></section>

      <section className="feedback-section"><div><span><History size={16}/>{t("专家反馈闭环", "Expert feedback loop")}</span><h2>{feedbackSaved ? t("反馈已记录", "Feedback recorded") : t("这份结论是否被业务采纳？", "Was this conclusion adopted?")}</h2><p>{t("反馈会与本报告及评分版本绑定，用于后续校准，不会反向修改当前报告。", "Feedback is bound to this report and scoring version for future calibration; it does not rewrite the current report.")}</p></div>{!feedbackOpen && <button className="button primary" onClick={() => setFeedbackOpen(true)}>{t("提交反馈", "Submit feedback")}<Send size={16}/></button>}{feedbackOpen && !feedbackSaved && <form onSubmit={saveFeedback} className="feedback-form"><div className="segmented"><label><input type="radio" name="decision" value="accepted" required/><span><Check size={15}/>{t("采纳", "Accept")}</span></label><label><input type="radio" name="decision" value="rejected"/><span><XCircle size={15}/>{t("驳回", "Reject")}</span></label></div><select name="finalAction" required defaultValue="review"><option value="go">GO</option><option value="review">REVIEW</option><option value="no-go">NO-GO</option></select><textarea name="note" placeholder={t("补充业务判断或验证结果…", "Add business context or validation outcome…")} maxLength={1000}/>{feedbackError && <p className="inline-error">{feedbackError}</p>}<button className="button primary" disabled={saving}>{saving ? t("保存中…", "Saving…") : t("保存反馈", "Save feedback")}</button></form>}{feedbackSaved && <div className="feedback-saved"><CheckCircle2/><span>{t("已纳入专家标签库", "Added to expert label set")}</span></div>}</section>

      <footer className="report-footer"><FileText size={15}/><span>{evaluation.id}</span><span>{evaluation.dataVersion}</span><span>{evaluation.scoringVersion}</span><span>{evaluation.analysisMode === "openai" ? "OpenAI vision" : "Deterministic demo"}</span></footer>
    </AppShell>
  );
}
