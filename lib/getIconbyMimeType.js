import {
  faFile,
  faFileAudio,
  faFileExcel,
  faFileImage,
  faFileLines,
  faFilePdf,
  faFileVideo,
  faFileWord,
} from "@fortawesome/pro-regular-svg-icons";

export default function getIconByMimeType(mimeType) {
  if (!mimeType) return faFile;
  const type = mimeType.split("/")[0];
  const extension = mimeType.split("/").pop();
  if (type === "image") return faFileImage;
  if (type === "video") return faFileVideo;
  if (type === "text") return faFileLines;
  if (type === "audio") return faFileAudio;
  if (type === "application") {
    if (extension === "pdf") return faFilePdf;
    if (
      extension === "msword" ||
      extension ===
        "vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
      return faFileWord;
    if (
      extension === "vnd.ms-excel" ||
      extension === "vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
      return faFileExcel;
  }
  return faFile;
}
