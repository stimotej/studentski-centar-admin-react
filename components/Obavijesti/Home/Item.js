import dayjs from "dayjs";
import Image from "next/image";
import { useEffect } from "react";
import { useState } from "react";
import { MdOutlineImage } from "react-icons/md";
import { useCategories } from "../../../features/obavijesti";
import { obavijestiCategoryId } from "../../../lib/constants";

const Item = ({ obavijest, active, onClick, className, isEvent }) => {
  const { data: categories } = useCategories();
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (categories && !isEvent) {
      const postCategory = obavijest.categories.find(
        (item) => parseInt(item) !== obavijestiCategoryId
      );
      categories.forEach((item) => {
        if (item.id === parseInt(postCategory)) setCategory(item.name);
      });
    }
  }, [categories, isEvent, obavijest.categories]);

  return (
    <div
      className={`flex items-center rounded-lg p-2 cursor-pointer hover:bg-white hover:shadow-lg transition-shadow ${
        active ? "shadow-lg bg-white mb-0 lg:mb-4" : "mb-4"
      } ${isEvent && "!items-start"} ${className}`}
      onClick={onClick}
    >
      {obavijest.image ? (
        <Image
          src={obavijest.image}
          alt={obavijest.title}
          width={112}
          height={112}
          className="rounded-lg object-cover w-28 h-28 mr-4"
        />
      ) : (
        <div className="w-28 mr-4">
          <MdOutlineImage className="w-24 h-24 text-black/50 mx-auto" />
        </div>
      )}
      <div className="flex-1 flex flex-col break-all">
        {isEvent && (
          <p className="text-sm text-gray-500">
            {dayjs(obavijest.date).format("DD.MM.YYYY HH:mm[h]")}
          </p>
        )}
        <div className="flex items-center gap-3">
          <h3
            className="text-lg font-semibold"
            dangerouslySetInnerHTML={{ __html: obavijest.title }}
          ></h3>
          {obavijest.status === "draft" && (
            <span className="text-sm font-normal text-error">Skica</span>
          )}
        </div>
        {isEvent && (
          <div>
            <p className="text-sm">
              Datumi:{" "}
              <strong>
                {obavijest.event_dates
                  .split(",")
                  .map((date) => dayjs(date).format("DD.MM.YYYY [u] HH:mm[h]"))
                  .join(", ")}
              </strong>
            </p>
            {!!obavijest.event_location && (
              <p className="text-sm">
                Lokacija:{" "}
                <span className="text-primary">{obavijest.event_location}</span>
              </p>
            )}
            {!!obavijest.event_type && (
              <p className="text-sm">
                Program:{" "}
                <span className="text-primary">{obavijest.event_type}</span>
              </p>
            )}
          </div>
        )}
        <p className="text-sm font-light my-2">{obavijest.description}</p>
        {!isEvent && (
          <>
            <p className="text-sm">
              {category} | {dayjs(obavijest.date).format("DD.MM.YYYY HH:mm[h]")}
            </p>
            <div className="text-sm">
              {obavijest.show_always ? (
                <span className="text-orange-500">
                  Obavijest se uvijek prikazuje
                </span>
              ) : dayjs().isBefore(obavijest.start_showing) ? (
                <span className="text-red-500">{`Obavijest se prikazuje od: ${dayjs(
                  obavijest.start_showing
                ).format("DD.MM.YYYY")}`}</span>
              ) : dayjs().isAfter(obavijest.end_showing) ? (
                <span className="text-red-700">Obavijest se ne prikazuje</span>
              ) : (
                <span className="text-green-500">{`Obavijest se prikazuje do: ${dayjs(
                  obavijest.end_showing
                ).format("DD.MM.YYYY")}`}</span>
              )}
              <p className="text-sm">
                {!!obavijest.event_date &&
                  `Datum na kalendaru: ${dayjs(obavijest.event_date).format(
                    "DD.MM.YYYY HH:mm[h]"
                  )}`}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Item;
