import {
  faArrowDownToBracket,
  faFileText,
} from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dynamic from "next/dynamic";
import { useState } from "react";
const QuillTextEditor = dynamic(
  () => import("../../Elements/QuillTextEditor"),
  {
    ssr: false,
  }
);
import { MdOutlineEdit, MdOutlineDelete, MdOpenInNew } from "react-icons/md";
import { useDeleteEvent } from "../../../features/events";
import { useDeleteObavijest } from "../../../features/obavijesti";
import Button from "../../Elements/Button";
import MyDialog from "../../Elements/MyDialog";

const Preview = ({
  obavijest,
  setObavijest,
  className,
  title,
  isEvent = false,
  from,
}) => {
  const [deleteDialog, setDeleteDialog] = useState(false);

  const { mutate: deleteObavijest, isLoading: isDeleting } =
    useDeleteObavijest();
  const { mutate: deleteEvent, isLoading: isDeletingEvent } = useDeleteEvent();

  const handleDelete = async () => {
    if (isEvent) {
      deleteEvent(obavijest.id, {
        onSuccess: () => {
          setDeleteDialog(false);
          setObavijest(null);
        },
      });
    } else {
      deleteObavijest(obavijest.id, {
        onSuccess: () => {
          setDeleteDialog(false);
          setObavijest(null);
        },
      });
    }
  };

  return (
    <div className={className + " break-all"}>
      {title !== false && (
        <div className="flex items-center gap-3">
          <QuillTextEditor
            value={obavijest?.title}
            containerClassName="!bg-transparent border-none px-3"
            className="[&>div>div]:p-0 [&>div>div]:!min-h-fit [&>div>div>p]:text-2xl [&>div>div>p]:font-semibold"
            readOnly
          />
          {obavijest?.status === "draft" && (
            <span className="text-sm font-normal text-error">Skica</span>
          )}
        </div>
      )}
      <div className="flex items-center px-3 mt-2 pt-5 lg:pt-0 lg:my-8">
        <MyDialog
          opened={deleteDialog}
          setOpened={setDeleteDialog}
          title="Brisanje obavijesti"
          content="Jeste li sigurni da želite obrisati odabranu obavijest?"
          actionTitle="Obriši"
          actionColor="error"
          loading={isDeleting || isDeletingEvent}
          onClick={handleDelete}
        />

        <Button
          link
          text="Uredi"
          variant="outlined"
          icon={<MdOutlineEdit />}
          to={isEvent ? "/kultura/uredi-event" : `/${from}/uredi-obavijest`}
          state={{ id: obavijest.id }}
        />
        <Button
          text="Otvori"
          variant="outlined"
          icon={<MdOpenInNew />}
          link
          openInNewTab
          to={obavijest?.link}
          className="!ml-4"
        />
        <Button
          text="Obriši"
          variant="outlined"
          color="error"
          icon={<MdOutlineDelete />}
          onClick={() => setDeleteDialog(true)}
          className="!ml-4"
        />
      </div>
      {/* <ReactQuill
        value={obavijest?.content || ""}
        className="mt-4"
        modules={{
          toolbar: false,
        }}
        readOnly={true}
      /> */}
      <QuillTextEditor
        value={obavijest?.content || ""}
        containerClassName="!bg-transparent border-none my-4"
        className="[&>div>div]:!min-h-fit"
        readOnly
      />
      {obavijest.documents?.length > 0 && (
        <div className="px-3 pb-10">
          <div className="flex flex-col gap-2">
            {obavijest.documents.map((file, index) => (
              <a
                key={index}
                className="flex items-center justify-between gap-2 border border-gray-200 hover:border-[#1CA4FF40] hover:bg-[#1CA4FF10] p-4 rounded-lg"
                target="_blank"
                rel="noreferrer"
                href={file.src}
              >
                <div className="flex items-center gap-2 w-full">
                  <FontAwesomeIcon
                    icon={faFileText}
                    className="text-lg text-gray-800 ml-2"
                  />
                  <div className="flex-1 line-clamp-1 break-all">
                    {file.src?.split("/").pop()}
                  </div>
                  <FontAwesomeIcon
                    icon={faArrowDownToBracket}
                    className="text-lg text-gray-800 ml-auto"
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Preview;
