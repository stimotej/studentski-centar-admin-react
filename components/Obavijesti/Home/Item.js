import dayjs from "dayjs";
import Image from "next/image";
import clearHtmlFromString from "../../../lib/clearHtmlFromString";
import dynamic from "next/dynamic";
import clsx from "clsx";
const QuillTextEditor = dynamic(
  () => import("../../Elements/QuillTextEditor"),
  {
    ssr: false,
  }
);

const Item = ({
  obavijest,
  active,
  onClick,
  className,
  isEvent,
  showCategory,
}) => {
  return (
    <div
      className={`flex rounded-lg p-2 cursor-pointer hover:bg-white hover:shadow-lg transition-shadow ${
        active ? "shadow-lg bg-white mb-0 lg:mb-4" : "mb-4"
      } ${isEvent && "!items-start"} ${className}`}
      onClick={onClick}
    >
      <Image
        src={obavijest.image || "/zaposlenici/placeholder.png"}
        alt={obavijest.title}
        width={112}
        height={112}
        className="rounded-lg object-cover w-28 h-28 mr-4 mt-2"
      />
      <div className="flex-1 flex flex-col break-all">
        {isEvent && (
          <p className="text-sm text-gray-500">
            {dayjs(obavijest.date).format("DD.MM.YYYY [u] HH:mm[h]")}
          </p>
        )}
        <div className="flex items-center gap-3">
          <QuillTextEditor
            value={
              clearHtmlFromString(obavijest.title || "")
                ? obavijest.title
                : "Nema naslova"
            }
            containerClassName="!bg-transparent border-none"
            className={clsx(
              "[&>div>div]:p-0 [&>div>div]:!min-h-fit [&>div>div]:line-clamp-1 [&>div>div>p]:text-lg [&>div>div>p]:font-semibold [&>div>div>p]:hover:cursor-pointer",
              clearHtmlFromString(obavijest.title || "")
                ? "text-gray-900"
                : "text-error"
            )}
            readOnly
          />
          {obavijest.status === "draft" && (
            <span className="text-sm font-normal text-error">Skica</span>
          )}
        </div>
        {isEvent && (
          <div>
            <p className="text-sm">
              Datumi:{" "}
              <strong>
                {obavijest.dates
                  .map((date) => dayjs(date).format("DD.MM.YYYY [u] HH:mm[h]"))
                  .join(", ")}
              </strong>
            </p>
            {!!obavijest.location && (
              <p className="text-sm">
                Lokacija:{" "}
                <span className="text-primary">{obavijest.location}</span>
              </p>
            )}
            {!!obavijest.type && (
              <p className="text-sm">
                Program: <span className="text-primary">{obavijest.type}</span>
              </p>
            )}
          </div>
        )}
        {!isEvent && (
          <>
            <p className="text-sm font-light my-2">
              <QuillTextEditor
                value={
                  clearHtmlFromString(obavijest.description || "")
                    ? obavijest.description
                    : "Nema opisa obavijesti"
                }
                containerClassName="!bg-transparent border-none"
                className={clsx(
                  "[&>div>div]:p-0 [&>div>div]:!min-h-fit [&>div>div]:line-clamp-2 [&>div>div>p]:font-light [&>div>div>p]:text-sm [&>div>div>p]:hover:cursor-pointer",
                  clearHtmlFromString(obavijest.description || "")
                    ? "text-gray-600"
                    : "text-error [&>div>div>p]:!font-normal"
                )}
                readOnly
              />
            </p>
            <p className="text-sm">
              {showCategory ? `${obavijest.category} | ` : null}
              {dayjs(obavijest.date).format("DD.MM.YYYY HH:mm[h]")}
            </p>
            <div className="text-sm">
              {dayjs().isBefore(obavijest.start_showing) ? (
                <span className="text-red-500">{`Obavijest se prikazuje od: ${dayjs(
                  obavijest.start_showing
                ).format("DD.MM.YYYY")}`}</span>
              ) : obavijest.end_showing === "Never" ? (
                <span className="text-orange-500">
                  Obavijest se uvijek prikazuje
                </span>
              ) : dayjs().isAfter(obavijest.end_showing) ? (
                <span className="text-red-700">Obavijest se ne prikazuje</span>
              ) : (
                <span className="text-green-500">{`Obavijest se prikazuje do: ${dayjs(
                  obavijest.end_showing
                ).format("DD.MM.YYYY")}`}</span>
              )}
              {!!obavijest.event_date && (
                <p className="text-sm">
                  {`Datum na kalendaru: ${dayjs(obavijest.event_date).format(
                    "DD.MM.YYYY HH:mm[h]"
                  )}`}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Item;
