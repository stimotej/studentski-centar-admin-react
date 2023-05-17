import { useDrop } from "react-dnd";
import ProductItem from "./ProductItem";
import { ItemTypesDnD } from "../../../lib/constants";

const MenuSelectItem = ({
  menuName,
  mealName,
  text,
  onSelect,
  selectedProduct,
  onSelectProduct,
  active,
  products,
  handleRemoveItem,
  handleMoveItem,
  handleChangeMenu,
  value,
}) => {
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: ItemTypesDnD.PRODUCT,
    drop: () => ({ menuName, mealName }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));
  const isActive = canDrop && isOver;

  return (
    <div
      ref={drop}
      className={`flex-1 mt-1 ring-inset md:mt-0 p-4 cursor-pointer rounded-lg transition ${
        active || isActive
          ? "ring-2 ring-primary hover:bg-primary/5"
          : "ring-1 ring-gray-300 hover:ring-black hover:bg-black/5"
      }`}
      onClick={onSelect}
    >
      <h4 className="uppercase font-semibold tracking-wide">{text}</h4>
      <div className="mt-4 flex flex-col">
        {products?.map((product, index) => (
          <ProductItem
            key={product.id}
            menuName={menuName}
            mealName={mealName}
            index={index}
            product={{ ...product, menuName, mealName }}
            selectedProduct={selectedProduct}
            onSelectProduct={onSelectProduct}
            handleRemoveItem={() => handleRemoveItem(value, product.id)}
            handleMoveItem={handleMoveItem}
            handleChangeMenu={handleChangeMenu}
          />
        ))}
      </div>
    </div>
  );
};

export default MenuSelectItem;
