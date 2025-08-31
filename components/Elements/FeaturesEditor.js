import { Button, TextField, Tooltip } from "@mui/material";
import MediaSelectDialog from "../MediaSelectDialog";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus, faXmark } from "@fortawesome/pro-regular-svg-icons";
import Image from "next/image";
import clsx from "clsx";

export default function FeaturesEditor({
  value,
  onChange,
  categoryId,
  className,
}) {
  const [mediaDialog, setMediaDialog] = useState(null);

  return (
    <>
      <div className={className}>
        {value.length <= 0 ? (
          <p className="text-gray-600">Nema značajki za prikaz</p>
        ) : (
          value.map((feature, index) => (
            <div
              key={index}
              className={clsx(
                "border border-gray-400 rounded-lg w-full p-4",
                index !== 0 && "mt-3"
              )}
            >
              <div className="flex gap-3">
                <button
                  onClick={() => setMediaDialog(index)}
                  className="w-14 h-14 border border-gray-400 bg-secondary rounded-md"
                >
                  {!feature.image_url ? (
                    <div className="flex items-center justify-center">
                      <FontAwesomeIcon icon={faCirclePlus} />
                    </div>
                  ) : (
                    <div key={index} className="relative">
                      <Tooltip title="Ukloni sliku" arrow>
                        <button
                          className="absolute top-0 right-0 z-10 peer px-2 py-1 opacity-0 hover:opacity-100 transition-opacity duration-200"
                          size="small"
                          onClick={() => {
                            onChange(
                              value.map((feature, i) =>
                                i === index
                                  ? { ...feature, image_url: "" }
                                  : feature
                              )
                            );
                          }}
                        >
                          <FontAwesomeIcon icon={faXmark} />
                        </button>
                      </Tooltip>
                      <div className="absolute inset-0 peer-hover:bg-gradient-to-bl from-white/80 to-transparent" />
                      <Image
                        src={feature.image_url}
                        alt="Slika"
                        width={96}
                        height={96}
                        className="w-full h-auto aspect-square object-contain bg-gray-100 rounded-sm"
                      />
                    </div>
                  )}
                </button>
                <TextField
                  variant="outlined"
                  label="Naslov"
                  className="flex-1"
                  value={feature.title || ""}
                  onChange={(e) => {
                    onChange(
                      value.map((feature, i) =>
                        i === index
                          ? { ...feature, title: e.target.value }
                          : feature
                      )
                    );
                  }}
                />
              </div>
              <TextField
                multiline
                variant="outlined"
                label="Opis"
                className="w-full !mt-3"
                value={feature.description || ""}
                onChange={(e) => {
                  onChange(
                    value.map((feature, i) =>
                      i === index
                        ? { ...feature, description: e.target.value }
                        : feature
                    )
                  );
                }}
              />

              <Button
                variant="text"
                color="error"
                className="!mt-3"
                onClick={() => {
                  onChange(value.filter((_, i) => i !== index));
                }}
              >
                Ukloni
              </Button>
            </div>
          ))
        )}
        <Button
          variant="outlined"
          className="!mt-3"
          onClick={() => {
            onChange([
              ...value,
              {
                title: "",
                description: "",
                image_url: "",
              },
            ]);
          }}
        >
          Dodaj značajku
        </Button>
      </div>

      <MediaSelectDialog
        opened={mediaDialog !== null}
        onClose={() => setMediaDialog(null)}
        onSelect={(media) => {
          onChange(
            value.map((feature, i) =>
              i === mediaDialog ? { ...feature, image_url: media.src } : feature
            )
          );
        }}
        categoryId={categoryId}
      />
    </>
  );
}
