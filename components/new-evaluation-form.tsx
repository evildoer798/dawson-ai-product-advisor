"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, ChevronDown, ImagePlus, LoaderCircle, ScanSearch, ShieldCheck, Sparkles, UploadCloud, X } from "lucide-react";
import type { MarketPolicy } from "@/lib/types";
import { AppShell } from "./app-shell";
import { useLocale } from "./app-providers";

const stages = [
  ["标准化产品字段", "Normalizing product fields"], ["检查目标市场法规", "Checking market regulation"],
  ["匹配相似竞品", "Matching comparable products"], ["读取贸易与市场信号", "Reading trade and market signals"],
  ["核验商标与供应链", "Checking trademark and supply chain"], ["生成双语评估报告", "Building bilingual assessment"]
];

export function NewEvaluationForm({ markets }: { markets: MarketPolicy[] }) {
  const { t } = useLocale();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [traits, setTraits] = useState<string[]>([]);
  const [traitInput, setTraitInput] = useState("");
  const [visionMode, setVisionMode] = useState<"idle" | "loading" | "demo" | "openai" | "error">("idle");
  const [submitting, setSubmitting] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const [error, setError] = useState("");

  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  const addFiles = (incoming: FileList | File[]) => {
    const accepted = Array.from(incoming).filter((file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024);
    setFiles((current) => [...current, ...accepted].slice(0, 6));
    setError(accepted.length ? "" : t("请选择 5MB 以内的图片。", "Choose images no larger than 5 MB."));
  };

  const runVision = async () => {
    if (!files[0]) return setError(t("请先上传产品图片。", "Upload a product image first."));
    setVisionMode("loading"); setError("");
    const body = new FormData(); body.append("image", files[0]);
    try {
      const response = await fetch("/api/vision", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Vision failed");
      setTraits(Array.from(new Set([...traits, ...result.traits, ...result.dominantColors.map((c: string) => `${c} color`)])).slice(0, 10));
      const charging = document.querySelector<HTMLInputElement>('input[name="charging"]');
      if (charging && result.charging && !charging.value) charging.value = result.charging;
      setVisionMode(result.mode);
    } catch (cause) {
      setVisionMode("error"); setError(cause instanceof Error ? cause.message : t("图片识别失败。", "Image analysis failed."));
    }
  };

  const addTrait = () => {
    const value = traitInput.trim();
    if (value && !traits.includes(value) && traits.length < 10) setTraits([...traits, value]);
    setTraitInput("");
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!files.length) return setError(t("至少需要一张产品图片。", "At least one product image is required."));
    setSubmitting(true); setError(""); setActiveStage(0);
    const timer = window.setInterval(() => setActiveStage((value) => Math.min(5, value + 1)), 520);
    const body = new FormData(event.currentTarget);
    files.forEach((file) => body.append("images", file));
    body.set("visualTraits", JSON.stringify(traits));
    try {
      const response = await fetch("/api/evaluations", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Evaluation failed");
      setActiveStage(5);
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push(`/evaluations/${result.id}`);
    } catch (cause) {
      setSubmitting(false); setError(cause instanceof Error ? cause.message : t("评估创建失败。", "Could not create assessment."));
    } finally { window.clearInterval(timer); }
  };

  return (
    <AppShell title={t("新建产品评估", "New product assessment")} eyebrow={t("一次性电子烟 · 决策支持", "Disposable vape · Decision support")}>
      <form className="assessment-form" onSubmit={submit}>
        <section className="form-intro"><div><span className="step-chip">1 / 3</span><h2>{t("提交产品证据", "Submit product evidence")}</h2><p>{t("图片用于识别可见设计特征；容量、尼古丁和价格必须由你确认。", "Images identify visible design attributes. Capacity, nicotine and price must be confirmed by you.")}</p></div><div className="privacy-note"><ShieldCheck size={17}/><span>{t("图片仅在服务端分析，不参与数值评分中的事实推断。", "Images are analyzed server-side and never used to infer scoring facts.")}</span></div></section>

        <div className="form-layout">
          <section className="form-panel upload-panel">
            <div className="panel-title"><div><h3>{t("产品图片", "Product images")}</h3><p>{t("1–6 张，单张不超过 5MB", "1–6 images, up to 5 MB each")}</p></div><span>{files.length}/6</span></div>
            <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && addFiles(e.target.files)} />
            {!files.length ? <button type="button" className="dropzone" onClick={() => inputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}><span className="upload-icon"><UploadCloud/></span><strong>{t("拖入产品图，或点击选择", "Drop product images or browse")}</strong><small>PNG · JPG · WEBP</small></button> : <div className="preview-grid">
              {previews.map((src, index) => <div className="image-preview" key={src}><Image src={src} alt={`${t("产品图片", "Product image")} ${index + 1}`} fill unoptimized/><button type="button" onClick={() => setFiles(files.filter((_, i) => i !== index))} aria-label={t("移除图片", "Remove image")}><X size={14}/></button>{index === 0 && <span>{t("主图", "Primary")}</span>}</div>)}
              {files.length < 6 && <button type="button" className="add-image" onClick={() => inputRef.current?.click()}><ImagePlus size={20}/><span>{t("添加", "Add")}</span></button>}
            </div>}
            <button type="button" className="vision-action" onClick={runVision} disabled={!files.length || visionMode === "loading"}>{visionMode === "loading" ? <LoaderCircle className="spin" size={17}/> : <ScanSearch size={17}/>}<span>{visionMode === "idle" ? t("AI 读取可见设计特征", "Read visible design traits with AI") : visionMode === "loading" ? t("正在读取图片…", "Reading image…") : visionMode === "error" ? t("重新识别", "Try again") : t("已识别，可在下方修正", "Analyzed — review below")}</span>{(visionMode === "demo" || visionMode === "openai") && <small>{visionMode === "openai" ? "OPENAI" : "DEMO"}</small>}</button>
          </section>

          <section className="form-panel details-panel">
            <div className="panel-title"><div><h3>{t("基本参数", "Core specifications")}</h3><p>{t("必填字段用于合规和商业评分", "Required for compliance and commercial scoring")}</p></div><span className="required-note">* {t("必填", "Required")}</span></div>
            <div className="field-grid">
              <label className="field span-2"><span>{t("产品名称", "Product name")} *</span><input name="name" required defaultValue="Dawsen Concept 15K" placeholder={t("例如：Aero 15K", "e.g. Aero 15K")}/></label>
              <label className="field"><span>{t("目标市场", "Target market")} *</span><div className="select-wrap"><select name="market" required defaultValue="AE">{markets.map((market) => <option value={market.code} key={market.code}>{market.flag} {t(market.nameZh, market.nameEn)}</option>)}</select><ChevronDown size={15}/></div></label>
              <label className="field"><span>{t("品牌", "Brand")}</span><input name="brand" placeholder="DAWSEN"/></label>
              <label className="field"><span>{t("口数", "Puff count")} *</span><input name="puffs" type="number" min="100" required defaultValue="15000"/><small>PUFFS</small></label>
              <label className="field"><span>{t("烟油容量", "E-liquid volume")} *</span><input name="eLiquidMl" type="number" min="0.1" step="0.1" required defaultValue="18"/><small>ML</small></label>
              <label className="field"><span>{t("尼古丁浓度", "Nicotine strength")} *</span><input name="nicotineMgMl" type="number" min="0" step="0.1" required defaultValue="20"/><small>MG/ML</small></label>
              <label className="field"><span>{t("口味类别", "Flavour category")} *</span><input name="flavor" required defaultValue="Mint" placeholder={t("例如：薄荷", "e.g. Mint")}/></label>
              <label className="field"><span>{t("目标零售价", "Target retail price")} *</span><input name="retailPriceUsd" type="number" min="0.1" step="0.1" required defaultValue="17.9"/><small>USD</small></label>
              <label className="field"><span>{t("目标成本", "Target cost")}</span><input name="targetCostUsd" type="number" min="0" step="0.1" defaultValue="6.2"/><small>USD</small></label>
            </div>
          </section>
        </div>

        <section className="form-panel wide-panel">
          <div className="panel-title"><div><h3>{t("已确认视觉特征", "Confirmed visual traits")}</h3><p>{t("AI 结果必须由用户确认；这些标签用于竞品相似度比较。", "AI results require confirmation; these tags support comparator similarity.")}</p></div><span>{traits.length}/10</span></div>
          <div className="trait-editor"><div className="traits">{traits.map((trait) => <button type="button" key={trait} onClick={() => setTraits(traits.filter((item) => item !== trait))}>{trait}<X size={12}/></button>)}{!traits.length && <span className="empty-traits">{t("运行图片识别或手动添加特征", "Run image analysis or add a trait manually")}</span>}</div><div className="trait-input"><input value={traitInput} onChange={(e) => setTraitInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTrait(); } }} placeholder={t("例如：双屏、金属质感", "e.g. dual display, metallic finish")}/><button type="button" onClick={addTrait}>{t("添加", "Add")}</button></div></div>
        </section>

        <details className="optional-panel"><summary><span><strong>{t("补充商业参数", "Additional commercial inputs")}</strong><small>{t("提高报告完整度与置信度", "Improves completeness and confidence")}</small></span><ChevronDown size={18}/></summary><div className="field-grid optional-fields">
          <label className="field"><span>{t("电池容量", "Battery")}</span><input name="batteryMah" type="number" min="0" defaultValue="650"/><small>MAH</small></label>
          <label className="field"><span>{t("充电方式", "Charging")}</span><input name="charging" placeholder="USB-C"/></label>
          <label className="field"><span>{t("产品尺寸", "Dimensions")}</span><input name="dimensions" placeholder="88 × 48 × 24 mm"/></label>
          <label className="field"><span>MOQ</span><input name="moq" type="number" min="0" defaultValue="10000"/></label>
          <label className="field span-2"><span>{t("目标渠道", "Target channel")}</span><input name="channel" defaultValue="Specialty retail"/></label>
        </div></details>

        {error && <div className="form-error" role="alert"><X size={16}/><span>{error}</span></div>}
        <div className="form-submit"><div><Sparkles size={17}/><span>{t("预计 1–3 分钟 · 生成中英双语报告", "Estimated 1–3 minutes · Bilingual report")}</span></div><button className="button primary large" type="submit">{t("开始评估", "Start assessment")}<ArrowRight size={17}/></button></div>
      </form>

      {submitting && <div className="analysis-overlay" role="status" aria-live="polite"><div className="analysis-dialog"><div className="agent-orbit"><span>DA</span><i/><i/><i/></div><h2>{t("Agent 正在建立证据链", "The agent is building the evidence chain")}</h2><p>{t("只展示任务状态，不展示模型内部推理。", "Operational status only; private model reasoning is never displayed.")}</p><div className="stage-list">{stages.map((stage, index) => <div key={stage[0]} className={index < activeStage ? "done" : index === activeStage ? "active" : ""}><span>{index < activeStage ? <Check size={14}/> : index === activeStage ? <LoaderCircle className="spin" size={14}/> : index + 1}</span><strong>{t(stage[0], stage[1])}</strong></div>)}</div></div></div>}
    </AppShell>
  );
}
