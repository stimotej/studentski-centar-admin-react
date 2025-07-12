import { useMemo, useState, useRef, useEffect, useId } from "react";
import { MdOutlineImage } from "react-icons/md";
import { FaYoutube } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faXmark } from "@fortawesome/pro-regular-svg-icons";
import MediaSelectDialog from "../MediaSelectDialog";
import MyDialog from "./MyDialog";
import { IconButton, TextField } from "@mui/material";
import { studentskiServisCategoryId } from "../../lib/constants";
import ReactQuill, { Quill } from "react-quill";
import ImageResize from "quill-image-resize-module-react";
import getIconByMimeType from "../../lib/getIconbyMimeType";
import clsx from "clsx";

Quill.register("modules/imageResize", ImageResize, true);

const Block = Quill.import("blots/block");
const Inline = Quill.import("blots/inline");
const Delta = Quill.import("delta");

class DetailsBlot extends Block {
  static create() {
    const node = super.create();
    node.setAttribute("open", "true"); // Open by default
    return node;
  }

  static formats(node) {
    return node.getAttribute("open");
  }

  static register() {
    Quill.register(DetailsBlot);
  }
}

DetailsBlot.blotName = "details";
DetailsBlot.tagName = "details";
DetailsBlot.className = "ql-details";

class SummaryBlot extends Inline {
  static create() {
    return super.create();
  }

  static register() {
    Quill.register(SummaryBlot);
  }
}
SummaryBlot.blotName = "summary";
SummaryBlot.tagName = "summary";
SummaryBlot.className = "ql-summary";

Quill.register(DetailsBlot);
Quill.register(SummaryBlot);

const formatsDefault = [
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
  "details",
  "summary",
];

const QuillTextEditor = ({
  value,
  onChange,
  placeholder,
  useToolbar = true,
  readOnly = false,
  includeStyles = true,
  className,
  containerClassName,
  formats,
  files,
  setFiles = () => {},
  mediaCategoryId,
}) => {
  const [mediaDialog, setMediaDialog] = useState(null);

  const toolbarId = useId();

  const [ytModal, setYtModal] = useState(false);
  const [ytUrl, setYtUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [src, setSrc] = useState(null);

  const addImageToolbar = () => {
    setMediaDialog({ type: "image", action: "contentImage" });
  };

  const addYoutubeVideo = () => {
    setYtModal(true);
  };

  const handleAddYtVideo = () => {
    const ytUrlParams = new URLSearchParams(ytUrl.split("?")[1]);
    setVideoId(ytUrlParams.get("v"));
    setYtModal(false);
  };

  const addDocumentToolbar = () => {
    setMediaDialog({ type: "application", action: "document" });
  };

  const handleSelectMedia = (value) => {
    if (mediaDialog.action === "contentImage") {
      setSrc(value.src);
    } else if (mediaDialog.action === "document") {
      setFiles([...files, value]);
    }
    console.log(value);
  };

  const modules = useMemo(
    () => ({
      toolbar:
        readOnly || !useToolbar
          ? false
          : {
              container: `[id='${toolbarId}']`,
              handlers: {
                addImageToolbar: addImageToolbar,
                addYoutubeVideo: addYoutubeVideo,
                addDocumentToolbar: addDocumentToolbar,
                details: handleInsertCollapsible,
              },
            },
      imageResize: {
        parchment: Quill.import("parchment"),
        modules: ["Resize", "DisplaySize"],
      },
    }),
    []
  );

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

  function handleInsertCollapsible() {
    const quill = reactQuillRef.current.getEditor();
    if (!quill) return;

    const Delta = Quill.import("delta");
    const range = quill.getSelection();
    const position = range ? range.index : 0;

    const delta = new Delta()
      .retain(position)
      .insert("Summary title", { summary: true })
      .insert("Details content")
      .insert("\n", { details: true });

    quill.updateContents(delta);
    quill.setSelection(position + 1, 0); // Place cursor after summary
  }

  return (
    <>
      <button onClick={handleInsertCollapsible} className="p-4">
        alooo
      </button>
      <div
        className={clsx(
          includeStyles &&
            "bg-secondary border border-gray-400 rounded-lg w-full",
          containerClassName
        )}
      >
        {!readOnly && useToolbar ? (
          <Header useFiles={!!files} toolbarId={toolbarId} />
        ) : null}
        <ReactQuill
          ref={(el) => (reactQuillRef.current = el)}
          className={clsx(
            includeStyles ? "my-ql" : "[&>div>div]:p-0",
            !readOnly && useToolbar && "border-t border-gray-400",
            className
          )}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          modules={modules}
          formats={formats || formatsDefault}
        />
        {files?.length > 0 && (
          <div className="p-[15px]">
            <div className="mt-8 mb-2 font-semibold">Dokumenti</div>
            <div className="flex flex-col gap-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-2 border border-gray-400 p-1 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={getIconByMimeType(file.mimeType)}
                      className="text-lg text-gray-800 ml-2"
                    />
                    <div className="flex-1 line-clamp-1 break-all">
                      {file.title}
                    </div>
                  </div>
                  <IconButton
                    className="!aspect-square"
                    onClick={() => {
                      const newFiles = [...files];
                      newFiles.splice(index, 1);
                      setFiles(newFiles);
                    }}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </IconButton>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <MyDialog
        opened={ytModal}
        setOpened={setYtModal}
        title="YouTube video"
        actionTitle={"Dodaj"}
        onClick={handleAddYtVideo}
      >
        <TextField
          value={ytUrl}
          onChange={(e) => setYtUrl(e.target.value)}
          label="Url"
          className="mt-2"
          fullWidth
        />
      </MyDialog>
      <MediaSelectDialog
        opened={!!mediaDialog}
        onClose={() => setMediaDialog(false)}
        onSelect={handleSelectMedia}
        categoryId={mediaCategoryId || studentskiServisCategoryId}
        mediaType={mediaDialog?.type}
      />
    </>
  );
};

const Header = ({ useFiles = true, toolbarId }) => {
  return (
    <header id={toolbarId} className="w-full p-4 flex flex-wrap">
      <select className="ql-header">
        <option value="">Tekst</option>
        <option value="6">Naslov 6</option>
        <option value="5">Naslov 5</option>
        <option value="4">Naslov 4</option>
        <option value="3">Naslov 3</option>
        <option value="2">Naslov 2</option>
        <option value="1">Naslov 1</option>
      </select>
      <div className="h-6 border-l border-black/50 mx-4 my-1 sm:my-2" />
      <button className="ql-bold my-1 sm:my-2"></button>
      <button className="ql-italic my-1 sm:my-2"></button>
      <button className="ql-underline my-1 sm:my-2"></button>
      <select className="ql-color my-1 sm:my-2"></select>
      <select className="ql-background my-1 sm:my-2"></select>
      <div className="h-6 border-l border-black/50 mx-4 my-1 sm:my-2" />
      <button className="ql-align my-1 sm:my-2" value=""></button>
      <button className="ql-align my-1 sm:my-2" value="center"></button>
      <button className="ql-align my-1 sm:my-2" value="right"></button>
      <button className="ql-align my-1 sm:my-2" value="justify"></button>
      <div className="h-6 border-l border-black/50 mx-4 my-1 sm:my-2" />
      <button className="ql-list my-1 sm:my-2" value="bullet"></button>
      <button className="ql-list my-1 sm:my-2" value="ordered"></button>
      <button className="ql-link my-1 sm:my-2"></button>
      <button className="ql-blockquote my-1 sm:my-2"></button>
      <button className="ql-details my-1 sm:my-2">
        <span className="text-black hover:text-primary">Details</span>
      </button>
      <button className="ql-addImageToolbar my-1 sm:my-2">
        <MdOutlineImage className="text-black hover:text-primary" />
      </button>
      <button className="ql-addYoutubeVideo my-1 sm:my-2">
        <FaYoutube className="text-black hover:text-primary" />
      </button>
      {useFiles && (
        <button className="ql-addDocumentToolbar my-1 sm:my-2">
          <FontAwesomeIcon
            icon={faFilePdf}
            className="text-black hover:text-primary ml-2"
          />
        </button>
      )}
    </header>
  );
};

export default QuillTextEditor;
