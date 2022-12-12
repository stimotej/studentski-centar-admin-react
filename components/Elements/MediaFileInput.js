import { forwardRef, useState } from "react";
import Image from "next/image";
import Dropzone from "react-dropzone";
import clsx from "clsx";

const MediaFileInput = forwardRef(({ value, onChange, className }, ref) => {
  const [dragOver, setDragOver] = useState(false);
  const [dragRejected, setDragRejected] = useState(false);

  return (
    <Dropzone
      ref={ref}
      onDrop={(acceptedFiles) => {
        onChange(acceptedFiles[0]);
        setDragOver(false);
        setDragRejected(false);
      }}
      accept="image/*"
      onDragEnter={() => setDragOver(true)}
      onDragLeave={() => setDragOver(false)}
      onDropAccepted={() => setDragRejected(false)}
      onDropRejected={() => setDragRejected(true)}
    >
      {({ getRootProps, getInputProps }) => (
        <div
          {...getRootProps()}
          className={clsx(
            "text-center p-5 sm:p-8 md:p-12 border cursor-pointer border-dashed text-black/50 rounded-lg",
            dragOver
              ? "border-primary bg-secondary"
              : dragRejected
              ? "border-error"
              : "border-black/50",
            className
          )}
        >
          <input {...getInputProps()} />
          {value && value !== "false" ? (
            <Image
              src={
                typeof value === "string" ? value : URL.createObjectURL(value)
              }
              width={200}
              height={320}
              className="rounded-lg mx-auto object-contain w-full h-auto"
              alt="Slika proizvoda"
            />
          ) : (
            <h3
              className={`text-lg font-semibold ${
                dragOver ? "text-black/50" : dragRejected ? "text-error/50" : ""
              }`}
            >
              {dragOver
                ? "Možete ispustiti datoteku"
                : dragRejected
                ? "Datoteka nije podržana"
                : "Ovdje ispustite datoteku ili pritisnite za odabir"}
            </h3>
          )}
        </div>
      )}
    </Dropzone>
  );
});

MediaFileInput.displayName = "MediaFileInput";

export default MediaFileInput;
