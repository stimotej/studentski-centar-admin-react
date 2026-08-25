import { createContext, useCallback, useContext, useEffect, useState } from "react";

export const LOCALES = ["hr", "en"];
export const DEFAULT_LOCALE = "hr";

const STORAGE_KEY = "admin_editing_locale";

const LocaleContext = createContext({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  isEnglish: false,
});

/**
 * Which language the editors on screen are currently writing.
 *
 * This is the *editing* locale, not the admin interface language — the admin
 * chrome stays Croatian. Croatian is always the source of truth; English is
 * stored alongside it in `_en` meta (docs/i18n/CONVENTIONS.md).
 */
export const LocaleProvider = ({ children }) => {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);

  // Read once on mount rather than during render — localStorage does not exist
  // during SSR, and reading it in useState would desync hydration.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (LOCALES.includes(stored)) setLocaleState(stored);
    } catch {
      // Private mode or blocked storage: stay on Croatian.
    }
  }, []);

  const setLocale = useCallback((next) => {
    if (!LOCALES.includes(next)) return;
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not being able to remember the choice is not worth failing over.
    }
  }, []);

  return (
    <LocaleContext.Provider
      value={{ locale, setLocale, isEnglish: locale === "en" }}
    >
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => useContext(LocaleContext);

/** Has this field actually been translated? Whitespace-only counts as not. */
export const hasTranslation = (value) =>
  typeof value === "string" && value.trim().length > 0;
