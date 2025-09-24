export default function clearHtmlFromString(strWithHtml) {
  const noTags = strWithHtml.replace(/<\/?[^>]+(>|$)/g, "");
  const doc = new DOMParser().parseFromString(noTags, "text/html");
  return doc.documentElement.textContent || "";
}
