export default function clearHtmlFromString(strWithHtml) {
  return strWithHtml.replace(/<\/?[^>]+(>|$)/g, "");
}
