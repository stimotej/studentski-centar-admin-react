import React, { forwardRef, useEffect, useState } from "react";
import Image from "next/image";
import MediaSelectDialog from "../MediaSelectDialog";
import clsx from "clsx";

const SelectMediaInput = forwardRef(function SelectMediaInput(
  { defaultValue, onChange, className, mediaCategoryId, imgAlt },
  ref
) {
  const [mediaDialog, setMediaDialog] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    setFile(
      typeof defaultValue === "string" ? { src: defaultValue } : defaultValue
    );
  }, [defaultValue]);

  const handleSelectMedia = (value) => {
    setFile(value);
    onChange && onChange(value.id);
  };

  return (
    <>
      <button
        ref={ref}
        className={clsx(
          "mt-2 w-full bg-secondary rounded-lg border border-black/20 hover:border-black text-black/60",
          className
        )}
        onClick={() => setMediaDialog(true)}
      >
        {file?.src ? (
          <Image
            src={file?.src}
            alt={file?.alt || imgAlt || "Slika obavijesti"}
            width={file?.width || 500}
            height={file?.height || 500}
            className="rounded-lg object-cover w-full h-auto"
          />
        ) : (
          <div className="py-4">Odaberi sliku</div>
        )}
      </button>
      <MediaSelectDialog
        opened={mediaDialog}
        onClose={() => setMediaDialog(false)}
        value={file}
        onSelect={handleSelectMedia}
        categoryId={mediaCategoryId}
        mediaType={"image"}
      />
    </>
  );
});

export default SelectMediaInput;
