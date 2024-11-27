import { useRef, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import { ItemTypesDnD } from "../../lib/constants";
import { ListItemText, Tooltip } from "@mui/material";
import {
  faGripDotsVertical,
  faTriangleExclamation,
} from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dynamic from "next/dynamic";
import { useState } from "react";
import { replaceElements } from "../Elements/ReorderImages";
import clsx from "clsx";
import axios from "axios";
import { toast } from "react-toastify";
const QuillTextEditor = dynamic(
  () => import("../../components/Elements/QuillTextEditor"),
  { ssr: false }
);

const DraggableMenuItems = ({ items, value, onChange }) => {
  const [innerItems, setInnerItems] = useState(items);

  useEffect(() => {
    setInnerItems(items);
  }, [items]);

  const handleMoveCard = (dragIndex, hoverIndex) => {
    setInnerItems(replaceElements(innerItems, dragIndex, hoverIndex));
  };

  const handleOnDrop = () => {
    const promises = innerItems.map((item, index) => {
      return axios.post(
        "https://www.sczg.unizg.hr/wp-json/wp/v2/posts/" + item.id,
        {
          meta: {
            order: index,
          },
        }
      );
    });

    const updateRestaurants = Promise.all(promises).catch(() => {});

    toast.promise(updateRestaurants, {
      pending: "Spremanje redoslijeda...",
      success: "Uspješno spremljeno",
      error: "Greška prilikom spremanja",
    });
  };

  return innerItems?.map((item, index) => (
    <DraggableItem
      key={item.id}
      index={index}
      selected={value === item.id}
      onClick={() => onChange(item.id)}
      moveCard={handleMoveCard}
      dropCard={handleOnDrop}
    >
      {item.status === "draft" && (
        <Tooltip title="Još nije vidljivo na stranici." arrow>
          <div>
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              className="text-error"
            />
          </div>
        </Tooltip>
      )}
      <ListItemText className="line-clamp-1">
        <QuillTextEditor
          value={item.title}
          useToolbar={false}
          formats={[]}
          className="[&>div>div>p]:hover:cursor-pointer [&>div>div]:line-clamp-1"
          readOnly
          includeStyles={false}
        />
      </ListItemText>
    </DraggableItem>
  ));
};

const DraggableItem = ({
  id,
  children,
  index,
  moveCard,
  selected,
  onClick,
  dropCard,
}) => {
  const ref = useRef(null);
  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypesDnD.RESTAURANT,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      // Don't replace items with themselves
      console.log(dragIndex, hoverIndex);
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
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      // Time to actually perform the action
      console.log(dragIndex, hoverIndex);
      moveCard(dragIndex, hoverIndex);
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
    drop: () => {
      dropCard();
    },
  });
  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypesDnD.RESTAURANT,
    item: () => {
      return { id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  preview(drop(ref));
  return (
    <button
      ref={ref}
      selected={selected}
      onClick={onClick}
      className={clsx(
        "flex items-center gap-3 hover:bg-gray-100 w-full py-1 active:bg-gray-200",
        isDragging ? "opacity-0" : "opacity-100"
      )}
      data-handler-id={handlerId}
    >
      <div ref={drag} className="w-6 h-6 cursor-move">
        <FontAwesomeIcon icon={faGripDotsVertical} />
      </div>
      {children}
    </button>
  );
};

export default DraggableMenuItems;
