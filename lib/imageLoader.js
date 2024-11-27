export default function imageLoader({ src, width, quality }) {
  const newSrc = src.replace("161.53.174.14", "www.sczg.unizg.hr");
  return `${newSrc}?w=${width}&q=${quality || 75}`;
}
