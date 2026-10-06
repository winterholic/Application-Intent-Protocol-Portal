/**
 * English is the canonical language. Other locales are translations of it and live under a path prefix.
 * 언어를 추가하면 src/i18n/ui.ts 사전과 src/content/docs/<locale>/ 번역을 함께 추가해야 빌드가 통과한다.
 */
export const LOCALES = ["en", "ko", "ja", "zh"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const TRANSLATED_LOCALES = LOCALES.filter((l) => l !== DEFAULT_LOCALE);

export const LOCALE_META: Record<Locale, { label: string; htmlLang: string; hreflang: string }> = {
  en: { label: "English", htmlLang: "en", hreflang: "en" },
  ko: { label: "한국어", htmlLang: "ko", hreflang: "ko" },
  ja: { label: "日本語", htmlLang: "ja", hreflang: "ja" },
  zh: { label: "简体中文", htmlLang: "zh-Hans", hreflang: "zh-Hans" },
};

export const isLocale = (value: string | undefined): value is Locale => LOCALES.includes(value as Locale);

/** `/docs/` 같은 언어 중립 경로를 해당 언어의 경로로 바꾼다. */
export const localizePath = (locale: Locale, path: string) => (locale === DEFAULT_LOCALE ? path : `/${locale}${path}`);
