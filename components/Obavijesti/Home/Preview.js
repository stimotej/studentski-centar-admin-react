import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import { MdOutlineEdit, MdOutlineDelete, MdOpenInNew } from "react-icons/md";
import Button from "../../Elements/Button";

const Preview = ({
  obavijest,
  handleDelete,
  className,
  title,
  isEvent = false,
}) => {
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
        <Button
          link
          text="Uredi"
          icon={<MdOutlineEdit />}
          to={isEvent ? "kultura/uredi-event" : "/obavijesti/uredi-obavijest"}
          state={obavijest}
        />
        <Button
          text="Obriši"
          icon={<MdOutlineDelete />}
          onClick={handleDelete}
          className="ml-4"
        />
        <Button
          text="Otvori"
          icon={<MdOpenInNew />}
          link
          openInNewTab
          to={obavijest?.link}
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
