import { Tooltip } from "@mui/material";
import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { HiExclamation, HiXCircle } from "react-icons/hi";
import { ItemTypesDnD } from "../../../lib/constants";

const ProductItem = ({
  onSelectProduct,
  selectedProduct,
  product,
  index,
  menuName,
  mealName,
  handleRemoveItem,
  handleMoveItem,
  handleChangeMenu,
}) => {
  const ref = useRef(null);
  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypesDnD.PRODUCT,
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
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      if (
        product.menuName == item.menuName &&
        product.mealName == item.mealName
      )
        handleMoveItem(dragIndex, hoverIndex, menuName, mealName);
      item.index = hoverIndex;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypesDnD.PRODUCT,
    item: () => {
      return { index, id: product.id, menuName, mealName };
    },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (
        item &&
        dropResult &&
        (dropResult.menuName != menuName || dropResult.mealName != mealName)
      ) {
        handleChangeMenu(
          index,
          menuName,
          mealName,
          dropResult.menuName,
          dropResult.mealName,
          item.id
        );
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));
  return (
    <button
      ref={ref}
      onClick={() => onSelectProduct({ ...product, menuName, mealName })}
      data-handlerid={handlerId}
      className={`flex items-center gap-1 text-left shadow justify-between py-2 px-3 text-black rounded-md mt-2 ${
        opacity ? "opacity-100" : "opacity-0"
      } ${
        selectedProduct?.id === product.id &&
        selectedProduct?.menuName === menuName &&
        selectedProduct?.mealName === mealName
          ? "ring-1 ring-offset-1 ring-primary"
          : ""
      } ${
        product?.stock === "outofstock"
          ? "bg-secondary text-error border-l-4 border-error"
          : "bg-secondary"
      }`}
    >
      <div>
        {product?.title || (
          <div className="text-error">Proizvod je uklonjen</div>
        )}
      </div>
      <div className="flex items-center">
        {product?.stock === "outofstock" && (
          <Tooltip title="Nema na stanju" arrow>
            <span>
              <HiExclamation className="w-5 h-5 mr-1 text-error" />
            </span>
          </Tooltip>
        )}
        <button onClick={handleRemoveItem}>
          <HiXCircle className="w-5 h-5" />
        </button>
      </div>
    </button>
  );
};

export default ProductItem;
