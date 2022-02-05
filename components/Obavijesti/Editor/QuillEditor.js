import { useRef, useMemo, useEffect } from "react";
import ReactQuill, { Quill } from "react-quill";
import ImageResize from "quill-image-resize-module-react";

Quill.register("modules/imageResize", ImageResize, true);

const Editor = ({ value, onChange, addImageToolbar, src, setSrc }) => {
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
  ];

  const modules = useMemo(
    () => ({
      toolbar: {
        container: "#toolbar",
        handlers: {
          addImageToolbar: addImageToolbar,
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
    <ReactQuill
      ref={(el) => (reactQuillRef.current = el)}
      value={value}
      onChange={onChange}
      className="mt-4"
      placeholder="Sadržaj..."
      modules={modules}
      formats={formats}
    />
  );
};

export default Editor;
