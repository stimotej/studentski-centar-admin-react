import { Tooltip } from "@mui/material";
import MediaSelectDialog from "../MediaSelectDialog";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd, faXmark } from "@fortawesome/pro-regular-svg-icons";
import Image from "next/image";
import clsx from "clsx";

export default function MultiImageSelect({
  categoryId,
  value,
  onChange,
  className,
}) {
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);

  return (
    <>
      <div
        className={clsx(
          "bg-secondary border border-gray-400 rounded-lg w-full p-4",
          className
        )}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {value &&
            Array.isArray(value) &&
            value.length > 0 &&
            value.map((imageSrc, index) => (
              <div key={index} className="relative">
                <Tooltip title="Ukloni sliku" arrow>
                  <button
                    className="absolute top-0 right-0 z-10 peer px-2 py-1 opacity-0 hover:opacity-100 transition-opacity duration-200"
                    size="small"
                    onClick={() => {
                      onChange(value.filter((_, i) => i !== index));
                    }}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </Tooltip>
                <div className="absolute inset-0 peer-hover:bg-gradient-to-bl from-white/80 to-transparent" />
                <Image
                  src={imageSrc}
                  alt="Studentski dom"
                  width={96}
                  height={96}
                  className="w-full h-auto aspect-square object-cover bg-gray-100 rounded-sm"
                />
              </div>
            ))}
          <button
            className="w-full h-auto aspect-square flex flex-col items-center justify-center gap-2 rounded-sm border border-gray-600 hover:bg-gray-100 text-gray-600 border-dashed"
            onClick={() => setMediaDialogOpen(true)}
          >
            <FontAwesomeIcon icon={faAdd} />
            <span className="text-xs">Dodaj sliku</span>
          </button>
        </div>
      </div>

      <MediaSelectDialog
        opened={mediaDialogOpen}
        onClose={() => setMediaDialogOpen(false)}
        onSelect={(media) => {
          onChange([...(value ?? []), media.src]);
        }}
        categoryId={categoryId}
      />
    </>
  );
}
