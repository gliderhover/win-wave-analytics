import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import {
  LocaleCode, LocaleConfig, supportedLocales, getMessages, getLocaleConfig, fallbackMessages,
} from "./locales";

const STORAGE_KEY = "ww_locale";
const isDev = import.meta.env.DEV;

function detectBrowserLocale(): LocaleCode {
  const lang = navigator.language || "en";
  // Exact match
  const exact = supportedLocales.find(l => l.code === lang);
  if (exact) return exact.code;
  // Base language match (e.g. "es-MX" → "es")
  const base = lang.split("-")[0];
  const partial = supportedLocales.find(l => l.code === base || l.code.startsWith(base + "-"));
  return partial?.code ?? "en";
}

function getSavedLocale(): LocaleCode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as LocaleCode | null;
    if (saved && supportedLocales.some(l => l.code === saved)) return saved;
  } catch {}
  return detectBrowserLocale();
}

interface I18nContextType {
  locale: LocaleCode;
  localeConfig: LocaleConfig;
  setLocale: (code: LocaleCode) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatNumber: (n: number, options?: Intl.NumberFormatOptions) => string;
  formatPercent: (n: number) => string;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatCurrency: (n: number, currency?: string) => string;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(getSavedLocale);

  const messages = useMemo(() => getMessages(locale), [locale]);
  const localeConfig = useMemo(() => getLocaleConfig(locale), [locale]);
  const isRTL = localeConfig.dir === "rtl";

  // Apply dir + lang to document
  useEffect(() => {
    document.documentElement.setAttribute("dir", localeConfig.dir);
    document.documentElement.setAttribute("lang", locale);
  }, [locale, localeConfig.dir]);

  const setLocale = useCallback((code: LocaleCode) => {
    setLocaleState(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch {}
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let value = messages[key] ?? fallbackMessages[key as keyof typeof fallbackMessages];
    if (!value) {
      if (isDev) console.warn(`[i18n] Missing key: "${key}" for locale "${locale}"`);
      return key;
    }
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value!.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      });
    }
    return value;
  }, [messages, locale]);

  const bcp47 = locale === "zh-CN" ? "zh-Hans" : locale === "zh-TW" ? "zh-Hant" : locale;

  const formatNumber = useCallback((n: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(bcp47, options).format(n);
  }, [bcp47]);

  const formatPercent = useCallback((n: number) => {
    return new Intl.NumberFormat(bcp47, { style: "percent", maximumFractionDigits: 1 }).format(n / 100);
  }, [bcp47]);

  const formatDate = useCallback((date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat(bcp47, options ?? { dateStyle: "medium", timeStyle: "short" }).format(d);
  }, [bcp47]);

  const formatCurrency = useCallback((n: number, currency = "USD") => {
    return new Intl.NumberFormat(bcp47, { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  }, [bcp47]);

  const ctx = useMemo<I18nContextType>(() => ({
    locale, localeConfig, setLocale, t, formatNumber, formatPercent, formatDate, formatCurrency, isRTL,
  }), [locale, localeConfig, setLocale, t, formatNumber, formatPercent, formatDate, formatCurrency, isRTL]);

  return <I18nContext.Provider value={ctx}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
