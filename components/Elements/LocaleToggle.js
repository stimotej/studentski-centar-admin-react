import { useLocale } from "../../lib/locale";
import clsx from "clsx";

/**
 * Switches which language every localized field on the page is editing.
 *
 * Croatian is the source of truth, so it sits first and is the default. The
 * English side is visually distinct because it is easy to forget which language
 * you are typing into and overwrite the wrong one.
 */
const LocaleToggle = ({ className }) => {
  const { locale, setLocale, sectionIsBilingual } = useLocale();

  // Hidden where the section's frontend cannot display English, so nobody is
  // invited to translate text that will not appear. The fields underneath stay
  // wired; see BILINGUAL_SECTIONS in lib/locale.js.
  if (!sectionIsBilingual) return null;

  const option = (value, label, title) => (
    <button
      type="button"
      key={value}
      title={title}
      aria-pressed={locale === value}
      onClick={() => setLocale(value)}
      className={clsx(
        "px-3 py-1 text-sm font-semibold rounded-md transition-colors",
        locale === value
          ? "bg-white shadow text-gray-900"
          : "text-gray-500 hover:text-gray-700",
      )}
    >
      {label}
    </button>
  );

  return (
    <div
      className={clsx(
        "inline-flex items-center gap-1 p-1 rounded-lg bg-gray-100",
        className,
      )}
    >
      <span className="pl-2 pr-1 text-xs uppercase tracking-wide text-gray-400">
        Jezik
      </span>
      {option("hr", "HR", "Uređivanje hrvatskog sadržaja")}
      {option("en", "EN", "Uređivanje engleskog sadržaja")}
    </div>
  );
};

export default LocaleToggle;
