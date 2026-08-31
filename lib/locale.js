import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/router";

export const LOCALES = ["hr", "en"];
export const DEFAULT_LOCALE = "hr";

const STORAGE_KEY = "admin_editing_locale";

/**
 * Admin sections whose content is displayed by a frontend that can show
 * English — currently only `studentski-centar-zagreb`.
 *
 * teatar-td, turizam, eventi and catering are separate App Router repos with
 * no i18n yet. Offering English editing there would invite someone to spend an
 * afternoon translating text that nothing renders, so the switch is hidden and
 * the editors stay Croatian until their frontend catches up.
 *
 * This is a gate, not a removal: every `_en` field, mutation and editor stays
 * wired. Adding a section here is the only change needed when its frontend
 * ships (docs/i18n/PLAN.md).
 */
export const BILINGUAL_SECTIONS = [
  "pocetna-stranica",
  "obavijesti",
  "smjestaj",
  "prehrana",
  "sport",
  "kultura",
  "student-servis",
];

/** The admin section a path belongs to, e.g. "/smjestaj/faq" -> "smjestaj". */
export const sectionOf = (pathname) =>
  String(pathname || "")
    .split("/")
    .filter(Boolean)[0] ?? "";

export const isBilingualSection = (pathname) =>
  BILINGUAL_SECTIONS.includes(sectionOf(pathname));

const LocaleContext = createContext({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  isEnglish: false,
  sectionIsBilingual: false,
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

  // The stored locale is global, so someone who switched to English on
  // /smjestaj would otherwise arrive in /teatar-td still editing English —
  // into fields that section's frontend cannot display. Sections that cannot
  // show English always edit Croatian, whatever is stored.
  const { pathname } = useRouter();
  const sectionIsBilingual = isBilingualSection(pathname);

  return (
    <LocaleContext.Provider
      value={{
        locale,
        setLocale,
        sectionIsBilingual,
        isEnglish: locale === "en" && sectionIsBilingual,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => useContext(LocaleContext);

/** Has this field actually been translated? Whitespace-only counts as not. */
export const hasTranslation = (value) =>
  typeof value === "string" && value.trim().length > 0;
