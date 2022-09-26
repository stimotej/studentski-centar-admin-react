import dayjs from "dayjs";
import Image from "next/image";
import { useEffect } from "react";
import { useState } from "react";
import { MdOutlineImage } from "react-icons/md";
import { useCategories } from "../../../lib/api/categories";
import { obavijestiCategoryId } from "../../../lib/constants";

const Item = ({ obavijest, active, onClick, className }) => {
  const { categories } = useCategories();
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (categories) {
      const postCategory = obavijest.categories.find(
        (item) => parseInt(item) !== obavijestiCategoryId
      );
      categories.forEach((item) => {
        if (item.id === parseInt(postCategory)) setCategory(item.name);
      });
    }
  }, [categories]);

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
          {category} | {dayjs(obavijest.date).format("DD.MM.YYYY HH:MM[h]")}
        </p>
      </div>
    </div>
  );
};

export default Item;
