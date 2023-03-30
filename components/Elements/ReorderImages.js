import { faAdd, faXmark } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LoadingButton } from "@mui/lab";
import { IconButton, Tooltip } from "@mui/material";
import clsx from "clsx";
import Image from "next/image";
import { useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { toast } from "react-toastify";
import { ItemTypesDnD } from "../../lib/constants";
import MediaSelectDialog from "../MediaSelectDialog";

export function replaceElements(arrayState, dragIndex, hoverIndex) {
  const array = [...arrayState];
  const dragItem = array[dragIndex];
  const hoverItem = array[hoverIndex];

  array.splice(dragIndex, 1, hoverItem);

  array.splice(hoverIndex, 1, dragItem);

  return array;
}

const ReorderImages = ({ mediaCategoryId, imageGroups, setImageGroups }) => {
  const [mediaDialog, setMediaDialog] = useState({
    opened: false,
    group: null,
  });

  const moveImage = (dragIndex, hoverIndex, groupId) => {
    // when moving card in same group replace images in group
    const newImageGroups = [...imageGroups];
    const group = newImageGroups.find((g) => g.id === groupId);
    if (!group) return;
    group.images = replaceElements(group.images, dragIndex, hoverIndex);
    setImageGroups(newImageGroups);
  };

  const handleAddImage = (image) => {
    const group = imageGroups.find((g) => g.id === mediaDialog.group);
    if (!group) return;
    if (group.images.some((img) => img.url === image.src)) {
      toast.info("Odabrana slika je već dodana.");
      return;
    }
    // Set new image to group images
    const newImageGroups = [...imageGroups];
    const newGroup = newImageGroups.find((g) => g.id === group.id);
    newGroup.images.push({ id: newGroup.images.length + 1, url: image.src });
    setImageGroups(newImageGroups);
    setMediaDialog({ opened: false, group: null });
  };

  const handleReorderImages = (groupId) => {
    // Set image ids to go by order in group
    const newImageGroups = [...imageGroups];
    const newGroup = newImageGroups.find((g) => g.id === groupId);
    if (!newGroup) return;
    newGroup.images = newGroup.images.map((image, index) => ({
      id: index + 1,
      url: image.url,
    }));
    setImageGroups(newImageGroups);
  };

  const handleRemoveImage = (groupId, imageId) => {
    const newImageGroups = [...imageGroups];
    const newGroup = newImageGroups.find((g) => g.id === groupId);
    if (!newGroup) return;
    newGroup.images = newGroup.images.filter((image) => image.id !== imageId);
    handleReorderImages(groupId);
    setImageGroups(newImageGroups);
  };

  return (
    <>
      <MediaSelectDialog
        opened={mediaDialog.opened}
        onClose={() => setMediaDialog({ opened: false, group: null })}
        onSelect={handleAddImage}
        categoryId={mediaCategoryId}
      />
      {imageGroups?.map((group, index) => (
        <div key={group.id} className="p-2 border rounded-md mb-2">
          <input
            type="text"
            value={group.title || ""}
            onChange={(e) => {
              const newImageGroups = [...imageGroups];
              const newGroup = newImageGroups.find((g) => g.id === group.id);
              newGroup.title = e.target.value;
              setImageGroups(newImageGroups);
            }}
            className="font-medium text-sm mb-2 border rounded bg-transparent w-full"
            placeholder="Naslov grupe"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 w-full">
            {group.images.map((image, i) => (
              <Card
                key={image.id}
                index={i}
                id={image.id}
                src={image.url}
                groupId={group.id}
                reorderImages={() => handleReorderImages(group.id)}
                removeImage={() => handleRemoveImage(group.id, image.id)}
                moveImage={(dIndex, hIndex) =>
                  moveImage(dIndex, hIndex, group.id)
                }
              />
            ))}
            <button
              className="w-full h-auto aspect-square flex flex-col items-center justify-center gap-2 rounded-sm border border-gray-600 hover:bg-gray-100 text-gray-600 border-dashed"
              onClick={() => setMediaDialog({ opened: true, group: group.id })}
            >
              <FontAwesomeIcon icon={faAdd} />
              <span className="text-xs">Dodaj sliku</span>
            </button>
          </div>
          <LoadingButton
            color="error"
            className="mt-2"
            onClick={() => {
              const newImageGroups = [...imageGroups];
              newImageGroups.splice(index, 1);
              setImageGroups(newImageGroups);
            }}
          >
            Obriši
          </LoadingButton>
        </div>
      ))}
      <LoadingButton
        variant="outlined"
        onClick={() => {
          console.log(imageGroups);
          setImageGroups([
            ...imageGroups,
            { id: imageGroups.length + 1, title: "", images: [] },
          ]);
        }}
      >
        Dodaj grupu
      </LoadingButton>
    </>
  );
};

export default ReorderImages;

const Card = ({
  id,
  src,
  index,
  moveImage,
  reorderImages,
  removeImage,
  groupId,
}) => {
  const ref = useRef(null);
  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypesDnD.IMAGE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      if (item.groupId !== groupId) return;

      const dragIndex = item.index;
      const hoverIndex = index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      // Dragging left
      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleY) {
        return;
      }
      // Dragging right
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveImage(dragIndex, hoverIndex);
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
    drop(item, monitor) {
      reorderImages();
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypesDnD.IMAGE,
    item: () => {
      return { id, index, groupId };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const opacity = isDragging ? 0 : 1;

  drag(drop(ref));
  return (
    <div ref={ref} className="relative">
      {/* Create x icon button on hover from mui that removes image when clicked */}
      <Tooltip title="Ukloni sliku iz grupe" arrow>
        <button
          className="absolute top-0 right-0 z-10 peer px-2 py-1 opacity-0 hover:opacity-100 transition-opacity duration-200"
          size="small"
          onClick={removeImage}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </Tooltip>
      <div className="absolute inset-0 peer-hover:bg-gradient-to-bl from-white/80 to-transparent" />
      <Image
        src={src}
        alt="Studentski dom"
        style={{ opacity }}
        width={96}
        height={96}
        className={clsx(
          "w-full h-auto aspect-square object-cover bg-gray-100 rounded-sm"
        )}
        data-handler-id={handlerId}
      />
    </div>
  );
};
