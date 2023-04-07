import { faXmark } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconButton } from "@mui/material";
import clsx from "clsx";
import React from "react";
import getIconByMimeType from "../../lib/getIconbyMimeType";

const DisplayFiles = ({ files, setFiles, className }) => {
  if (!files.length) return null;
  return (
    <div className={clsx("flex flex-col gap-2", className)}>
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
            <div className="flex-1 line-clamp-1 break-all">{file.title}</div>
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
  );
};

export default DisplayFiles;
