import { useRef, useMemo, useEffect } from "react";
import ReactQuill, { Quill } from "react-quill";
import ImageResize from "quill-image-resize-module-react";

Quill.register("modules/imageResize", ImageResize, true);

const BlockEmbed = Quill.import("blots/block/embed");

class InstagramEmbed extends BlockEmbed {
  static create(value) {
    const node = super.create();
    node.innerHTML = value;

    return node;
  }

  static value(node) {
    if (!window.instgrm) {
      const script = document.createElement("script");
      script.src = "https://www.instagram.com/embed.js";
      document.body.appendChild(script);
    } else {
      window.instgrm.Embeds.process();
    }

    return node.innerHTML;
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

  useEffect(() => {
    if (src) {
      const quill = reactQuillRef.current.getEditor();
      var range = quill.getSelection();
      let position = range ? range.index : 0;
      quill.insertEmbed(position, "image", src);
      setSrc(null);
    }
  }, [src]);

  useEffect(() => {
    if (videoId) {
      const quill = reactQuillRef.current.getEditor();
      var range = quill.getSelection();
      let position = range ? range.index : 0;
      quill.insertEmbed(
        position,
        "video",
        `https://www.youtube.com/embed/${videoId}`
      );
      setVideoId(null);
    }
  }, [videoId]);

  useEffect(() => {
    if (embed) {
      const quill = reactQuillRef.current.getEditor();
      const range = quill.getSelection();
      const position = range ? range.index : 0;

      quill.insertEmbed(position, "instagram", embed);
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
          addImageToolbar: addImageToolbar,
          addYoutubeVideo: addYoutubeVideo,
          addEmbedPost: addEmbedPost,
          addDocumentToolbar: addDocumentToolbar,
        },
      },
      imageResize: {
        parchment: Quill.import("parchment"),
        modules: ["Resize", "DisplaySize"],
      },
    }),
    []
  );

  return (
    <>
      <ReactQuill
        ref={(el) => (reactQuillRef.current = el)}
        value={value}
        onChange={onChange}
        className={`mt-4 ${className}`}
        placeholder="Sadržaj..."
        modules={modules}
        formats={formats}
      />
    </>
  );
};

export default Editor;
