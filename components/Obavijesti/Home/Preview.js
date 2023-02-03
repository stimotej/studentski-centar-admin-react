import {
  faArrowDownToBracket,
  faFileText,
} from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dynamic from "next/dynamic";
import { useState } from "react";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import { MdOutlineEdit, MdOutlineDelete, MdOpenInNew } from "react-icons/md";
import { useDeleteEvent } from "../../../features/events";
import { useDeleteObavijest } from "../../../features/obavijesti";
import Button from "../../Elements/Button";
import MyDialog from "../../Elements/MyDialog";

const Preview = ({ obavijest, className, title, isEvent = false, from }) => {
  const [deleteDialog, setDeleteDialog] = useState(false);

  const { mutate: deleteObavijest, isLoading: isDeleting } =
    useDeleteObavijest();
  const { mutate: deleteEvent, isLoading: isDeletingEvent } = useDeleteEvent();

  const handleDelete = async () => {
    if (isEvent) {
      deleteEvent(obavijest.id, {
        onSuccess: () => {
          setDeleteDialog(false);
        },
      });
    } else {
      deleteObavijest(obavijest.id, {
        onSuccess: () => {
          setDeleteDialog(false);
        },
      });
    }
  };

  return (
    <div className={className + " break-all"}>
      {title !== false && (
        <div className="flex items-center gap-3">
          <h1
            className="text-2xl font-semibold px-3"
            dangerouslySetInnerHTML={{ __html: obavijest?.title }}
          ></h1>
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
          content="Jeste li sigurni da  želite obrisati odabranu obavijest?"
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
      <ReactQuill
        value={obavijest?.content || ""}
        className="mt-4"
        modules={{
          toolbar: false,
        }}
        readOnly={true}
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
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faFileText}
                    className="text-lg text-gray-800 ml-2"
                  />
                  <div className="flex-1 line-clamp-1 break-all">
                    {file.src?.split("/").pop()}
                  </div>
                  <FontAwesomeIcon
                    icon={faArrowDownToBracket}
                    className="text-lg text-gray-800 ml-2"
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
