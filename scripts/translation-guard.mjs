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
  // The TLD is matched as lowercase and must not be followed by more
  // lowercase. WordPress strips tags from excerpt.rendered, so
  // "…@sczg.hr</p><p>Informacije" arrives as "…@sczg.hrInformacije" — a
  // greedier pattern captures that whole mess as the address and then
  // blocks every correct translation for "losing" it.
  email: /[\w.+-]+@[\w-]+(?:\.[\w-]+)*\.[a-z]{2,24}(?![a-z])/g,
  url: /https?:\/\/[^\s"'<>]+/g,
  iban: /\bHR\d{2}[\dA-Z]{15,}\b/g,
  oib: /\b\d{11}\b/g,
  phone: /(?:\+385|\b0)[\s/()-]?\d[\d\s/().-]{6,}\d/g,
  money: /\d+[,.]\d{2}\s*(?:€|EUR|kn|HRK)/g,
};

const findAll = (text, rx) =>
  [...String(text ?? "").matchAll(rx)].map((m) => m[0].trim());

/**
 * Purely presentational wrappers, ignored when comparing structure.
 *
 * Content pasted from Word arrives fragmented across dozens of <span> tags
 * carrying near-identical inline colours — post 13556 has 34 of them mid-
 * sentence. A translation naturally consolidates a few, which is an
 * improvement, not damage. Links, lists, headings and emphasis stay strict.
 */
const COSMETIC_TAGS = new Set(["span", "font"]);

/** Opening-tag sequence, so meaningful markup cannot be restructured or dropped. */
const tagSequence = (html) =>
  [...String(html ?? "").matchAll(/<\s*([a-zA-Z][\w-]*)/g)]
    .map((m) => m[1].toLowerCase())
    .filter((tag) => !COSMETIC_TAGS.has(tag));

/**
 * Names that must appear verbatim in the English text.
 *
 * Regexes catch numbers and links; they cannot catch "Lašćinska cesta" turning
 * into "Lašćina Street" or a dormitory being renamed. Add anything here whose
 * translation would send a student to the wrong place.
 */
export const PROTECTED_TERMS = [
  "Studentski centar",
  "Teatar &TD",
];

/**
 * Abbreviations that must survive untouched.
 *
 * SN (Studentsko naselje, a student village) and SD (Studentski dom, a student
 * hall) are DIFFERENT places. A 2026-08-26 dry run had the model silently
 * "correcting" SN to SD in two fields out of four.
 *
 * This is a curated list rather than "any capitalised token". The first version
 * flagged every all-caps word, so a shouty Croatian sentence tripped it with
 * DA, NA, TE and KOJI — ordinary words, not abbreviations. Add real
 * abbreviations here; do not widen it back into a pattern.
 */
export const PROTECTED_ABBREVIATIONS = [
  "SN", "SD", "SC", "TD",
  "MZO", "PDV", "OIB", "IBAN",
  "ECTS", "ISIC", "EU", "PDF", "FAQ",
];

// JS word boundaries are ASCII-only, so \b lands in the middle of words like
// NAPIŠITE. Match on explicit letter neighbours instead, Croatian included.
const LETTER = "A-Za-zŠĐČĆŽšđčćž";
const standalone = (abbr) =>
  new RegExp(`(?<![${LETTER}])${abbr}(?![${LETTER}])`, "g");

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
      // Date ranges like "01.01.- 31.12.2025" look like phone numbers to the
      // pattern above. They are dates; the digits are checked anyway.
      if (kind === "phone" && /\d{1,2}\.\s?\d{1,2}\.\s*-?\s*\d{1,2}\.\s?\d{1,2}\.\s?\d{4}/.test(item)) {
        continue;
      }

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

  // Each protected abbreviation must appear at least as often in the English as
  // in the Croatian — this is what catches SN silently becoming SD.
  for (const abbr of PROTECTED_ABBREVIATIONS) {
    const inSource = findAll(source, standalone(abbr)).length;
    if (!inSource) continue;
    const inTranslation = findAll(translation, standalone(abbr)).length;
    if (inTranslation < inSource) {
      errors.push(
        `abbreviation lost or changed: ${abbr} appears ${inSource}x in Croatian, ${inTranslation}x in English`
      );
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
