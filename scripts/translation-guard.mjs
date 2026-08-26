/**
 * Refuses to let a translation through if it altered anything that must not change.
 *
 * Translation models sometimes "helpfully" reformat a phone number, localise an
 * address, or drop a link. In this content that is not cosmetic: there are 194
 * email addresses, 227 phone numbers, 765 URLs and 5 IBANs across the site.
 *
 * Everything below is a *mechanical* check on the model's output. It is not a
 * prompt instruction the model may or may not follow.
 */

/** Things that must survive translation byte-for-byte. */
const INVARIANTS = {
  email: /[\w.+-]+@[\w-]+\.[\w.]+/g,
  url: /https?:\/\/[^\s"'<>]+/g,
  iban: /\bHR\d{2}[\dA-Z]{15,}\b/g,
  oib: /\b\d{11}\b/g,
  phone: /(?:\+385|\b0)[\s/()-]?\d[\d\s/().-]{6,}\d/g,
  money: /\d+[,.]\d{2}\s*(?:€|EUR|kn|HRK)/g,
};

const findAll = (text, rx) =>
  [...String(text ?? "").matchAll(rx)].map((m) => m[0].trim());

/** Opening-tag sequence, so markup cannot be restructured or dropped. */
const tagSequence = (html) =>
  [...String(html ?? "").matchAll(/<\s*([a-zA-Z][\w-]*)/g)].map((m) =>
    m[1].toLowerCase()
  );

/**
 * Names that must appear verbatim in the English text.
 *
 * Regexes catch numbers and links; they cannot catch "Lašćinska cesta" turning
 * into "Lašćina Street" or a dormitory being renamed. Add anything here whose
 * translation would send a student to the wrong place.
 */
export const PROTECTED_TERMS = [
  "Studentski centar",
  "SD Stjepan Radić",
  "SD Cvjetno naselje",
  "SD Lašćina",
  "SD Dr. Ante Starčević",
  "Teatar &TD",
];

/** Digits only — catches "same number, different spacing" separately from "different number". */
const digitsOf = (s) => String(s).replace(/\D/g, "");

/**
 * @returns {{ok: boolean, errors: string[], warnings: string[]}}
 */
export function checkTranslation(source, translation) {
  const errors = [];
  const warnings = [];

  if (typeof translation !== "string" || !translation.trim()) {
    return { ok: false, errors: ["translation is empty"], warnings };
  }

  for (const [kind, rx] of Object.entries(INVARIANTS)) {
    for (const item of findAll(source, rx)) {
      if (translation.includes(item)) continue;

      // Present but reformatted (e.g. "01 4593 555" → "01-4593-555") is still a
      // change to a number a student will dial. Flag it rather than accept it.
      const digits = digitsOf(item);
      const reformatted =
        digits.length >= 6 && digitsOf(translation).includes(digits);

      if (reformatted) {
        warnings.push(`${kind} reformatted: ${item}`);
      } else {
        errors.push(`${kind} missing or altered: ${item}`);
      }
    }
  }

  for (const term of PROTECTED_TERMS) {
    if (String(source ?? "").includes(term) && !translation.includes(term)) {
      errors.push(`protected name missing or translated: ${term}`);
    }
  }

  const before = tagSequence(source);
  const after = tagSequence(translation);
  if (before.join(",") !== after.join(",")) {
    const missing = before.filter((t, i) => after[i] !== t).slice(0, 4);
    errors.push(
      `HTML structure changed (${before.length} tags in, ${after.length} out` +
        (missing.length ? `, first divergence: <${missing[0]}>` : "") +
        ")"
    );
  }

  // A translation far shorter than the source usually means truncation.
  const ratio = translation.length / Math.max(String(source ?? "").length, 1);
  if (ratio < 0.5) {
    errors.push(`suspiciously short: ${(ratio * 100).toFixed(0)}% of source length`);
  }

  return { ok: errors.length === 0, errors, warnings };
}

export default checkTranslation;
