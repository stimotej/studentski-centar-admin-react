import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import { MdOutlineEdit, MdOutlineDelete } from "react-icons/md";
import Button from "../../Elements/Button";

const Preview = ({ obavijest, handleDelete, className, title }) => {
  return (
    <div className={className + " break-all"}>
      {title !== false && (
        <h1 className="text-2xl font-semibold px-3">
          {obavijest?.title}
          {obavijest?.status === "draft" && (
            <span className="text-sm font-normal text-error ml-3">Skica</span>
          )}
        </h1>
      )}
      <div className="flex items-center px-3 mt-2 pt-5 lg:pt-0 lg:my-8">
        <Button
          link
          text="Uredi"
          icon={<MdOutlineEdit />}
          to="/obavijesti/uredi-obavijest"
          state={obavijest}
        />
        <Button
          text="Obriši"
          icon={<MdOutlineDelete />}
          onClick={handleDelete}
          className="ml-4"
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
