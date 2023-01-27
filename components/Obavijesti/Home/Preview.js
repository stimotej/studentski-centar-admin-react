import dynamic from "next/dynamic";
import { useState } from "react";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import { MdOutlineEdit, MdOutlineDelete, MdOpenInNew } from "react-icons/md";
import { useDeleteObavijest } from "../../../features/obavijesti";
import Button from "../../Elements/Button";
import MyDialog from "../../Elements/MyDialog";

const Preview = ({ obavijest, className, title, isEvent = false, from }) => {
  const [deleteDialog, setDeleteDialog] = useState(false);

  const { mutate: deleteObavijest, isLoading: isDeleting } =
    useDeleteObavijest();

  const handleDelete = async () => {
    deleteObavijest(obavijest.id, {
      onSuccess: () => {
        setDeleteDialog(false);
      },
    });
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
          loading={isDeleting}
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
    </div>
  );
};

export default Preview;
