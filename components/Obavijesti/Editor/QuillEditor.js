import { useRef, useMemo, useEffect, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import ImageResize from "quill-image-resize-module-react";

Quill.register("modules/imageResize", ImageResize, true);

const BlockEmbed = Quill.import("blots/block/embed");

const AlignStyle = Quill.import("attributors/style/align");
Quill.register(AlignStyle, true);

class InstagramEmbed extends BlockEmbed {
  static create(value) {
    const node = super.create();
    node.setAttribute("contenteditable", "false");
    const { html, align } = InstagramEmbed.normalizeValue(value);
    node.innerHTML = `
      <div class="embed-container">${html}</div>
    `;
    InstagramEmbed.applyAlignment(node, align ?? "center");
    return node;
  }

  static formats(node) {
    const formats = { ...(super.formats(node) || {}) };
    const align = node.style.textAlign;
    if (align) {
      formats.align = align;
    }
    return formats;
  }

  format(name, value) {
    super.format(name, value);
    if (name === "align") {
      InstagramEmbed.applyAlignment(this.domNode, value);
    }
  }

  static value(node) {
    if (!window.instgrm) {
      const script = document.createElement("script");
      script.src = "https://www.instagram.com/embed.js";
      document.body.appendChild(script);
    } else {
      window.instgrm.Embeds.process();
    }
    return {
      html: node.querySelector(".embed-container")?.innerHTML || "",
      align: node.dataset.align ?? node.style.textAlign ?? "",
    };
  }

  static normalizeValue(value) {
    if (typeof value === "string") {
      return { html: value, align: undefined };
    }
    if (value && typeof value === "object") {
      return {
        html: value.html || "",
        align: value.align,
      };
    }
    return { html: "", align: undefined };
  }

  static applyAlignment(node, value) {
    const allowed = ["left", "center", "right", "justify"];
    const align = allowed.includes(value) ? value : value ? "center" : "";
    if (align) {
      node.style.textAlign = align;
      node.dataset.align = align;
    } else {
      node.style.textAlign = "";
      delete node.dataset.align;
    }
  }
}

InstagramEmbed.blotName = "instagram";
InstagramEmbed.tagName = "div";
InstagramEmbed.className = "instagram-embed";

Quill.register(InstagramEmbed, true);

const Editor = ({
  value,
  onChange,
  addImageToolbar,
  addYoutubeVideo,
  addEmbedPost,
  addDocumentToolbar,
  embed,
  setEmbed,
  videoId,
  setVideoId,
  className,
  src,
  setSrc,
}) => {
  const reactQuillRef = useRef(null);
  const [savedRange, setSavedRange] = useState(null);

  const handleSelectionChange = (range) => {
    if (range) setSavedRange(range);
  };

  useEffect(() => {
    if (src) {
      const quill = reactQuillRef.current.getEditor();
      const position = savedRange ? savedRange.index : quill.getLength();
      quill.insertEmbed(position, "image", src);
      quill.focus();
      quill.setSelection(position + 1);
      setSrc(null);
    }
  }, [src]);

  useEffect(() => {
    if (videoId) {
      const quill = reactQuillRef.current.getEditor();
      const position = savedRange ? savedRange.index : quill.getLength();
      quill.insertEmbed(
        position,
        "video",
        `https://www.youtube.com/embed/${videoId}`
      );
      quill.focus();
      quill.setSelection(position + 1);
      setVideoId(null);
    }
  }, [videoId]);

  // Insert Instagram
  useEffect(() => {
    if (embed) {
      const quill = reactQuillRef.current.getEditor();
      const position = savedRange ? savedRange.index : quill.getLength();
      const formatTarget = savedRange || { index: position, length: 0 };
      const currentFormat = quill.getFormat(formatTarget);
      const initialAlign = Object.prototype.hasOwnProperty.call(
        currentFormat,
        "align"
      )
        ? currentFormat.align
        : undefined;

      quill.insertEmbed(position, "instagram", {
        html: embed,
        align: initialAlign,
      });
      quill.focus();
      quill.setSelection(position + 1);
      setEmbed(null);
    }
  }, [embed]);

  const formats = [
    "bold",
    "italic",
    "underline",
    "color",
    "background",
    "header",
    "list",
    "align",
    "link",
    "blockquote",
    "image",
    "video",
    "instagram",
  ];

  const modules = useMemo(
    () => ({
      toolbar: {
        container: "#toolbar",
        handlers: {
          addImageToolbar,
          addYoutubeVideo,
          addEmbedPost,
          addDocumentToolbar,
        },
      },
      imageResize: {
        parchment: Quill.import("parchment"),
        modules: ["Resize", "DisplaySize"],
      },
      clipboard: { matchVisual: false },
    }),
    []
  );

  return (
    <ReactQuill
      ref={(el) => (reactQuillRef.current = el)}
      value={value}
      onChange={onChange}
      onChangeSelection={handleSelectionChange}
      className={`mt-4 ${className}`}
      placeholder="Sadržaj..."
      modules={modules}
      formats={formats}
    />
  );
};

export default Editor;
