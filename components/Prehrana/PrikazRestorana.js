import { useState, useRef } from "react";
import ReactHtmlParser from "react-html-parser";
import {
  MdOutlinePlace,
  MdOutlineEventNote,
  MdOutlineCalendarToday,
} from "react-icons/md";
import { toast } from "react-toastify";
import Button from "../Elements/Button";
import Image from "next/image";
import { updateRestaurant } from "../../lib/api/restaurant";
import { createMedia } from "../../lib/api/media";
import { useUpdateRestaurant } from "../../features/restaurant";
import { useCreateMedia } from "../../features/media";

const PrikazRestorana = ({ id, slika, naslov, opis }) => {
  function transform(node) {
    if (node.type === "tag" && node.name === "ul") {
      node.attribs.class = "list-disc mb-3";
    }
    if (node.type === "tag" && node.name === "i") {
      node.attribs.class = "material-icons hidden";
      const iconName = node.children[0].data;
      let icon = <div />;
      if (iconName === "place") icon = <MdOutlinePlace className="mr-2" />;
      if (iconName === "event_note")
        icon = <MdOutlineEventNote className="mr-2" />;
      if (iconName === "calendar_today")
        icon = <MdOutlineCalendarToday className="mr-2" />;

      return (
        <>
          <i className={node.attribs.class}>{iconName}</i>
          {icon}
        </>
      );
    }
    if (node.type === "tag" && node.attribs.class === "podatak") {
      node.attribs.class = "podatak flex my-3";
    }
  }

  const [image, setImage] = useState(null);
  const naslovRef = useRef("");
  const opisRef = useRef("");

  const { mutate: createMedia, isLoading: isCreatingMedia } = useCreateMedia();
  const { mutate: updateRestaurant, isLoading: isUpdating } =
    useUpdateRestaurant();

  const handleUpdatePost = async () => {
    if (image) {
      var reader = new FileReader();
      reader.onloadend = async () => {
        createMedia(
          { body: reader.result, type: image.type, name: image.name },
          {
            onSuccess: (media) => {
              updateRestaurant({
                title: naslovRef.current.innerHTML,
                description: opisRef.current.innerHTML,
                imageId: media.id,
              });
            },
          }
        );
      };
      reader.readAsArrayBuffer(image);
    } else {
      updateRestaurant({
        title: naslovRef.current.innerHTML,
        description: opisRef.current.innerHTML,
      });
    }
  };

  return (
    <div className="flex flex-col mt-6">
      <input
        style={{ display: "none" }}
        id="image"
        type="file"
        accept="image/png, image/jpeg"
        onChange={(e) => {
          e.target.files.length && setImage(e.target.files[0]);
        }}
      />
      <label
        htmlFor="image"
        className="relative w-full h-80 cursor-pointer rounded-xl shadow-md hover:shadow-lg transition-shadow"
      >
        {(!!image || !!slika) && (
          <Image
            src={image ? URL.createObjectURL(image) : slika ? slika : ""}
            alt="Slika restorana"
            className="rounded-xl"
            layout="fill"
            objectFit="cover"
          />
        )}
      </label>
      <h4
        className="font-semibold pt-4 text-2xl"
        ref={naslovRef}
        contentEditable
        suppressContentEditableWarning
      >
        {naslov}
      </h4>
      <div
        ref={opisRef}
        className="pt-4"
        contentEditable
        suppressContentEditableWarning
      >
        {ReactHtmlParser(opis, { transform })}
      </div>

      <Button
        text="Spremi"
        loading={isCreatingMedia || isUpdating}
        onClick={handleUpdatePost}
        className="w-fit mt-5"
        primary
      />
    </div>
  );
};

export default PrikazRestorana;
