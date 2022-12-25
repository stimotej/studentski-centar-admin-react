import { useState } from "react";
import Button from "../Elements/Button";
import Image from "next/image";
import { useUpdateRestaurant } from "../../features/restaurant";
import dynamic from "next/dynamic";
import MediaSelectDialog from "../MediaSelectDialog";
import { prehranaCategoryId } from "../../lib/constants";
import {
  MdAdd,
  MdCalendarToday,
  MdDelete,
  MdEventNote,
  MdLocationPin,
} from "react-icons/md";
import { IconButton, Tooltip } from "@mui/material";
import MyDialog from "../Elements/MyDialog";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const iconList = [
  { name: "location_pin", Icon: MdLocationPin },
  { name: "event_note", Icon: MdEventNote },
  { name: "calendar_today", Icon: MdCalendarToday },
];

const PrikazRestorana = ({ id, slika, naslov, ponuda, info, radnoVrijeme }) => {
  const [image, setImage] = useState(slika);

  const [title, setTitle] = useState(naslov);
  const [description, setDescription] = useState(ponuda);

  const [infoList, setInfoList] = useState(
    info.length > 0
      ? info.map((item) => ({
          ...item,
          icon: iconList.find((i) => i.name === item.icon),
        }))
      : [{ icon: iconList[0], title: "", order: 1 }]
  );
  const [infoHovered, setInfoHovered] = useState(null);

  const [mediaDialog, setMediaDialog] = useState(false);

  const [iconDialog, setIconDialog] = useState(false);

  const { mutate: updateRestaurant, isLoading: isUpdating } =
    useUpdateRestaurant();

  const handleUpdatePost = async () => {
    updateRestaurant({
      imageId: image.id,
      title: title,
      ponuda: description,
      info: infoList.map((item) => ({ ...item, icon: item.icon.name })),
    });
  };

  return (
    <div className="flex flex-col mt-6">
      <MediaSelectDialog
        opened={mediaDialog}
        onClose={() => setMediaDialog(false)}
        value={image}
        onSelect={(value) => setImage(value)}
        categoryId={prehranaCategoryId}
      />

      <button
        onClick={() => setMediaDialog(true)}
        className="relative w-full h-80 cursor-pointer rounded-xl shadow-md hover:shadow-lg transition-shadow"
      >
        {!!image && (
          <Image
            src={image}
            alt="Slika restorana"
            className="rounded-xl object-cover h-full w-auto"
            width={image?.width || 600}
            height={image?.height || 600}
          />
        )}
      </button>
      <ReactQuill
        value={title}
        onChange={setTitle}
        className="mt-4 border rounded-lg obavijest-title font-semibold"
        formats={["header"]}
        modules={{
          toolbar: false,
        }}
      />
      <ReactQuill
        value={description}
        onChange={setDescription}
        className="mt-4 border rounded-lg"
        modules={{
          toolbar: [
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ color: [] }, { background: [] }],
            [{ align: ["", "center", "right", "justify"] }],
          ],
        }}
      />

      <div className="flex flex-col gap-2 mt-4 border rounded-lg p-3">
        {infoList
          ?.sort((a, b) => a.order - b.order)
          ?.map((infoItem, index) => (
            <div
              className="flex gap-4"
              key={index}
              onMouseOver={() => setInfoHovered(infoItem.order)}
              onMouseOut={() => setInfoHovered(null)}
            >
              <Tooltip title="Pritisni za promjenu ikone" arrow>
                <IconButton onClick={() => setIconDialog(infoItem)}>
                  <infoItem.icon.Icon className="text-[#666666]" />
                </IconButton>
              </Tooltip>
              <input
                value={infoItem.title}
                onChange={(e) =>
                  setInfoList([
                    ...infoList.filter((item) => item.order !== infoItem.order),
                    { ...infoItem, title: e.target.value },
                  ])
                }
                placeholder="Unesi informaciju o restoranu"
                className="p-0 bg-transparent flex-1"
              />
              {infoHovered === infoItem.order ? (
                <Tooltip
                  title={index !== infoList.length - 1 ? "Obriši" : "Dodaj"}
                  arrow
                >
                  <IconButton
                    color="error"
                    onClick={
                      index !== infoList.length - 1
                        ? () =>
                            setInfoList(
                              infoList.filter(
                                (item) => item.order !== infoItem.order
                              )
                            )
                        : () =>
                            setInfoList([
                              ...infoList,
                              {
                                icon: iconList[0],
                                title: "",
                                order:
                                  Math.max(
                                    ...infoList.map((item) => item.order),
                                    1
                                  ) + 1,
                              },
                            ])
                    }
                    onMouseOver={() => setInfoHovered(infoItem.order)}
                    onMouseOut={() => setInfoHovered(null)}
                  >
                    {index === infoList.length - 1 ? (
                      <MdAdd className="text-[#666666]" />
                    ) : (
                      <MdDelete />
                    )}
                  </IconButton>
                </Tooltip>
              ) : null}
            </div>
          ))}
      </div>

      <MyDialog
        title="Odaberi ikonu"
        opened={iconDialog}
        setOpened={() => setIconDialog(false)}
        handleClose={() => setIconDialog(false)}
        showActions={false}
      >
        <span className="text-[#666666] flex gap-3 flex-wrap">
          {iconList.map((icon, index) => (
            <IconButton
              key={index}
              onClick={() => {
                setInfoList([
                  ...infoList.filter((item) => item.order !== iconDialog.order),
                  { ...iconDialog, icon },
                ]);
                setIconDialog(false);
              }}
            >
              <icon.Icon />
            </IconButton>
          ))}
        </span>
      </MyDialog>

      <Button
        text="Spremi"
        loading={isUpdating}
        onClick={handleUpdatePost}
        className="w-fit mt-5"
        primary
      />
    </div>
  );
};

export default PrikazRestorana;
