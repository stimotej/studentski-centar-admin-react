import { useMemo, useState, useRef, useEffect } from "react";
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

const QuillTextEditor = ({
  value,
  onChange,
  placeholder,
  readOnly,
  className,
  containerClassName,
  files,
  setFiles = () => {},
}) => {
  const [mediaDialog, setMediaDialog] = useState(null);

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
      toolbar: readOnly
        ? false
        : {
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

  return (
    <>
      <div
        className={clsx(
          "bg-secondary border border-gray-400 rounded-lg w-full",
          containerClassName
        )}
      >
        {!readOnly && <Header useFiles={!!files} />}
        <ReactQuill
          ref={(el) => (reactQuillRef.current = el)}
          className={clsx(
            "my-ql",
            !readOnly && "border-t border-gray-400",
            className
          )}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          modules={modules}
          formats={formats}
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
                      {file.src?.split("/").pop()}
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
        categoryId={studentskiServisCategoryId}
        mediaType={mediaDialog?.type}
      />
    </>
  );
};

const Header = ({ useFiles = true }) => {
  return (
    <header id="toolbar" className="w-full p-4 flex flex-wrap">
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
