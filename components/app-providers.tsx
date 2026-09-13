"use client";

import { createContext, useContext, useMemo, useState } from "react";

type Locale = "zh" | "en";
type LocaleContextValue = { locale: Locale; setLocale: (value: Locale) => void; t: (zh: string, en: string) => string };
const LocaleContext = createContext<LocaleContextValue | null>(null);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");
  const setLocale = (value: Locale) => { setLocaleState(value); localStorage.setItem("dawson-locale", value); document.documentElement.lang = value === "zh" ? "zh-CN" : "en"; };
  const value = useMemo(() => ({ locale, setLocale, t: (zh: string, en: string) => locale === "zh" ? zh : en }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within AppProviders");
  return context;
}
