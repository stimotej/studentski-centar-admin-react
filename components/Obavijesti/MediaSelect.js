import Image from "next/image";
import React from "react";

const MediaSelect = ({ mediaList, value, onChange, onDoubleClick }) => {
  return (
    <div className="flex flex-wrap">
      {mediaList?.map((media) => (
        <button
          key={media.id}
          className="w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 h-40 rounded-lg p-2"
          onClick={() => onChange(media)}
          onDoubleClick={onDoubleClick}
        >
          <div
            className={`relative w-full h-full rounded-lg ${
              media.id === value?.id
                ? "ring-2 ring-offset-2 ring-primary"
                : "hover:ring-2 ring-primary"
            }`}
          >
            <Image
              src={media.src}
              alt={media.alt}
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
        </button>
      ))}
    </div>
  );
};

export default MediaSelect;
