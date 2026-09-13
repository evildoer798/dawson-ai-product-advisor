"use client";

import { useMemo, useState } from "react";
import { Check, Database, RotateCcw, Save, ShieldCheck, SlidersHorizontal } from "lucide-react";
import type { MarketPolicy, ScoringProfile } from "@/lib/types";
import { AppShell } from "./app-shell";
import { useLocale } from "./app-providers";

const dimensionLabels: Record<keyof ScoringProfile["weights"], [string,string]> = {
  demand: ["市场需求", "Market demand"], competition: ["竞争机会", "Competitive whitespace"],
  differentiation: ["产品差异化", "Product differentiation"], compliance: ["合规可行性", "Compliance feasibility"],
  supply: ["供应链可行性", "Supply-chain feasibility"], commercial: ["商业可行性", "Commercial feasibility"]
};

export function AdminClient({ initialProfiles, markets }: { initialProfiles: ScoringProfile[]; markets: MarketPolicy[] }) {
  const { t } = useLocale();
  const [profiles, setProfiles] = useState(initialProfiles);
  const [activeMarket, setActiveMarket] = useState("AE");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const profile = profiles.find((row) => row.market === activeMarket) || profiles[0];
  const total = useMemo(() => Object.values(profile.weights).reduce((a,b) => a+b,0), [profile]);
  const updateProfile = (patch: Partial<ScoringProfile>) => setProfiles((rows) => rows.map((row) => row.market === activeMarket ? { ...row, ...patch } : row));
  const updateWeight = (key: keyof ScoringProfile["weights"], value: number) => updateProfile({ weights: { ...profile.weights, [key]: value } });
  const save = async () => {
    setStatus("saving");
    const response = await fetch(`/api/admin/scoring-profiles/${activeMarket}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
    setStatus(response.ok ? "saved" : "error");
    if (response.ok) window.setTimeout(() => setStatus("idle"), 1800);
  };
  const reset = () => setProfiles((rows) => rows.map((row) => row.market === activeMarket ? { ...row, goThreshold:75, reviewThreshold:55, weights:{ demand:25,competition:20,differentiation:15,compliance:20,supply:10,commercial:10 } } : row));

  return <AppShell title={t("评分配置", "Scoring profiles")} eyebrow={t("管理后台 · 规则版本", "Administration · Rule versions")} action={<button className="button primary" onClick={save} disabled={status === "saving" || total !== 100}><Save size={16}/>{status === "saving" ? t("保存中", "Saving") : status === "saved" ? t("已保存", "Saved") : t("保存版本", "Save version")}</button>}>
    <section className="admin-header"><div><SlidersHorizontal/><div><h2>{t("市场评分模板", "Market scoring template")}</h2><p>{t("修改只影响之后创建的评估；既有报告保持原始评分版本。", "Changes affect future assessments only; existing reports retain their original scoring version.")}</p></div></div><span>{profile.version}</span></section>
    <div className="admin-layout">
      <aside className="market-sidebar"><div className="market-search">{t("已启用市场", "Enabled markets")}<strong>{profiles.filter((p) => p.enabled).length}</strong></div>{markets.map((market) => <button key={market.code} className={activeMarket === market.code ? "active" : ""} onClick={() => {setActiveMarket(market.code);setStatus("idle");}}><span>{market.flag}</span><div><strong>{t(market.nameZh, market.nameEn)}</strong><small>{market.code}</small></div><i className={profiles.find((p) => p.market === market.code)?.enabled ? "on" : ""}/></button>)}</aside>
      <div className="admin-content">
        <section className="settings-block"><div className="settings-title"><div><h3>{t("评分权重", "Dimension weights")}</h3><p>{t("权重总和必须等于 100%", "Weights must total 100%")}</p></div><strong className={total === 100 ? "valid" : "invalid"}>{total}%</strong></div><div className="weight-list">{(Object.keys(profile.weights) as Array<keyof ScoringProfile["weights"]>).map((key) => <label key={key}><span><strong>{t(...dimensionLabels[key])}</strong><small>{profile.weights[key]}%</small></span><input type="range" min="0" max="50" step="1" value={profile.weights[key]} onChange={(e) => updateWeight(key,Number(e.target.value))}/></label>)}</div></section>
        <section className="settings-block"><div className="settings-title"><div><h3>{t("决策阈值", "Decision thresholds")}</h3><p>{t("合规硬门槛始终优先于分数", "Compliance hard gates always override score")}</p></div><ShieldCheck className="positive"/></div><div className="thresholds"><label><span>GO</span><input type="number" min="1" max="100" value={profile.goThreshold} onChange={(e) => updateProfile({goThreshold:Number(e.target.value)})}/><small>{t("及以上", "and above")}</small></label><label><span>REVIEW</span><input type="number" min="1" max="100" value={profile.reviewThreshold} onChange={(e) => updateProfile({reviewThreshold:Number(e.target.value)})}/><small>{t("至 GO", "to GO")}</small></label><label className="toggle-setting"><span>{t("开放市场", "Market enabled")}</span><button type="button" className={profile.enabled ? "switch on" : "switch"} onClick={() => updateProfile({enabled:!profile.enabled})}><i/></button><small>{profile.enabled ? t("用户可选择", "Available to users") : t("暂时隐藏", "Hidden")}</small></label></div></section>
        <div className="admin-actions"><button className="button quiet" onClick={reset}><RotateCcw size={15}/>{t("恢复默认权重", "Restore defaults")}</button>{status === "error" && <span className="inline-error">{t("保存失败，请检查权重总和与阈值。", "Save failed. Check weights and thresholds.")}</span>}{status === "saved" && <span className="save-confirm"><Check size={15}/>{t("新版本已保存", "New version saved")}</span>}</div>
      </div>
    </div>
    <section className="snapshot-register"><div><Database/><span><strong>{t("数据快照", "Data snapshot")}</strong><small>dawsen-snapshot-2026.09-demo</small></span></div><div><span>{t("来源市场", "Source markets")}</span><strong>43</strong></div><div><span>{t("当前启用", "Enabled")}</span><strong>{profiles.filter((p) => p.enabled).length}</strong></div><div><span>{t("模式", "Mode")}</span><strong>FIXED</strong></div></section>
  </AppShell>;
}
