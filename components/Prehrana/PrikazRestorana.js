import { useState } from "react";
import Image from "next/image";
import {
  useDeleteRestaurant,
  useUpdateRestaurant,
} from "../../features/restaurant";
import dynamic from "next/dynamic";
import MediaSelectDialog from "../MediaSelectDialog";
import { prehranaCategoryId } from "../../lib/constants";
import {
  MdAdd,
  MdCalendarToday,
  MdDelete,
  MdEventNote,
  MdLocationPin,
  MdRestaurantMenu,
  MdRestaurant,
  MdLunchDining,
  MdCoffee,
  MdLocalBar,
} from "react-icons/md";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
} from "@mui/material";
import MyDialog from "../Elements/MyDialog";
import { useEffect } from "react";
import { LoadingButton } from "@mui/lab";
import SelectMediaInput from "../Elements/SelectMediaInput";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const iconList = [
  { name: "location_pin", Icon: MdLocationPin },
  { name: "event_note", Icon: MdEventNote },
  { name: "calendar_today", Icon: MdCalendarToday },
  { name: "restaurant_menu", Icon: MdRestaurantMenu },
  { name: "restaurant", Icon: MdRestaurant },
  { name: "lunch_dining", Icon: MdLunchDining },
  { name: "coffee", Icon: MdCoffee },
  { name: "local_bar", Icon: MdLocalBar },
];

const PrikazRestorana = ({ restaurant, page, setPage }) => {
  const [image, setImage] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [workingHours, setWorkingHours] = useState("");

  const [infoList, setInfoList] = useState([]);

  useEffect(() => {
    if (restaurant) {
      setImage(restaurant.imageId);
      setTitle(restaurant.title);
      setDescription(restaurant.ponuda);
      setWorkingHours(restaurant.radnoVrijeme);
      setInfoList(
        restaurant.info.length > 0
          ? restaurant.info.map((item) => ({
              ...item,
              icon: iconList.find((i) => i.name === item.icon),
            }))
          : [{ icon: iconList[0], title: "", order: 1 }]
      );
    }
  }, [restaurant]);

  const [infoHovered, setInfoHovered] = useState(null);

  const [mediaDialog, setMediaDialog] = useState(false);

  const [iconDialog, setIconDialog] = useState(false);

  const [deleteRestaurantDialog, setDeleteRestaurantDialog] = useState(false);

  const { mutate: updateRestaurant, isLoading: isUpdating } =
    useUpdateRestaurant();

  const handleUpdateRestaurant = () => {
    updateRestaurant({
      id: page,
      imageId: image,
      title: title,
      ponuda: description,
      radnoVrijeme: workingHours,
      info: infoList.map((item) => ({ ...item, icon: item.icon.name })),
    });
  };

  const { mutate: deleteRestaurant, isLoading: isDeleting } =
    useDeleteRestaurant();

  const handleDeleteRestaurant = () => {
    deleteRestaurant(
      {
        id: page,
      },
      {
        onSuccess: () => {
          setDeleteRestaurantDialog(false);
          setPage(0);
        },
      }
    );
  };

  return (
    <div className="flex flex-col">
      <MediaSelectDialog
        opened={mediaDialog}
        onClose={() => setMediaDialog(false)}
        value={image}
        onSelect={(value) => setImage(value)}
        categoryId={prehranaCategoryId}
      />

      <h3 className="uppercase text-primary text-sm tracking-wider mb-6">
        Prikaz restorana
      </h3>

      <h3 className="font-semibold">Slika</h3>
      <SelectMediaInput
        defaultValue={restaurant?.image}
        onChange={setImage}
        className="w-1/2 !bg-transparent border-gray-200"
        mediaCategoryId={prehranaCategoryId}
      />

      <h3 className="font-semibold mt-4 mb-2">Naziv</h3>
      <ReactQuill
        value={title}
        onChange={setTitle}
        className="border rounded-lg obavijest-title font-semibold"
        formats={["header"]}
        placeholder="Unesi naslov..."
        modules={{
          toolbar: false,
        }}
      />
      <h3 className="font-semibold mt-4 mb-2">Ponuda</h3>
      <ReactQuill
        value={description}
        onChange={setDescription}
        className="border rounded-lg [&>div>div]:border-t [&>div>div]:border-gray-200"
        placeholder="Unesi ponudu..."
        modules={{
          toolbar: [
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ color: [] }, { background: [] }],
            [{ align: ["", "center", "right", "justify"] }],
          ],
        }}
      />

      <h3 className="font-semibold mb-2 mt-4">Informacije</h3>
      <div className="flex flex-col gap-2 border rounded-lg p-3">
        {infoList
          ?.sort((a, b) => a.order - b.order)
          ?.map((infoItem, index) => (
            <div
              className="flex gap-4"
              key={infoItem.order}
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

      <h3 className="uppercase text-primary text-sm tracking-wider mt-6">
        Radno vrijeme
      </h3>
      <ReactQuill
        value={workingHours}
        onChange={setWorkingHours}
        className="mt-4 border rounded-lg [&>div>div]:border-t [&>div>div]:border-gray-200"
        placeholder="Unesi radno vrijeme..."
        modules={{
          toolbar: [
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ color: [] }, { background: [] }],
            [
              { align: "" },
              { align: "center" },
              { align: "right" },
              { align: "justify" },
            ],
          ],
        }}
      />

      <div className="flex gap-2 items-center mt-6">
        <LoadingButton
          variant="contained"
          loading={isUpdating}
          onClick={handleUpdateRestaurant}
          className="!bg-primary"
        >
          Spremi
        </LoadingButton>
        <LoadingButton
          variant="outlined"
          color="error"
          onClick={() => setDeleteRestaurantDialog(true)}
        >
          Obriši
        </LoadingButton>
      </div>

      <Dialog
        open={deleteRestaurantDialog}
        onClose={() => setDeleteRestaurantDialog(false)}
      >
        <DialogTitle>Brisanje restorana</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ovime se briše stranica i link na strnicu sadržaja. Radnja se ne
            može poništiti.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteRestaurantDialog(false)}
            className="!text-black"
          >
            Odustani
          </Button>
          <LoadingButton
            color="error"
            onClick={handleDeleteRestaurant}
            loading={isDeleting}
          >
            Obriši
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PrikazRestorana;
