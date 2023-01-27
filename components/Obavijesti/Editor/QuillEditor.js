import { useRef, useMemo, useEffect } from "react";
import ReactQuill, { Quill } from "react-quill";
import ImageResize from "quill-image-resize-module-react";

Quill.register("modules/imageResize", ImageResize, true);

const Editor = ({
  value,
  onChange,
  addImageToolbar,
  addYoutubeVideo,
  addDocumentToolbar,
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

  const formats = [
    "bold",
    "italic",
    "underline",
    "header",
    "list",
    "align",
    "link",
    "blockquote",
    "image",
    "video",
  ];

  const modules = useMemo(
    () => ({
      toolbar: {
        container: "#toolbar",
        handlers: {
          addImageToolbar: addImageToolbar,
          addYoutubeVideo: addYoutubeVideo,
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
