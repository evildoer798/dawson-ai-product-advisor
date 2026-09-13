"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Database, FilePlus2, Gauge, Languages, Settings2, ShieldCheck } from "lucide-react";
import { useLocale } from "./app-providers";

const links = [
  { href: "/", zh: "任务中心", en: "Mission control", icon: Gauge },
  { href: "/new", zh: "新建评估", en: "New assessment", icon: FilePlus2 },
  { href: "/#data", zh: "数据资产", en: "Data assets", icon: Database },
  { href: "/#signals", zh: "市场信号", en: "Market signals", icon: BarChart3 },
  { href: "/admin", zh: "评分配置", en: "Scoring profiles", icon: Settings2 }
];

export function AppShell({ children, title, eyebrow, action }: { children: React.ReactNode; title: string; eyebrow?: string; action?: React.ReactNode }) {
  const pathname = usePathname();
  const { locale, setLocale, t } = useLocale();
  return (
    <div className="app-frame">
      <aside className="side-nav">
        <Link href="/" className="brand" aria-label="DAWSEN AI home">
          <span className="brand-mark">D</span>
          <span><strong>DAWSEN</strong><small>PRODUCT INTELLIGENCE</small></span>
        </Link>
        <nav aria-label={t("主导航", "Primary navigation")}>
          {links.map(({ href, zh, en, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : href.includes("#") ? false : pathname.startsWith(href);
            return <Link key={href} href={href} className={active ? "nav-link active" : "nav-link"}><Icon size={17} /><span>{t(zh, en)}</span></Link>;
          })}
        </nav>
        <div className="nav-status">
          <span className="status-dot" />
          <div><strong>{t("快照模式", "Snapshot mode")}</strong><small>{t("可复现分析", "Reproducible analysis")}</small></div>
        </div>
        <div className="compliance-note"><ShieldCheck size={16} /><span>{t("决策支持，不构成销量保证", "Decision support, not a sales guarantee")}</span></div>
      </aside>
      <main className="app-main">
        <header className="topbar">
          <div><span className="page-context">{eyebrow || t("DAWSEN 产品情报", "DAWSEN product intelligence")}</span><h1>{title}</h1></div>
          <div className="topbar-actions">
            {action}
            <button className="locale-toggle" onClick={() => setLocale(locale === "zh" ? "en" : "zh")} aria-label={t("切换到英文", "Switch to Chinese")}><Languages size={16} /><span>{locale === "zh" ? "EN" : "中文"}</span></button>
          </div>
        </header>
        <div className="page-body">{children}</div>
      </main>
    </div>
  );
}
