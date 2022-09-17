import Image from "next/image";
import { MdOutlineImage } from "react-icons/md";

const Item = ({ obavijest, active, onClick, className }) => {
  return (
    <div
      className={`flex items-center rounded-lg p-2 cursor-pointer hover:bg-white hover:shadow-lg transition-shadow ${
        active ? "shadow-lg bg-white mb-0 lg:mb-4" : "mb-4"
      } ${className}`}
      onClick={onClick}
    >
      {obavijest.image ? (
        <div className="w-28 h-28 relative mr-4">
          <Image
            src={obavijest.image}
            alt={obavijest.title}
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
        </div>
      ) : (
        <div className="w-28 mr-4">
          <MdOutlineImage className="w-24 h-24 text-black/50 mx-auto" />
        </div>
      )}
      <div className="flex-1 flex flex-col break-all">
        <div className="flex items-center gap-3">
          <h3
            className="text-lg font-semibold"
            dangerouslySetInnerHTML={{ __html: obavijest.title }}
          ></h3>
          {obavijest.status === "draft" && (
            <span className="text-sm font-normal text-error">Skica</span>
          )}
        </div>
        <p className="text-sm font-light my-2">{obavijest.description}</p>
        <p className="text-sm">
          {obavijest.author} - {obavijest.date.replace("T", " ")}
        </p>
      </div>
    </div>
  );
};

export default Item;
