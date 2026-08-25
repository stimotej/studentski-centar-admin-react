import { hasTranslation, useLocale } from "../../lib/locale";

/**
 * Chrome shown around a field while the English side is being edited.
 *
 * Two jobs: make it obvious you are no longer typing into Croatian, and put the
 * Croatian original within reach so whoever is translating does not have to
 * toggle back and forth to read it.
 */
export const EnglishFieldFrame = ({ label, source, value, children }) => {
  const translated = hasTranslation(value);

  // Strip markup for the reference copy — it is there to be read, not styled,
  // and rendering stored HTML here would be needless exposure.
  const plainSource =
    typeof source === "string"
      ? source.replace(/<\/?[^>]+(>|$)/g, " ").replace(/\s+/g, " ").trim()
      : "";

  return (
    <div className="border-l-4 border-sky-400 pl-3 my-2">
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span className="text-xs font-semibold uppercase tracking-wide text-sky-600">
          Engleski{label ? ` — ${label}` : ""}
        </span>
        {!translated && (
          <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800">
            nije prevedeno
          </span>
        )}
      </div>

      {plainSource && (
        <details className="mb-2">
          <summary className="text-xs text-gray-500 cursor-pointer select-none hover:text-gray-700">
            Prikaži hrvatski izvornik
          </summary>
          <p className="mt-1 text-sm text-gray-600 bg-gray-50 rounded p-2 whitespace-pre-wrap">
            {plainSource}
          </p>
        </details>
      )}

      {children}
    </div>
  );
};

/**
 * Wraps any value/onChange editor so it edits Croatian or English depending on
 * the active locale.
 *
 * Deliberately additive: the Croatian props keep their existing names and
 * behaviour, so converting a field is adding `valueEn`/`onChangeEn` and
 * swapping the component — not restructuring the page's state.
 *
 *   <LocalizedField
 *     as={QuillTextEditor}
 *     label="Sadržaj"
 *     value={sadrzaj}     onChange={setSadrzaj}
 *     valueEn={sadrzajEn} onChangeEn={setSadrzajEn}
 *     placeholder="Unesi sadržaj..."
 *   />
 */
const LocalizedField = ({
  as: Field,
  label,
  value,
  onChange,
  valueEn,
  onChangeEn,
  className,
  ...rest
}) => {
  const { isEnglish } = useLocale();

  if (!isEnglish) {
    return (
      <Field value={value} onChange={onChange} className={className} {...rest} />
    );
  }

  return (
    <EnglishFieldFrame label={label} source={value} value={valueEn}>
      <Field
        value={valueEn ?? ""}
        onChange={onChangeEn}
        className={className}
        {...rest}
      />
    </EnglishFieldFrame>
  );
};

export default LocalizedField;
